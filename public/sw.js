const CACHE_NAME = 'dz-post-link-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/constants.tsx',
  '/types.ts',
  '/components/LanguageSwitcher.tsx',
  '/components/ResultCard.tsx',
  '/utils/ccp-logic.ts'
];

// Install Event - Pre-cache critical application shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline app shell');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.error('[Service Worker] Pre-cache failed (some assets might be dynamic dev routes):', err);
        // Continue worker activation even if some local source files fail to cache initially
        return cache.addAll(['/', '/index.html']);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up stale cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing stale cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Stale-While-Revalidate strategy for optimal performance and offline capability
self.addEventListener('fetch', (event) => {
  // Only handle local HTTP/HTTPS requests (avoid chrome-extension issues)
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('http')) {
    return;
  }

  // Handle caching for font resources, ESM modules, and local assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in background to update cache (Stale-While-Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Ignore background fetch failures (e.g. offline)
          });
        return cachedResponse;
      }

      // Network fallback
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
            return networkResponse;
          }

          // Dynamically cache successful requests to esm.sh, Google Fonts, and local assets
          const url = new URL(event.request.url);
          const shouldCache = 
            url.origin === self.location.origin || 
            url.hostname.includes('esm.sh') || 
            url.hostname.includes('fonts.googleapis.com') || 
            url.hostname.includes('fonts.gstatic.com');

          if (shouldCache) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return networkResponse;
        })
        .catch((error) => {
          // If offline and request is for page navigation, serve cached Root/HTML
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          throw error;
        });
    })
  );
});
