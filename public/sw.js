// Service Worker for Offline Reading
const CACHE_NAME = 'manhwa-mirror-v1'
const OFFLINE_URL = '/offline.html'

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json'
]

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching assets')
      return cache.addAll(PRECACHE_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Domain mappings for image proxy
const DOMAIN_MAPPINGS = {
  '1': 'sv1.imgkc1.my.id',
  '2': 'sv2.imgkc2.my.id',
  '3': 'sv3.imgkc3.my.id',
  '4': 'sv4.imgkc4.my.id',
  '5': 'sv5.imgkc5.my.id'
}

const REVERSE_DOMAIN_MAPPINGS = {
  'sv1.imgkc1.my.id': '1',
  'sv2.imgkc2.my.id': '2',
  'sv3.imgkc3.my.id': '3',
  'sv4.imgkc4.my.id': '4',
  'sv5.imgkc5.my.id': '5'
}

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip chrome extensions and other schemes
  if (!event.request.url.startsWith('http')) return

  // Intercept image requests to route through proxy
  const url = new URL(event.request.url)
  if (url.hostname.includes('komikcast03.com')) {
    return
  }

  let requestUrl = event.request.url

  // Check if this is an image from a mapped domain
  const domainId = REVERSE_DOMAIN_MAPPINGS[url.hostname]
  if (domainId && url.pathname.includes('/wp-content/')) {
    // Route through image proxy
    const path = url.pathname + url.search
    requestUrl = `/api/image/${domainId}${path}`
  }

  event.respondWith(
    fetch(requestUrl)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone()

        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(event.request, responseToCache)
            } catch (e) {
              // Ignore cache errors
            }
          })
        }

        return response
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }

          // If no cache, show offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL)
          }

          // FIX: Hanya return SVG jika request adalah GAMBAR
          // Ini memperbaiki error GTM (MIME type mismatch) dan fetch API error
          const isImage = event.request.destination === 'image' ||
            requestUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);

          if (isImage) {
            return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>', {
              status: 200,
              headers: { 'Content-Type': 'image/svg+xml' }
            })
          }

          // Untuk script/API/CSS yang gagal, biarkan error (atau return 503) agar tidak merusak parsing
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        })
      })
  )
})

// Message event - handle commands from app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urls)
      })
    )
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        return caches.open(CACHE_NAME)
      })
    )
  }
})
