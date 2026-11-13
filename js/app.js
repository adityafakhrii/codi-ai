/**
 * Codi AI - Main Application Engine
 * Authentication, Teacher Selection, Chat & Speak Interactive Workspace
 * Mobile-First, PWA, Lucide Icons, WCAG 2.2 AA Accessible
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons Helper
  function refreshIcons() {
    if (window.lucide && typeof lucide.createIcons === 'function') {
      try {
        lucide.createIcons();
      } catch (e) {
        console.warn('Lucide icons refresh note:', e);
      }
    }
  }
  refreshIcons();

  // 2. Service Worker Registration (PWA)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('Codi AI Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('Service Worker registration note:', err);
        });
    });
  }

  // 3. PWA Install Prompt
  let deferredPrompt = null;
  const pwaInstallBtn = document.getElementById('pwa-install-btn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (pwaInstallBtn) {
      pwaInstallBtn.style.display = 'inline-flex';
    }
  });

  if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('Codi AI berhasil dipasang di layar utama ponsel!');
        }
        deferredPrompt = null;
        pwaInstallBtn.style.display = 'none';
      } else {
        showToast('Untuk memasang Codi AI: Buka menu browser lalu pilih "Tambahkan ke Layar Utama".');
      }
    });
  }

  // 4. Universal Custom Notification & Dialog Modal System
  // (Kids-friendly, accessible, high-contrast, theme-adaptive, keyboard-navigable)
  let toastNoticeTimeout = null;

  function showToast(message, type = 'info') {
    let toastEl = document.getElementById('toast-notice') || document.getElementById('codi-toast-notice');
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'toast-notice';
      toastEl.className = 'codi-toast-notice toast-notice';
      document.body.appendChild(toastEl);
    }

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg class="toast-inline-icon is-success" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
    } else if (type === 'danger') {
      iconSvg = '<svg class="toast-inline-icon is-danger" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg class="toast-inline-icon is-warning" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    } else {
      iconSvg = '<svg class="toast-inline-icon is-info" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
    }

    const safeMsg = escapeHtml(message);
    toastEl.innerHTML = iconSvg + '<span>' + safeMsg + '</span>';
    toastEl.classList.add('is-visible', 'show');

    if (toastNoticeTimeout) clearTimeout(toastNoticeTimeout);
    toastNoticeTimeout = setTimeout(() => {
      toastEl.classList.remove('is-visible', 'show');
    }, 2800);
  }
  window.showToast = showToast;
  window.showCodiToast = showToast;

  function trapFocusInModal(e, containerEl) {
    if (e.key !== 'Tab' || !containerEl) return;
    const focusables = Array.from(
      containerEl.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter((el) => el.offsetParent !== null);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function showCustomConfirm({
    title = 'Konfirmasi',
    message = 'Apakah adik yakin?',
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    type = 'danger'
  } = {}) {
    return new Promise((resolve) => {
      const backdrop = document.getElementById('codi-custom-dialog');
      const titleEl = document.getElementById('codi-dialog-title');
      const messageEl = document.getElementById('codi-dialog-message');
      const iconEl = document.getElementById('codi-dialog-icon');
      const cancelBtn = document.getElementById('btn-dialog-cancel');
      const confirmBtn = document.getElementById('btn-dialog-confirm');

      if (!backdrop || !confirmBtn || !cancelBtn) {
        resolve(window.confirm(message));
        return;
      }

      titleEl.textContent = title;
      messageEl.textContent = message;
      confirmBtn.textContent = confirmText;
      cancelBtn.textContent = cancelText;
      cancelBtn.style.display = 'inline-block';

      iconEl.className = 'codi-dialog-icon-wrapper is-' + type;
      confirmBtn.className = 'btn-dialog-confirm is-' + type;

      let iconSvg = '';
      if (type === 'danger') {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>';
      } else if (type === 'warning') {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
      } else if (type === 'success') {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';
      } else {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
      }
      iconEl.innerHTML = iconSvg;

      backdrop.style.display = 'flex';
      backdrop.offsetHeight;
      backdrop.classList.add('is-open');
      backdrop.setAttribute('aria-hidden', 'false');
      confirmBtn.focus();

      function cleanup(result) {
        backdrop.classList.remove('is-open');
        backdrop.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
          backdrop.style.display = 'none';
        }, 220);
        window.removeEventListener('keydown', onKeyDown);
        confirmBtn.removeEventListener('click', onConfirm);
        cancelBtn.removeEventListener('click', onCancel);
        backdrop.removeEventListener('click', onBackdrop);
        resolve(result);
      }

      function onConfirm() { cleanup(true); }
      function onCancel() { cleanup(false); }
      function onBackdrop(e) {
        if (e.target === backdrop) cleanup(false);
      }
      function onKeyDown(e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          cleanup(false);
          return;
        }
        trapFocusInModal(e, backdrop);
      }

      confirmBtn.addEventListener('click', onConfirm);
      cancelBtn.addEventListener('click', onCancel);
      backdrop.addEventListener('click', onBackdrop);
      window.addEventListener('keydown', onKeyDown);
    });
  }
  window.showCustomConfirm = showCustomConfirm;

  function showCustomAlert({
    title = 'Pemberitahuan Codi',
    message = '',
    buttonText = 'Mengerti',
    type = 'info'
  } = {}) {
    return new Promise((resolve) => {
      const backdrop = document.getElementById('codi-custom-dialog');
      const titleEl = document.getElementById('codi-dialog-title');
      const messageEl = document.getElementById('codi-dialog-message');
      const iconEl = document.getElementById('codi-dialog-icon');
      const cancelBtn = document.getElementById('btn-dialog-cancel');
      const confirmBtn = document.getElementById('btn-dialog-confirm');

      if (!backdrop || !confirmBtn) {
        window.alert(message);
        resolve();
        return;
      }

      titleEl.textContent = title;
      messageEl.textContent = message;
      confirmBtn.textContent = buttonText;
      if (cancelBtn) cancelBtn.style.display = 'none';

      iconEl.className = 'codi-dialog-icon-wrapper is-' + type;
      confirmBtn.className = 'btn-dialog-confirm is-' + (type === 'danger' ? 'danger' : 'info');

      let iconSvg = '';
      if (type === 'danger') {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
      } else if (type === 'success') {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';
      } else {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
      }
      iconEl.innerHTML = iconSvg;

      backdrop.style.display = 'flex';
      backdrop.offsetHeight;
      backdrop.classList.add('is-open');
      backdrop.setAttribute('aria-hidden', 'false');
      confirmBtn.focus();

      function cleanup() {
        backdrop.classList.remove('is-open');
        backdrop.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
          backdrop.style.display = 'none';
        }, 220);
        window.removeEventListener('keydown', onKeyDown);
        confirmBtn.removeEventListener('click', onConfirm);
        backdrop.removeEventListener('click', onBackdrop);
        resolve();
      }

      function onConfirm() { cleanup(); }
      function onBackdrop(e) {
        if (e.target === backdrop) cleanup();
      }
      function onKeyDown(e) {
        if (e.key === 'Escape' || e.key === 'Enter') {
          e.preventDefault();
          cleanup();
          return;
        }
        trapFocusInModal(e, backdrop);
      }

      confirmBtn.addEventListener('click', onConfirm);
      backdrop.addEventListener('click', onBackdrop);
      window.addEventListener('keydown', onKeyDown);
    });
  }
  window.showCustomAlert = showCustomAlert;

  // Global override for native window.alert to guarantee custom Codi UI
  window.alert = function (msg) {
    return showCustomAlert({
      title: 'Pemberitahuan Codi',
      message: String(msg || ''),
      buttonText: 'Mengerti',
      type: 'info'
    });
  };

  // 5. Global App State & View Routing
  const views = {
    landing: document.getElementById('landing-page-view'),
    teacherSelect: document.getElementById('teacher-select-view'),
    chatWorkspace: document.getElementById('chat-workspace-view')
  };

  const authModal = document.getElementById('auth-modal');

  let currentUser = null;
  let currentSession = null;
  let supabaseClient = null;
  let supabaseConfigured = false;
  let currentTeacher = 'math'; // 'math' | 'general' | 'pancasila'
  let chatSessions = [];
  let activeSessionId = null;
  let currentTeacherFilter = 'all'; // 'all' | 'math' | 'general' | 'pancasila'
  let sidebarSearchQuery = '';

  let quotaState = {
    limit: 15,
    used: 0,
    remaining: 15,
    windowStart: null,
    resetAt: null,
    isLimited: false
  };
  let quotaCountdownInterval = null;
  let quotaSyncInFlight = false;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }

  function formatSessionDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} • ${hours}:${mins}`;
  }

  function getSessionRelativeGroup(isoString) {
    if (!isoString) return 'Sebelumnya';
    const target = new Date(isoString);
    if (isNaN(target.getTime())) return 'Sebelumnya';
    const now = new Date();
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((today - targetDay) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hari Ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays <= 7) return '7 Hari Terakhir';
    return 'Sebelumnya';
  }

  function generateUuid() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function createDefaultSession(teacherId, defaultTitle) {
    const profile = window.CodiAI && window.CodiAI.TEACHER_PROFILES ? window.CodiAI.TEACHER_PROFILES[teacherId] : null;
    const now = new Date();
    const greetingId = generateUuid();
    return {
      id: generateUuid(),
      teacherId: teacherId,
      title: defaultTitle,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      persisted: false,
      messages: [
        {
          id: greetingId,
          sender: 'ai',
          teacherName: profile ? profile.name : 'Codi',
          text: profile ? profile.greeting : 'Halo adik pintar! Ada yang bisa Codi bantu hari ini?',
          timestamp: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          isoTime: now.toISOString(),
          persisted: false
        }
      ]
    };
  }

  function saveChatSessions() {
    // Disinkronkan langsung ke Supabase (dipertahankan sebagai no-op sinkron agar kompatibel dengan caller UI)
  }

  async function persistSessionAndGreetingToDb(session) {
    if (!supabaseClient || !currentUser || !session) return false;
    try {
      if (!session.persisted) {
        const { error: sessErr } = await supabaseClient
          .from('chat_sessions')
          .upsert({
            id: session.id,
            user_id: currentUser.id,
            teacher_id: session.teacherId,
            title: session.title || 'Obrolan Baru',
            created_at: session.createdAt,
            updated_at: session.updatedAt || session.createdAt
          }, { onConflict: 'id' });

        if (sessErr) {
          console.warn('Supabase session insert note:', sessErr.message);
          return false;
        }
        session.persisted = true;
      }

      if (Array.isArray(session.messages) && session.messages.length > 0) {
        const unpersisted = session.messages.filter((m) => !m.persisted);
        if (unpersisted.length > 0) {
          const rows = unpersisted.map((m) => {
            if (!m.id) m.id = generateUuid();
            return {
              id: m.id,
              session_id: session.id,
              user_id: currentUser.id,
              sender: m.sender,
              teacher_name: m.teacherName || null,
              content: m.text || '',
              model: m.model || null,
              display_time: m.timestamp || null,
              created_at: m.isoTime || new Date().toISOString()
            };
          });
          const { error: msgErr } = await supabaseClient
            .from('chat_messages')
            .upsert(rows, { onConflict: 'id' });
          if (!msgErr) {
            unpersisted.forEach((m) => { m.persisted = true; });
          } else {
            console.warn('Supabase messages insert note:', msgErr.message);
          }
        }
      }
      return true;
    } catch (err) {
      console.warn('Persist session error:', err);
      return false;
    }
  }

  async function persistMessageToDb(session, msg) {
    if (!supabaseClient || !currentUser || !session || !msg) return;
    try {
      await persistSessionAndGreetingToDb(session);
      if (!msg.id) msg.id = generateUuid();
      const { error: msgErr } = await supabaseClient
        .from('chat_messages')
        .upsert({
          id: msg.id,
          session_id: session.id,
          user_id: currentUser.id,
          sender: msg.sender,
          teacher_name: msg.teacherName || null,
          content: msg.text || '',
          model: msg.model || null,
          display_time: msg.timestamp || null,
          created_at: msg.isoTime || new Date().toISOString()
        }, { onConflict: 'id' });

      if (!msgErr) {
        msg.persisted = true;
      }

      await supabaseClient
        .from('chat_sessions')
        .update({
          title: session.title || 'Obrolan Baru',
          updated_at: session.updatedAt || new Date().toISOString()
        })
        .eq('id', session.id)
        .eq('user_id', currentUser.id);
    } catch (err) {
      console.warn('Persist message error:', err);
    }
  }

  async function deleteMessageFromDb(messageId) {
    if (!supabaseClient || !currentUser || !messageId) return;
    try {
      await supabaseClient
        .from('chat_messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', currentUser.id);
    } catch (err) {
      console.warn('Delete message error:', err);
    }
  }

  async function loadUserSessionsFromDb() {
    if (!supabaseClient || !currentUser) return [];
    try {
      const { data: sessionRows, error: sessErr } = await supabaseClient
        .from('chat_sessions')
        .select('id, teacher_id, title, created_at, updated_at')
        .eq('user_id', currentUser.id)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (sessErr) {
        console.warn('Load sessions error:', sessErr.message);
        return [];
      }

      if (!sessionRows || sessionRows.length === 0) {
        return [];
      }

      const sessionIds = sessionRows.map((s) => s.id);
      const { data: msgRows, error: msgErr } = await supabaseClient
        .from('chat_messages')
        .select('id, session_id, sender, teacher_name, content, model, display_time, created_at')
        .eq('user_id', currentUser.id)
        .in('session_id', sessionIds)
        .order('created_at', { ascending: true });

      if (msgErr) {
        console.warn('Load messages error:', msgErr.message);
      }

      const msgsBySession = new Map();
      (msgRows || []).forEach((m) => {
        if (!msgsBySession.has(m.session_id)) {
          msgsBySession.set(m.session_id, []);
        }
        const createdDate = new Date(m.created_at);
        msgsBySession.get(m.session_id).push({
          id: m.id,
          sender: m.sender,
          teacherName: m.teacher_name || undefined,
          text: m.content,
          model: m.model || undefined,
          timestamp: m.display_time || (!isNaN(createdDate.getTime()) ? createdDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''),
          isoTime: m.created_at,
          persisted: true
        });
      });

      return sessionRows.map((row) => {
        const teacherId = ['math', 'general', 'pancasila'].includes(row.teacher_id) ? row.teacher_id : 'math';
        const messages = msgsBySession.get(row.id) || [];
        return {
          id: row.id,
          teacherId,
          title: row.title || 'Obrolan Baru',
          createdAt: row.created_at,
          updatedAt: row.updated_at || row.created_at,
          persisted: true,
          messages
        };
      });
    } catch (err) {
      console.warn('Load Supabase history failed:', err);
      return [];
    }
  }

  function formatCountdownDuration(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours} jam ${String(minutes).padStart(2, '0')} menit`;
    }
    if (minutes > 0) {
      return `${minutes} menit ${String(seconds).padStart(2, '0')} detik`;
    }
    return `${seconds} detik`;
  }

  function syncSendButtonState() {
    const sendBtnEl = document.getElementById('btn-dock-send');
    if (!sendBtnEl) return;
    const remaining = Math.max(0, Number(quotaState.remaining ?? (Number(quotaState.limit) || 15)));
    const hasText = Boolean(textInput && textInput.value.trim().length > 0);
    sendBtnEl.disabled = remaining <= 0 || isAiResponding || !hasText;
  }

  function renderQuotaUI() {
    const quotaBar = document.getElementById('workspace-quota-bar');
    const countText = document.getElementById('quota-count-text');
    const timerText = document.getElementById('quota-timer-text');
    const navQuotaPill = document.getElementById('nav-quota-pill');
    const navQuotaCount = document.getElementById('nav-quota-count');
    const limit = Number(quotaState.limit) || 15;
    let remaining = Math.max(0, Number(quotaState.remaining ?? limit));
    let resetAtMs = quotaState.resetAt ? new Date(quotaState.resetAt).getTime() : null;

    if (resetAtMs && Date.now() >= resetAtMs) {
      remaining = limit;
      resetAtMs = null;
      quotaState.remaining = limit;
      quotaState.used = 0;
      quotaState.windowStart = null;
      quotaState.resetAt = null;
      quotaState.isLimited = false;
      if (!quotaSyncInFlight) {
        fetchUserQuota();
      }
    }

    const isExhausted = remaining <= 0;
    const isWarning = remaining > 0 && remaining <= 3;
    const countdownLabel = resetAtMs ? formatCountdownDuration(resetAtMs - Date.now()) : '';

    const detailLabel = !resetAtMs
      ? 'Siklus 12 jam dimulai saat chat pertama'
      : isExhausted
      ? `Istirahat sebentar ya - reset otomatis dalam ${countdownLabel}`
      : `Reset dalam ${countdownLabel}`;

    const summaryTitle = isExhausted
      ? `Kuota habis (0/${limit}) - ${detailLabel}`
      : `${remaining}/${limit} chat tersisa - ${detailLabel}`;

    if (navQuotaPill) {
      navQuotaPill.classList.toggle('is-exhausted', isExhausted);
      navQuotaPill.classList.toggle('is-warning', isWarning);
      navQuotaPill.setAttribute('title', summaryTitle);
      navQuotaPill.setAttribute('aria-label', summaryTitle);
    }
    if (navQuotaCount) {
      navQuotaCount.textContent = `${remaining}/${limit}`;
    }

    if (quotaBar) {
      quotaBar.classList.toggle('is-visible', isWarning || isExhausted);
      quotaBar.classList.toggle('is-exhausted', isExhausted);
      quotaBar.classList.toggle('is-warning', isWarning);
    }

    if (countText) {
      countText.textContent = isExhausted
        ? 'Kuota habis (0/15)'
        : `${remaining}/${limit} chat tersisa`;
    }

    if (timerText) {
      timerText.textContent = detailLabel;
    }

    if (chatForm) {
      chatForm.classList.toggle('is-quota-locked', isExhausted);
    }
    if (textInput) {
      textInput.disabled = isExhausted;
      textInput.placeholder = isExhausted
        ? `Belajar hari ini cukup dulu ya! Kuota kembali dalam ${countdownLabel || 'beberapa saat'}...`
        : 'Tanya soal pelajaran ke Codi...';
    }
    syncSendButtonState();
    const micBtnEl = document.getElementById('btn-dock-mic');
    if (micBtnEl) {
      micBtnEl.disabled = isExhausted;
    }
    if (chipsBar) {
      chipsBar.querySelectorAll('.btn-quick-chip').forEach((chip) => {
        chip.disabled = isExhausted;
      });
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && currentUser && currentSession) {
      fetchUserQuota();
    }
  });

  const navQuotaPillBtn = document.getElementById('nav-quota-pill');
  if (navQuotaPillBtn) {
    navQuotaPillBtn.addEventListener('click', () => {
      const msg = navQuotaPillBtn.getAttribute('title') || '15/15 chat tersisa';
      const tone = (quotaState.remaining ?? 15) <= 0 ? 'warning' : 'info';
      showToast(msg, tone);
    });
  }

  function startQuotaTimer() {
    if (quotaCountdownInterval) {
      clearInterval(quotaCountdownInterval);
      quotaCountdownInterval = null;
    }
    if (quotaState.resetAt) {
      quotaCountdownInterval = setInterval(() => {
        renderQuotaUI();
      }, 1000);
    }
  }

  function applyQuotaFromServer(data) {
    if (!data || typeof data !== 'object') return;
    const limit = Number(data.limit ?? 15);
    const remaining = Math.max(0, Number(data.remaining ?? limit));
    const used = Number(data.used ?? Math.max(0, limit - remaining));
    const windowStart = data.windowStart ?? data.window_start ?? null;
    const resetAt = data.resetAt ?? data.reset_at ?? null;

    quotaState = {
      limit,
      used,
      remaining,
      windowStart,
      resetAt,
      isLimited: remaining <= 0
    };
    renderQuotaUI();
    startQuotaTimer();
  }

  async function fetchUserQuota() {
    if (!currentSession || !currentSession.access_token) return;
    quotaSyncInFlight = true;
    try {
      const res = await fetch('/api/quota', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentSession.access_token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        applyQuotaFromServer(data);
      }
    } catch (err) {
      console.warn('Quota sync note:', err);
    } finally {
      quotaSyncInFlight = false;
    }
  }

  function showView(viewKey) {
    if ((viewKey === 'teacherSelect' || viewKey === 'chatWorkspace') && (!currentUser || !currentSession)) {
      viewKey = 'landing';
      openAuthModal();
    }

    try {
      if (currentUser && (viewKey === 'teacherSelect' || viewKey === 'chatWorkspace')) {
        localStorage.setItem('codi_active_view', viewKey);
      } else if (!currentUser) {
        localStorage.removeItem('codi_active_view');
      }
    } catch (e) {}

    // Stop any speech when switching views
    if (typeof stopCurrentMessageAudio === 'function') {
      stopCurrentMessageAudio();
    }
    if (window.CodiSpeech) {
      window.CodiSpeech.stopSpeaking();
      window.CodiSpeech.stopListening();
    }

    Object.keys(views).forEach((key) => {
      if (views[key]) {
        views[key].style.display = key === viewKey ? 'flex' : 'none';
      }
    });

    if (viewKey === 'landing' && views.landing) {
      views.landing.style.display = 'block';
    }

    document.documentElement.classList.remove('is-oauth-callback', 'has-active-teacher-view', 'has-active-workspace-view');
    document.documentElement.classList.add('app-mounted');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshIcons();
    if (window.refreshCodi3D) {
      requestAnimationFrame(window.refreshCodi3D);
    }
  }

  // 6. Authentication Modal Controls
  let lastFocusedBeforeAuthModal = null;

  function openAuthModal() {
    if (!authModal) return;
    lastFocusedBeforeAuthModal = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    authModal.classList.add('is-open');
    authModal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      if (btnGoogleAction && !btnGoogleAction.disabled) {
        btnGoogleAction.focus();
      } else if (btnCloseAuthModal) {
        btnCloseAuthModal.focus();
      }
    });
  }

  function closeAuthModal() {
    if (!authModal) return;
    authModal.classList.remove('is-open');
    authModal.setAttribute('aria-hidden', 'true');
    if (lastFocusedBeforeAuthModal && typeof lastFocusedBeforeAuthModal.focus === 'function') {
      lastFocusedBeforeAuthModal.focus();
    }
    lastFocusedBeforeAuthModal = null;
  }

  const headerLoginBtn = document.getElementById('header-login-btn');
  const btnCloseAuthModal = document.getElementById('btn-close-auth-modal');
  const btnGoogleAction = document.getElementById('btn-google-login-action');
  const googleLoginBtnLabel = document.getElementById('google-login-btn-label');

  if (headerLoginBtn) headerLoginBtn.addEventListener('click', openAuthModal);
  if (btnCloseAuthModal) btnCloseAuthModal.addEventListener('click', closeAuthModal);

  document.addEventListener('keydown', (e) => {
    if (!authModal || !authModal.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeAuthModal();
      return;
    }
    trapFocusInModal(e, authModal);
  });

  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        closeAuthModal();
      }
    });
  }

  function mapSupabaseUser(authUser) {
    if (!authUser) return null;
    const meta = authUser.user_metadata || {};
    const email = authUser.email || '';
    const fallbackName = email ? email.split('@')[0] : 'Siswa Codi';
    const fullName = (meta.full_name || meta.name || fallbackName).trim();
    const avatarUrl = meta.avatar_url || meta.picture || '';
    return {
      id: authUser.id,
      name: fullName,
      email: email,
      avatarUrl: avatarUrl,
      initial: fullName ? fullName.charAt(0).toUpperCase() : 'C'
    };
  }

  function clearLocalAuthArtifacts(clearPreferences = true) {
    try {
      localStorage.removeItem('codi_auth_user');
      localStorage.removeItem('codi_chat_sessions');
      localStorage.removeItem('codi_chat_histories');
      localStorage.removeItem('codi_active_session_id');
      localStorage.removeItem('codi_waitlist');
      if (clearPreferences) {
        localStorage.removeItem('codi_selected_teacher');
        localStorage.removeItem('codi_active_view');
      }
    } catch (e) {}
  }

  async function hydrateAuthenticatedSession(session, isFreshLogin = false) {
    if (!session || !session.user) return;
    currentSession = session;
    currentUser = mapSupabaseUser(session.user);
    document.documentElement.classList.remove('is-oauth-callback');
    document.documentElement.classList.add('has-active-session');

    // Bersihkan URL callback OAuth (?code=... atau #access_token=...) setelah terautentikasi
    if (window.location.search.includes('code=') || window.location.hash.includes('access_token=')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    let pendingTeacher = '';
    let savedView = 'teacherSelect';
    try {
      const storedTeacher = localStorage.getItem('codi_selected_teacher');
      if (storedTeacher && ['math', 'general', 'pancasila'].includes(storedTeacher)) {
        currentTeacher = storedTeacher;
      }
      pendingTeacher = localStorage.getItem('codi_pending_teacher') || '';
      if (pendingTeacher) {
        localStorage.removeItem('codi_pending_teacher');
      }
      savedView = localStorage.getItem('codi_active_view') || 'teacherSelect';
    } catch (e) {}

    updateUserUI();
    closeAuthModal();

    const validTeachers = window.CodiAI && window.CodiAI.TEACHER_PROFILES;
    const hasPendingTeacher = Boolean(pendingTeacher && validTeachers && validTeachers[pendingTeacher]);

    // Tampilkan Pilih Guru Pendamping Belajar seketika tanpa menunggu fetch DB/quota selesai
    if (!hasPendingTeacher && (isFreshLogin || savedView !== 'chatWorkspace')) {
      showView('teacherSelect');
    }

    if (isFreshLogin) {
      showToast(`Selamat datang, ${currentUser.name}!`, 'success');
    }

    const [loadedSessions] = await Promise.all([
      loadUserSessionsFromDb(),
      fetchUserQuota()
    ]);

    chatSessions = loadedSessions;
    activeSessionId = chatSessions.length > 0 ? chatSessions[0].id : null;

    if (hasPendingTeacher) {
      enterTeacherWorkspace(pendingTeacher);
    } else if (!isFreshLogin && savedView === 'chatWorkspace' && activeSessionId && chatSessions.some((s) => s.id === activeSessionId)) {
      switchSession(activeSessionId);
      showView('chatWorkspace');
    } else {
      showView('teacherSelect');
    }
  }

  async function logoutUser() {
    if (quotaCountdownInterval) {
      clearInterval(quotaCountdownInterval);
      quotaCountdownInterval = null;
    }
    if (supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut note:', e);
      }
    }

    currentUser = null;
    currentSession = null;
    chatSessions = [];
    activeSessionId = null;
    document.documentElement.classList.remove('has-active-session');
    clearLocalAuthArtifacts();

    if (window.CodiSpeech) {
      window.CodiSpeech.stopSpeaking();
      window.CodiSpeech.stopListening();
    }

    showToast('Berhasil keluar dari akun Codi AI.');
    showView('landing');
  }

  if (btnGoogleAction) {
    btnGoogleAction.addEventListener('click', async () => {
      if (!supabaseConfigured || !supabaseClient) {
        showCustomAlert({
          title: 'Layanan Masuk Belum Tersedia',
          message: 'Layanan login Google sedang belum siap sementara. Silakan hubungi pengelola Codi AI ya!',
          type: 'warning'
        });
        return;
      }

      btnGoogleAction.disabled = true;
      if (googleLoginBtnLabel) {
        googleLoginBtnLabel.textContent = 'Menghubungkan ke Google...';
      }

      try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              prompt: 'select_account'
            }
          }
        });
        if (error) {
          throw error;
        }
      } catch (err) {
        btnGoogleAction.disabled = false;
        if (googleLoginBtnLabel) {
          googleLoginBtnLabel.textContent = 'Lanjutkan dengan Google';
        }
        showToast('Gagal membuka login Google. Silakan coba lagi.', 'danger');
      }
    });
  }

  const btnLogoutFromSelect = document.getElementById('btn-logout-from-select');
  const btnLogoutFromWorkspace = document.getElementById('btn-logout-from-workspace');
  const btnSidebarLogout = document.getElementById('btn-sidebar-logout');
  if (btnLogoutFromSelect) btnLogoutFromSelect.addEventListener('click', logoutUser);
  if (btnLogoutFromWorkspace) btnLogoutFromWorkspace.addEventListener('click', logoutUser);
  if (btnSidebarLogout) btnSidebarLogout.addEventListener('click', logoutUser);

  function updateUserUI() {
    if (!currentUser) return;
    const displayName = document.getElementById('user-display-name');
    const avatarLetter = document.getElementById('user-avatar-letter');
    const sidebarDisplayName = document.getElementById('sidebar-display-name');
    const sidebarBadge = document.querySelector('.sidebar-user-badge');
    if (displayName) displayName.textContent = currentUser.name;
    if (avatarLetter) {
      if (currentUser.avatarUrl) {
        avatarLetter.innerHTML = `<img src="${escapeHtml(currentUser.avatarUrl)}" alt="${escapeHtml(currentUser.name)}" referrerpolicy="no-referrer">`;
      } else {
        avatarLetter.textContent = currentUser.initial || currentUser.name.charAt(0);
      }
    }
    if (sidebarDisplayName) sidebarDisplayName.textContent = currentUser.name;
    if (sidebarBadge) sidebarBadge.textContent = currentUser.email || 'Akun Google Aktif';
  }

  // 7. Teacher Selection & Workspace Navigation
  const btnSelectMath = document.getElementById('btn-select-math');
  const btnSelectGeneral = document.getElementById('btn-select-general');
  const btnSelectPancasila = document.getElementById('btn-select-pancasila');
  const btnBackToTeacherSelect = document.getElementById('btn-back-to-teacher-select');
  const activeTeacherIndicator = document.getElementById('active-teacher-indicator');

  function getActiveSession() {
    if (!activeSessionId) {
      if (chatSessions.length > 0) {
        activeSessionId = chatSessions[0].id;
      } else {
        return null;
      }
    }
    return chatSessions.find((s) => s.id === activeSessionId) || null;
  }

  function updateActiveSessionHeader(session) {
    const sessionTitleEl = document.getElementById('active-session-title');
    const sessionTimeEl = document.getElementById('active-session-time');
    if (sessionTitleEl && session) {
      sessionTitleEl.textContent = session.title;
    }
    if (sessionTimeEl && session) {
      sessionTimeEl.textContent = formatSessionDate(session.updatedAt || session.createdAt);
    }
  }

  function applyTeacherVisuals(teacherId) {
    const profile = window.CodiAI && window.CodiAI.TEACHER_PROFILES ? window.CodiAI.TEACHER_PROFILES[teacherId] : null;
    const mascotActiveName = document.getElementById('mascot-active-name');
    const mascotActiveRole = document.getElementById('mascot-active-role');
    const mascotPedagogyHint = document.getElementById('mascot-pedagogy-hint');

    if (mascotActiveName && profile) {
      mascotActiveName.textContent = profile.name;
    }
    if (mascotActiveRole && profile) {
      mascotActiveRole.textContent = profile.title;
      mascotActiveRole.classList.remove('is-general', 'is-pancasila');
      if (teacherId === 'general') {
        mascotActiveRole.classList.add('is-general');
      } else if (teacherId === 'pancasila') {
        mascotActiveRole.classList.add('is-pancasila');
      }
    }
    if (mascotPedagogyHint) {
      if (teacherId === 'math') {
        mascotPedagogyHint.textContent = 'Tanya soal operasi hitung, pecahan, atau rumus matematika seru hari ini!';
      } else if (teacherId === 'pancasila') {
        mascotPedagogyHint.textContent = 'Tanya makna 5 sila Pancasila, lambang Garuda, hak & kewajiban anak, atau gotong royong!';
      } else {
        mascotPedagogyHint.textContent = 'Tanya rahasia sains alam, luar angkasa, atau sejarah seru hari ini!';
      }
    }

    if (window.setCodiTeacherTheme) {
      window.setCodiTeacherTheme(teacherId);
    }
  }

  function enterTeacherWorkspace(teacherId) {
    if (!currentUser || !currentSession) {
      openAuthModal();
      showToast('Silakan masuk dengan Akun Google terlebih dahulu.');
      return;
    }

    currentTeacher = teacherId;
    currentTeacherFilter = teacherId;
    try {
      localStorage.setItem('codi_selected_teacher', teacherId);
    } catch (e) {}

    // Find latest session for this teacher, or create a fresh one
    let targetSession = chatSessions.find((s) => s.teacherId === teacherId);
    if (!targetSession) {
      const defaultTitle = teacherId === 'math'
        ? 'Latihan Berhitung Seru'
        : teacherId === 'pancasila'
        ? 'Pendidikan Pancasila & Nilai Luhur'
        : 'Eksplorasi Sains & Flora Fauna';
      targetSession = createDefaultSession(teacherId, defaultTitle);
      chatSessions.unshift(targetSession);
      persistSessionAndGreetingToDb(targetSession);
    }

    activeSessionId = targetSession.id;
    applyTeacherVisuals(teacherId);
    updateActiveSessionHeader(targetSession);
    renderChatStream();
    renderQuickChips();
    renderQuotaUI();
    if (typeof syncSidebarTeacherPills === 'function') {
      syncSidebarTeacherPills();
    }
    renderSidebarSessions();
    if (window.innerWidth < 768) {
      collapseSidebar();
    }
    showView('chatWorkspace');

    // Zero autoplay: stop any previous audio playback
    stopCurrentMessageAudio();

    requestAnimationFrame(() => {
      if (window.refreshCodi3D) {
        window.refreshCodi3D();
      }
    });
  }

  if (btnSelectMath) {
    btnSelectMath.addEventListener('click', () => enterTeacherWorkspace('math'));
  }

  if (btnSelectGeneral) {
    btnSelectGeneral.addEventListener('click', () => enterTeacherWorkspace('general'));
  }

  if (btnSelectPancasila) {
    btnSelectPancasila.addEventListener('click', () => enterTeacherWorkspace('pancasila'));
  }

  if (btnBackToTeacherSelect) {
    btnBackToTeacherSelect.addEventListener('click', () => {
      stopCurrentMessageAudio();
      showView('teacherSelect');
    });
  }

  function getNextTeacher(teacherId) {
    if (teacherId === 'math') return 'general';
    if (teacherId === 'general') return 'pancasila';
    return 'math';
  }

  if (activeTeacherIndicator) {
    activeTeacherIndicator.addEventListener('click', () => {
      enterTeacherWorkspace(getNextTeacher(currentTeacher));
    });
  }

  // 8. ChatGPT-Style Sidebar History Controls
  const sidebarEl = document.getElementById('workspace-sidebar');
  const sidebarBackdrop = document.getElementById('workspace-sidebar-backdrop');
  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  const btnCollapseSidebar = document.getElementById('btn-collapse-sidebar');
  const btnRailExpand = document.getElementById('btn-rail-expand');
  const btnRailSearch = document.getElementById('btn-rail-search');
  const btnRailTeacher = document.getElementById('btn-rail-teacher');
  const sidebarBrandToggle = document.getElementById('sidebar-brand-toggle');
  const btnNewChat = document.getElementById('btn-new-chat');
  const btnNavNewChatMobile = document.getElementById('btn-nav-new-chat-mobile');
  const sidebarSearchInput = document.getElementById('sidebar-search-input');
  const filterTabPills = document.querySelectorAll('.filter-tab-pill');

  function triggerSmoothLayoutSync() {
    if (!window.refreshCodi3D) return;
    const start = performance.now();
    function tick(now) {
      window.refreshCodi3D();
      if (now - start < 360) {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
  }

  function collapseSidebar() {
    if (sidebarEl) {
      sidebarEl.classList.add('is-collapsed');
      sidebarEl.classList.remove('is-open');
    }
    if (sidebarBackdrop) {
      sidebarBackdrop.classList.remove('is-open');
    }
    if (window.innerWidth >= 768) {
      try {
        localStorage.setItem('codi_sidebar_collapsed', '1');
      } catch (e) {}
    }
    triggerSmoothLayoutSync();
  }

  function expandSidebar() {
    if (sidebarEl) {
      sidebarEl.classList.remove('is-collapsed');
      if (window.innerWidth < 768) {
        sidebarEl.classList.add('is-open');
      }
    }
    if (sidebarBackdrop && window.innerWidth < 768) {
      sidebarBackdrop.classList.add('is-open');
    }
    if (window.innerWidth >= 768) {
      try {
        localStorage.setItem('codi_sidebar_collapsed', '0');
      } catch (e) {}
    }
    triggerSmoothLayoutSync();
  }

  if (btnCollapseSidebar) btnCollapseSidebar.addEventListener('click', collapseSidebar);
  if (btnToggleSidebar) btnToggleSidebar.addEventListener('click', expandSidebar);
  if (btnRailExpand) btnRailExpand.addEventListener('click', expandSidebar);
  if (sidebarBrandToggle) {
    sidebarBrandToggle.addEventListener('click', () => {
      if (sidebarEl && sidebarEl.classList.contains('is-collapsed')) {
        expandSidebar();
      }
    });
  }
  if (btnRailSearch) {
    btnRailSearch.addEventListener('click', () => {
      expandSidebar();
      setTimeout(() => {
        if (sidebarSearchInput) {
          sidebarSearchInput.focus();
        }
      }, 150);
    });
  }
  if (btnRailTeacher) {
    btnRailTeacher.addEventListener('click', () => {
      stopCurrentMessageAudio();
      showView('teacherSelect');
    });
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', collapseSidebar);
    sidebarBackdrop.addEventListener('touchstart', collapseSidebar, { passive: true });
  }

  // Click outside sidebar on mobile to close drawer
  document.addEventListener('click', (e) => {
    if (window.innerWidth < 768 && sidebarEl && sidebarEl.classList.contains('is-open')) {
      if (!sidebarEl.contains(e.target) && !btnToggleSidebar?.contains(e.target)) {
        collapseSidebar();
      }
    }
  });

  // Mobile initial state: ALWAYS closed by default!
  if (window.innerWidth < 768) {
    collapseSidebar();
  } else {
    try {
      const savedCollapsed = localStorage.getItem('codi_sidebar_collapsed');
      if (savedCollapsed === '1' && sidebarEl) {
        sidebarEl.classList.add('is-collapsed');
      }
    } catch (e) {}
  }

  // New Chat Action
  function createNewSession(teacherId = currentTeacher) {
    if (!currentUser || !currentSession) {
      openAuthModal();
      return;
    }
    stopCurrentMessageAudio();
    const profile = window.CodiAI && window.CodiAI.TEACHER_PROFILES ? window.CodiAI.TEACHER_PROFILES[teacherId] : null;
    const teacherName = profile ? profile.name : 'Codi';
    const newSession = createDefaultSession(teacherId, 'Obrolan Baru');

    chatSessions.unshift(newSession);
    activeSessionId = newSession.id;
    currentTeacher = teacherId;

    applyTeacherVisuals(teacherId);
    updateActiveSessionHeader(newSession);
    renderChatStream();
    renderQuickChips();
    renderQuotaUI();
    renderSidebarSessions();
    persistSessionAndGreetingToDb(newSession);

    showToast(`Sesi obrolan baru dengan ${teacherName} siap!`);

    if (window.innerWidth < 768) {
      collapseSidebar();
    }
    if (textInput) {
      textInput.focus();
    }
  }

  if (btnNewChat) {
    btnNewChat.addEventListener('click', () => createNewSession(currentTeacher));
  }
  if (btnNavNewChatMobile) {
    btnNavNewChatMobile.addEventListener('click', () => createNewSession(currentTeacher));
  }

  // Teacher Switcher & History Filter Tabs in Sidebar
  function syncSidebarTeacherPills() {
    if (!filterTabPills || filterTabPills.length === 0) return;
    filterTabPills.forEach((pill) => {
      const filter = pill.getAttribute('data-filter');
      let isActive = false;
      if (currentTeacherFilter === 'all') {
        isActive = (filter === 'all');
      } else {
        isActive = (filter === currentTeacher);
      }
      pill.classList.toggle('is-active', isActive);
      pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  filterTabPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const filter = pill.getAttribute('data-filter') || 'all';

      if (filter === 'math' || filter === 'general' || filter === 'pancasila') {
        currentTeacherFilter = filter;
        syncSidebarTeacherPills();
        enterTeacherWorkspace(filter);
        const name = filter === 'math'
          ? 'Pak Codi (Matematika)'
          : filter === 'pancasila'
          ? 'Kak Codi (Pendidikan Pancasila)'
          : 'Bu Codi (IPA & Umum)';
        showToast(`Asisten belajar aktif: ${name}`);
      } else {
        currentTeacherFilter = 'all';
        syncSidebarTeacherPills();
        renderSidebarSessions();
        showToast('Menampilkan seluruh riwayat obrolan');
      }
    });
  });

  // Sidebar Search Bar
  if (sidebarSearchInput) {
    sidebarSearchInput.addEventListener('input', (e) => {
      sidebarSearchQuery = e.target.value || '';
      renderSidebarSessions();
    });
  }

  function switchSession(sessionId) {
    stopCurrentMessageAudio();
    const session = chatSessions.find((s) => s.id === sessionId);
    if (!session) return;

    if (window.innerWidth < 768) {
      collapseSidebar();
    }

    activeSessionId = session.id;
    currentTeacher = session.teacherId;
    try {
      localStorage.setItem('codi_selected_teacher', session.teacherId);
    } catch (e) {}

    applyTeacherVisuals(session.teacherId);
    updateActiveSessionHeader(session);
    renderChatStream();
    renderQuickChips();
    syncSidebarTeacherPills();
    renderSidebarSessions();
    saveChatSessions();
  }

  async function deleteSession(sessionId) {
    const idx = chatSessions.findIndex((s) => s.id === sessionId);
    if (idx === -1) return;

    const target = chatSessions[idx];
    stopCurrentMessageAudio();
    chatSessions.splice(idx, 1);

    if (supabaseClient && currentUser && target && target.persisted) {
      try {
        await supabaseClient
          .from('chat_sessions')
          .delete()
          .eq('id', sessionId)
          .eq('user_id', currentUser.id);
      } catch (err) {
        console.warn('Delete session DB note:', err);
      }
    }

    if (chatSessions.length === 0) {
      const freshSession = createDefaultSession(currentTeacher, 'Obrolan Baru');
      chatSessions.push(freshSession);
      activeSessionId = freshSession.id;
      persistSessionAndGreetingToDb(freshSession);
    } else if (activeSessionId === sessionId) {
      activeSessionId = chatSessions[0].id;
    }

    const active = getActiveSession();
    if (active) {
      currentTeacher = active.teacherId;
      applyTeacherVisuals(active.teacherId);
      updateActiveSessionHeader(active);
    }

    renderSidebarSessions();
    renderChatStream();
    renderQuickChips();
    renderQuotaUI();
    showToast('Obrolan berhasil dihapus.', 'success');
  }

  async function clearAllSessions() {
    stopCurrentMessageAudio();

    if (supabaseClient && currentUser) {
      try {
        await supabaseClient
          .from('chat_sessions')
          .delete()
          .eq('user_id', currentUser.id);
      } catch (err) {
        console.warn('Clear all sessions DB note:', err);
      }
    }

    const freshSession = createDefaultSession(currentTeacher, 'Obrolan Baru');
    chatSessions = [freshSession];
    activeSessionId = freshSession.id;
    persistSessionAndGreetingToDb(freshSession);

    applyTeacherVisuals(currentTeacher);
    updateActiveSessionHeader(freshSession);
    renderSidebarSessions();
    renderChatStream();
    renderQuickChips();
    renderQuotaUI();
    showToast('Seluruh riwayat chat berhasil dibersihkan mulai dari nol.', 'success');
  }
  window.clearCodiAllSessions = clearAllSessions;

  const btnClearAllHistory = document.getElementById('btn-clear-all-history');
  if (btnClearAllHistory) {
    btnClearAllHistory.addEventListener('click', async (e) => {
      e.stopPropagation();
      const confirmClear = await showCustomConfirm({
        title: 'Hapus Semua Riwayat?',
        message: 'Apakah adik yakin ingin menghapus semua riwayat chat dan mulai belajar dari nol?',
        confirmText: 'Ya, Hapus Semua',
        cancelText: 'Batal',
        type: 'danger'
      });
      if (confirmClear) {
        clearAllSessions();
      }
    });
  }


  function renderSidebarSessions() {
    const sidebarList = document.getElementById('sidebar-history-list');
    if (!sidebarList) return;
    sidebarList.innerHTML = '';

    let filtered = chatSessions.slice();

    if (currentTeacherFilter !== 'all') {
      filtered = filtered.filter((s) => s.teacherId === currentTeacherFilter);
    }

    if (sidebarSearchQuery.trim()) {
      const q = sidebarSearchQuery.toLowerCase().trim();
      filtered = filtered.filter((s) => {
        if (s.title && s.title.toLowerCase().includes(q)) return true;
        if (formatSessionDate(s.createdAt).toLowerCase().includes(q)) return true;
        return s.messages && s.messages.some((m) => m.text && m.text.toLowerCase().includes(q));
      });
    }

    if (filtered.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'sidebar-empty-state';
      emptyDiv.textContent = sidebarSearchQuery.trim()
        ? 'Tidak ada obrolan yang cocok dengan pencarian.'
        : 'Belum ada riwayat obrolan.';
      sidebarList.appendChild(emptyDiv);
      return;
    }

    filtered.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

    const groups = {
      'Hari Ini': [],
      'Kemarin': [],
      '7 Hari Terakhir': [],
      'Sebelumnya': []
    };

    filtered.forEach((session) => {
      const groupKey = getSessionRelativeGroup(session.updatedAt || session.createdAt);
      if (groups[groupKey]) {
        groups[groupKey].push(session);
      } else {
        groups['Sebelumnya'].push(session);
      }
    });

    ['Hari Ini', 'Kemarin', '7 Hari Terakhir', 'Sebelumnya'].forEach((groupName) => {
      const items = groups[groupName];
      if (items.length === 0) return;

      const groupHeader = document.createElement('div');
      groupHeader.className = 'history-group-header';
      groupHeader.textContent = groupName;
      sidebarList.appendChild(groupHeader);

      const groupList = document.createElement('ul');
      groupList.className = 'history-group-list';
      groupList.setAttribute('aria-label', `Riwayat ${groupName}`);

      items.forEach((session) => {
        const isSelected = session.id === activeSessionId;
        const teacherProfile = window.CodiAI && window.CodiAI.TEACHER_PROFILES ? window.CodiAI.TEACHER_PROFILES[session.teacherId] : null;
        const teacherName = teacherProfile ? teacherProfile.name : 'Codi';
        const dateObj = new Date(session.updatedAt || session.createdAt);
        const timeStr = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : '';

        const itemLi = document.createElement('li');
        itemLi.className = `history-session-item ${isSelected ? 'is-active' : ''}`;
        itemLi.setAttribute('data-id', session.id);

        itemLi.innerHTML = `
          <button type="button" class="history-session-select-btn" aria-current="${isSelected ? 'true' : 'false'}">
            <div class="history-item-left">
              <span class="history-item-title">${escapeHtml(session.title)}</span>
              <div class="history-item-meta">
                <span class="history-teacher-badge ${session.teacherId === 'general' ? 'is-general' : session.teacherId === 'pancasila' ? 'is-pancasila' : ''}">${teacherName}</span>
                <span>${timeStr}</span>
              </div>
            </div>
          </button>
          <button type="button" class="btn-delete-session" data-delete-id="${session.id}" aria-label="Hapus obrolan ${escapeHtml(session.title)}" title="Hapus sesi obrolan">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
        `;

        const selectBtn = itemLi.querySelector('.history-session-select-btn');
        if (selectBtn) {
          selectBtn.addEventListener('click', () => {
            switchSession(session.id);
            if (window.innerWidth < 768) {
              collapseSidebar();
            }
          });
        }

        const deleteBtn = itemLi.querySelector('.btn-delete-session');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const sessionTitle = session.title || 'Obrolan ini';
            const confirmed = await showCustomConfirm({
              title: 'Hapus Obrolan?',
              message: 'Apakah adik yakin ingin menghapus obrolan "' + sessionTitle + '"?',
              confirmText: 'Ya, Hapus',
              cancelText: 'Batal',
              type: 'danger'
            });
            if (confirmed) {
              deleteSession(session.id);
            }
          });
        }

        groupList.appendChild(itemLi);
      });

      sidebarList.appendChild(groupList);
    });

    refreshIcons();
  }

  // 9. Chat Stream Rendering & Word-by-Word Streaming Typing Engine
  const chatFeed = document.getElementById('workspace-chat-feed');
  const chipsBar = document.getElementById('workspace-quick-chips');
  const chatForm = document.getElementById('workspace-chat-form');
  const textInput = document.getElementById('workspace-text-input');
  const mascotStateText = document.getElementById('mascot-state-text');

  let activePlayingAudio = {
    messageIndex: null,
    buttonElement: null
  };

  let isAiResponding = false;
  let currentChatAbortController = null;

  function autoResizeTextInput() {
    if (!textInput) return;
    textInput.style.height = 'auto';
    const nextHeight = Math.min(textInput.scrollHeight, 140);
    if (nextHeight > 0) {
      textInput.style.height = `${nextHeight}px`;
    }
  }

  function setDockStreamingState(streaming) {
    const sendBtnEl = document.getElementById('btn-dock-send');
    const stopBtnEl = document.getElementById('btn-dock-stop');
    if (stopBtnEl) {
      stopBtnEl.style.display = streaming ? 'inline-flex' : 'none';
    }
    if (sendBtnEl) {
      sendBtnEl.style.display = streaming ? 'none' : 'flex';
    }
    if (!streaming) {
      syncSendButtonState();
    }
  }

  const btnDockStop = document.getElementById('btn-dock-stop');
  if (btnDockStop) {
    btnDockStop.addEventListener('click', () => {
      if (currentChatAbortController) {
        currentChatAbortController.abort();
      }
    });
  }

  function stopCurrentMessageAudio() {
    if (window.CodiSpeech) {
      window.CodiSpeech.stopSpeaking();
    }
    if (activePlayingAudio.buttonElement) {
      updatePlayButtonUI(activePlayingAudio.buttonElement, false);
      activePlayingAudio.buttonElement = null;
    }
    activePlayingAudio.messageIndex = null;
    updateMascotStateUI('Codi Siap Menjawab', 'idle');
  }

  // Helper format nama model AI agar tampil ramah dan rapi
  function formatModelLabel(rawModel) {
    if (!rawModel || rawModel === 'auto') return 'Otomatis';
    let clean = rawModel.replace(/^@makers\//, '').replace(/^openai\//, '');
    if (clean === 'deepseek-v4.1-flash') return 'DeepSeek 4.1 Flash';
    if (clean === 'deepseek-v4-flash') return 'DeepSeek 4 Flash';
    if (clean === 'deepseek-v4-pro') return 'DeepSeek 4 Pro';
    if (clean === 'kimi-k2.6') return 'Kimi K2.6';
    if (clean === 'minimax-m3') return 'MiniMax M3';
    if (clean === 'minimax-m2.7') return 'MiniMax M2.7';
    if (clean === 'hy3') return 'Hunyuan 3';
    return clean
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  // Internal Smart Auto-Model Routing (No technical AI picker exposed in UI)
  let selectedModel = 'auto';
  let availableModels = [];

  function updateModelPickerUI() {
    const labelEl = document.getElementById('dock-model-pill-label');
    if (labelEl) {
      labelEl.textContent = formatModelLabel(selectedModel);
    }
    const options = document.querySelectorAll('.dock-model-option');
    options.forEach(opt => {
      const optModel = opt.getAttribute('data-model');
      if (optModel === selectedModel) {
        opt.classList.add('is-selected');
      } else {
        opt.classList.remove('is-selected');
      }
    });
  }

  function initModelPicker() {
    const pillBtn = document.getElementById('btn-dock-model-pill');
    const menuEl = document.getElementById('dock-model-menu');
    const menuListEl = document.getElementById('dock-model-menu-list');

    if (!pillBtn || !menuEl) return;

    pillBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menuEl.classList.contains('is-open');
      if (isOpen) {
        menuEl.classList.remove('is-open');
        pillBtn.setAttribute('aria-expanded', 'false');
      } else {
        menuEl.classList.add('is-open');
        pillBtn.setAttribute('aria-expanded', 'true');
      }
    });

    document.addEventListener('click', (e) => {
      if (!menuEl.contains(e.target) && !pillBtn.contains(e.target)) {
        menuEl.classList.remove('is-open');
        pillBtn.setAttribute('aria-expanded', 'false');
      }
    });

    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.models)) {
          availableModels = data.models;
          renderModelPickerMenu(menuListEl, menuEl, pillBtn);
        }
      })
      .catch(err => {
        console.warn('Gagal memuat status model LLM:', err);
      });
  }

  // Helper deskripsi ramah anak untuk gaya berpikir model AI
  function getModelKidFriendlyDesc(rawModel, idx) {
    const m = (rawModel || '').toLowerCase();
    if (m.includes('v4.1-flash') || (m.includes('flash') && idx === 0)) {
      return 'Menjawab secepat kilat untuk tanya jawab harian';
    }
    if (m.includes('flash')) {
      return 'Cepat dan tanggap untuk latihan harian';
    }
    if (m.includes('pro')) {
      return 'Penjelasan mendalam dan terperinci untuk soal sulit';
    }
    if (m.includes('kimi')) {
      return 'Gaya bahasa ceria dan asyik untuk cerita sains';
    }
    if (m.includes('minimax-m3')) {
      return 'Kreatif dan ramah untuk belajar pengetahuan umum';
    }
    if (m.includes('minimax')) {
      return 'Ramah dan sabar untuk tanya jawab santai';
    }
    if (m.includes('hy3') || m.includes('hunyuan')) {
      return 'Teliti dan pintar untuk latihan soal berhitung';
    }
    if (m.includes('gpt')) {
      return 'Pengetahuan luas dan pintar membimbing';
    }
    if (m.includes('claude')) {
      return 'Bahasa yang santun dan penjelasan terstruktur';
    }
    return 'Siap membimbing adik belajar dengan ceria';
  }

  function renderModelPickerMenu(menuListEl, menuEl, pillBtn) {
    if (!menuListEl) return;
    menuListEl.innerHTML = '';

    // 1. Opsi Otomatis (Rekomendasi Cerdas untuk Anak)
    const autoOption = document.createElement('button');
    autoOption.type = 'button';
    autoOption.className = `dock-model-option ${selectedModel === 'auto' ? 'is-selected' : ''}`;
    autoOption.setAttribute('data-model', 'auto');
    autoOption.innerHTML = `
      <div class="dock-model-option-info">
        <span class="dock-model-option-name"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap" style="display:inline-block; vertical-align:-1px; margin-right:4px;" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Otomatis (Rekomendasi)</span>
        <span class="dock-model-option-desc">Paling cepat menjawab dan selalu siap sedia</span>
      </div>
      <span class="dock-model-option-check">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"/></svg>
      </span>
    `;
    autoOption.addEventListener('click', () => {
      selectModel('auto', menuEl, pillBtn);
    });
    menuListEl.appendChild(autoOption);

    // 2. Daftar Gaya Model Bersih Tanpa Kode Teknis
    availableModels.forEach((m, idx) => {
      const isSelected = selectedModel === m;
      const opt = document.createElement('button');
      opt.type = 'button';
      opt.className = `dock-model-option ${isSelected ? 'is-selected' : ''}`;
      opt.setAttribute('data-model', m);
      const friendlyName = formatModelLabel(m);
      const kidDesc = getModelKidFriendlyDesc(m, idx);

      opt.innerHTML = `
        <div class="dock-model-option-info">
          <span class="dock-model-option-name">${friendlyName}</span>
          <span class="dock-model-option-desc">${kidDesc}</span>
        </div>
        <span class="dock-model-option-check">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
      `;

      opt.addEventListener('click', () => {
        selectModel(m, menuEl, pillBtn);
      });
      menuListEl.appendChild(opt);
    });

    updateModelPickerUI();
  }

  function selectModel(modelId, menuEl, pillBtn) {
    selectedModel = modelId;
    localStorage.setItem('codi_selected_model', modelId);
    updateModelPickerUI();
    if (menuEl) menuEl.classList.remove('is-open');
    if (pillBtn) pillBtn.setAttribute('aria-expanded', 'false');
    showToast(`Gaya belajar aktif: ${formatModelLabel(modelId)}`);
  }

  function updatePlayButtonUI(btn, isPlaying) {
    if (!btn) return;
    const isActionBubble = btn.classList.contains('btn-action-bubble');
    if (isPlaying) {
      btn.classList.add('is-playing');
      btn.setAttribute('aria-label', 'Hentikan suara');
      btn.setAttribute('title', 'Hentikan suara');
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="lucide lucide-square" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
        <span>Berhenti</span>
      `;
    } else {
      btn.classList.remove('is-playing');
      btn.setAttribute('aria-label', 'Dengarkan suara');
      btn.setAttribute('title', 'Dengarkan dengan suara');
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
        <span>Dengarkan</span>
      `;
    }
  }

  function updateMascotStateUI(text, stateKey) {
    if (mascotStateText) {
      mascotStateText.textContent = text;
    }
    if (window.setCodiState) {
      window.setCodiState(stateKey);
    }

    const mascotCard = document.getElementById('workspace-mascot-card');
    const waveform = document.getElementById('mascot-speaking-waveform');
    if (mascotCard) {
      if (stateKey === 'speaking') {
        mascotCard.classList.add('is-speaking');
      } else {
        mascotCard.classList.remove('is-speaking');
      }
    }
    if (waveform) {
      waveform.style.display = stateKey === 'speaking' ? 'inline-flex' : 'none';
    }
  }

  function handleSpeakMessage(text, speakBtn, idx, teacherName) {
    if (!window.CodiSpeech) return;

    if (activePlayingAudio.messageIndex === idx) {
      stopCurrentMessageAudio();
      return;
    }

    stopCurrentMessageAudio();

    if (window.CodiSpeech.state.isMuted) {
      window.CodiSpeech.toggleMute();
    }

    activePlayingAudio.messageIndex = idx;
    activePlayingAudio.buttonElement = speakBtn;
    updatePlayButtonUI(speakBtn, true);

    updateMascotStateUI(`${teacherName} sedang berbicara...`, 'speaking');

    window.CodiSpeech.speakText(
      text,
      () => {
        updatePlayButtonUI(speakBtn, true);
        updateMascotStateUI(`${teacherName} sedang berbicara...`, 'speaking');
      },
      () => {
        updatePlayButtonUI(speakBtn, false);
        if (activePlayingAudio.messageIndex === idx) {
          activePlayingAudio.messageIndex = null;
          activePlayingAudio.buttonElement = null;
        }
        updateMascotStateUI('Codi Siap Menjawab', 'idle');
      }
    );
  }

  // Hoisted Regular Expressions for High-Performance Markdown Parsing (js-hoist-regexp)
  const RE_THINK_CLOSED = /<think>[\s\S]*?<\/think>/gi;
  const RE_THINK_OPEN = /<think>[\s\S]*/gi;
  const RE_AMP = /&/g;
  const RE_LT = /</g;
  const RE_GT = />/g;
  const RE_FLAG_EMOJIS = /(?:[\uD83C][\uDDE6-\uDDFF]){1,2}/g;
  const RE_EM_DASH = /—/g;
  const RE_NUM_LIST_MERGED1 = /:\s*(\d+\.\s+)/g;
  const RE_NUM_LIST_MERGED2 = /([^\n])\s+(\d+\.\s+\*\*)/g;
  const RE_NUM_LIST_MERGED3 = /([^\n])\s+(\d+\.\s+[A-Z])/g;
  const RE_END_SENTENCE = /(!|\.)\s+(Pak Codi akan|Bu Codi akan|Kamu pasti bisa|Ayo|Sekarang[,:]?|Pertanyaan\b)/g;
  const RE_EMOJI_SPLIT = /(💪|✨|🌟|🎯|🚀)\s*(Sekarang|Pertanyaan|Ayo|Coba)/g;
  const RE_CODE_BLOCK = /```([a-z]*)\n([\s\S]*?)```/g;
  const RE_INLINE_CODE = /`([^`]+)`/g;
  const RE_BOLD = /\*\*([^*]+)\*\*/g;
  const RE_ITALIC = /\*([^*]+)\*/g;
  const RE_DOUBLE_NEWLINE = /\n\s*\n/;
  const RE_NUM_LINE = /^\d+\.\s+/;
  const RE_BULLET_LINE = /^[-*•]\s+/;
  const RE_LIST_CLEAN = /^\d+\.\s+|^[-*•]\s+/;

  function renderMarkdownToHtml(raw) {
    if (!raw) return '';

    // 1. Bersihkan token think
    let text = raw.replace(RE_THINK_CLOSED, '').replace(RE_THINK_OPEN, '').trim();

    // 2. Escape tag HTML berbahaya
    text = text
      .replace(RE_AMP, '&amp;')
      .replace(RE_LT, '&lt;')
      .replace(RE_GT, '&gt;');

    // 2b. Bersihkan emoji bendera regional indicator yang rusak jadi huruf teks di Windows (misal bendera RI 🇮🇩 menjadi "ID")
    text = text.replace(RE_FLAG_EMOJIS, '').replace(/\s+([.,?!])/g, '$1');

    // 3. Normalisasi tanda baca em dash panjang menjadi tanda hubung bersih
    text = text.replace(RE_EM_DASH, ' - ');

    // 4. Pisahkan daftar nomor jika tergabung dalam satu baris tanpa baris baru
    text = text.replace(RE_NUM_LIST_MERGED1, ':\n$1');
    text = text.replace(RE_NUM_LIST_MERGED2, '$1\n$2');
    text = text.replace(RE_NUM_LIST_MERGED3, '$1\n$2');

    // 5. Pisahkan kalimat penutup atau pertanyaan di akhir menjadi paragraf tersendiri
    text = text.replace(RE_END_SENTENCE, '$1\n\n$2');
    text = text.replace(RE_EMOJI_SPLIT, '\n\n$1 $2');

    // 6. Format Blok Kode
    text = text.replace(RE_CODE_BLOCK, (match, lang, code) => {
      return `<pre class="chat-code-block"><code>${code.trim()}</code></pre>`;
    });

    // 7. Format Kode Inline
    text = text.replace(RE_INLINE_CODE, '<code class="chat-inline-code">$1</code>');

    // 8. Format Bold (**teks**) dan Italic (*teks*)
    text = text.replace(RE_BOLD, '<strong>$1</strong>');
    text = text.replace(RE_ITALIC, '<em>$1</em>');

    // 9. Pisahkan blok menjadi Paragraf dan List terstruktur
    const rawBlocks = text.split(RE_DOUBLE_NEWLINE);
    const htmlBlocks = rawBlocks.map(block => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return '';

      if (trimmedBlock.startsWith('<pre') && trimmedBlock.endsWith('</pre>')) {
        return trimmedBlock;
      }

      const lines = trimmedBlock.split('\n').map(l => l.trim()).filter(Boolean);
      let formattedFragments = [];
      let inList = false;
      let listType = null;
      let listItems = [];

      for (const line of lines) {
        const isNum = RE_NUM_LINE.test(line);
        const isBullet = RE_BULLET_LINE.test(line);

        if (isNum || isBullet) {
          const currentType = isNum ? 'ol' : 'ul';
          if (!inList) {
            inList = true;
            listType = currentType;
            listItems = [];
          } else if (listType !== currentType) {
            formattedFragments.push(`<${listType} class="chat-${listType === 'ol' ? 'ordered' : 'unordered'}-list">${listItems.join('')}</${listType}>`);
            listType = currentType;
            listItems = [];
          }
          const cleaned = line.replace(RE_LIST_CLEAN, '');
          listItems.push(`<li>${cleaned}</li>`);
        } else {
          if (inList) {
            formattedFragments.push(`<${listType} class="chat-${listType === 'ol' ? 'ordered' : 'unordered'}-list">${listItems.join('')}</${listType}>`);
            inList = false;
            listType = null;
            listItems = [];
          }
          formattedFragments.push(`<p class="chat-para">${line}</p>`);
        }
      }

      if (inList) {
        formattedFragments.push(`<${listType} class="chat-${listType === 'ol' ? 'ordered' : 'unordered'}-list">${listItems.join('')}</${listType}>`);
      }

      return formattedFragments.join('');
    });

    return htmlBlocks.filter(Boolean).join('');
  }

  function createAiActionBar(msg, idx, teacherName) {
    const bar = document.createElement('div');
    bar.className = 'chat-bubble-actions';

    // 1. Baca Suara (Dengarkan)
    const speakBtn = document.createElement('button');
    speakBtn.type = 'button';
    speakBtn.className = 'btn-action-bubble btn-action-speaker';
    const isCurrentlyPlaying = activePlayingAudio.messageIndex === idx;
    if (isCurrentlyPlaying) {
      activePlayingAudio.buttonElement = speakBtn;
    }
    updatePlayButtonUI(speakBtn, isCurrentlyPlaying);
    speakBtn.addEventListener('click', () => {
      handleSpeakMessage(msg.text, speakBtn, idx, teacherName);
    });
    bar.appendChild(speakBtn);

    // 2. Salin Jawaban
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'btn-action-bubble btn-action-copy';
    copyBtn.setAttribute('aria-label', 'Salin jawaban');
    copyBtn.setAttribute('title', 'Salin jawaban');
    const copyDefaultHtml = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      <span>Salin</span>
    `;
    copyBtn.innerHTML = copyDefaultHtml;

    copyBtn.addEventListener('click', () => {
      const rawText = msg.text || '';
      const cleanPlain = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      navigator.clipboard.writeText(cleanPlain).then(() => {
        copyBtn.classList.add('is-copied');
        copyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Tersalin</span>
        `;
        showToast('Jawaban berhasil disalin!');
        setTimeout(() => {
          copyBtn.classList.remove('is-copied');
          copyBtn.innerHTML = copyDefaultHtml;
        }, 1600);
      }).catch(() => {
        showToast('Gagal menyalin jawaban');
      });
    });
    bar.appendChild(copyBtn);

    // 3. Buat Ulang Jawaban (Ulangi)
    const regenBtn = document.createElement('button');
    regenBtn.type = 'button';
    regenBtn.className = 'btn-action-bubble btn-action-regenerate';
    regenBtn.setAttribute('aria-label', 'Ulangi penjelasan guru');
    regenBtn.setAttribute('title', 'Minta penjelasan ulang');
    regenBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-cw" aria-hidden="true"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
      <span>Ulangi</span>
    `;

    regenBtn.addEventListener('click', () => {
      if (isAiResponding) return;
      if (quotaState.remaining <= 0) {
        renderQuotaUI();
        showToast('Kuota 15 chat habis. Istirahat sebentar sampai kuota terisi kembali ya!', 'warning');
        return;
      }
      const session = getActiveSession();
      if (!session) return;

      let promptToReRun = '';
      for (let i = idx - 1; i >= 0; i--) {
        if (session.messages[i] && session.messages[i].sender === 'user') {
          promptToReRun = session.messages[i].text;
          break;
        }
      }

      if (!promptToReRun) {
        showToast('Tidak ada pertanyaan sebelumnya untuk diulang.');
        return;
      }

      const [removedMsg] = session.messages.splice(idx, 1);
      if (removedMsg && removedMsg.id && removedMsg.persisted) {
        deleteMessageFromDb(removedMsg.id);
      }
      renderChatStream();

      handleUserSubmit(promptToReRun, true);
    });
    bar.appendChild(regenBtn);

    return bar;
  }

  function renderChatStream() {
    if (!chatFeed) return;
    chatFeed.innerHTML = '';

    const session = getActiveSession();
    const messages = session ? session.messages : [];

    messages.forEach((msg, idx) => {
      const row = document.createElement('div');
      row.className = `chat-bubble-row from-${msg.sender}`;

      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble';

      if (msg.sender === 'ai') {
        const senderLabel = document.createElement('div');
        senderLabel.className = 'chat-bubble-sender';
        senderLabel.textContent = `${msg.teacherName || 'Codi'} • ${msg.timestamp}`;
        bubble.appendChild(senderLabel);

        const content = document.createElement('div');
        content.className = 'chat-bubble-content';
        content.innerHTML = renderMarkdownToHtml(msg.text);
        bubble.appendChild(content);

        // ChatGPT-Style Action Bar under AI response
        const actionBar = createAiActionBar(msg, idx, msg.teacherName || 'Codi');
        bubble.appendChild(actionBar);
      } else {
        const content = document.createElement('div');
        content.className = 'chat-bubble-content';
        content.textContent = msg.text;
        bubble.appendChild(content);
      }

      row.appendChild(bubble);
      chatFeed.appendChild(row);
    });

    scrollChatToBottom();
    refreshIcons();
  }


  function scrollChatToBottom(smooth = true) {
    if (!chatFeed) return;
    requestAnimationFrame(() => {
      chatFeed.scrollTo({
        top: chatFeed.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
      setTimeout(() => {
        chatFeed.scrollTop = chatFeed.scrollHeight;
      }, 60);
    });
  }

  // Generator Saran Pertanyaan Kontekstual Dinamis (Dynamic Follow-up Suggestions)
  function generateContextualSuggestions(session) {
    if (!session) return [];
    const teacherId = session.teacherId || currentTeacher || 'math';
    const profile = window.CodiAI && window.CodiAI.TEACHER_PROFILES ? window.CodiAI.TEACHER_PROFILES[teacherId] : null;
    const defaultPrompts = profile && profile.quickPrompts ? [...profile.quickPrompts] : [];

    const userMsgs = (session.messages || []).filter(m => m.sender === 'user');
    // Jika belum ada chat dari user (baru buka / greeting awal), tampilkan saran default awal
    if (userMsgs.length === 0) {
      return defaultPrompts;
    }

    const lastUserText = userMsgs[userMsgs.length - 1].text || '';
    const aiMsgs = (session.messages || []).filter(m => m.sender === 'ai');
    const lastAiText = aiMsgs.length > 0 ? aiMsgs[aiMsgs.length - 1].text || '' : '';
    const ctx = (lastUserText + ' ' + lastAiText).toLowerCase();

    // 1. Cek apakah respon AI menawarkan pilihan pertanyaan langsung
    if (/\b(sekolah atau di rumah|rumah atau di sekolah)\b/i.test(lastAiText)) {
      return [
        'Ceritakan contoh di sekolah dong!',
        'Bagaimana penerapannya kalau di rumah?',
        'Mau pelajari materi yang lain!'
      ];
    }
    if (/\b(tentang apa hari ini|materi apa yang ingin|mau mulai belajar apa)\b/i.test(lastAiText)) {
      if (teacherId === 'math') {
        return [
          'Belajar operasi hitung perkalian',
          'Cara mudah pecahan dan desimal',
          'Rumus bangun datar dan ruang'
        ];
      }
      if (teacherId === 'pancasila') {
        return [
          'Makna 5 Sila Pancasila',
          'Arti lambang Garuda Pancasila',
          'Contoh hak & kewajiban anak di sekolah'
        ];
      }
      return [
        'Rahasia tata surya & luar angkasa',
        'Kenapa daun warnanya hijau?',
        'Hewan langka khas nusantara'
      ];
    }

    // 2. Berdasarkan subjek guru & topik percakapan terakhir
    if (teacherId === 'pancasila') {
      // Sila 1: Bintang, Ketuhanan, Agama, Ibadah, Doa
      if (/\b(bintang|sila ke-1|sila 1|ketuhanan|ibadah|doa|agama|toleransi)\b/i.test(ctx)) {
        return [
          'Contoh pengamalan sila ke-1 di rumah',
          'Bagaimana cara menghargai teman beda agama?',
          'Apa arti lambang Bintang emas di perisai?',
          'Lanjut bahas Sila ke-2 dong!'
        ];
      }
      // Sila 2: Rantai, Kemanusiaan, Tolong, Menolong, Kasih, Teman
      if (/\b(rantai|sila ke-2|sila 2|kemanusiaan|tolong|menolong|kasih|dijahili|berbagi)\b/i.test(ctx)) {
        return [
          'Contoh tolong-menolong di lingkungan sekolah',
          'Apa arti gelang bulat & persegi pada lambang Rantai?',
          'Bagaimana jika melihat teman sedang diejek?',
          'Lanjut bahas Sila ke-3 dong!'
        ];
      }
      // Sila 3: Pohon Beringin, Persatuan, Rukun, Gotong Royong, Suku, Nusantara
      if (/\b(pohon beringin|beringin|sila ke-3|sila 3|persatuan|rukun|gotong royong|suku|nusantara)\b/i.test(ctx)) {
        return [
          'Contoh gotong royong membersihkan kelas',
          'Apa makna akar gantung Pohon Beringin?',
          'Mengapa kita harus rukun walau berbeda suku?',
          'Lanjut bahas Sila ke-4 dong!'
        ];
      }
      // Sila 4: Banteng, Musyawarah, Mufakat, Ketua Kelas, Berpendapat
      if (/\b(banteng|kepala banteng|sila ke-4|sila 4|musyawarah|mufakat|ketua kelas|pendapat|suara)\b/i.test(ctx)) {
        return [
          'Bagaimana musyawarah memilih ketua kelas?',
          'Mengapa lambang sila ke-4 Kepala Banteng?',
          'Apa artinya musyawarah untuk mufakat?',
          'Lanjut bahas Sila ke-5 dong!'
        ];
      }
      // Sila 5: Padi Kapas, Keadilan, Hak, Berbagi, Hemat
      if (/\b(padi dan kapas|padi|kapas|sila ke-5|sila 5|keadilan sosial|hemat|adil)\b/i.test(ctx)) {
        return [
          'Contoh bersikap adil kepada semua teman',
          'Apa arti lambang Padi dan Kapas?',
          'Apa bedanya hidup hemat dengan pelit?',
          'Rangkum makna kelima sila Pancasila dong!'
        ];
      }
      // Lambang Garuda Pancasila & Semboyan
      if (/\b(garuda|sayap|ekor|pita|bhinneka|lambang negara|perisai)\b/i.test(ctx)) {
        return [
          'Berapa jumlah bulu sayap dan ekor Garuda?',
          'Mengapa burung Garuda menoleh ke arah kanan?',
          'Apa arti semboyan Bhinneka Tunggal Ika?',
          'Apa saja 5 simbol di perisai dada Garuda?'
        ];
      }
      // Hak & Kewajiban
      if (/\b(hak|kewajiban|tanggung jawab|tugas anak|aturan sekolah)\b/i.test(ctx)) {
        return [
          'Sebutkan 3 hak anak di lingkungan rumah',
          'Apa saja kewajiban anak saat di sekolah?',
          'Mengapa kewajiban harus didahulukan dari hak?',
          'Apa aturan kesopanan yang wajib dipatuhi?'
        ];
      }
      // Budi Pekerti & Sopan Santun
      if (/\b(sopan|santun|budi pekerti|karakter|maaf|tolong|terima kasih|salam)\b/i.test(ctx)) {
        return [
          'Kapan kita memakai kata tolong, maaf, dan terima kasih?',
          'Bagaimana cara menunjukkan sopan santun ke guru?',
          'Sikap yang baik saat mendengarkan orang tua',
          'Tanya contoh gotong royong di sekolah'
        ];
      }
      // Pertanyaan identitas guru
      if (/\b(guru apa|siapa kamu|siapa anda|kak codi|namamu)\b/i.test(ctx)) {
        return [
          'Apa arti lambang Bintang di sila ke-1?',
          'Mengapa semboyan kita Bhinneka Tunggal Ika?',
          'Contoh gotong royong anak SD di sekolah',
          'Apa beda hak dan kewajiban anak?'
        ];
      }
      // Default dinamis Pancasila
      return [
        'Contoh pengamalan Pancasila sehari-hari',
        'Apa arti semboyan Bhinneka Tunggal Ika?',
        'Tanya hak dan kewajiban anak di sekolah',
        'Ceritakan makna lambang Garuda Pancasila'
      ];
    }

    if (teacherId === 'math') {
      // Pecahan & Desimal
      if (/\b(pecahan|pembilang|penyebut|desimal|persen|setengah|seperempat)\b/i.test(ctx)) {
        return [
          'Bagaimana cara menjumlahkan pecahan beda penyebut?',
          'Cara mudah mengubah pecahan biasa ke desimal',
          'Beri 1 contoh soal cerita pecahan yang seru!',
          'Apa arti pembilang dan penyebut?'
        ];
      }
      // Perkalian & Pembagian
      if (/\b(perkalian|kali|pembagian|bagi|porogapit|bersusun|tabel perkalian)\b/i.test(ctx)) {
        return [
          'Trik cepat menghafal perkalian 9 dengan jari',
          'Bagaimana langkah pembagian bersusun (porogapit)?',
          'Coba berikan 1 soal tantangan perkalian!',
          'Bagaimana perkalian angka ratusan?'
        ];
      }
      // Bangun Datar / Geometri
      if (/\b(bangun datar|persegi|panjang|segitiga|lingkaran|keliling|luas)\b/i.test(ctx)) {
        return [
          'Rumus keliling dan luas persegi panjang',
          'Bagaimana cara menghitung luas segitiga?',
          'Apa perbedaan antara keliling dan luas?',
          'Sifat-sifat bangun datar jajar genjang'
        ];
      }
      // Bangun Ruang
      if (/\b(bangun ruang|kubus|balok|tabung|kerucut|rusuk|sisi|sudut|volume)\b/i.test(ctx)) {
        return [
          'Berapa banyak rusuk dan titik sudut kubus?',
          'Bagaimana rumus mencari volume balok?',
          'Apa bedanya bangun datar dan bangun ruang?',
          'Bentuk jaring-jaring kubus seperti apa?'
        ];
      }
      // Pertanyaan identitas guru
      if (/\b(guru apa|siapa kamu|siapa anda|pak codi|namamu)\b/i.test(ctx)) {
        return [
          'Bisa bantu jelaskan materi pecahan?',
          'Trik cepat operasi hitung perkalian',
          'Coba beri aku 1 soal latihan matematika seru!',
          'Bagaimana cara menghitung luas bangun datar?'
        ];
      }
      // Default dinamis Matematika
      return [
        'Tips memahami soal cerita matematika',
        'Trik cepat perkalian matematika SD',
        'Cara mudah menghitung pecahan campuran',
        'Beri aku teka-teki logika angka seru!'
      ];
    }

    // Default: IPAS / Sains (Bu Codi)
    if (/\b(daun|hijau|klorofil|fotosintesis|tumbuhan|akar|batang|bunga)\b/i.test(ctx)) {
      return [
        'Apa saja yang dibutuhkan tumbuhan saat fotosintesis?',
        'Mengapa daun tumbuhan warnanya hijau?',
        'Bagaimana tumbuhan bernapas di malam hari?',
        'Apa fungsi akar dan batang bagi tumbuhan?'
      ];
    }
    if (/\b(hewan|binatang|fauna|komodo|orangutan|mamalia|karnivora|herbivora)\b/i.test(ctx)) {
      return [
        'Apa saja hewan endemik langka khas Indonesia?',
        'Apa perbedaan hewan herbivora, karnivora, dan omnivora?',
        'Bagaimana rantai makanan di hutan nusantara?',
        'Mengapa Komodo hanya ada di Indonesia?'
      ];
    }
    if (/\b(bumi|matahari|bulan|planet|tata surya|luar angkasa|bintang|gerhana)\b/i.test(ctx)) {
      return [
        'Mengapa bumi satu-satunya planet yang berpenghuni?',
        'Bagaimana proses terjadinya gerhana bulan?',
        'Apa planet terbesar di tata surya kita?',
        'Berapa lama waktu bumi mengelilingi matahari?'
      ];
    }
    if (/\b(hujan|air|siklus|awan|sungai|laut|alam|gunung)\b/i.test(ctx)) {
      return [
        'Bagaimana proses terjadinya hujan dari awal?',
        'Mengapa air laut rasanya asin?',
        'Bagaimana siklus air di bumi tidak pernah habis?',
        'Mengapa gunung berapi bisa meletus?'
      ];
    }
    if (/\b(pahlawan|kemerdekaan|kartini|diponegoro|nusantara|sejarah)\b/i.test(ctx)) {
      return [
        'Kisah perjuangan R.A. Kartini untuk anak Indonesia',
        'Mengapa Indonesia disebut negara kepulauan?',
        'Siapa saja tokoh pahlawan dari Maluku?',
        'Kisah peristiwa proklamasi kemerdekaan 1945'
      ];
    }
    // Pertanyaan identitas guru
    if (/\b(guru apa|siapa kamu|siapa anda|bu codi|namamu)\b/i.test(ctx)) {
      return [
        'Ceritakan misteri luar angkasa dong!',
        'Hewan unik asli Indonesia apa saja?',
        'Kenapa daun warnanya hijau?',
        'Bagaimana proses terjadinya hujan?'
      ];
    }
    // Default dinamis IPAS
    return [
      'Bagaimana proses terjadinya hujan?',
      'Hewan langka khas Indonesia apa saja?',
      'Kenapa bumi mengelilingi matahari?',
      'Kisah pahlawan nusantara yang inspiratif'
    ];
  }

  function renderQuickChips(targetSession = null) {
    if (!chipsBar) return;
    chipsBar.innerHTML = '';

    const session = targetSession || getActiveSession();
    const suggestions = generateContextualSuggestions(session);
    if (!suggestions || suggestions.length === 0) return;

    suggestions.forEach((prompt, index) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'btn-quick-chip';
      chip.textContent = prompt;
      chip.style.animationDelay = `${index * 45}ms`;
      chip.disabled = quotaState.remaining <= 0;
      chip.addEventListener('click', () => {
        handleUserSubmit(prompt);
      });
      chipsBar.appendChild(chip);
    });
  }

  function handleUserSubmit(userText, isRegen = false) {
    if (!currentUser || !currentSession) {
      openAuthModal();
      showToast('Silakan masuk dengan Akun Google terlebih dahulu.', 'warning');
      return;
    }
    if (quotaState.remaining <= 0) {
      renderQuotaUI();
      showToast('Kuota 15 chat per 12 jam sudah habis. Tunggu waktu reset berakhir ya!', 'warning');
      return;
    }
    if (!userText || !userText.trim() || isAiResponding) return;
    const cleanText = userText.trim();
    const session = getActiveSession();
    if (!session) return;

    stopCurrentMessageAudio();

    const now = new Date();
    const nowTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    let pendingUserMsg = null;
    const prevTitle = session.title;
    const prevUpdatedAt = session.updatedAt;

    // 1. Append user message if not regenerating
    if (!isRegen) {
      pendingUserMsg = {
        id: generateUuid(),
        sender: 'user',
        text: cleanText,
        timestamp: nowTime,
        isoTime: now.toISOString(),
        persisted: false
      };
      session.messages.push(pendingUserMsg);

      // Auto-title generation if new chat
      if (session.title === 'Obrolan Baru' || session.title.startsWith('Obrolan Baru')) {
        const words = cleanText.split(/\s+/).slice(0, 5).join(' ');
        session.title = words.length > 28 ? words.substring(0, 26) + '...' : words;
      }

      session.updatedAt = now.toISOString();
      renderChatStream();
      renderSidebarSessions();
      updateActiveSessionHeader(session);
    }

    const prevErrorRow = document.getElementById('chat-inline-error-row');
    if (prevErrorRow && prevErrorRow.parentNode) {
      prevErrorRow.parentNode.removeChild(prevErrorRow);
    }

    if (textInput) {
      textInput.value = '';
      autoResizeTextInput();
      syncSendButtonState();
    }

    function rollbackPendingUserMessage() {
      if (!isRegen && pendingUserMsg) {
        const msgIdx = session.messages.lastIndexOf(pendingUserMsg);
        if (msgIdx !== -1) {
          session.messages.splice(msgIdx, 1);
        }
        session.title = prevTitle;
        session.updatedAt = prevUpdatedAt;
        renderChatStream();
        renderSidebarSessions();
        updateActiveSessionHeader(session);
        if (textInput) {
          textInput.value = cleanText;
          autoResizeTextInput();
          syncSendButtonState();
        }
      }
    }

    // 2. Set Thinking State & Show Typing Indicator Dots
    isAiResponding = true;
    const abortController = new AbortController();
    currentChatAbortController = abortController;
    setDockStreamingState(true);
    updateMascotStateUI('Codi sedang berpikir...', 'thinking');

    const indicatorRow = document.createElement('div');
    indicatorRow.className = 'chat-bubble-row from-ai';
    indicatorRow.id = 'ai-typing-indicator';
    indicatorRow.innerHTML = `
      <div class="chat-bubble">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    chatFeed.appendChild(indicatorRow);
    scrollChatToBottom(true);

    // 3. Connect to Real LLM Streaming Endpoint (POST /api/chat)
    const teacherProfile = window.CodiAI && window.CodiAI.TEACHER_PROFILES ? window.CodiAI.TEACHER_PROFILES[session.teacherId] : null;
    const teacherName = teacherProfile ? teacherProfile.name : (session.teacherId === 'general' ? 'Bu Codi' : 'Pak Codi');
    const responseTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // 4. Create streaming AI bubble with animated cursor
    const aiRow = document.createElement('div');
    aiRow.className = 'chat-bubble-row from-ai';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';

    const senderLabel = document.createElement('div');
    senderLabel.className = 'chat-bubble-sender';
    senderLabel.textContent = `${teacherName} • ${responseTime}`;
    bubble.appendChild(senderLabel);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'chat-bubble-content';
    const textSpan = document.createElement('div');
    textSpan.className = 'streaming-text';
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'streaming-cursor';
    cursorSpan.setAttribute('aria-hidden', 'true');

    textSpan.appendChild(cursorSpan);
    contentDiv.appendChild(textSpan);
    bubble.appendChild(contentDiv);
    aiRow.appendChild(bubble);

    let fullText = '';

    function appendInlineCursor() {
      if (cursorSpan.parentNode) {
        cursorSpan.parentNode.removeChild(cursorSpan);
      }
      const lastEl = textSpan.lastElementChild;
      if (lastEl && /^(P|LI|BLOCKQUOTE|H[1-6])$/.test(lastEl.tagName)) {
        lastEl.appendChild(cursorSpan);
      } else {
        textSpan.appendChild(cursorSpan);
      }
    }

    function finalizeAiResponse() {
      if (cursorSpan.parentNode) {
        cursorSpan.parentNode.removeChild(cursorSpan);
      }

      textSpan.innerHTML = renderMarkdownToHtml(fullText);

      // Save completed message to active session
      const aiNow = new Date();
      const completedAiMsg = {
        id: generateUuid(),
        sender: 'ai',
        teacherName: teacherName,
        text: fullText,
        model: selectedModel,
        timestamp: responseTime,
        isoTime: aiNow.toISOString(),
        persisted: false
      };

      // Append simplified 3-action bar
      const actionBar = createAiActionBar(completedAiMsg, session.messages.length, teacherName);
      bubble.appendChild(actionBar);

      session.messages.push(completedAiMsg);
      session.updatedAt = aiNow.toISOString();
      persistMessageToDb(session, completedAiMsg);
      renderSidebarSessions();
      updateActiveSessionHeader(session);

      isAiResponding = false;
      currentChatAbortController = null;
      setDockStreamingState(false);
      updateMascotStateUI('Codi Siap Menjawab', 'idle');
      scrollChatToBottom(true);

      const srAnnouncer = document.getElementById('chat-sr-announcer');
      if (srAnnouncer) {
        const plainReply = fullText.replace(/[*_`#>]/g, '').replace(/\s+/g, ' ').trim();
        srAnnouncer.textContent = `${teacherName} menjawab: ${plainReply.slice(0, 260)}`;
      }

      // Perbarui saran pertanyaan cepat secara dinamis mengikuti alur chat
      renderQuickChips(session);
      renderQuotaUI();
    }

    function renderInlineRetryCard(friendlyMsg) {
      if (!chatFeed) return;
      const errRow = document.createElement('div');
      errRow.className = 'chat-bubble-row from-ai';
      errRow.id = 'chat-inline-error-row';
      errRow.innerHTML = `
        <div class="chat-bubble chat-error-card" role="status">
          <div class="chat-bubble-sender">${escapeHtml(teacherName)}</div>
          <p class="chat-para">${escapeHtml(friendlyMsg)}</p>
          <div class="chat-error-actions">
            <button type="button" class="btn-retry-chat">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-cw" aria-hidden="true"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
              <span>Coba Lagi</span>
            </button>
          </div>
        </div>
      `;
      const retryBtn = errRow.querySelector('.btn-retry-chat');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          if (errRow.parentNode) errRow.parentNode.removeChild(errRow);
          handleUserSubmit(cleanText, isRegen);
        });
      }
      chatFeed.appendChild(errRow);
      scrollChatToBottom(true);
    }

    function handleChatRequestError(errMessage, wasAborted = false) {
      if (indicatorRow.parentNode) {
        indicatorRow.parentNode.removeChild(indicatorRow);
      }
      if (aiRow.parentNode) {
        aiRow.parentNode.removeChild(aiRow);
      }
      isAiResponding = false;
      currentChatAbortController = null;
      setDockStreamingState(false);
      updateMascotStateUI('Codi Siap Menjawab', 'idle');

      if (wasAborted) {
        rollbackPendingUserMessage();
        showToast('Jawaban dihentikan.');
        return;
      }

      rollbackPendingUserMessage();
      const safeMessage = errMessage && !/HTTP\s*\d+/i.test(errMessage)
        ? errMessage
        : 'Koneksi sempat terputus sebelum Codi selesai menjawab. Yuk coba tanya lagi!';
      renderInlineRetryCard(safeMessage);
    }

    try {
      const activeToken = currentSession ? currentSession.access_token : '';
      fetch('/api/chat', {
        method: 'POST',
        signal: abortController.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          teacherId: session.teacherId,
          message: cleanText,
          selectedModel: selectedModel,
          history: session.messages.slice(-8)
        })
      }).then(async (response) => {
        if (response.status === 401) {
          if (indicatorRow.parentNode) indicatorRow.parentNode.removeChild(indicatorRow);
          isAiResponding = false;
          currentChatAbortController = null;
          setDockStreamingState(false);
          updateMascotStateUI('Sesi Login Berakhir', 'idle');
          rollbackPendingUserMessage();
          showToast('Sesi login Google sudah berakhir. Silakan masuk ulang.', 'warning');
          await logoutUser();
          openAuthModal();
          return;
        }

        if (response.status === 429) {
          if (indicatorRow.parentNode) indicatorRow.parentNode.removeChild(indicatorRow);
          isAiResponding = false;
          currentChatAbortController = null;
          setDockStreamingState(false);
          updateMascotStateUI('Batas Chat Tercapai', 'idle');
          rollbackPendingUserMessage();
          try {
            const errJson = await response.json();
            if (errJson && errJson.quota) {
              applyQuotaFromServer(errJson.quota);
            } else {
              await fetchUserQuota();
            }
          } catch (e) {
            await fetchUserQuota();
          }
          showToast('Kuota 15 chat per 12 jam sudah habis!', 'warning');
          return;
        }

        if (!response.ok || !response.body) {
          let errMsg = 'Maaf, Codi sedang sibuk sebentar. Yuk klik Coba Lagi!';
          try {
            const errJson = await response.json();
            if (errJson && errJson.error && !/HTTP\s*\d+/i.test(errJson.error)) {
              errMsg = errJson.error;
            }
          } catch (parseErr) {}
          throw new Error(errMsg);
        }

        // Sinkronkan sisa kuota dan waktu reset dari header server secara langsung
        const rlRemaining = response.headers.get('X-RateLimit-Remaining');
        const rlReset = response.headers.get('X-RateLimit-Reset');
        const rlWindowStart = response.headers.get('X-RateLimit-WindowStart');
        const rlLimit = response.headers.get('X-RateLimit-Limit');
        if (rlRemaining !== null) {
          applyQuotaFromServer({
            limit: rlLimit ? Number(rlLimit) : quotaState.limit,
            remaining: Number(rlRemaining),
            resetAt: rlReset || quotaState.resetAt,
            windowStart: rlWindowStart || quotaState.windowStart
          });
        } else {
          fetchUserQuota();
        }

        // Kuota tervalidasi -> simpan pesan user ke database Supabase
        if (!isRegen && pendingUserMsg) {
          persistMessageToDb(session, pendingUserMsg);
        }

        if (indicatorRow.parentNode) {
          indicatorRow.parentNode.removeChild(indicatorRow);
        }
        chatFeed.appendChild(aiRow);
        updateMascotStateUI(`${teacherName} sedang menjawab...`, 'typing');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        function sanitizeStreamOutput(raw) {
          let clean = raw.replace(RE_THINK_CLOSED, '');
          clean = clean.replace(RE_THINK_OPEN, '');
          return clean.trimStart();
        }

        // Batched Streaming Renderer via requestAnimationFrame
        let renderRafId = null;

        function scheduleBatchedRender() {
          if (renderRafId) return;
          renderRafId = requestAnimationFrame(() => {
            renderRafId = null;
            const displayText = sanitizeStreamOutput(fullText);
            if (displayText) {
              textSpan.innerHTML = renderMarkdownToHtml(displayText);
              appendInlineCursor();
              scrollChatToBottom(false);
            }
          });
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;
            const dataStr = trimmed.slice(5).trim();
            if (dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices && parsed.choices[0] && parsed.choices[0].delta ? parsed.choices[0].delta.content : '';
              if (delta) {
                fullText += delta;
                scheduleBatchedRender();
              }
            } catch (e) {
              fullText += dataStr;
              scheduleBatchedRender();
            }
          }
        }

        if (renderRafId) {
          cancelAnimationFrame(renderRafId);
          renderRafId = null;
        }

        fullText = sanitizeStreamOutput(fullText);
        if (!fullText) {
          fullText = 'Wah, jawaban belum berhasil diterima. Yuk coba tanyakan sekali lagi ya!';
        }
        textSpan.innerHTML = renderMarkdownToHtml(fullText);
        scrollChatToBottom(false);

        finalizeAiResponse();

      }).catch((err) => {
        const isAbort = err && err.name === 'AbortError';
        const partial = fullText ? sanitizeStreamOutput(fullText) : '';
        if (isAbort && partial) {
          fullText = partial;
          finalizeAiResponse();
          showToast('Jawaban dihentikan.');
          return;
        }
        if (!isAbort) {
          console.warn('Gagal memanggil API chat:', err);
        }
        handleChatRequestError(err && err.message ? err.message : '', isAbort);
      });

    } catch (err) {
      const isAbort = err && err.name === 'AbortError';
      if (!isAbort) {
        console.warn('Gagal memanggil API chat:', err);
      }
      handleChatRequestError(err && err.message ? err.message : '', isAbort);
    }
  }

  if (textInput) {
    let focusBlurTimer = null;
    textInput.addEventListener('input', () => {
      autoResizeTextInput();
      syncSendButtonState();
    });
    textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUserSubmit(textInput.value);
      }
    });
    textInput.addEventListener('focus', () => {
      if (focusBlurTimer) clearTimeout(focusBlurTimer);
      if (views.chatWorkspace) {
        views.chatWorkspace.classList.add('is-input-focused');
      }
    });
    textInput.addEventListener('blur', () => {
      if (focusBlurTimer) clearTimeout(focusBlurTimer);
      focusBlurTimer = setTimeout(() => {
        if (views.chatWorkspace) {
          views.chatWorkspace.classList.remove('is-input-focused');
        }
      }, 140);
    });
    syncSendButtonState();
  }

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (textInput) {
        handleUserSubmit(textInput.value);
      }
    });
  }

  // 9. Speech-to-Text Voice Microphone Integration
  const btnDockMic = document.getElementById('btn-dock-mic');

  if (btnDockMic) {
    btnDockMic.addEventListener('click', () => {
      if (!window.CodiSpeech) return;

      // Stop any message audio when starting to speak
      stopCurrentMessageAudio();

      if (window.CodiSpeech.state.isListening) {
        window.CodiSpeech.stopListening();
        btnDockMic.classList.remove('is-listening');
        updateMascotStateUI('Codi Siap Menjawab', 'idle');
      } else {
        btnDockMic.classList.add('is-listening');
        updateMascotStateUI('Mendengarkan adik bicara...', 'listening');

        window.CodiSpeech.startListening(
          // onResult
          (transcript, isFinal) => {
            if (textInput) {
              textInput.value = transcript;
              autoResizeTextInput();
              syncSendButtonState();
            }
          },
          // onError
          (err) => {
            btnDockMic.classList.remove('is-listening');
            updateMascotStateUI('Codi Siap Menjawab', 'idle');
            showToast('Suara tidak terdengar jelas atau mic belum diizinkan. Coba lagi ya!');
          },
          // onFinal
          (finalTranscript) => {
            btnDockMic.classList.remove('is-listening');
            updateMascotStateUI('Codi Siap Menjawab', 'idle');
            handleUserSubmit(finalTranscript);
          }
        );
      }
    });
  }


  // 11. FAQ Accordion Logic
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question-btn');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove('is-open');
          const otherBtn = otherItem.querySelector('.faq-question-btn');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
        questionBtn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 12. Landing Page Access Actions (Direct to Google Login Modal or Teacher Selection)
  const heroGoogleCta = document.getElementById('hero-google-cta');
  if (heroGoogleCta) {
    heroGoogleCta.addEventListener('click', () => {
      if (currentUser) {
        showView('teacherSelect');
        return;
      }
      openAuthModal();
    });
  }

  document.querySelectorAll('.btn-preview-enter').forEach((btn) => {
    btn.addEventListener('click', () => {
      const teacherId = btn.getAttribute('data-preview-teacher');
      const profiles = window.CodiAI && window.CodiAI.TEACHER_PROFILES;
      if (currentUser && currentSession) {
        if (teacherId && profiles && profiles[teacherId]) {
          enterTeacherWorkspace(teacherId);
        } else {
          showView('teacherSelect');
        }
        return;
      }
      if (teacherId && profiles && profiles[teacherId]) {
        try {
          localStorage.setItem('codi_pending_teacher', teacherId);
        } catch (e) {}
      }
      openAuthModal();
    });
  });

  // 13. Mascot Stage Size Toggle (Compact / Expanded)
  const btnToggleMascotSize = document.getElementById('btn-toggle-mascot-size');
  const workspaceMascotCard = document.getElementById('workspace-mascot-card');
  const iconMascotSize = document.getElementById('icon-mascot-size');

  if (btnToggleMascotSize && workspaceMascotCard) {
    btnToggleMascotSize.addEventListener('click', () => {
      const isCompact = workspaceMascotCard.classList.toggle('is-compact');
      btnToggleMascotSize.setAttribute('title', isCompact ? 'Besarkan tampilan Codi' : 'Kecilkan tampilan Codi');
      btnToggleMascotSize.setAttribute('aria-label', isCompact ? 'Besarkan tampilan Codi' : 'Kecilkan tampilan Codi');
      if (iconMascotSize) {
        iconMascotSize.outerHTML = isCompact
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize-2" id="icon-mascot-size"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minimize-2" id="icon-mascot-size"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/></svg>`;
      }
      if (window.refreshCodi3D) {
        setTimeout(window.refreshCodi3D, 80);
      }
      refreshIcons();
    });
  }

  // 14. App Initializer
    function checkLlmStatus() {
    fetch('/api/status')
      .then(r => r.json())
      .then(status => {
        window.codiLlmStatus = status;
        const pill = document.getElementById('mascot-state-pill');
        if (pill) {
          if (status.configured) {
            const total = status.totalModels || (status.models ? status.models.length : 1);
            const modelName = status.activeModel || status.model || 'AI';
            pill.setAttribute('title', `AI Real Aktif: ${modelName} (${total} model cadangan siap siaga)`);
          } else {
            pill.setAttribute('title', 'Kunci API belum diisi di .env. Menggunakan mode simulasi lokal.');
          }
        }
      })
      .catch(() => {});
  }

  // 15. Dark / Light Theme System (Default Dark Mode, Precision Light Mode)
  const themeToggles = document.querySelectorAll('.btn-theme-toggle');

  function updateThemeUI(theme) {
    const isLight = theme === 'light';
    if (isLight) {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('theme-light');
    }

    themeToggles.forEach((btn) => {
      btn.setAttribute('aria-label', isLight ? 'Ganti ke mode gelap' : 'Ganti ke mode terang');
      btn.setAttribute('title', isLight ? 'Ganti ke mode gelap' : 'Ganti ke mode terang');
    });
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    try {
      localStorage.setItem('codi_theme', nextTheme);
    } catch (e) {}
    updateThemeUI(nextTheme);
    showToast(nextTheme === 'light' ? 'Beralih ke mode terang' : 'Beralih ke mode gelap');
  }

  themeToggles.forEach((btn) => {
    btn.addEventListener('click', toggleTheme);
  });

  // Default theme is light unless explicitly set to dark
  let activeTheme = 'light';
  try {
    const savedTheme = localStorage.getItem('codi_theme');
    if (savedTheme === 'dark') {
      activeTheme = 'dark';
    }
  } catch (e) {}
  updateThemeUI(activeTheme);

  async function initializeSupabaseAuthAndApp() {
    try {
      clearLocalAuthArtifacts(false);
      const res = await fetch('/api/config', { cache: 'no-store' });
      const cfg = await res.json();

      if (!cfg || !cfg.configured || !cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) {
        supabaseConfigured = false;
        document.documentElement.classList.remove('has-active-session', 'is-oauth-callback');
        showView('landing');
        return;
      }

      supabaseConfigured = true;
      supabaseClient = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });

      const { data: sessionData, error: sessionErr } = await supabaseClient.auth.getSession();
      if (sessionErr) {
        console.warn('Supabase getSession note:', sessionErr.message);
      }

      if (sessionData && sessionData.session) {
        await hydrateAuthenticatedSession(sessionData.session, window.location.search.includes('code=') || window.location.hash.includes('access_token='));
      } else {
        currentUser = null;
        currentSession = null;
        document.documentElement.classList.remove('has-active-session', 'is-oauth-callback');
        showView('landing');
      }

      supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'TOKEN_REFRESHED') {
          currentSession = session;
          return;
        }
        if (event === 'SIGNED_IN' && session) {
          if (!currentUser || currentUser.id !== session.user.id) {
            await hydrateAuthenticatedSession(session, true);
          } else {
            currentSession = session;
          }
        } else if (event === 'SIGNED_OUT') {
          currentUser = null;
          currentSession = null;
          chatSessions = [];
          activeSessionId = null;
          document.documentElement.classList.remove('has-active-session');
          showView('landing');
        }
      });
    } catch (err) {
      console.warn('Supabase init error:', err);
      document.documentElement.classList.remove('has-active-session', 'is-oauth-callback');
      showView('landing');
    }
  }

  checkLlmStatus();
  initModelPicker();
  initializeSupabaseAuthAndApp();
});
