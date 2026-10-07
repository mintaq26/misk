/* مكتبة مِسْك — خدمة العمل دون اتصال. الصفحة الرئيسية: الشبكة أولًا، وبقية الملفات: من الذاكرة ثم تُحدَّث في الخلفية. */
const V="masak-v1";
const CORE=["./", "index.html", "manifest.webmanifest", "fonts/fonts.css", "fonts/amiri-arabic-400-normal.woff2", "fonts/amiri-arabic-700-normal.woff2", "fonts/amiri-latin-400-normal.woff2", "fonts/amiri-latin-700-normal.woff2", "fonts/aref-ruqaa-arabic-400-normal.woff2", "fonts/aref-ruqaa-arabic-700-normal.woff2", "fonts/aref-ruqaa-latin-400-normal.woff2", "fonts/aref-ruqaa-latin-700-normal.woff2", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
 const r=e.request; if(r.method!=="GET") return;
 const u=new URL(r.url); if(u.origin!==location.origin) return;
 const page=r.mode==="navigate"||u.pathname.endsWith("/")||u.pathname.endsWith("/index.html");
 if(page){
  e.respondWith(fetch(r).then(res=>{ if(res&&res.ok){ const cp=res.clone(); caches.open(V).then(c=>c.put("index.html",cp)); } return res; }).catch(()=>caches.match("index.html").then(h=>h||caches.match("./"))));
  return;
 }
 e.respondWith(caches.match(r).then(hit=>{
  const net=fetch(r).then(res=>{ if(res&&res.ok){ const cp=res.clone(); caches.open(V).then(c=>c.put(r,cp)); } return res; }).catch(()=>hit);
  return hit||net; }));
});
