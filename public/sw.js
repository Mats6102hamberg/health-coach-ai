const CACHE_NAME = 'halsopartner-v2';
const STATIC_CACHE = 'halsopartner-static-v2';
const DYNAMIC_CACHE = 'halsopartner-dynamic-v2';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Serving from cache:', request.url);
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Don't cache if not ok
            if (!response.ok) {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache dynamic content
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Background sync for health data
self.addEventListener('sync', (event) => {
  if (event.tag === 'health-data-sync') {
    event.waitUntil(syncHealthData());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Dags för din hälsokontroll!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'Öppna appen',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Stäng'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('HälsoPartner AI', options)
  );
});

async function syncHealthData() {
  try {
    // Hämta lagrad hälsodata från IndexedDB
    const healthData = await getStoredHealthData();
    
    // Skicka till server
    await fetch('/api/sync-health', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(healthData)
    });
    
    console.log('Health data synced successfully');
  } catch (error) {
    console.error('Failed to sync health data:', error);
  }
}

// Simulera hälsodata från telefon
async function getStoredHealthData() {
  // I verkligheten skulle detta komma från HealthKit/Google Fit
  return {
    steps: Math.floor(Math.random() * 5000) + 5000,
    heartRate: Math.floor(Math.random() * 40) + 60,
    sleep: Math.floor(Math.random() * 3) + 6,
    timestamp: Date.now()
  };
}
