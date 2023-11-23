var cacheStatic = 'cache';

self.addEventListener('install', function (event) {
    console.log('SW instalado', event);
    event.waitUntil(
        caches.open(cacheStatic)
            .then(function (cache) {
                return cache.addAll([
                    'style.css',
                    'index.html',
                    'favoritos.html',
                    'poke.png',
                ]);
            })
            .catch(function (error) {
                console.error('Error al intentar almacenar en caché:', error);
            })
    );
});


self.addEventListener('activate', function (event) {
    console.log('SW activado', event);
});

//cache dinamico
var cacheDynamic = 'dynamic';
// ...

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (response) {
                return response;
            }

            var requestToCache = event.request.clone();

            // Verifica el esquema de la solicitud
            if (requestToCache.url.startsWith('chrome-extension://')) {
                return fetch(requestToCache);
            }

            return fetch(requestToCache)
                .then(function (response) {
                    if (!response || response.status !== 200) {
                        return response;
                    }

                    var responseToCache = response.clone();

                    // Cambiamos la forma de almacenar en caché
                    return caches.open(cacheDynamic).then(function (cache) {
                        return cache.put(new Request(event.request.url), responseToCache);
                    });
                })
                .catch(function (error) {
                    console.error('Error al intentar realizar la solicitud:', error);
                });
        })
    );
});

// ...



// Notificaciones push
self.addEventListener("push", function (e) {
    console.log(e)

    var title = "un push para practicar";

    options = {
        body: "Click para regresar a la aplicacion",
        icon: "android-icon-192x192.png",
        vibrate: [100, 50, 100],
        data: { id: 1 },
        actions: [{
            'action': 'SI', 'title': 'Copada la app',
            'icon': 'android-icon-192x192.png'

        },
        {
            'action': 'NO', 'title': 'buuu, fea la app',
            'icon': 'android-icon-192x192.png'
        }]
    }
    e.waitUntil(self.registration.showNotification(title, options))

})


self.addEventListener("notificationclick", function (e) {
    console.log(e);

    if (e.action === "SI") {
        console.log("Me encanta esta APP")
        clients.openWindow('https://google.com')
        console.log(clients)
    }
    else if (e.action === "NO") {
        console.log("NO me gusta esta app")


    }

    e.notification.close();
})