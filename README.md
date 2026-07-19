# 🎵 一起听 · 听见时光

一个基于 Vue 3 + Vite 的现代化音乐播放器，采用纯静态部署，无需后端服务器。全站沉浸氛围风设计，动态色系随播放封面实时变化。

![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 功能特性

### 🎵 核心播放功能
- **歌曲播放** — 播放、暂停、上一首、下一首
- **播放模式** — 列表循环、单曲循环（仅自动播放时循环）、随机播放
- **进度控制** — 可拖拽进度条，显示当前时间/总时长
- **音量调节** — 滑块调节音量（默认 50%，范围 0-1）
- **锁屏控制** — Media Session API 支持锁屏显示歌曲信息和控制按钮
- **播放队列** — 当前播放列表和手动添加的插队队列

### 📚 音乐管理
- **歌曲库** — 90+ 首精选歌曲（国风、许巍、凤凰传奇等）
- **专辑管理** — 16+ 个专辑分类
- **歌单推荐** — 华语经典、流行热歌、治愈系、国风歌曲等
- **歌曲详情页** — 封面模糊背景、歌词当前行高亮、歌曲信息、相关歌曲
- **本地歌单导入** — 支持 JSON 格式歌单导入（含 Excel 模板），数据存储在 localStorage

### ❤️ 个人收藏
- **我喜欢** — 收藏喜欢的歌曲，数据保存在本地
- **最近播放** — 自动记录播放历史（最近 50 首）
- **自定义歌单** — 创建、删除、导入个人歌单
- **快速收藏** — 底部播放器和全屏播放器一键喜欢

### 🎨 沉浸氛围风（方案 D）
- **动态色系** — 从封面提取主色调，全站颜色实时同步变化（导航栏、按钮、背景光球）
- **毛玻璃效果** — 核心卡片采用 `backdrop-filter: blur(24px)` 毛玻璃设计
- **氛围光球** — `box-shadow` 实现的轻量浮动光球，GPU 友好
- **统一歌曲列表交互** — 封面点击播放，标题/歌手点击跳转详情页

### 📱 全屏播放页
- **沉浸式体验** — 封面模糊背景 + 光球 + 粒子动画
- **歌词显示** — 当前行高亮，RAF 缓动滚动（无卡顿）
- **手势支持** — 下滑关闭全屏
- **左右布局** — 电脑端封面与歌词并排显示，固定宽度防偏移
- **性能优化** — `box-shadow` 替代 `filter:blur`、`transform:scale` 替代 `font-size` 变化、`computed` 预计算 active 行

### 🎭 季节/节日动态主题
- **6 个主题** — 夏(橘子日落)、秋(枫叶信笺)、冬(雪落星光)、春(樱花物语)、情人节(玫瑰红)、中秋节(金秋明月)
- **自动切换** — `getActiveTheme()` 根据当前日期自动匹配，节日优先、季节兜底
- **配置驱动** — 新增主题只需添加配置对象，无需新建页面
- **粒子效果** — 6 种动画类型：浮动、闪烁、爱心、飘雪、樱花、灯笼

### 🏠 多首页方案
- **方案 D**（默认 `/`）— 沉浸氛围风，Hero 大图 + 快捷入口 + 推荐歌单 + 新专辑 + 热门歌曲
- **方案 A**（`/home-v2`）— 杂志编辑风格，亮色主题
- **方案 C**（`/home-dashboard`）— Bento Grid 仪表盘，深色主题
- **旧版**（`/home-old`）— 原始卡片布局（保留对比）

### 📱 PWA 支持
- **安装到桌面** — 支持添加到主屏幕
- **离线缓存** — Service Worker 缓存静态资源
- **响应式设计** — 完美适配手机端和电脑端

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| Vue 3 | 渐进式 JavaScript 框架（Composition API） |
| Vite 5 | 下一代前端构建工具 |
| Pinia | Vue 状态管理 |
| Vue Router | 路由管理（Hash 模式，支持 View Transitions） |
| CSS3 | 动画、渐变、毛玻璃、CSS 变量动态色系 |
| Service Worker | PWA 离线缓存 |
| Media Session API | 锁屏播放控制 |
| Web Audio API | 音频分析和频谱可视化 |
| Canvas | 粒子动画、频谱渲染 |

## ⚡ 性能优化

- **图片压缩** — 封面图片从 95MB 压缩到 14MB（85% 节省）
- **localStorage 异步化** — requestIdleCallback 避免阻塞主线程
- **缓存优先策略** — Service Worker 缓存优先，减少网络请求
- **图片懒加载** — 列表图片按需加载
- **box-shadow 替代 filter:blur** — 4 个光球从 `filter:blur()` 改为 `box-shadow`，消除 GPU 高开销
- **transform 替代 font-size** — 歌词 active 行放大从 `font-size` 变化（布局回流）改为 `transform:scale`（GPU 合成层）
- **RAF 缓动滚动** — 歌词滚动从 `scrollTo smooth` 改为 `requestAnimationFrame` 指数缓动插值
- **computed 预计算** — active 行判定从每行调用 `isCurrentLine()` 改为单次 `computed`
- **粒子数量优化** — 桌面端从 60 降至 35，移动端从 30 降至 20
- **运行时数据加载** — 歌曲和歌词数据运行时 fetch 加载，不打包进 JS

## 📁 项目结构

```
music-player/
├── public/
│   ├── audio/              # 音频文件（UUID命名）
│   ├── images/
│   │   └── covers/         # 封面图片（已压缩，含默认歌单封面）
│   ├── data/
│   │   ├── songs.json     # 歌曲数据（运行时加载）
│   │   ├── lyrics.json    # 歌词数据（运行时加载）
│   │   └── songs/         # 分类歌单 JSON（国风/流行/许巍等）
│   ├── pwa-icons/          # PWA 图标
│   ├── manifest.json       # PWA 配置
│   └── sw.js               # Service Worker（缓存优先）
├── scripts/
│   ├── batch_import.py     # Excel 批量导入歌曲脚本
│   └── templates/          # 导入模板（music_data_template.xlsx / demo_playlist.json）
├── src/
│   ├── config/
│   │   └── seasonalThemes.js   # 季节/节日主题配置引擎
│   ├── components/
│   │   ├── MusicPlayer.vue       # 底部播放器
│   │   ├── FullscreenPlayer.vue  # 全屏播放页（沉浸氛围风）
│   │   ├── MusicVisualizer.vue   # 真实音频频谱
│   │   ├── FloatingNotes.vue     # 浮动音符
│   │   ├── PlayQueue.vue         # 播放队列面板
│   │   ├── SongItem.vue          # 歌曲列表项（旧版，功能页保留使用）
│   │   ├── PlaylistCard.vue      # 歌单/专辑卡片（旧版，功能页保留使用）
│   │   ├── ShareModal.vue        # 分享弹窗
│   │   ├── MVPlayer.vue          # MV 播放器
│   │   └── SkeletonLoader.vue    # 骨架屏
│   ├── views/
│   │   ├── Home.vue              # 首页（方案 D 沉浸氛围风）
│   │   ├── HomeV2.vue            # 首页方案 A（杂志编辑风）
│   │   ├── HomeDashboard.vue     # 首页方案 C（Bento Grid）
│   │   ├── HomeOld.vue           # 旧版首页（保留对比）
│   │   ├── Search.vue            # 搜索页
│   │   ├── SongDetail.vue        # 歌曲详情
│   │   ├── AlbumDetail.vue       # 专辑详情
│   │   ├── PlaylistDetail.vue    # 歌单详情
│   │   ├── HotSongs.vue          # 热门歌曲
│   │   ├── AllSongs.vue          # 全部歌曲
│   │   ├── AllPlaylists.vue      # 推荐歌单
│   │   ├── AllAlbums.vue         # 全部专辑
│   │   ├── LikedSongs.vue        # 我喜欢
│   │   ├── MyMusic.vue           # 我的音乐（含歌单导入）
│   │   ├── Stats.vue             # 播放统计
│   │   ├── SeasonalPage.vue      # 季节/节日动态主题页
│   │   ├── SummerOrange.vue      # （已下线，保留备用）
│   │   └── Love520.vue           # （已下线，保留备用）
│   ├── stores/
│   │   └── player.js             # 播放器状态管理（含运行时数据加载、导入歌单）
│   ├── utils/
│   │   └── baseUrl.js             # 全局路径工具（支持自定义部署路径）
│   ├── router/
│   │   └── index.js              # 路由配置（含 View Transitions 动画）
│   ├── App.vue                   # 根组件（沉浸氛围风导航栏）
│   └── main.js                   # 入口文件
├── deploy-dist.sh                # Bash 部署脚本
├── deploy-dist.ps1               # PowerShell 部署脚本
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

项目采用纯静态部署，可部署到 GitHub Pages、Vercel、Netlify 或任何静态服务器。

### 自定义部署路径

修改 `vite.config.js` 中的 `BASE_URL`：

```javascript
const BASE_URL = process.env.BASE_URL || '/music-player/'
```

```bash
BASE_URL=/ npm run build          # 根目录部署
npm run build                      # 子目录部署
BASE_URL=/app/player/ npm run build  # 任意路径
```

### 构建并推送

```bash
# Bash
./deploy-dist.sh [分支名] [BASE_URL]
./deploy-dist.sh dist /music-player/

# PowerShell
.\deploy-dist.ps1 [分支名] [BASE_URL]
```

## 🗺️ 路由说明

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | Home.vue | 首页（方案 D 沉浸氛围风） |
| `/search` | Search.vue | 搜索页 |
| `/my` | MyMusic.vue | 我的音乐（歌单管理 + 导入） |
| `/stats` | Stats.vue | 播放统计 |
| `/season` | SeasonalPage.vue | 季节/节日动态主题（自动匹配） |
| `/song/:id` | SongDetail.vue | 歌曲详情 |
| `/album/:id` | AlbumDetail.vue | 专辑详情 |
| `/playlist/:id` | PlaylistDetail.vue | 歌单详情 |
| `/liked` | LikedSongs.vue | 我喜欢的歌曲 |
| `/songs` | AllSongs.vue | 全部歌曲 |
| `/hot` | HotSongs.vue | 热门歌曲 |
| `/playlists` | AllPlaylists.vue | 推荐歌单 |
| `/albums` | AllAlbums.vue | 全部专辑 |
| `/home-v2` | HomeV2.vue | 首页方案 A（杂志编辑风） |
| `/home-dashboard` | HomeDashboard.vue | 首页方案 C（Bento Grid） |
| `/home-old` | HomeOld.vue | 旧版首页 |

## 🎨 设计规范

### 动态色系
全站使用 `playerStore.themeColor` 驱动的 CSS 变量 `--dynamic-r/g/b`，实现封面取色全站同步：
- 导航栏 Logo / Active Tab 高亮色
- 各页面返回按钮 hover、label 标签色
- 播放按钮、标签 badge（词/MV）颜色
- 氛围光球 `box-shadow` 颜色

### 歌曲列表交互规则
- **封面点击** → 播放歌曲
- **标题/歌手点击** → 跳转 `/song/:id` 详情页
- **收藏按钮** → 切换喜欢状态
- 列表项不设置整体 `@click`，避免事件冒泡冲突

### 性能约束
- 氛围效果优先使用 `box-shadow` 而非 `filter: blur()`
- 动画优先使用 `transform` / `opacity`，避免触发布局回流
- 歌词滚动使用 RAF 手动插值，不依赖 `scrollTo smooth`

## 📝 数据存储

所有数据存储在浏览器 localStorage（异步写入，不阻塞主线程）：

| 数据 | 存储键 | 说明 |
|------|--------|------|
| 我喜欢 | `likedSongs` | 收藏的歌曲 ID 列表 |
| 最近播放 | `recentSongs` | 最近播放的歌曲 ID |
| 自定义歌单 | `customPlaylists` | 用户创建/导入的歌单 |
| 播放统计 | `playStats` | 播放次数、时长统计 |
| 会话状态 | `playerSession` | 当前播放进度、音量等 |
| 播放队列 | `playQueue` | 手动添加的队列 |

## 🔧 配置说明

### 添加新歌曲

歌曲和歌词数据已改为**运行时加载**，更新数据**无需重新打包**：

1. 将音频文件放入 `public/audio/`（建议 UUID 命名）
2. 编辑 `public/data/songs.json` 添加歌曲信息
3. 编辑 `public/data/lyrics.json` 添加歌词（可选）
4. 封面图片添加到 `public/images/covers/`
5. 直接替换服务器上的 `dist/data/` 目录，刷新页面生效

### 导入歌单

1. 下载模板：`scripts/templates/music_data_template.xlsx`
2. 参考示例：`scripts/templates/demo_playlist.json`
3. 在"我的音乐"页面点击"导入歌单"，选择 JSON 文件

### 新增季节/节日主题

编辑 `src/config/seasonalThemes.js`，在 `themeConfigs` 数组中添加配置对象即可：

```js
{
  id: 'christmas',
  name: '圣诞欢歌',
  badge: '圣诞限定',
  dateRange: { type: 'exact', start: { month: 12, day: 25 }, end: { month: 12, day: 25 } },
  // ... 完整配置见文件内注释
}
```

## 🎯 未来计划

- [x] 播放队列管理
- [x] 真实音频频谱
- [x] 缓冲进度显示
- [x] 运行时数据加载
- [x] 沉浸氛围风全站适配
- [x] 动态色系全站同步
- [x] 全屏播放器性能优化
- [x] 季节/节日动态主题引擎
- [x] 本地歌单导入
- [ ] 键盘快捷键支持
- [ ] 定时关闭功能
- [ ] 歌手页面
- [ ] 黑暗/明亮主题切换

## 📄 开源协议

[MIT License](LICENSE)

---

**一起听 · 听见时光** — 让音乐陪伴每一刻
