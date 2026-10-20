const CACHE_NAME = 'orphionmc-static-v9';
const STATIC_ASSETS = [
    './',
    'index.html',
    'wiki/zeus.html',
    'css/custom.css',
    'css/wiki.css',
    'js/main.js',
    'js/server-status.js',
    'js/wiki-model-viewer.js',
    'manifest.json',
    'favicon.ico',
    'assets/images/logo.png',
    'assets/images/poster.png',
    'legal/terms.html',
    '404.html',
    'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=MedievalSharp&family=Inter:wght@400;600&display=swap'
];

// 1. Install: Pre-cache core static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// 2. Activate: Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// 3. Fetch Strategy: Static Cache First with network revalidation
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Solo interceptar peticiones GET
    if (request.method !== 'GET') return;

    // Para páginas HTML: Network-first con fallback a caché
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Para recursos estáticos: Cache-first con actualización en segundo plano
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                fetch(request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
                    }
                }).catch(() => {});
                return cachedResponse;
            }
            return fetch(request);
        })
    );
});
