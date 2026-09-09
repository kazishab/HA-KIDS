const CACHE_NAME = 'ha-kids-v1';
const urlsToCache = [
    './',
    './index.html',
    './css/style.css',
    './js/main.js',
    './js/games/memory-game.js',
    './js/games/pattern-game.js',
    './js/games/speed-game.js',
    './js/games/sudoku-game.js',
    './assets/images/app-icon.png',
    './assets/images/splash-logo.jpg'
];

// Install: cache app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch: serve from cache first, fall back to network
self.addEventListener('fetch', (event) => {
    // Only handle GET requests, let Firebase/other requests pass through normally
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request).catch(() => {
                return caches.match('./index.html');
            });
        })
    );
});
