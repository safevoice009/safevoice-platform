// SafeVoice Service Worker v12.0
const CACHE_NAME = 'safevoice-v12.0';
const urlsToCache = [
  '/',
  '/index.html'
];

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
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch (serve from cache first)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

////////////////////////////////////////////////////////////////////////////////
// Helper for uploading files to Supabase Edge Function
////////////////////////////////////////////////////////////////////////////////
async function uploadAndGetUrl(file) {
  // Read file as Base64
  const reader = new FileReader();
  reader.readAsDataURL(file);
  await new Promise(resolve => reader.onload = resolve);
  const base64 = reader.result.split(',')[1];

  // Call your Supabase function
  const res = await fetch(
    'https://mrgapvgbtqgwysfjzwoy.functions.supabase.co/uploadToDrive',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileData: base64,
        fileName: file.name,
        mimeType: file.type
      })
    }
  );
  const { url, error } = await res.json();
  if (error) throw new Error(error);
  return url;
}

// Export for client pages to call
self.uploadAndGetUrl = uploadAndGetUrl;
