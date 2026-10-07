/* مسك — عامل الخدمة: يعمل دون إنترنت بعد أول فتح */
const VER = 'masak-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png',
  'icons/apple-touch-icon.png', 'icons/favicon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // الخطوط (Aref Ruqaa / Amiri): تُخزَّن عند أول تحميل لتعمل لاحقًا دون إنترنت
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(VER).then(c => c.match(req).then(hit => {
        const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit);
        return hit || net;
      }))
    );
    return;
  }

  // ملفات الموقع نفسه: من الذاكرة أولًا ثم الشبكة
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then(hit =>
        hit || fetch(req).catch(() => req.mode === 'navigate' ? caches.match('index.html') : Response.error())
      )
    );
  }
  // روابط Google Drive وغيرها تمرّ كما هي
});
