// sw.js - Service Worker
const CACHE_NAME = 'chuanxun-v1';
const urlsToCache = [
  '/Zayne/',                 // 缓存你的起始页
  '/Zayne/index.html',       // 缓存主HTML
  'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600&display=swap'
  // 移除了返回403的Font Awesome链接
];

// 安装Service Worker
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        // 使用 catch 忽略单个资源失败，避免整个安装过程失败
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => console.warn('缓存失败:', url, err))
          )
        );
      })
  );
});

// 激活Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// 处理推送通知 (保持不变)
self.addEventListener('push', event => {
  // ... 你的代码
});

// 点击通知 (保持不变)
self.addEventListener('notificationclick', event => {
  // ... 你的代码
});
