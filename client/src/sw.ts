const cacheName = 'app-lernen-' + process.env.VERSION;

const basePath = !process.env.DEV ? '/lernen/client/public' : '';

const cacheEnum = {
  index: `${basePath}/`,
  css: `${basePath}/index.css`,
  js: `${basePath}/index.js`,
};

// cache
self.addEventListener('install', (event: FetchEvent) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll([
        cacheEnum.index,
        cacheEnum.css,
        cacheEnum.js,
      ]);
    }).catch(e => {
      console.log('install', e);
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
    }).catch(e => {
      console.log('activate', e);
    })
  );
});

const getCache = request => {
  return caches.match(request).then((resp) => {
    if (resp) {
      return resp;
    }

    if (request.method.toUpperCase() === 'GET') {
      return caches.match(cacheEnum.index);
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
  });
} ;

// fetch
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response) {
        caches.match(event.request).then((resp) => {
          if (resp) {
            const responseClone = response.clone();
            caches.open(cacheName).then((cache: Cache) => {
              cache.put(event.request, responseClone);
            });
          }
        });

        return response;
      } else {
        return getCache(event.request);
      }
    }).catch(() => {
      return getCache(event.request);
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
