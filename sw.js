// 1. 每次修改 index.html 後，請手動將這裡的 v1 改成 v2, v3... 以此類推
// 將 v1 改成 v2 (或是您目前沒用過的數字)
const CACHE_NAME = 'camera-master-v2.0';

const ASSETS = [
  './',
  './index.html'
];

// 安裝階段：將檔案寫入快取
self.addEventListener('install', (e) => {
  // 強制讓新的 Service Worker 進入啟動狀態，不需等待舊版關閉
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching all assets');
      return cache.addAll(ASSETS);
    })
  );
});

// 啟動階段：這是關鍵！它會比對版本號，並刪除舊的快取資料
self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Activating new version');
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 如果快取名稱不是目前的版本，就把它刪掉
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 讓新的 Service Worker 立即取得網頁的控制權
      return self.clients.claim();
    })
  );
});

// 攔截請求：優先從快取讀取，若無則從網路抓取
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
