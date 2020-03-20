const cacheName = 'app-lernen-v8';

// cache
self.addEventListener('install', (event: FetchEvent) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll([
        '/lernen/client/public/',
        '/lernen/client/public/index.css',
        '/lernen/client/public/index.js',
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

      return fetch(event.request).then((response) => {
        if (event.request.method.toUpperCase() === 'GET') {
          let responseClone = response.clone();
          caches.open(cacheName).then((cache: Cache) => {
            cache.put(event.request, responseClone);
          });
        }

        return response;
      });
    }).catch(() => {
      if (event.request.method.toUpperCase() === 'GET') {
        return caches.match('/lernen/client/public/');
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
