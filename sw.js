// 같은 주소의 파일은 새것을 먼저 받고(못 받으면 저장본), 외부 라이브러리·글꼴은 저장본을 먼저 쓴다.
const C = 'simapp-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'apple-touch-icon.png', 'icon-192.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(C).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const put = (k, res) => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(C).then((c) => c.put(k, copy)); } return res; };
  if (url.origin === self.location.origin) {
    const k = url.origin + url.pathname;
    e.respondWith(fetch(req).then((res) => put(k, res)).catch(() => caches.match(k).then((r) => r || Response.error())));
  } else {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => put(req, res))));
  }
});
