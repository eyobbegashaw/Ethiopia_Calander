const CACHE_NAME = 'ethiopian-calendar-v2'
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/pwa-icon.svg']

const hasExpectedAssetType = (request, response) => {
  const contentType = response.headers.get('content-type') || ''
  if (request.destination === 'script') return contentType.includes('javascript')
  if (request.destination === 'style') return contentType.includes('text/css')
  return true
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(async (cache) => {
    await cache.addAll(APP_SHELL)
    const indexResponse = await cache.match('/index.html')
    const indexHtml = await indexResponse.text()
    const assetUrls = [...indexHtml.matchAll(/(?:src|href)="([^"]+\.(?:js|css)(?:\?[^\"]*)?)"/g)]
      .map((match) => new URL(match[1], self.location.origin))
      .filter((url) => url.origin === self.location.origin)
      .map((url) => url.href)
    await cache.addAll(assetUrls)
  }))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.filter((cacheName) => cacheName !== CACHE_NAME).map((cacheName) => caches.delete(cacheName)),
    )),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(async (response) => {
        if (response.ok) {
          const responseCopy = response.clone()
          await caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseCopy))
        }
        return response
      }).catch(() => caches.match('/index.html')),
    )
    return
  }

  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      if (cachedResponse && hasExpectedAssetType(request, cachedResponse)) return cachedResponse
      if (cachedResponse) {
        await caches.open(CACHE_NAME).then((cache) => cache.delete(request))
      }

      const response = await fetch(request)
      if (response.ok && response.type === 'basic' && hasExpectedAssetType(request, response)) {
        const responseCopy = response.clone()
        await caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy))
      }
      if (response.ok && !hasExpectedAssetType(request, response)) {
        return new Response('Requested application asset was not served with the expected content type.', {
          status: 502,
          headers: { 'Content-Type': request.destination === 'style' ? 'text/css' : 'text/javascript' },
        })
      }
      return response
    }),
  )
})