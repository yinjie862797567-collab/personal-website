// Service Worker - 杰克船长 PWA
const CACHE_NAME = 'jack-captain-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/avatar.png',
  '/images/scene-working.png',
  '/images/scene-speaking.png',
  '/images/scene-thinking.png',
  '/images/scene-consulting.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// 安装：缓存核心资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 请求：缓存优先策略
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache));
          return networkResponse;
        });
      })
      .catch(() => {
        // 离线 fallback
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});