/**
 * 歌曲数据拆分脚本
 * 
 * 将大的 songs.json 拆分成多个分类文件
 * 用法: node scripts/split-songs.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const INPUT_FILE = path.join(__dirname, '../public/data/songs.json')
const OUTPUT_DIR = path.join(__dirname, '../public/data/songs')

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

// 读取原始数据
const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'))

// 分类规则（根据 albumId 或 genre 分组）
const categoryRules = [
  { id: 'guofeng', name: '国风歌曲', match: (song) => song.genre === '国风' || song.album?.includes('国风') || song.album?.includes('剑网三') || song.album?.includes('魔道') },
  { id: 'xuwei', name: '许巍专辑', match: (song) => song.artist === '许巍' || song.album === '许巍' },
  { id: 'fhcq', name: '凤凰传奇', match: (song) => song.artist === '凤凰传奇' },
  { id: 'pop', name: '流行热歌', match: (song) => song.genre === 'pop' || !song.genre },
]

// 按分类分组
const categories = {}
categoryRules.forEach(rule => {
  categories[rule.id] = {
    category: rule.id,
    name: rule.name,
    songs: []
  }
})

// 分配歌曲到分类
data.songs.forEach(song => {
  let assigned = false
  for (const rule of categoryRules) {
    if (rule.match(song)) {
      categories[rule.id].songs.push(song)
      assigned = true
      break
    }
  }
  // 未匹配的分类到 "other"
  if (!assigned) {
    if (!categories.other) {
      categories.other = { category: 'other', name: '其他', songs: [] }
    }
    categories.other.songs.push(song)
  }
})

// 生成索引文件
const index = {
  categories: Object.values(categories).map(c => ({
    id: c.category,
    name: c.name,
    count: c.songs.length
  })),
  albums: data.albums?.map(a => ({
    id: a.id,
    name: a.name,
    artist: a.artist,
    cover: a.cover,
    songCount: a.songs?.length || 0
  })) || [],
  playlists: data.recommendPlaylists?.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    cover: p.cover,
    songCount: p.songs?.length || 0
  })) || [],
  totalSongs: data.songs.length
}

// 写入索引文件
fs.writeFileSync(
  path.join(__dirname, '../public/data/index.json'),
  JSON.stringify(index, null, 2)
)

// 写入分类文件
Object.values(categories).forEach(cat => {
  const output = {
    category: cat.category,
    songs: cat.songs
  }
  fs.writeFileSync(
    path.join(OUTPUT_DIR, `${cat.category}.json`),
    JSON.stringify(output, null, 2)
  )
})

// 写入全部歌曲（用于搜索）
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'all.json'),
  JSON.stringify({ category: 'all', songs: data.songs }, null, 2)
)

// 写入专辑和歌单
fs.writeFileSync(
  path.join(__dirname, '../public/data/albums.json'),
  JSON.stringify({ albums: data.albums || [] }, null, 2)
)
fs.writeFileSync(
  path.join(__dirname, '../public/data/playlists.json'),
  JSON.stringify({ playlists: data.recommendPlaylists || [] }, null, 2)
)

console.log('✅ 拆分完成！')
console.log(`📁 输出目录: ${OUTPUT_DIR}`)
console.log(`📊 分类统计:`)
Object.values(categories).forEach(cat => {
  console.log(`  - ${cat.name} (${cat.category}.json): ${cat.songs.length} 首`)
})
console.log(`  - all.json: ${data.songs.length} 首（搜索用）`)
