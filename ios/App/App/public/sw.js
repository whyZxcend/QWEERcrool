// QWERcrool Service Worker v4.0
// Push + offline-first API caching

const CACHE_VERSION = 'qwercrool-v4.1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// API endpoints that can be cached (read-only, GET)
const CACHEABLE_API_PREFIXES = [
  '/api/chats',
  '/api/users',
  '/api/stickers',
  '/api/themes',
];

// API endpoints that must NEVER be cached (always fresh)
const NEVER_CACHE_PREFIXES = [
  '/api/messages/',
  '/api/calls/',
  '/api/auth/',
  '/api/upload',
  '/api/push/',
];

const PRECACHE_URLS = [
  '/',
  '/index.html',
];

// ========================================
// INSTALL
// ========================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v4.1');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching core assets');
        return Promise.allSettled(
          PRECACHE_URLS.map(url =>
            cache.add(url).catch(err =>
              console.warn(`[SW] Failed to cache ${url}:`, err)
            )
          )
        );
      })
      .then(async () => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
  );
});

// ========================================
// ACTIVATE
// ========================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v4.1');

  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== API_CACHE)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      }),
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activation complete, controlling all clients');
    })
  );
});

// ========================================
// FETCH — caching strategies
// ========================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET
  if (request.method !== 'GET') return;

  // Bypass Service Worker completely for audio/video media and music API
  if (
    url.pathname.startsWith('/api/music/') ||
    request.destination === 'audio' ||
    request.destination === 'video' ||
    request.headers.get('range')
  ) {
    return;
  }

  // API requests
  if (url.pathname.startsWith('/api/')) {
    const shouldNeverCache = NEVER_CACHE_PREFIXES.some(p => url.pathname.startsWith(p));
    const canCache = !shouldNeverCache
      && CACHEABLE_API_PREFIXES.some(p => url.pathname.startsWith(p));

    if (canCache) {
      // Network-first with API cache fallback
      event.respondWith(
        fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(API_CACHE).then(c => c.put(request, clone));
            }
            return response;
          })
          .catch(() => {
            return caches.match(request).then(cached => {
              return cached || new Response(JSON.stringify({ error: 'Offline', cached: false }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            });
          })
      );
      return;
    }

    // Default: network only
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Network error' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Navigation requests — always network (no caching to avoid stale index.html → white screen)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Other static assets — Network First with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || new Response('Offline', { status: 503 });
        });
      })
  );
});

// ========================================
// PUSH NOTIFICATIONS
// ========================================

self.addEventListener('push', (event) => {
  console.log('[SW] 📬 Push received');

  let notificationData = {
    title: 'QWERcrool',
    body: 'Новое сообщение',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'default',
    requireInteraction: false,
    data: {}
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[SW] Push payload:', payload);

      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        tag: payload.tag || notificationData.tag,
        requireInteraction: payload.requireInteraction || false,
        data: {
          url: payload.url || '/',
          chatId: payload.chatId,
          messageUid: payload.messageUid,
          ...payload.data
        }
      };
    } catch (err) {
      console.error('[SW] Failed to parse push payload:', err);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    requireInteraction: notificationData.requireInteraction,
    data: notificationData.data,
    vibrate: [200, 100, 200],
    renotify: true,
    silent: false
  };

  if (notificationData.data.chatId) {
    notificationOptions.actions = [
      { action: 'open', title: 'Открыть' }
    ];
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions)
      .then(() => {
        console.log('[SW] ✅ Notification shown:', notificationData.title);
      })
      .catch((err) => {
        console.error('[SW] ❌ Failed to show notification:', err);
      })
  );
});

// ========================================
// NOTIFICATION CLICK
// ========================================

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 👆 Notification clicked:', event.action);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            console.log('[SW] Focusing existing window');
            return client.focus().then((focusedClient) => {
              if (urlToOpen !== '/' && focusedClient) {
                focusedClient.postMessage({
                  type: 'NOTIFICATION_CLICK',
                  url: urlToOpen,
                  data: event.notification.data
                });
              }
              return focusedClient;
            });
          }
        }

        console.log('[SW] Opening new window');
        return clients.openWindow(urlToOpen);
      })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// ========================================
// MESSAGE — from client
// ========================================

self.addEventListener('message', (event) => {
  console.log('[SW] 📨 Message from client:', event.data);

  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'CLAIM_CLIENTS') {
    self.clients.claim();
  }

  if (event.data?.type === 'MARK_OPENED' && event.data.messageUid) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          client.postMessage({
            type: 'MARK_OPENED',
            messageUid: event.data.messageUid,
          });
        }
      })
    );
  }

  if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      })
    );
  }
});

// ========================================
// ERROR HANDLING
// ========================================

self.addEventListener('error', (event) => {
  console.error('[SW] ❌ Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] ❌ Unhandled rejection:', event.reason);
});

console.log('[SW] 🚀 Service Worker v4.1 loaded');
