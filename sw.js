// Sheba Shop — সার্ভিস ওয়ার্কার: নিজের ফাইল নেটওয়ার্ক-ফার্স্ট, বাকি সব (Supabase, CDN) সরাসরি নেটওয়ার্কে
const CACHE = 'sheba-v1.4';
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c =>
    c.addAll(['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png']).catch(() => {})));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
