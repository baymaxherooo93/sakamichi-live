/* sw.js — cache shell agar portal bisa dibuka offline saat di-hosting */
const CACHE = 'saka-v1';
const ASSETS = ['./', './index.html', './sakamichi-live.html', './sw.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/proxy')) return;      /* jangan cache data API */
  e.respondWith(
    fetch(e.request).then(r => {
      const c = r.clone();
      caches.open(CACHE).then(x => x.put(e.request, c)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request).then(m => m || caches.match('./')))
  );
});
