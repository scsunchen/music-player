/**
 * 歌曲数据分片加载器
 * 
 * 按需加载歌曲数据，支持：
 * - 索引优先加载（快速显示页面框架）
 * - 分类按需加载（点击分类时加载对应数据）
 * - 歌词按需加载（播放歌曲时才加载对应歌词）
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
 * 加载全部歌曲（仅歌曲数据，不含专辑和歌单）
 */
export const loadAllSongs = () => loadJson('data/songs.json')

/**
 * 加载指定分类的歌曲
 * @param {string} category - 分类标识，如 'pop', 'guofeng', 'xuwei'
 */
export const loadSongsByCategory = (category) => {
  return loadJson(`data/songs/${category}.json`)
}

/**
 * 加载专辑列表
 */
export const loadAlbums = () => loadJson('data/albums.json')

/**
 * 加载推荐歌单列表
 */
export const loadRecommendPlaylists = () => loadJson('data/recommendPlaylists.json')

/**
 * 加载自定义歌单列表
 */
export const loadPlaylists = () => loadJson('data/playlists.json')

/**
 * 加载歌词索引（轻量级，仅包含有歌词的歌曲ID列表）
 * 用于快速判断某首歌是否有歌词（[词]标签显示）
 */
export const loadLyricsIndex = () => loadJson('data/lyrics-index.json')

/**
 * 按需加载单首歌曲的歌词
 * @param {number} songId - 歌曲ID
 * @returns {Promise<{lyrics: string}|null>}
 */
export const loadLyrics = (songId) => {
  if (!songId) return Promise.resolve(null)
  return loadJson(`data/lyrics/${songId}.json`)
}

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
