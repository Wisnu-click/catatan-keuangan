const CACHE_VERSION = 'vira-v' + Date.now();
const CACHE_NAME = 'vira-cache-' + CACHE_VERSION;
const OFFLINE_URL = '/offline.html';

const STATIC_PRECACHE = [
    OFFLINE_URL,
    '/favicon.ico',
    '/logo.png',
    '/icon-192x192.png',
    '/icon-512x512.png',
];

// Pre-cache only offline fallback and essential icons (NEVER cache root HTML "/" or dynamic pages)
self.addEventListener('install', (event) => {
    console.log('[VIRA PWA] Service Worker installing:', CACHE_NAME);
    // Force the waiting service worker to become the active service worker immediately
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_PRECACHE).catch((err) => {
                console.warn('[VIRA PWA] Precache warning:', err);
            });
        })
    );
});

// Clean up all old caches and take control of all clients immediately
self.addEventListener('activate', (event) => {
    console.log('[VIRA PWA] Service Worker activated:', CACHE_NAME);
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[VIRA PWA] Deleting old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Listen for explicit skip waiting message
self.addEventListener('message', (event) => {
    if (event.data && (event.data.type === 'SKIP_WAITING' || event.data === 'skipWaiting')) {
        self.skipWaiting();
    }
});

// Helper to check if request is a Vite dev/HMR or development asset
function isViteOrDevRequest(url) {
    return (
        url.port === '5173' ||
        url.pathname.includes('@vite') ||
        url.pathname.includes('@react-refresh') ||
        url.pathname.includes('resources/js') ||
        url.pathname.includes('resources/css') ||
        url.pathname.endsWith('.jsx') ||
        url.pathname.endsWith('.tsx') ||
        url.pathname.endsWith('.ts') ||
        url.search.includes('v=') ||
        url.pathname.includes('hot')
    );
}

// Fetch handler: STRICT NETWORK-FIRST STRATEGY (Never lock user on stale cached JS/HTML)
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // 1. Never intercept non-GET requests (POST, PUT, DELETE, PATCH)
    if (request.method !== 'GET') {
        event.respondWith(fetch(request));
        return;
    }

    // 2. Bypass Vite dev server & HMR requests completely
    if (isViteOrDevRequest(url)) {
        event.respondWith(fetch(request));
        return;
    }

    // 3. For page navigations / HTML documents / Inertia responses: ALWAYS NETWORK FIRST
    if (request.mode === 'navigate' || request.destination === 'document') {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    return networkResponse;
                })
                .catch(async () => {
                    // Only if completely offline, serve offline.html
                    const offline = await caches.match(OFFLINE_URL);
                    return offline || new Response('Offline', { status: 503, statusText: 'Offline' });
                })
        );
        return;
    }

    // 4. For static assets (scripts, styles, images, fonts): NETWORK FIRST, fallback to cache if offline
    if (
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'image' ||
        request.destination === 'font' ||
        url.pathname.startsWith('/build/') ||
        url.pathname.startsWith('/assets/')
    ) {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    // If valid response, update cache in background
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(async () => {
                    // Network failed (offline), try cache
                    const cachedResponse = await caches.match(request);
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return new Response('', { status: 408, statusText: 'Request Timeout' });
                })
        );
        return;
    }

    // 5. Default: Network with Cache Fallback
    event.respondWith(
        fetch(request)
            .then((response) => {
                return response;
            })
            .catch(() => caches.match(request))
    );
});

// Background Sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'laravel-pwa-sync') {
        event.waitUntil(syncRequests());
    }
});

async function syncRequests() {
    try {
        const db = await openDB();
        const tx = db.transaction('offline-requests', 'readonly');
        const store = tx.objectStore('offline-requests');
        const requests = await getAllRequests(store);

        for (const req of requests) {
            try {
                const response = await fetch(req.url, {
                    method: req.method,
                    headers: req.headers,
                    body: req.body
                });

                if (response.ok) {
                    const deleteTx = db.transaction('offline-requests', 'readwrite');
                    deleteTx.objectStore('offline-requests').delete(req.id);
                }
            } catch (err) {
                console.error('[Laravel PWA] Sync failed for:', req.url, err);
            }
        }
    } catch (e) {
        // Ignore if IndexedDB is not set up
    }
}

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('laravel-pwa-sync', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getAllRequests(store) {
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
