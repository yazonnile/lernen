const cacheName = 'app-lernen-v6';
// cache
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(cacheName).then((cache) => {
        return cache.addAll([
            '/pwa-test/',
            '/pwa-test/index.css',
            '/pwa-test/index.js',
        ]);
    }));
});
// remove all except actual
self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
            if (key !== cacheName) {
                return caches.delete(key);
            }
        }));
    }));
});
// fetch
self.addEventListener('fetch', (event) => {
    event.respondWith(caches.match(event.request).then((resp) => {
        if (resp) {
            return resp;
        }
        return fetch(event.request).then((response) => {
            if (event.request.method.toUpperCase() === 'GET') {
                let responseClone = response.clone();
                caches.open(cacheName).then((cache) => {
                    cache.put(event.request, responseClone);
                });
            }
            return response;
        });
    }).catch(() => {
        if (event.request.method.toUpperCase() === 'GET') {
            return caches.match('/pwa-test/');
        }
        else {
            return new Response(JSON.stringify({
                offline: {
                    status: 'error',
                    text: 'offline'
                }
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }));
});
/*

navigator.serviceWorker.getRegistrations().then(registrations => {
  for (let registration of registrations) {
    registration.unregister()
  }
});

 */
