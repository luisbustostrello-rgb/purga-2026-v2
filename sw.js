const CACHE='lbd-v3';
const SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.hostname.endsWith('supabase.co'))return;           // los datos siempre van a la red
  if(u.origin===location.origin){                                            // app: red primero, caché si no hay internet
    e.respondWith(fetch(r,{cache:'no-store'}).then(x=>{const c=x.clone();caches.open(CACHE).then(k=>k.put(r,c));return x;}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
  }else if(u.hostname==='cdnjs.cloudflare.com'){                             // librerías: caché primero
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(x=>{const c=x.clone();caches.open(CACHE).then(k=>k.put(r,c));return x;})));
  }
});
