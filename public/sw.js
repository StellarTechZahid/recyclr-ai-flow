
const CACHE_NAME = 'recyclr-ai-v3';
const API_CACHE = 'recyclr-api-v2';
const STATIC_CACHE = 'recyclr-static-v2';
const OFFLINE_PAGE = '/offline.html';

const urlsToCache = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/dashboard',
  '/dashboard/content',
  '/dashboard/repurpose',
  '/dashboard/templates',
  '/dashboard/scheduling',
  '/dashboard/analytics',
  '/dashboard/bulk',
  '/offline.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(urlsToCache)),
      caches.open(CACHE_NAME).then((cache) => 
        cache.add(new Request(OFFLINE_PAGE, {cache: 'reload'}))
      ),
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
            if (!['recyclr-ai-v3', 'recyclr-api-v2', 'recyclr-static-v2'].includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - comprehensive offline strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for caching
  if (request.method !== 'GET') return;

  // Handle API requests with network first, cache fallback
  if (url.hostname.includes('supabase.co') || request.url.includes('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then(cache => {
        return fetch(request)
          .then(response => {
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            return cache.match(request).then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline message for failed API requests
              return new Response(JSON.stringify({
                error: 'Offline - cached data not available',
                offline: true
              }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            });
          });
      })
    );
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match(OFFLINE_PAGE);
          });
        })
    );
    return;
  }

  // Handle static resources with cache first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        if (response.status === 200 && request.url.startsWith(self.location.origin)) {
          const responseToCache = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // Return a fallback for failed static resource requests
        if (request.destination === 'image') {
          return new Response('', { status: 404 });
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
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Your content is ready!',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id || 1,
      url: data.url || '/dashboard'
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
      clients.openWindow(event.notification.data.url || '/dashboard')
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
  
  // Store shared content for the app to pick up
  const shareData = { title, text, url, timestamp: Date.now() };
  
  return Response.redirect('/dashboard/content?shared=true', 303);
}

async function syncPendingContent() {
  console.log('Syncing pending content...');
  // Implementation for syncing offline actions
}

async function syncAnalytics() {
  console.log('Syncing analytics data...');
  // Implementation for syncing analytics data
}

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
