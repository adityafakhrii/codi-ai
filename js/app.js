/**
 * Codi AI - Main Application Engine
 * Authentication, Teacher Selection, Chat & Speak Interactive Workspace
 * Mobile-First, PWA, Lucide Icons, WCAG 2.2 AA Accessible
 */

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('app-mounted');

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
        }
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
        }
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
  let currentTeacher = 'math'; // 'math' | 'general'
  let chatSessions = [];
  let activeSessionId = null;
  let currentTeacherFilter = 'all'; // 'all' | 'math' | 'general'
  let sidebarSearchQuery = '';

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

  function createDefaultSession(teacherId, defaultTitle) {
    const profile = window.CodiAI && window.CodiAI.TEACHER_PROFILES ? window.CodiAI.TEACHER_PROFILES[teacherId] : null;
    const now = new Date();
    return {
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      teacherId: teacherId,
      title: defaultTitle,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      messages: [
        {
          sender: 'ai',
          teacherName: profile ? profile.name : 'Codi',
          text: profile ? profile.greeting : 'Halo adik pintar! Ada yang bisa Codi bantu hari ini?',
          timestamp: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          isoTime: now.toISOString()
        }
      ]
    };
  }

  function loadStoredState() {
    try {
      // Pembersihan total riwayat obrolan lama agar aplikasi segar dari nol setelah integrasi API
      const FRESH_START_KEY = 'codi_fresh_clean_zero_v1';
      if (!localStorage.getItem(FRESH_START_KEY)) {
        localStorage.removeItem('codi_chat_sessions');
        localStorage.removeItem('codi_chat_histories');
        localStorage.removeItem('codi_active_session_id');
        localStorage.setItem(FRESH_START_KEY, 'true');
      }

      const storedUser = localStorage.getItem('codi_auth_user');
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
      }
      const storedTeacher = localStorage.getItem('codi_selected_teacher');
      if (storedTeacher && ['math', 'general', 'pancasila'].includes(storedTeacher)) {
        currentTeacher = storedTeacher;
      }
      const storedSessions = localStorage.getItem('codi_chat_sessions');
      if (storedSessions) {
        chatSessions = JSON.parse(storedSessions);
      } else {
        chatSessions = [];
      }

      // Mulai dengan satu sesi bersih tanpa pesan riwayat lama
      if (!chatSessions || chatSessions.length === 0) {
        const freshSession = createDefaultSession(currentTeacher, 'Obrolan Baru');
        chatSessions = [freshSession];
        activeSessionId = freshSession.id;
        saveChatSessions();
      } else {
        const storedActiveSession = localStorage.getItem('codi_active_session_id');
        if (storedActiveSession && chatSessions.some(s => s.id === storedActiveSession)) {
          activeSessionId = storedActiveSession;
        } else {
          activeSessionId = chatSessions[0]?.id || null;
        }
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
  }

  // Safe Storage with Quota Protection & Automatic Pruning (client-localstorage-schema)
  const MAX_STORED_SESSIONS = 15;
  const MAX_MESSAGES_PER_SESSION = 30;

  function pruneSessionsForStorage(sessions) {
    if (!Array.isArray(sessions)) return [];
    const trimmed = sessions.slice(0, MAX_STORED_SESSIONS);
    return trimmed.map(s => {
      if (Array.isArray(s.messages) && s.messages.length > MAX_MESSAGES_PER_SESSION) {
        return {
          ...s,
          messages: s.messages.slice(-MAX_MESSAGES_PER_SESSION)
        };
      }
      return s;
    });
  }

  function saveChatSessions() {
    try {
      const sanitized = pruneSessionsForStorage(chatSessions);
      localStorage.setItem('codi_chat_sessions', JSON.stringify(sanitized));
      if (activeSessionId) {
        localStorage.setItem('codi_active_session_id', activeSessionId);
      }
    } catch (e) {
      console.warn('Storage save error (mencoba eviksi kuota):', e);
      try {
        // Jika kuota hampir penuh (QuotaExceededError), pangkas setengah sesi tertua
        if (chatSessions.length > 3) {
          const reduced = chatSessions.slice(0, 3).map(s => ({
            ...s,
            messages: s.messages ? s.messages.slice(-15) : []
          }));
          localStorage.setItem('codi_chat_sessions', JSON.stringify(reduced));
        }
      } catch (retryErr) {
        console.error('Storage quota exhausted completely:', retryErr);
      }
    }
  }

  function showView(viewKey) {
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

    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshIcons();
    if (window.refreshCodi3D) {
      requestAnimationFrame(window.refreshCodi3D);
    }
  }

  // 6. Authentication Modal Controls
  function openAuthModal() {
    if (authModal) {
      authModal.classList.add('is-open');
    }
  }

  function closeAuthModal() {
    if (authModal) {
      authModal.classList.remove('is-open');
    }
  }

  const headerLoginBtn = document.getElementById('header-login-btn');
  const mobileLoginTrigger = document.getElementById('mobile-login-trigger');
  const btnCloseAuthModal = document.getElementById('btn-close-auth-modal');
  const btnGoogleAction = document.getElementById('btn-google-login-action');
  const demoAccountButtons = document.querySelectorAll('.btn-demo-account');

  if (headerLoginBtn) headerLoginBtn.addEventListener('click', openAuthModal);
  if (mobileLoginTrigger) mobileLoginTrigger.addEventListener('click', openAuthModal);
  if (btnCloseAuthModal) btnCloseAuthModal.addEventListener('click', closeAuthModal);

  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        closeAuthModal();
      }
    });
  }

  function loginUser(userData) {
    currentUser = userData;
    try {
      localStorage.setItem('codi_auth_user', JSON.stringify(userData));
    } catch (e) {}
    document.documentElement.classList.add('has-active-session');

    updateUserUI();
    closeAuthModal();
    showToast(`Selamat datang, ${userData.name}!`);
    const storedTeacher = localStorage.getItem('codi_selected_teacher');
    enterTeacherWorkspace(storedTeacher && ['math', 'general'].includes(storedTeacher) ? storedTeacher : 'math');
  }

  function logoutUser() {
    currentUser = null;
    document.documentElement.classList.remove('has-active-session');
    try {
      localStorage.removeItem('codi_auth_user');
      localStorage.removeItem('codi_selected_teacher');
    } catch (e) {}

    if (window.CodiSpeech) {
      window.CodiSpeech.stopSpeaking();
      window.CodiSpeech.stopListening();
    }

    showToast('Berhasil keluar dari akun Codi AI.');
    showView('landing');
  }

  if (btnGoogleAction) {
    btnGoogleAction.addEventListener('click', () => {
      // Simulate official Google Sign-In verification
      loginUser({
        name: 'Budi Pratama',
        role: 'Siswa SD Kelas 4',
        email: 'budi.sd@belajar.id',
        initial: 'B'
      });
    });
  }

  demoAccountButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      const role = btn.getAttribute('data-role');
      const email = btn.getAttribute('data-email');
      loginUser({
        name: name,
        role: role,
        email: email,
        initial: name ? name.charAt(0) : 'S'
      });
    });
  });

  const btnLogoutFromSelect = document.getElementById('btn-logout-from-select');
  const btnLogoutFromWorkspace = document.getElementById('btn-logout-from-workspace');
  if (btnLogoutFromSelect) btnLogoutFromSelect.addEventListener('click', logoutUser);
  if (btnLogoutFromWorkspace) btnLogoutFromWorkspace.addEventListener('click', logoutUser);

  function updateUserUI() {
    if (!currentUser) return;
    const displayName = document.getElementById('user-display-name');
    const avatarLetter = document.getElementById('user-avatar-letter');
    const sidebarDisplayName = document.getElementById('sidebar-display-name');
    if (displayName) displayName.textContent = currentUser.name;
    if (avatarLetter) avatarLetter.textContent = currentUser.initial || currentUser.name.charAt(0);
    if (sidebarDisplayName) sidebarDisplayName.textContent = currentUser.name;
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
      saveChatSessions();
    }

    activeSessionId = targetSession.id;
    applyTeacherVisuals(teacherId);
    updateActiveSessionHeader(targetSession);
    renderChatStream();
    renderQuickChips();
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
      enterTeacherWorkspace(getNextTeacher(currentTeacher));
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
    renderSidebarSessions();
    saveChatSessions();

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

  function deleteSession(sessionId) {
    const idx = chatSessions.findIndex((s) => s.id === sessionId);
    if (idx === -1) return;

    stopCurrentMessageAudio();
    chatSessions.splice(idx, 1);

    if (chatSessions.length === 0) {
      const freshSession = createDefaultSession(currentTeacher, 'Obrolan Baru');
      chatSessions.push(freshSession);
      activeSessionId = freshSession.id;
    } else if (activeSessionId === sessionId) {
      activeSessionId = chatSessions[0].id;
    }

    const active = getActiveSession();
    if (active) {
      currentTeacher = active.teacherId;
      applyTeacherVisuals(active.teacherId);
      updateActiveSessionHeader(active);
    }

    saveChatSessions();
    renderSidebarSessions();
    renderChatStream();
    renderQuickChips();
    showToast('Obrolan berhasil dihapus.', 'success');
  }

  function clearAllSessions() {
    stopCurrentMessageAudio();
    localStorage.removeItem('codi_chat_sessions');
    localStorage.removeItem('codi_chat_histories');
    localStorage.removeItem('codi_active_session_id');

    const freshSession = createDefaultSession(currentTeacher, 'Obrolan Baru');
    chatSessions = [freshSession];
    activeSessionId = freshSession.id;

    saveChatSessions();
    applyTeacherVisuals(currentTeacher);
    updateActiveSessionHeader(freshSession);
    renderSidebarSessions();
    renderChatStream();
    renderQuickChips();
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

      items.forEach((session) => {
        const isSelected = session.id === activeSessionId;
        const teacherProfile = window.CodiAI && window.CodiAI.TEACHER_PROFILES ? window.CodiAI.TEACHER_PROFILES[session.teacherId] : null;
        const teacherName = teacherProfile ? teacherProfile.name : 'Codi';
        const dateObj = new Date(session.updatedAt || session.createdAt);
        const timeStr = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : '';

        const itemDiv = document.createElement('div');
        itemDiv.className = `history-session-item ${isSelected ? 'is-active' : ''}`;
        itemDiv.setAttribute('role', 'button');
        itemDiv.setAttribute('tabindex', '0');
        itemDiv.setAttribute('data-id', session.id);

        itemDiv.innerHTML = `
          <div class="history-item-left">
            <span class="history-item-title">${escapeHtml(session.title)}</span>
            <div class="history-item-meta">
              <span class="history-teacher-badge ${session.teacherId === 'general' ? 'is-general' : session.teacherId === 'pancasila' ? 'is-pancasila' : ''}">${teacherName}</span>
              <span>${timeStr}</span>
            </div>
          </div>
          <button type="button" class="btn-delete-session" data-delete-id="${session.id}" aria-label="Hapus sesi" title="Hapus sesi obrolan">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
        `;

        itemDiv.addEventListener('click', (e) => {
          if (e.target.closest('.btn-delete-session')) return;
          switchSession(session.id);
          if (window.innerWidth < 860) {
            closeSidebarDrawer();
          }
        });

        const deleteBtn = itemDiv.querySelector('.btn-delete-session');
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

        sidebarList.appendChild(itemDiv);
      });
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

  // Model Picker State (Persisted in localStorage)
  let selectedModel = localStorage.getItem('codi_selected_model') || 'auto';
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
      btn.innerHTML = isActionBubble
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="lucide lucide-square"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`
        : `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="lucide lucide-square"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
          <span>Berhenti</span>
        `;
    } else {
      btn.classList.remove('is-playing');
      btn.setAttribute('aria-label', 'Dengarkan suara');
      btn.setAttribute('title', 'Dengarkan dengan suara');
      btn.innerHTML = isActionBubble
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`
        : `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
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

    // 1. Salin Jawaban (Copy)
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'btn-action-bubble btn-action-copy';
    copyBtn.setAttribute('aria-label', 'Salin jawaban ke papan klip');
    copyBtn.setAttribute('title', 'Salin jawaban');
    copyBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
    `;

    copyBtn.addEventListener('click', () => {
      const rawText = msg.text || '';
      const cleanPlain = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      navigator.clipboard.writeText(cleanPlain).then(() => {
        copyBtn.classList.add('is-copied');
        copyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"/></svg>
        `;
        showToast('Jawaban berhasil disalin ke papan klip');
        setTimeout(() => {
          copyBtn.classList.remove('is-copied');
          copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          `;
        }, 1600);
      }).catch(() => {
        showToast('Gagal menyalin jawaban');
      });
    });
    bar.appendChild(copyBtn);

    // 2. Tombol Bagus (Thumbs Up)
    const upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.className = `btn-action-bubble btn-action-thumb-up ${msg.feedback === 'up' ? 'is-active-up' : ''}`;
    upBtn.setAttribute('aria-label', 'Bagus dan bermanfaat');
    upBtn.setAttribute('title', 'Jawaban bagus dan bermanfaat');
    upBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-thumbs-up"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3"/><path d="M7 10l5-6a2 2 0 0 1 3 1.88z"/></svg>
    `;

    // 3. Tombol Kurang Bagus (Thumbs Down)
    const downBtn = document.createElement('button');
    downBtn.type = 'button';
    downBtn.className = `btn-action-bubble btn-action-thumb-down ${msg.feedback === 'down' ? 'is-active-down' : ''}`;
    downBtn.setAttribute('aria-label', 'Kurang tepat atau membingungkan');
    downBtn.setAttribute('title', 'Jawaban kurang tepat');
    downBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-thumbs-down"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3"/><path d="M17 14l-5 6a2 2 0 0 1-3-1.88z"/></svg>
    `;

    upBtn.addEventListener('click', () => {
      if (upBtn.classList.contains('is-active-up')) {
        upBtn.classList.remove('is-active-up');
        msg.feedback = null;
      } else {
        upBtn.classList.add('is-active-up');
        downBtn.classList.remove('is-active-down');
        msg.feedback = 'up';
        showToast('Terima kasih atas tanggapan positif Anda!');
      }
      saveChatSessions();
    });

    downBtn.addEventListener('click', () => {
      if (downBtn.classList.contains('is-active-down')) {
        downBtn.classList.remove('is-active-down');
        msg.feedback = null;
      } else {
        downBtn.classList.add('is-active-down');
        upBtn.classList.remove('is-active-up');
        msg.feedback = 'down';
        showToast('Terima kasih masukannya, kami akan tingkatkan kualitas jawaban.');
      }
      saveChatSessions();
    });

    bar.appendChild(upBtn);
    bar.appendChild(downBtn);

    // 4. Tombol Baca Suara (Speaker)
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

    // 5. Tombol Buat Ulang (Regenerate)
    const regenBtn = document.createElement('button');
    regenBtn.type = 'button';
    regenBtn.className = 'btn-action-bubble btn-action-regenerate';
    regenBtn.setAttribute('aria-label', 'Buat ulang respons AI');
    regenBtn.setAttribute('title', 'Buat ulang jawaban ini');
    regenBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-cw"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
    `;

    regenBtn.addEventListener('click', () => {
      if (isAiResponding) return;
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
        showToast('Tidak ada pertanyaan sebelumnya untuk dibuat ulang.');
        return;
      }

      session.messages.splice(idx, 1);
      saveChatSessions();
      renderChatStream();

      showToast('Membuat ulang respons AI...');
      handleUserSubmit(promptToReRun, true);
    });
    bar.appendChild(regenBtn);

    // 6. Label Model yang Digunakan
    const modelTag = document.createElement('span');
    modelTag.className = 'chat-bubble-model-tag';
    modelTag.setAttribute('title', 'Model AI yang memproses respons ini');
    const displayModel = formatModelLabel(msg.model || selectedModel);
    modelTag.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
      <span>${displayModel}</span>
    `;
    bar.appendChild(modelTag);

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

  function renderQuickChips() {
    if (!chipsBar) return;
    chipsBar.innerHTML = '';

    const profile = window.CodiAI && window.CodiAI.TEACHER_PROFILES ? window.CodiAI.TEACHER_PROFILES[currentTeacher] : null;
    if (!profile || !profile.quickPrompts) return;

    profile.quickPrompts.forEach((prompt) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'btn-quick-chip';
      chip.textContent = prompt;
      chip.addEventListener('click', () => {
        handleUserSubmit(prompt);
      });
      chipsBar.appendChild(chip);
    });
  }

  function handleUserSubmit(userText, isRegen = false) {
    if (!userText || !userText.trim() || isAiResponding) return;
    const cleanText = userText.trim();
    const session = getActiveSession();
    if (!session) return;

    stopCurrentMessageAudio();

    const now = new Date();
    const nowTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // 1. Append user message if not regenerating
    if (!isRegen) {
      const userMsg = {
        sender: 'user',
        text: cleanText,
        timestamp: nowTime,
        isoTime: now.toISOString()
      };
      session.messages.push(userMsg);

      // Auto-title generation if new chat
      if (session.title === 'Obrolan Baru' || session.title.startsWith('Obrolan Baru')) {
        const words = cleanText.split(/\s+/).slice(0, 5).join(' ');
        session.title = words.length > 28 ? words.substring(0, 26) + '...' : words;
      }

      session.updatedAt = now.toISOString();
      saveChatSessions();
      renderChatStream();
      renderSidebarSessions();
      updateActiveSessionHeader(session);
    }

    if (textInput) textInput.value = '';

    // 2. Set Thinking State & Show Typing Indicator Dots
    isAiResponding = true;
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

    contentDiv.appendChild(textSpan);
    contentDiv.appendChild(cursorSpan);
    bubble.appendChild(contentDiv);
    aiRow.appendChild(bubble);

    let fullText = '';

    function finalizeAiResponse() {
      if (cursorSpan.parentNode) {
        cursorSpan.parentNode.removeChild(cursorSpan);
      }

      textSpan.innerHTML = renderMarkdownToHtml(fullText);

      // Save completed message to active session
      const aiNow = new Date();
      const completedAiMsg = {
        sender: 'ai',
        teacherName: teacherName,
        text: fullText,
        model: selectedModel,
        timestamp: responseTime,
        isoTime: aiNow.toISOString()
      };

      // Append ChatGPT-style action bar
      const actionBar = createAiActionBar(completedAiMsg, session.messages.length, teacherName);
      bubble.appendChild(actionBar);

      session.messages.push(completedAiMsg);
      session.updatedAt = aiNow.toISOString();
      saveChatSessions();
      renderSidebarSessions();
      updateActiveSessionHeader(session);

      isAiResponding = false;
      updateMascotStateUI('Codi Siap Menjawab', 'idle');
      scrollChatToBottom(true);
    }

    function fallbackToLocalReasoning() {
      if (indicatorRow.parentNode) {
        indicatorRow.parentNode.removeChild(indicatorRow);
      }
      if (!aiRow.parentNode) {
        chatFeed.appendChild(aiRow);
      }

      // Fallback: mesin penalaran pedagogis bawaan
      const aiResult = window.CodiAI.generatePedagogicalResponse(session.teacherId, cleanText);
      fullText = aiResult.text;

      const words = fullText.split(/(\s+)/);
      let wordIndex = 0;
      updateMascotStateUI(`${teacherName} sedang menjawab...`, 'typing');

      const streamTimer = setInterval(() => {
        if (wordIndex < words.length) {
          wordIndex++;
          textSpan.innerHTML = renderMarkdownToHtml(words.slice(0, wordIndex).join(''));
          scrollChatToBottom(false);
        } else {
          clearInterval(streamTimer);
          finalizeAiResponse();
        }
      }, 24);
    }

    try {
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: session.teacherId,
          message: cleanText,
          selectedModel: selectedModel,
          history: session.messages.slice(-8)
        })
      }).then(async (response) => {
        if (indicatorRow.parentNode) {
          indicatorRow.parentNode.removeChild(indicatorRow);
        }
        chatFeed.appendChild(aiRow);
        updateMascotStateUI(`${teacherName} sedang menjawab...`, 'typing');

        if (!response.ok || !response.body) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        function sanitizeStreamOutput(raw) {
          // Bersihkan blok <think>...</think> dan tag think yang belum selesai
          let clean = raw.replace(RE_THINK_CLOSED, '');
          clean = clean.replace(RE_THINK_OPEN, '');
          return clean.trimStart();
        }

        // Batched Streaming Renderer via requestAnimationFrame (js-batch-dom-css, rendering-usetransition-loading)
        let renderRafId = null;

        function scheduleBatchedRender() {
          if (renderRafId) return;
          renderRafId = requestAnimationFrame(() => {
            renderRafId = null;
            const displayText = sanitizeStreamOutput(fullText);
            if (displayText) {
              textSpan.innerHTML = renderMarkdownToHtml(displayText);
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
          fullText = 'Wah, jawaban dari AI belum diterima. Coba ulangi pertanyaanmu ya!';
        }
        textSpan.innerHTML = renderMarkdownToHtml(fullText);
        scrollChatToBottom(false);

        finalizeAiResponse();


      }).catch((err) => {
        console.warn('Gagal memanggil API LLM, beralih ke mesin penalaran lokal:', err);
        fallbackToLocalReasoning();
      });

    } catch (err) {
      console.warn('Gagal memanggil API LLM, beralih ke mesin penalaran lokal:', err);
      fallbackToLocalReasoning();
    }
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

  // 12. Landing Page Waitlist Form
  const waitlistForm = document.getElementById('waitlist-form');
  const emailInput = document.getElementById('waitlist-input') || document.getElementById('waitlist-email');

  if (waitlistForm && emailInput) {
    waitlistForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();

      if (!email || !email.includes('@')) {
        showToast('Mohon masukkan alamat email yang valid.');
        emailInput.focus();
        return;
      }

      try {
        const stored = JSON.parse(localStorage.getItem('codi_waitlist') || '[]');
        stored.push({ email, timestamp: new Date().toISOString() });
        localStorage.setItem('codi_waitlist', JSON.stringify(stored));
      } catch (err) {}

      emailInput.value = '';
      showToast('Selamat! Email Anda berhasil terdaftar akses awal Codi AI.');
    });
  }

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

  // Default theme is dark unless explicitly set to light
  let activeTheme = 'dark';
  try {
    const savedTheme = localStorage.getItem('codi_theme');
    if (savedTheme === 'light') {
      activeTheme = 'light';
    }
  } catch (e) {}
  updateThemeUI(activeTheme);

  checkLlmStatus();
  initModelPicker();
  loadStoredState();
  if (currentUser) {
    document.documentElement.classList.add('has-active-session');
    updateUserUI();
    const storedTeacher = localStorage.getItem('codi_selected_teacher');
    enterTeacherWorkspace(storedTeacher && ['math', 'general'].includes(storedTeacher) ? storedTeacher : 'math');
  } else {
    document.documentElement.classList.remove('has-active-session');
    showView('landing');
  }
});
