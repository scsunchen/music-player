/**
 * Service Worker - 分层缓存策略
 * 
 * 策略说明：
 * - 导航请求 (index.html): network-first，确保用户拿到最新版本，离线时回退缓存
 * - 哈希资源 (*-[hash].js/css): cache-first，文件名含哈希即不可变，永久缓存
 * - 数据文件 (data/*.json): stale-while-revalidate，秒返回缓存 + 后台更新
 * - 图片资源: cache-first + 容量限制（最多 80 张），避免缓存膨胀
 * - 音频/视频: 不缓存（600MB+ 音频、14MB 视频不适合 Cache API）
 */

const VERSION = 'v6'
const PREFIX = 'music-player'

// 分层缓存名
const CACHE_STATIC = `${PREFIX}-static-${VERSION}`   // 哈希资源（不可变）
const CACHE_RUNTIME = `${PREFIX}-runtime-${VERSION}`  // 数据 + 图片（可变，带过期）
const CACHE_NAV = `${PREFIX}-nav-${VERSION}`           // 导航文档

// 运行时缓存上限（条目数），超出按 LRU 淘汰
const RUNTIME_MAX_ENTRIES = 80

// 动态基础路径
const BASE = new URL('.', self.location.href).pathname

// ==================== 安装：预缓存关键资源 ====================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAV).then((cache) => cache.addAll([
      BASE,
      BASE + 'index.html'
    ]))
  )
  self.skipWaiting()
})

// ==================== 激活：清理旧缓存 ====================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => !key.endsWith(VERSION))
          .map((key) => caches.delete(key))
      )
    }).then(() => self.clients.claim())
  )
})

// ==================== 导航预加载 ====================
if ('navigationPreload' in self.registration) {
  self.addEventListener('activate', (event) => {
    event.waitUntil(self.registration.navigationPreload.enable())
  })
}

// ==================== 工具函数 ====================

// 判断是否为哈希资源（文件名含 8 位以上哈希，如 vendor-Bfasw1lY.js）
const isHashedAsset = (url) => {
  return /-[a-zA-Z0-9_]{8,}\.(js|css|woff2?)$/i.test(url.pathname)
}

// 判断是否为数据 JSON
const isDataAsset = (url) => {
  return url.pathname.includes('/data/') && url.pathname.endsWith('.json')
}

// 判断是否为图片
const isImageAsset = (url) => {
  return /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(url.pathname)
}

// 判断是否为音频/视频（不缓存）
const isMediaAsset = (url) => {
  return /\.(mp3|mp4|webm|ogg|m4a|wav|flac)$/i.test(url.pathname)
}

// LRU 淘汰：删除最旧的条目，保持缓存条目数在上限内
const trimCache = async (cacheName, maxEntries) => {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length <= maxEntries) return

  // 按请求时间排序（利用 headers 的 date 或条目顺序）
  // Cache API 不直接暴露时间，但 keys() 返回顺序大致为写入顺序
  const deleteCount = keys.length - maxEntries
  await Promise.all(
    keys.slice(0, deleteCount).map((key) => cache.delete(key))
  )
}

// ==================== 请求拦截 ====================
self.addEventListener('fetch', (event) => {
  const { request } = event

  // 只处理 GET 请求
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // 跳过非 http(s) 协议
  if (!['http:', 'https:'].includes(url.protocol)) return

  // 跳过跨域请求（只缓存同源资源）
  if (url.origin !== self.location.origin) return

  // 跳过音频/视频（体积过大）
  if (isMediaAsset(url)) return

  // 跳过 API 请求
  if (url.pathname.includes('/api/')) return

  // ---- 策略 1: 导航请求 → network-first ----
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // 优先用导航预加载（如果可用）
          const preloadResponse = await event.preloadResponse
          if (preloadResponse) {
            // 后台更新导航缓存
            const cache = await caches.open(CACHE_NAV)
            cache.put(BASE + 'index.html', preloadResponse.clone())
            return preloadResponse
          }

          // 正常网络请求
          const response = await fetch(request)
          const cache = await caches.open(CACHE_NAV)
          cache.put(BASE + 'index.html', response.clone())
          return response
        } catch {
          // 离线：回退到缓存的 index.html
          const cache = await caches.open(CACHE_NAV)
          return (await cache.match(BASE + 'index.html')) ||
                 (await cache.match(request)) ||
                 new Response('离线状态，请检查网络连接', {
                   status: 503,
                   headers: { 'Content-Type': 'text/html; charset=utf-8' }
                 })
        }
      })()
    )
    return
  }

  // ---- 策略 2: 哈希资源 → cache-first（不可变，永久缓存） ----
  if (isHashedAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_STATIC).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // ---- 策略 3: 数据 JSON → stale-while-revalidate ----
  if (isDataAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        // 后台更新（不阻塞响应）
        const fetchAndUpdate = fetch(request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_RUNTIME).then((cache) => cache.put(request, clone))
          }
          return response
        }).catch(() => null)

        // 有缓存先返回，无缓存等网络
        return cached || fetchAndUpdate
      })
    )
    return
  }

  // ---- 策略 4: 图片 → cache-first + 容量限制 ----
  if (isImageAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_RUNTIME).then((cache) => {
              cache.put(request, clone)
              // 异步清理，不阻塞响应
              trimCache(CACHE_RUNTIME, RUNTIME_MAX_ENTRIES)
            })
          }
          return response
        })
      })
    )
    return
  }

  // ---- 默认: stale-while-revalidate ----
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchAndUpdate = fetch(request).then((response) => {
        if (response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_RUNTIME).then((cache) => cache.put(request, clone))
        }
        return response
      }).catch(() => cached)
      return cached || fetchAndUpdate
    })
  )
})

// ==================== 消息通信：支持手动更新 ====================
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
