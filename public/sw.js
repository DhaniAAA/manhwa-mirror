// Service Worker for Offline Reading
const CACHE_NAME = 'manhwa-mirror-v1'
const OFFLINE_URL = '/offline.html'

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json'
]

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  self.clients.claim()
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => key !== CACHE_NAME && caches.delete(key))
    ))
  )
})

// Domain mappings for image proxy
const REVERSE_DOMAIN_MAPPINGS = {
  'sv1.imgkc1.my.id': '1',
  'sv2.imgkc2.my.id': '2',
  'sv3.imgkc3.my.id': '3',
  'sv4.imgkc4.my.id': '4',
  'sv5.imgkc5.my.id': '5'
}

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith('http')) return

  const url = new URL(event.request.url)

  // FIX: Jangan intersep request ke Google Tag Manager / Analytics
  // Biarkan browser menanganinya secara langsung (network only)
  if (url.hostname.includes('googletagmanager.com') ||
      url.hostname.includes('google-analytics.com')) {
    return
  }

  // Intercept image requests to route through proxy
  let requestUrl = event.request.url
  if (url.hostname.includes('komikcast03.com')) return

  const domainId = REVERSE_DOMAIN_MAPPINGS[url.hostname]
  if (domainId && url.pathname.includes('/wp-content/')) {
    requestUrl = `/api/image/${domainId}${url.pathname + url.search}`
  }

  event.respondWith(
    fetch(requestUrl)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            try { cache.put(event.request, responseToCache) } catch (e) {}
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse

          // Navigation requests -> Offline page
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL)
          }

          // Image requests -> Placeholder SVG
          const isImage = event.request.destination === 'image' ||
                          requestUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);

          if (isImage) {
            return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="3" x2="21" y2="21"/><line x1="21" y1="3" x2="3" y2="21"/></svg>', {
              status: 200,
              headers: { 'Content-Type': 'image/svg+xml' }
            })
          }

          // Untuk resource lain yang gagal (seperti script external),
          // return 503 atau error response standar agar tidak merusak parsing di browser
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
        })
      })
  )
})

// Message event
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
  if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(caches.delete(CACHE_NAME))
  }
})