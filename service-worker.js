const CACHE='las-veraneras-v6';
const ASSETS=['./','index.html','styles.css','data/menu.json','manifest.json'];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).catch(()=>{}));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));self.clients.claim();});
self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  const isPage=request.mode==='navigate';
  const isFreshAsset=url.pathname.endsWith('.css')||url.pathname.endsWith('.js')||url.pathname.endsWith('.json')||url.pathname.endsWith('.html')||isPage;
  if(isFreshAsset){
    event.respondWith(fetch(request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));return response;}).catch(()=>caches.match(request).then(cached=>cached||caches.match('./'))));
    return;
  }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));
});
