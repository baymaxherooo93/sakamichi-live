/* sw.js — cache shell agar SAKAMICHI LIVE bisa dibuka offline saat di-hosting */
const CACHE = 'saka-v2';
const ASSETS = ['./', './index.html', './sw.js'];

self.addEventListener('install', e => {
  /* tambah per-file: satu 404 tidak boleh membatalkan seluruh cache */
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.all(ASSETS.map(a => c.add(a).catch(() => null))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;        /* data/proxy pihak ketiga: jangan disentuh */
  if (url.pathname.indexOf('/proxy') >= 0) return;        /* jalur data lokal: selalu jaringan */
  e.respondWith(
    fetch(e.request).then(r => {
      if (r && r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)).catch(() => {}); }
      return r;
    }).catch(async () => {
      const m = await caches.match(e.request);
      if (m) return m;
      for (const k of ['./index.html', './']) { const x = await caches.match(k); if (x) return x; }
      return new Response('<meta charset="utf-8">Offline — cache shell belum tersedia.', {
        status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    })
  );
});
