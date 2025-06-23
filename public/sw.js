
const CACHE_NAME = 'recyclr-ai-v2';
const API_CACHE = 'recyclr-api-v1';
const STATIC_CACHE = 'recyclr-static-v1';

const urlsToCache = [
  '/',
  '/dashboard',
  '/dashboard/content',
  '/dashboard/repurpose',
  '/dashboard/templates',
  '/dashboard/scheduling',
  '/dashboard/analytics',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE)
        .then((cache) => cache.addAll(urlsToCache)),
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE && cacheName !== STATIC_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - network first for API, cache first for static resources
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network first strategy
  if (url.hostname.includes('supabase.co') || request.url.includes('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then(cache => {
        return fetch(request)
          .then(response => {
            // Only cache successful GET requests
            if (request.method === 'GET' && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Return cached version if network fails
            return cache.match(request);
          });
      })
    );
    return;
  }

  // Handle static resources with cache first strategy
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Fetch from network and cache the response
        return fetch(request).then((response) => {
          // Only cache successful responses for same origin
          if (response.status === 200 && request.url.startsWith(self.location.origin)) {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
          }
          return response;
        }).catch(() => {
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncPendingContent());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New content ready!',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Content',
        icon: '/pwa-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/pwa-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Recyclr AI', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Share target handling
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname === '/dashboard/content' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request));
  }
});

async function handleShareTarget(request) {
  const formData = await request.formData();
  const title = formData.get('title') || '';
  const text = formData.get('text') || '';
  const url = formData.get('url') || '';
  
  // Store shared content in IndexedDB for the app to pick up
  const shareData = { title, text, url, timestamp: Date.now() };
  
  // Return a response that redirects to the content page
  return Response.redirect('/dashboard/content?shared=true', 303);
}

async function syncPendingContent() {
  // Implementation for syncing content when connection is restored
  console.log('Syncing pending content...');
}
