const cacheName = 'app-lernen-v21';

// cache
self.addEventListener('install', (event: FetchEvent) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll([
        '/',
        '/styles.css',
        '/styles.js',
        '/index.js',
      ]);
    })
  );
});

// remove all except actual
self.addEventListener('activate', (event: FetchEvent) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== cacheName) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// fetch
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then((resp) => {
      if (resp) {
        return resp;
      }

      return fetch(event.request);
    }).catch(() => {
      if (event.request.method.toUpperCase() === 'GET') {
        return caches.match('/');
      } else {
        return new Response(JSON.stringify({
          offline: {
            status: 'error',
            text: 'offline'
          }
        }), {
          headers: {'Content-Type': 'application/json'}
        });
      }
    })
  );
});

/*

navigator.serviceWorker.getRegistrations().then(registrations => {
  for (let registration of registrations) {
    registration.unregister()
  }
});

 */
