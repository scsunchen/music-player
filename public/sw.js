const CACHE_NAME = 'music-player-v3'

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/music-player/',
  '/music-player/index.html'
]

// 安装时预缓存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// 请求拦截：缓存优先，减少网络请求
self.addEventListener('fetch', (event) => {
  // 跳过音频文件（太大，不缓存）
  if (event.request.url.includes('/audio/')) return

  // 跳过非 http(s) 协议请求（chrome-extension、blob、data 等）
  const url = new URL(event.request.url)
  if (!['http:', 'https:'].includes(url.protocol)) return

  // 跳过 POST 请求
  if (event.request.method !== 'GET') return

  // 跳过 API 请求（如果有的话）
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // 如果有缓存，先返回缓存，同时后台更新
      if (cached) {
        // 后台更新缓存（不阻塞响应）
        fetch(event.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone)
            })
          }
        }).catch(() => {})
        return cached
      }

      // 没有缓存，走网络请求
      return fetch(event.request).then((response) => {
        if (response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone)
          })
        }
        return response
      }).catch(() => {
        return new Response('离线状态', { status: 503 })
      })
    })
  )
})