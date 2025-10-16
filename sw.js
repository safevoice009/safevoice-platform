// SafeVoice Service Worker v3.2.0
const CACHE_NAME = 'safevoice-v3.2.0';
const urlsToCache = [
  '/safevoice-platform/',
  '/safevoice-platform/index.html',
  '/safevoice-platform/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('🛡️ SafeVoice: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Cache error:', err);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🛡️ SafeVoice: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          return caches.match('/safevoice-platform/index.html');
        });
      })
  );
});

self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New update on SafeVoice',
    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ctext y="75" font-size="75"%3E🛡️%3C/text%3E%3C/svg%3E',
    badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ctext y="75" font-size="75"%3E🛡️%3C/text%3E%3C/svg%3E',
    vibrate: [200, 100, 200],
    tag: 'safevoice-notification',
    requireInteraction: false
  };
  
  event.waitUntil(
    self.registration.showNotification('SafeVoice', options)
  );
});

console.log('🛡️ SafeVoice Service Worker v3.2.0 loaded');
