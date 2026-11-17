// Minimal offline cache: app shell + static data. Network-first for navigation, cache-first for the rest.
const CACHE = 'nizhny-guests-v2';
const MAX_ENTRIES = 400;
async function trim(c) { const ks = await c.keys(); for (let i = 0; i < ks.length - MAX_ENTRIES; i++) await c.delete(ks[i]); }
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.includes('/api/')) return;
  if (url.origin !== location.origin && !/tile\.openstreetmap\.org/.test(url.host)) return;
  e.respondWith(
    fetch(req).then((res) => { const copy = res.clone(); if (res.ok) caches.open(CACHE).then((c) => c.put(req, copy).then(() => trim(c))); return res; })
      .catch(() => caches.match(req).then((r) => r || caches.match('./')))
  );
});
