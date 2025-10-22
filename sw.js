// SafeVoice Service Worker v13.0
const CACHE_NAME = 'safevoice-v13.0';
const urlsToCache = ['/', '/index.html'];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch (cache-first)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Listen for messages from the page
self.addEventListener('message', async event => {
  if (event.data.type === 'UPLOAD_FILE') {
    try {
      const { fileData, fileName, mimeType } = event.data;
      
      // Call Supabase Edge Function
      const res = await fetch(
        'https://mrgapvgbtqgwysfjzwoy.functions.supabase.co/uploadToDrive',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileData, fileName, mimeType })
        }
      );
      
      const { url, error } = await res.json();
      
      // Send result back to the page
      event.ports[0].postMessage({ success: !error, url, error });
    } catch (err) {
      event.ports[0].postMessage({ success: false, error: err.message });
    }
  }
});
