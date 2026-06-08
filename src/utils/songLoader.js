/**
 * 歌曲数据分片加载器
 * 
 * 按需加载歌曲数据，支持：
 * - 索引优先加载（快速显示页面框架）
 * - 分类按需加载（点击分类时加载对应数据）
 * - 缓存已加载数据（避免重复请求）
 * - 动态更新（替换 JSON 文件即可，无需重新打包）
 */

import { resolveUrl } from './baseUrl'

// 缓存
const cache = new Map()
const loadingPromises = new Map()

/**
 * 加载 JSON 数据（带缓存）
 */
const loadJson = async (path) => {
  if (cache.has(path)) {
    return cache.get(path)
  }

  if (loadingPromises.has(path)) {
    return loadingPromises.get(path)
  }

  const promise = fetch(resolveUrl(path))
    .then(res => {
      if (!res.ok) throw new Error(`加载失败: ${path} (${res.status})`)
      return res.json()
    })
    .then(data => {
      cache.set(path, data)
      loadingPromises.delete(path)
      return data
    })
    .catch(err => {
      loadingPromises.delete(path)
      console.error(err)
      return null
    })

  loadingPromises.set(path, promise)
  return promise
}

/**
 * 加载索引文件（包含分类列表、专辑列表、歌单列表）
 * 体积小，优先加载
 */
export const loadIndex = () => loadJson('data/index.json')

/**
 * 加载指定分类的歌曲
 * @param {string} category - 分类标识，如 'pop', 'guofeng', 'xuwei'
 */
export const loadSongsByCategory = (category) => {
  return loadJson(`data/songs/${category}.json`)
}

/**
 * 加载全部歌曲（用于搜索功能）
 */
export const loadAllSongs = () => loadJson('data/songs/all.json')

/**
 * 加载专辑列表
 */
export const loadAlbums = () => loadJson('data/albums.json')

/**
 * 加载歌单列表
 */
export const loadPlaylists = () => loadJson('data/playlists.json')

/**
 * 加载歌词
 */
export const loadLyrics = () => loadJson('data/lyrics.json')

/**
 * 预加载指定分类（后台静默加载）
 */
export const preloadCategory = (category) => {
  loadSongsByCategory(category).catch(() => {})
}

/**
 * 清除缓存
 */
export const clearCache = () => {
  cache.clear()
  loadingPromises.clear()
}

/**
 * 检查分类是否已加载
 */
export const isCategoryLoaded = (category) => {
  return cache.has(`data/songs/${category}.json`)
}
