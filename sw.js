const CACHE="panini-wc2026-v7";
const ASSETS=["./","./index.html","./manifest.json","./icon.svg","https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"];

self.addEventListener("install",e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch",e=>{
  const req=e.request;
  const isHTML = req.mode==="navigate" || (req.headers.get("accept")||"").includes("text/html");
  if(isHTML){
    // Réseau d'abord : on récupère toujours la dernière version en ligne
    e.respondWith(
      fetch(req).then(resp=>{
        const copy=resp.clone();
        caches.open(CACHE).then(c=>c.put(req,copy).catch(()=>{}));
        return resp;
      }).catch(()=>caches.match(req).then(r=>r||caches.match("./index.html")))
    );
  }else{
    // Le reste (icône, jsPDF) : cache d'abord pour la vitesse + hors-ligne
    e.respondWith(
      caches.match(req).then(r=>r||fetch(req).then(resp=>{
        const copy=resp.clone();
        caches.open(CACHE).then(c=>c.put(req,copy).catch(()=>{}));
        return resp;
      }))
    );
  }
});
