const CACHE_NAME = 'orphionmc-static-v20';
const STATIC_ASSETS = [
    './',
    'index.html',
    'wiki/index.html',
    'wiki/olimpo.html',
    'wiki/delos.html',
    'wiki/colosos.html',
    'wiki/zeus.html',
    'wiki/poseidon.html',
    'wiki/pluto.html',
    'wiki/kronos.html',
    'wiki/anubis.html',
    'wiki/cerberus.html',
    'wiki/medusa.html',
    'wiki/loki.html',
    'wiki/buda.html',
    'wiki/bufobufo.html',
    'wiki/hydra.html',
    'wiki/cyclops.html',
    'wiki/aloc.html',
    'wiki/nyctalus.html',
    'wiki/dragon.html',
    'wiki/minotaur.html',
    'assets/models/zeus.bin',
    'assets/models/poseidon.bin',
    'assets/models/pluto.bin',
    'assets/models/kronos.bin',
    'assets/models/anubis.bin',
    'assets/models/cerberus.bin',
    'assets/models/medusa.bin',
    'assets/models/loki.bin',
    'assets/models/buda.bin',
    'assets/models/bufo.bin',
    'assets/models/hydra.bin',
    'assets/models/cyclops.bin',
    'assets/models/aloc.bin',
    'assets/models/nyctalus.bin',
    'assets/models/dragon.bin',
    'assets/models/minotaur.bin',
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

// 1. Install: Pre-cache core static assets y saltar espera inmediatamente
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
});

// 2. Activate: Eliminar cachés viejas inmediatamente y tomar control de todos los clientes
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

// 3. Fetch Strategy: NETWORK-FIRST para todo (HTML, CSS, JS, Assets)
// Esto asegura que cualquier cambio visual se refleje de inmediato en la primera carga sin requerir F5.
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Solo interceptar peticiones GET
    if (request.method !== 'GET') return;

    event.respondWith(
        fetch(request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const copy = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                }
                return networkResponse;
            })
            .catch(() => caches.match(request))
    );
});
