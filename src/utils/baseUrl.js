/**
 * 全局基础路径配置
 * 
 * 所有资源路径都应通过此模块获取，确保部署路径可配置
 * 
 * 使用方式：
 *   import { baseUrl, resolveUrl } from '../utils/baseUrl'
 *   const img = resolveUrl('images/cover.jpg')
 */

// 从 Vite 注入的环境变量获取 base 路径
// import.meta.env.BASE_URL 由 vite.config.js 中的 base 配置自动注入
export const baseUrl = import.meta.env.BASE_URL || '/'

/**
 * 拼接完整 URL
 * @param {string} path - 相对路径，如 'images/cover.jpg'
 * @returns {string} 完整路径，如 '/music-player/images/cover.jpg'
 */
export const resolveUrl = (path) => {
  if (!path) return ''
  // 已经是完整 URL（http/https/data/blob）则直接返回
  if (/^(https?:|data:|blob:|\/\/)/.test(path)) return path
  // 已经以 baseUrl 开头则直接返回
  if (path.startsWith(baseUrl)) return path
  // 拼接路径，确保不重复斜杠
  const base = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'
  const relativePath = path.startsWith('/') ? path.slice(1) : path
  return base + relativePath
}
