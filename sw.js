// Codi AI PWA Service Worker v3.0.0 (Agibot-Style Furry 3D Companion)
const CACHE_NAME = 'codi-ai-cache-v30';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/workspace.css',
  '/js/app.js',
  '/js/ai-teacher.js',
  '/js/speech.js',
  '/js/codi-3d.js',
  '/js/vendor/three.min.js',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/img/mascot-hero-fur.png',
  '/img/mascot-avatar-fur.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('Some assets failed to precache:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Do not intercept or cache real-time AI endpoints
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  const isSameOrigin = url.origin === self.location.origin;

  if (event.request.mode === 'navigate') {
    // Navigation: Network-first with cache fallback
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static Assets: Stale-While-Revalidate for instant render & background update
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      }).catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});
