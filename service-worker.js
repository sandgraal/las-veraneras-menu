const CACHE = 'las-veraneras-v10';
const STATIC = ['./','index.html','styles.css','app.js','manifest.json','data/menu.json','data/combos.json'];
const FRESH = ['data/config.json','data/specials.json','data/combos.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)).catch(()=>{}));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const path = url.pathname;

  // Stale-while-revalidate for config and specials
  const isFresh = FRESH.some(f => path.endsWith(f));
  if (isFresh) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          const fetchPromise = fetch(e.request).then(res => {
            cache.put(e.request, res.clone());
            return res;
          }).catch(() => cached || new Response('{"error":"offline"}', {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }));
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Network-first for HTML/CSS/JS, fallback to cache
  const isNav = e.request.mode === 'navigate';
  const isAsset = /\.(css|js|html|json)$/.test(path);
  if (isNav || isAsset) {
    e.respondWith(
      fetch(e.request)
        .then(res => { caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; })
        .catch(() => caches.match(e.request, {ignoreSearch: true}).then(c => c || caches.match('./', {ignoreSearch: true})))
    );
    return;
  }

  // Cache-first for images and other assets
  e.respondWith(
    caches.match(e.request).then(c => c || fetch(e.request))
  );
});
