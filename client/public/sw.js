const cacheName = 'app-lernen-' + 1584738652043;
const basePath =  '/lernen/client/public' ;
const cacheEnum = {
    index: `${basePath}/`,
    css: `${basePath}/index.css`,
    js: `${basePath}/index.js`,
};
// cache
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(cacheName).then((cache) => {
        return cache.addAll([
            cacheEnum.index,
            cacheEnum.css,
            cacheEnum.js,
        ]);
    }).catch(e => {
        console.log('install', e);
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
    }).catch(e => {
        console.log('activate', e);
    }));
});
const getCache = request => {
    return caches.match(request).then((resp) => {
        if (resp) {
            return resp;
        }
        if (request.method.toUpperCase() === 'GET') {
            return caches.match(cacheEnum.index);
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
    });
};
// fetch
self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request).then((response) => {
        if (response) {
            return response;
        }
        else {
            return getCache(event.request);
        }
    }).catch(() => {
        return getCache(event.request);
    }));
});
/*

navigator.serviceWorker.getRegistrations().then(registrations => {
  for (let registration of registrations) {
    registration.unregister()
  }
});

 */
