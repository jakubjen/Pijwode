const staticCacheName = 'site-static-v0.1';
const assets = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  '/js/Chart.bundle.min.js',
  '/img/background-header.jpg',
  'https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh7USSwaPGR_p.woff2',
  'https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh7USSwiPGQ.woff2',
  'https://fonts.gstatic.com/s/lato/v16/S6uyw4BMUTPHjxAwXjeu.woff2',
  'https://fonts.gstatic.com/s/lato/v16/S6uyw4BMUTPHjx4wXg.woff2',
  'https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh50XSwaPGR_p.woff2',
  'https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh50XSwiPGQ.woff2',
  'https://fonts.gstatic.com/s/yellowtail/v10/OZpGg_pnoDtINPfRIlLohlvHwQ.woff2',
];
// install event
self.addEventListener('install', evt => {
  console.log('service worker installed');
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('caching shell assets');
      cache.addAll(assets);
    })
  );
});

// fetch event
self.addEventListener('fetch', evt => {
  //console.log('fetch event', evt);
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request);
    })
  );
});
