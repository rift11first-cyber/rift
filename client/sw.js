const cacheName = 'rift-cache-v1';
const assetsToCache = [
  '/',
  '/index.html',
  '/style.css',
  'client/src/main.tsx',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assetsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
