// Zayne/sw.js
const CACHE_NAME = 'chuanxun-v1';
const urlsToCache = [
    '/Zayne/',
    '/Zayne/index.html',
    'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 安装 Service Worker
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('缓存已打开');
                // 使用 Promise.allSettled 避免单个资源失败导致整个安装失败
                return Promise.allSettled(
                    urlsToCache.map(url => 
                        cache.add(url).catch(err => console.warn(`缓存失败: ${url}`, err))
                    )
                );
            })
    );
});

// 激活 Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return clients.claim();
        })
    );
});

// 拦截请求
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 如果在缓存中找到，返回缓存的响应
                if (response) {
                    return response;
                }
                // 否则发起网络请求
                return fetch(event.request).catch(() => {
                    // 如果网络请求失败，可以返回离线页面
                    if (event.request.mode === 'navigate') {
                        return caches.match('/Zayne/');
                    }
                });
            })
    );
});

// 处理推送通知
self.addEventListener('push', event => {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch {
            data = { title: '新消息', body: event.data.text() };
        }
    }

    const options = {
        body: data.body || '对方发来了新消息',
        icon: data.icon || 'https://file.youtochat.com/images/20260216/1771224856844_qdqdq.jpeg',
        badge: 'https://file.youtochat.com/images/20260216/1771224856844_qdqdq.jpeg',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/Zayne/'
        },
        actions: [
            {
                action: 'open',
                title: '打开'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(
            data.title || '传讯',
            options
        )
    );
});

// 处理通知点击
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/Zayne/')
        );
    } else {
        event.waitUntil(
            clients.openWindow('/Zayne/')
        );
    }
});
