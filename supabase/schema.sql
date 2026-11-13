-- ==============================================================================
-- Codi AI - Final Beta Testing Schema, Strict RLS & Atomic Rate Limit RPC
-- Jalankan seluruh script ini di Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Tabel Riwayat Sesi Percakapan (chat_sessions)
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  teacher_id text not null check (teacher_id in ('math', 'general', 'pancasila')),
  title text not null default 'Obrolan Baru',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_chat_sessions_user_updated
  on public.chat_sessions (user_id, updated_at desc);

-- 2. Tabel Pesan Percakapan (chat_messages)
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  sender text not null check (sender in ('user', 'ai')),
  teacher_name text,
  content text not null,
  model text,
  display_time text,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_session_created
  on public.chat_messages (session_id, created_at asc);

create index if not exists idx_chat_messages_user
  on public.chat_messages (user_id);

-- 3. Tabel Pelacakan Rate Limit per User (15 Chat / 12 Jam sejak chat pertama)
create table if not exists public.user_rate_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_start timestamptz,
  message_count integer not null default 0 check (message_count >= 0),
  updated_at timestamptz not null default now()
);

-- 4. Aktifkan Row Level Security (RLS) pada semua tabel
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.user_rate_limits enable row level security;

-- 5. Kebijakan RLS Ketat untuk chat_sessions
drop policy if exists "Users can view their own chat sessions" on public.chat_sessions;
create policy "Users can view their own chat sessions"
  on public.chat_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own chat sessions" on public.chat_sessions;
create policy "Users can create their own chat sessions"
  on public.chat_sessions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own chat sessions" on public.chat_sessions;
create policy "Users can update their own chat sessions"
  on public.chat_sessions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own chat sessions" on public.chat_sessions;
create policy "Users can delete their own chat sessions"
  on public.chat_sessions
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 6. Kebijakan RLS Ketat untuk chat_messages
drop policy if exists "Users can view their own chat messages" on public.chat_messages;
create policy "Users can view their own chat messages"
  on public.chat_messages
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create messages in their own sessions" on public.chat_messages;
create policy "Users can create messages in their own sessions"
  on public.chat_messages
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.chat_sessions s
      where s.id = session_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists "Users can delete their own chat messages" on public.chat_messages;
create policy "Users can delete their own chat messages"
  on public.chat_messages
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 7. Kebijakan RLS Ketat untuk user_rate_limits
-- Catatan Keamanan: User HANYA boleh membaca status kuotanya sendiri.
-- INSERT/UPDATE dilarang langsung dari client agar tidak bisa dimanipulasi via inspect element/console.
-- Perubahan kuota hanya bisa dilakukan secara atomik melalui fungsi RPC SECURITY DEFINER di bawah.
drop policy if exists "Users can view their own rate limit" on public.user_rate_limits;
create policy "Users can view their own rate limit"
  on public.user_rate_limits
  for select
  to authenticated
  using (auth.uid() = user_id);

-- 8. Fungsi RPC: Cek Sisa Kuota Chat User Saat Ini (Read-Only)
create or replace function public.get_chat_quota()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_limit constant integer := 15;
  v_window constant interval := interval '12 hours';
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select window_start, message_count
    into v_window_start, v_count
  from public.user_rate_limits
  where user_id = v_user_id;

  if not found or v_window_start is null or v_now >= (v_window_start + v_window) then
    return jsonb_build_object(
      'limit', v_limit,
      'used', 0,
      'remaining', v_limit,
      'window_start', null,
      'reset_at', null,
      'is_limited', false
    );
  end if;

  return jsonb_build_object(
    'limit', v_limit,
    'used', least(v_count, v_limit),
    'remaining', greatest(v_limit - v_count, 0),
    'window_start', v_window_start,
    'reset_at', v_window_start + v_window,
    'is_limited', v_count >= v_limit
  );
end;
$$;

-- 9. Fungsi RPC: Konsumsi Kuota Chat Secara Atomik (Server-Enforced)
-- Siklus 12 jam dimulai tepat saat pesan pertama dikirim dalam siklus tersebut.
create or replace function public.consume_chat_quota()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_limit constant integer := 15;
  v_window constant interval := interval '12 hours';
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_count integer;
  v_new_count integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  insert into public.user_rate_limits (user_id, window_start, message_count, updated_at)
  values (v_user_id, null, 0, v_now)
  on conflict (user_id) do nothing;

  -- Kunci baris user untuk mencegah race condition jika user mengirim request paralel
  select window_start, message_count
    into v_window_start, v_count
  from public.user_rate_limits
  where user_id = v_user_id
  for update;

  -- Jika belum pernah memulai siklus atau siklus 12 jam sudah habis -> mulai siklus baru dari sekarang
  if v_window_start is null or v_now >= (v_window_start + v_window) then
    update public.user_rate_limits
    set window_start = v_now,
        message_count = 1,
        updated_at = v_now
    where user_id = v_user_id;

    return jsonb_build_object(
      'allowed', true,
      'limit', v_limit,
      'used', 1,
      'remaining', v_limit - 1,
      'window_start', v_now,
      'reset_at', v_now + v_window,
      'is_limited', false
    );
  end if;

  -- Jika kuota dalam siklus 12 jam saat ini sudah mencapai batas 15 pesan -> tolak
  if v_count >= v_limit then
    return jsonb_build_object(
      'allowed', false,
      'limit', v_limit,
      'used', v_limit,
      'remaining', 0,
      'window_start', v_window_start,
      'reset_at', v_window_start + v_window,
      'is_limited', true
    );
  end if;

  -- Tambah pemakaian dalam siklus aktif (window_start tetap pada chat pertama)
  v_new_count := v_count + 1;
  update public.user_rate_limits
  set message_count = v_new_count,
      updated_at = v_now
  where user_id = v_user_id;

  return jsonb_build_object(
    'allowed', true,
    'limit', v_limit,
    'used', v_new_count,
    'remaining', greatest(v_limit - v_new_count, 0),
    'window_start', v_window_start,
    'reset_at', v_window_start + v_window,
    'is_limited', v_new_count >= v_limit
  );
end;
$$;

-- 10. Hak akses RPC hanya untuk user terautentikasi
revoke all on function public.get_chat_quota() from public;
revoke all on function public.get_chat_quota() from anon;
grant execute on function public.get_chat_quota() to authenticated;

revoke all on function public.consume_chat_quota() from public;
revoke all on function public.consume_chat_quota() from anon;
grant execute on function public.consume_chat_quota() to authenticated;

