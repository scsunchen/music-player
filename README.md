# 🎵 一起听 · 听见时光

一个基于 Vue 3 + Vite 的现代化音乐播放器，采用纯静态部署，无需后端服务器。

![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 功能特性

### 🎵 核心播放功能
- **歌曲播放** — 支持播放、暂停、上一首、下一首
- **播放模式** — 列表循环、单曲循环（仅自动播放时循环）、随机播放
- **进度控制** — 可拖拽进度条，显示当前时间/总时长
- **音量调节** — 滑块调节音量大小（默认50%，范围限制0-1）
- **锁屏控制** — Media Session API 支持锁屏显示歌曲信息和控制按钮
- **播放队列** — 显示当前播放列表和手动添加的插队队列

### 📚 音乐管理
- **歌曲库** — 90+ 首精选歌曲（国风、许巍专辑、凤凰传奇等）
- **专辑管理** — 16+ 个专辑分类
- **歌单推荐** — 华语经典、流行热歌、治愈系、国风歌曲等
- **歌曲详情页** — 虚化封面背景、歌词滚动、歌曲简介

### ❤️ 个人收藏
- **我喜欢** — 收藏喜欢的歌曲，数据保存在本地
- **最近播放** — 自动记录播放历史（最近 50 首）
- **自定义歌单** — 创建和管理个人歌单
- **快速收藏** — 底部播放器和全屏播放器一键喜欢

### 🎨 视觉效果
- **封面取色动态主题** — 从封面提取主色调，动态改变播放器颜色
- **黑胶唱片旋转** — 播放时封面变为旋转的黑胶唱片
- **骨架屏加载** — 页面加载时显示优雅的骨架屏
- **页面切换动画** — 路由切换时的淡入淡出效果
- **浮动音符动画** — 播放时的音符飘动效果
- **真实音频频谱** — Canvas + Web Audio API 频谱可视化
- **缓冲进度显示** — 进度条显示音频缓冲进度

### 📱 全屏播放页
- **大封面展示** — 沉浸式播放体验
- **歌词滚动** — 实时高亮当前歌词
- **手势支持** — 下滑关闭全屏
- **左右布局** — 电脑端封面与歌词并排显示
- **快速喜欢** — 一键收藏当前歌曲

### 💝 节日专题
- **520 爱情专题** — 浪漫渐变背景、浮动爱心、阳光光晕、甜蜜歌单

### 📱 PWA 支持
- **安装到桌面** — 支持添加到主屏幕
- **离线缓存** — Service Worker 缓存静态资源
- **响应式设计** — 完美适配手机端和电脑端

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| Vue 3 | 渐进式 JavaScript 框架 |
| Vite 5 | 下一代前端构建工具 |
| Pinia | Vue 状态管理 |
| Vue Router | 路由管理 |
| CSS3 | 动画、渐变、毛玻璃效果 |
| Service Worker | PWA 离线缓存 |
| Media Session API | 锁屏播放控制 |
| Web Audio API | 音频分析和可视化 |

## ⚡ 性能优化

- **图片压缩** — 封面图片从 95MB 压缩到 14MB（85% 节省）
- **localStorage 异步化** — requestIdleCallback 避免阻塞主线程
- **缓存优先策略** — Service Worker 缓存优先，减少网络请求
- **图片懒加载** — 列表图片按需加载
- **歌曲缓存** — 每日推荐歌曲结果缓存，避免重复计算
- **运行时数据加载** — 歌曲和歌词数据运行时 fetch 加载，不打包进 JS

## 📁 项目结构

```
music-player/
├── public/
│   ├── audio/              # 音频文件（UUID命名）
│   ├── images/
│   │   └── covers/         # 封面图片（已压缩）
│   ├── data/
│   │   ├── songs.json     # 歌曲数据（运行时加载）
│   │   └── lyrics.json    # 歌词数据（运行时加载）
│   ├── pwa-icons/          # PWA 图标
│   ├── manifest.json       # PWA 配置
│   └── sw.js               # Service Worker（缓存优先）
├── src/
│   ├── components/         # 组件
│   │   ├── MusicPlayer.vue       # 底部播放器
│   │   ├── FullscreenPlayer.vue  # 全屏播放页
│   │   ├── MusicVisualizer.vue   # 真实音频频谱
│   │   ├── FloatingNotes.vue     # 浮动音符
│   │   ├── PlayQueue.vue         # 播放队列面板
│   │   ├── SongItem.vue          # 歌曲列表项
│   │   ├── ShareModal.vue        # 分享弹窗
│   │   ├── LyricsEditor.vue      # 歌词编辑器
│   │   └── SkeletonLoader.vue    # 骨架屏
│   ├── views/              # 页面
│   │   ├── Home.vue          # 首页
│   │   ├── Search.vue        # 搜索页
│   │   ├── SongDetail.vue    # 歌曲详情
│   │   ├── AlbumDetail.vue   # 专辑详情
│   │   ├── PlaylistDetail.vue # 歌单详情
│   │   ├── LikedSongs.vue    # 我喜欢
│   │   ├── Love520.vue       # 520专题
│   │   ├── MyMusic.vue       # 我的音乐
│   │   └── Stats.vue         # 播放统计
│   ├── stores/
│   │   └── player.js       # 播放器状态（含运行时数据加载）
│   ├── utils/
│   │   └── baseUrl.js       # 全局路径工具（支持自定义部署路径）
│   ├── router/             # 路由配置
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── deploy-dist.sh          # Bash 部署脚本
├── deploy-dist.ps1         # PowerShell 部署脚本
├── index.html
├── vite.config.js
└── package.json
```

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### HTTPS 开发模式
```bash
# Linux / Mac
HTTPS=true npm run dev

# Windows PowerShell
$env:HTTPS="true"; npm run dev

# Windows CMD
set HTTPS=true && npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 📦 部署

项目采用纯静态部署，可部署到：

- **GitHub Pages** — 免费，推荐
- **Vercel** — 自动部署
- **Netlify** — 自动部署
- **任何静态服务器**

### 自定义部署路径

修改 `vite.config.js` 中的 `BASE_URL`：

```javascript
const BASE_URL = process.env.BASE_URL || '/music-player/'
```

```bash
# 根目录部署
BASE_URL=/ npm run build

# 子目录部署
npm run build

# 任意路径
BASE_URL=/app/player/ npm run build
```

所有资源路径（JS、CSS、图片、音频、歌词）会自动适配，无需手动修改。

### 构建并推送到指定分支

```bash
# Bash（Linux / Mac）
./deploy-dist.sh [分支名] [BASE_URL]

# 示例：推送到 dist 分支
./deploy-dist.sh dist /music-player/

# 示例：根目录部署推送到 gh-pages
./deploy-dist.sh gh-pages /

# PowerShell（Windows）
.\deploy-dist.ps1 [分支名] [BASE_URL]
```

### GitHub Pages 部署

1. 修改 `vite.config.js` 中的 `BASE_URL`
2. 构建项目：`npm run build`
3. 部署 `dist` 目录

## 🎨 页面截图

### 首页
- 每日10首 / 我喜欢 / 520专题 入口卡片
- 推荐歌单网格
- 最新歌曲 & 热门歌曲 双列布局
- 新专辑展示

### 播放器
- 黑胶唱片旋转效果
- 封面取色动态主题
- 真实音频频谱可视化
- 进度条 & 控制按钮（含喜欢按钮）
- 浮动音符动画

### 全屏播放页
- 大封面展示
- 实时歌词滚动
- 手势下滑关闭
- 电脑端左右布局
- 一键喜欢收藏

### 播放队列
- 当前播放列表（高亮当前歌曲）
- 插队队列（可拖拽排序）
- 点击切歌

### 歌曲详情
- 虚化封面背景
- 歌词滚动高亮
- 歌曲简介
- 相关歌曲推荐

### 520 专题
- 浪漫渐变背景
- 浮动爱心动画
- 阳光光晕效果
- 甜蜜歌单

## 📝 数据存储

所有数据存储在浏览器 localStorage（异步写入，不阻塞主线程）：

| 数据 | 存储键 | 说明 |
|------|--------|------|
| 我喜欢 | `likedSongs` | 收藏的歌曲 ID 列表 |
| 最近播放 | `recentSongs` | 最近播放的歌曲 ID |
| 自定义歌单 | `customPlaylists` | 用户创建的歌单 |
| 播放统计 | `playStats` | 播放次数、时长统计 |
| 会话状态 | `playerSession` | 当前播放进度、音量等 |
| 播放队列 | `playQueue` | 手动添加的队列 |

## 🔧 配置说明

### 添加新歌曲

歌曲和歌词数据已改为**运行时加载**，更新数据**无需重新打包**：

1. 将音频文件放入 `public/audio/`（建议使用 UUID 命名避免特殊字符）
2. 编辑 `public/data/songs.json` 添加歌曲信息
3. 编辑 `public/data/lyrics.json` 添加歌词（可选）
4. 封面图片添加到 `public/images/covers/`
5. **直接替换服务器上的 `dist/data/` 目录即可，刷新页面生效**

### 歌曲数据格式

```json
{
  "id": 152,
  "title": "蓝莲花",
  "artist": "许巍",
  "album": "许巍",
  "albumId": 16,
  "duration": 240,
  "cover": "/music-player/images/covers/22b8989e42a5_cover.jpg",
  "audioUrl": "/music-player/audio/22b8989e42a5.mp3"
}
```

> `audioUrl` 支持多种格式：
> - 相对路径：`/music-player/audio/song.mp3`（自动适配部署路径）
> - HTTP/HTTPS：`https://cdn.example.com/song.mp3`
> - Blob URL：`blob:https://example.com/xxx`

### 歌词格式

```json
{
  "152": {
    "lyrics": "[00:00.00] 蓝莲花 - 许巍\n[00:10.50] 没有什么能够阻挡\n[00:20.30] 你对自由的向往"
  }
}
```

## 🎯 未来计划

- [x] 播放队列管理
- [x] 快速喜欢功能
- [x] 真实音频频谱
- [x] 缓冲进度显示
- [x] 歌词编辑器
- [x] 自定义部署路径
- [x] 运行时数据加载（无需打包即可更新歌曲）
- [x] HTTPS 开发模式
- [x] 单曲循环仅自动播放时生效
- [ ] 键盘快捷键支持
- [ ] 定时关闭功能
- [ ] 歌手页面
- [ ] 更多节日专题

## 📄 开源协议

[MIT License](LICENSE)

## 🙏 致谢

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/)

---

**一起听 · 听见时光** — 让音乐陪伴每一刻 💕
