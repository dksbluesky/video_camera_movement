// 這次改為 auto-v3 主要是為了強迫瀏覽器開除舊的「手動版」守門員
// 之後您更新 index.html，這個檔案就不必再動了
const CACHE_NAME = 'camera-master-auto-v3';

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

// 【核心】：網路優先策略
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // 有網路時，永遠抓最新的並更新快取
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // 沒網路時，才讀取最後一次存下來的快取
        return caches.match(e.request);
      })
  );
});
