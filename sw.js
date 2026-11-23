// Sheba Brand Shop Cafe — Service Worker v1.7
// পেজ (index.html) সবসময় আগে ইন্টারনেট থেকে আনে, তাই নতুন ভার্সন আপলোড করলেই ফোনে নতুনটা চলে আসে।
// ইন্টারনেট না থাকলে শেষ ক্যাশ-করা পেজ দেখায়। ডেটা (Supabase) কখনো ক্যাশ হয় না।
const CACHE = 'sheba-shell-v1.7';
const SHELL = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Supabase বা অন্য কোনো বাইরের API — কখনো ক্যাশ নয়
  if (url.hostname.endsWith('supabase.co') || url.hostname.endsWith('supabase.in')) return;

  const sameOrigin = url.origin === self.location.origin;
  const isCdnScript = /(^|\.)(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|unpkg\.com)$/.test(url.hostname);
  if (!sameOrigin && !isCdnScript) return;

  // নেটওয়ার্ক-ফার্স্ট; ব্যর্থ হলে ক্যাশ
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
