const CACHE_NAME = 'orphionmc-static-v28';
const STATIC_ASSETS = [
    './',
    'index.html',
    'wiki/index.html',
    'wiki/olimpo.html',
    'wiki/delos.html',
    'wiki/colosos.html',
    'wiki/sepulcrales.html',
    'wiki/eventos.html',
    'wiki/prehistorico.html',
    'wiki/marinas.html',
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
    'wiki/undead_king.html',
    'wiki/lich_king.html',
    'wiki/azazel.html',
    'wiki/demon_lord.html',
    'wiki/ent_king.html',
    'wiki/goblin_king.html',
    'wiki/fenrir.html',
    'wiki/pumpkinking.html',
    'wiki/azgad.html',
    'wiki/frankie.html',
    'wiki/yeti.html',
    'wiki/santa.html',
    'wiki/dino_trex.html',
    'wiki/dino_allosaurus.html',
    'wiki/dino_yutyrannus.html',
    'wiki/dino_beishanlong.html',
    'wiki/dino_brachiosaurus.html',
    'wiki/dino_triceratops.html',
    'wiki/dino_ankylosaurus.html',
    'wiki/dino_utahraptor.html',
    'wiki/dino_dracorex.html',
    'wiki/dino_carnotaurus.html',
    'wiki/dino_stegosaurus.html',
    'wiki/dino_therizinosaurus.html',
    'wiki/dino_glacialisaurus.html',
    'wiki/dino_kentrosaurus.html',
    'wiki/marine_giant_squid.html',
    'wiki/marine_orca.html',
    'wiki/marine_shark.html',
    'wiki/marine_mako_shark.html',
    'wiki/marine_hammerhead.html',
    'wiki/marine_hammerhead_reef.html',
    'wiki/marine_manta_ray.html',
    'wiki/marine_swordfish.html',
    'wiki/marine_sunfish.html',
    'wiki/marine_angler_fish.html',
    'wiki/marine_box_jellyfish.html',
    'wiki/marine_jellyfish_ghost.html',
    'wiki/marine_jellyfish_crown.html',
    'wiki/marine_octopus_blue.html',
    'wiki/marine_octopus_mimic.html',
    'wiki/marine_spider_crab.html',
    'wiki/marine_blue_lobster.html',
    'wiki/marine_red_lobster.html',
    'wiki/marine_pistol_shrimp.html',
    'wiki/marine_pufferfish_blown.html',
    'wiki/marine_nautilus.html',
    'wiki/marine_sea_angel.html',
    'wiki/marine_sea_slug.html',
    'wiki/marine_barracuda.html',
    'wiki/marine_dolphin.html',
    'wiki/marine_manatee.html',
    'wiki/marine_stingray.html',
    'wiki/marine_piranha.html',
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
    'assets/models/undead_king.bin',
    'assets/models/lich_king.bin',
    'assets/models/azazel.bin',
    'assets/models/demon_lord.bin',
    'assets/models/ent_king.bin',
    'assets/models/goblin_king.bin',
    'assets/models/fenrir.bin',
    'assets/models/pumpkinking.bin',
    'assets/models/azgad.bin',
    'assets/models/frankie.bin',
    'assets/models/yeti.bin',
    'assets/models/santa.bin',
    'assets/models/dino_trex.bin',
    'assets/models/dino_allosaurus.bin',
    'assets/models/dino_yutyrannus.bin',
    'assets/models/dino_beishanlong.bin',
    'assets/models/dino_brachiosaurus.bin',
    'assets/models/dino_triceratops.bin',
    'assets/models/dino_ankylosaurus.bin',
    'assets/models/dino_utahraptor.bin',
    'assets/models/dino_dracorex.bin',
    'assets/models/dino_carnotaurus.bin',
    'assets/models/dino_stegosaurus.bin',
    'assets/models/dino_therizinosaurus.bin',
    'assets/models/dino_glacialisaurus.bin',
    'assets/models/dino_kentrosaurus.bin',
    'assets/models/marine_giant_squid.bin',
    'assets/models/marine_orca.bin',
    'assets/models/marine_shark.bin',
    'assets/models/marine_mako_shark.bin',
    'assets/models/marine_hammerhead.bin',
    'assets/models/marine_hammerhead_reef.bin',
    'assets/models/marine_manta_ray.bin',
    'assets/models/marine_swordfish.bin',
    'assets/models/marine_sunfish.bin',
    'assets/models/marine_angler_fish.bin',
    'assets/models/marine_box_jellyfish.bin',
    'assets/models/marine_jellyfish_ghost.bin',
    'assets/models/marine_jellyfish_crown.bin',
    'assets/models/marine_octopus_blue.bin',
    'assets/models/marine_octopus_mimic.bin',
    'assets/models/marine_spider_crab.bin',
    'assets/models/marine_blue_lobster.bin',
    'assets/models/marine_red_lobster.bin',
    'assets/models/marine_pistol_shrimp.bin',
    'assets/models/marine_pufferfish_blown.bin',
    'assets/models/marine_nautilus.bin',
    'assets/models/marine_sea_angel.bin',
    'assets/models/marine_sea_slug.bin',
    'assets/models/marine_barracuda.bin',
    'assets/models/marine_dolphin.bin',
    'assets/models/marine_manatee.bin',
    'assets/models/marine_stingray.bin',
    'assets/models/marine_piranha.bin',
    'assets/models/cyclops.bin',
    'assets/models/aloc.bin',
    'assets/models/nyctalus.bin',
    'assets/models/dragon.bin',
    'assets/models/minotaur.bin',
    'assets/models/undead_king.bin',
    'assets/models/lich_king.bin',
    'assets/models/azazel.bin',
    'assets/models/demon_lord.bin',
    'assets/models/ent_king.bin',
    'assets/models/goblin_king.bin',
    'assets/models/fenrir.bin',
    'assets/models/pumpkinking.bin',
    'assets/models/azgad.bin',
    'assets/models/frankie.bin',
    'assets/models/yeti.bin',
    'assets/models/santa.bin',
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
