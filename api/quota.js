export const config = {
  runtime: 'edge'
};

export default async function handler(requestOrContext, possibleContext) {
  let request = requestOrContext;
  let env = (typeof process !== 'undefined' && process.env) ? process.env : {};

  if (requestOrContext && requestOrContext.request) {
    request = requestOrContext.request;
    if (requestOrContext.env) {
      env = { ...env, ...requestOrContext.env };
    }
  } else if (possibleContext && possibleContext.env) {
    env = { ...env, ...possibleContext.env };
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }

  const supabaseUrl = (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseAnonKey = (
    env.SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.SUPABASE_PUBLISHABLE_KEY ||
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim();
  const authHeader = request.headers.get('authorization') || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  const accessToken = match ? match[1].trim() : '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(JSON.stringify({ error: 'Konfigurasi Supabase server belum lengkap.' }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }

  if (!accessToken || accessToken === supabaseAnonKey) {
    return new Response(JSON.stringify({ error: 'Autentikasi Google diperlukan.' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }

  try {
    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/get_chat_quota`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${accessToken}`
      },
      body: '{}'
    });

    if (rpcRes.status === 401 || rpcRes.status === 403) {
      return new Response(JSON.stringify({ error: 'Sesi tidak valid atau kedaluwarsa.' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }

    if (!rpcRes.ok) {
      const errText = await rpcRes.text().catch(() => '');
      return new Response(JSON.stringify({ error: 'Gagal memeriksa kuota chat.', detail: errText.slice(0, 120) }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }

    const quota = await rpcRes.json();
    return new Response(JSON.stringify(quota), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Gagal terhubung ke layanan kuota Supabase.' }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }
}

export { handler as onRequest };

