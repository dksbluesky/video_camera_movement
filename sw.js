const CACHE_NAME = 'camera-master-auto-update';

// 這裡不需要列出所有檔案，我們改用動態快取
self.addEventListener('install', (e) => {
  self.skipWaiting(); 
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

// 【核心改變】：網路優先策略
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // 如果網路通暢，就抓最新的並存入快取
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // 如果斷網了，才從快取拿資料
        return caches.match(e.request);
      })
  );
});
