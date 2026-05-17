# 🎵 一起听 · 听见时光

一个基于 Vue 3 + Vite 的现代化音乐播放器，采用纯静态部署，无需后端服务器。

![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 功能特性

### 🎵 核心播放功能
- **歌曲播放** — 支持播放、暂停、上一首、下一首
- **播放模式** — 列表循环、单曲循环、随机播放
- **进度控制** — 可拖拽进度条，显示当前时间/总时长
- **音量调节** — 滑块调节音量大小

### 📚 音乐管理
- **歌曲库** — 14+ 首精选歌曲
- **专辑管理** — 13 个专辑分类
- **歌单推荐** — 华语经典、流行热歌、治愈系、周杰伦精选
- **歌曲详情页** — 虚化封面背景、歌词滚动、歌曲简介

### ❤️ 个人收藏
- **我喜欢** — 收藏喜欢的歌曲，数据保存在本地
- **最近播放** — 自动记录播放历史（最近 50 首）
- **自定义歌单** — 创建和管理个人歌单

### 🎨 视觉效果
- **封面取色动态主题** — 从封面提取主色调，动态改变播放器颜色
- **黑胶唱片旋转** — 播放时封面变为旋转的黑胶唱片
- **骨架屏加载** — 页面加载时显示优雅的骨架屏
- **页面切换动画** — 路由切换时的淡入淡出效果
- **浮动音符动画** — 播放时的音符飘动效果
- **音频可视化** — 跳动的音柱效果

### 💝 节日专题
- **520 爱情专题** — 浪漫渐变背景、浮动爱心、阳光光晕、甜蜜歌单

### 📱 响应式设计
- 完美适配手机端和电脑端
- 手机端两行布局，电脑端多列布局

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| Vue 3 | 渐进式 JavaScript 框架 |
| Vite | 下一代前端构建工具 |
| Pinia | Vue 状态管理 |
| Vue Router | 路由管理 |
| CSS3 | 动画、渐变、毛玻璃效果 |

## 📁 项目结构

```
music-player/
├── public/
│   ├── audio/          # 音频文件
│   └── images/         # 图片资源
├── src/
│   ├── components/     # 组件
│   │   ├── MusicPlayer.vue      # 底部播放器
│   │   ├── MusicVisualizer.vue  # 音频可视化
│   │   ├── FloatingNotes.vue    # 浮动音符
│   │   ├── SongItem.vue         # 歌曲列表项
│   │   ├── PlaylistCard.vue     # 歌单卡片
│   │   └── SkeletonLoader.vue   # 骨架屏
│   ├── views/          # 页面
│   │   ├── Home.vue          # 首页
│   │   ├── Search.vue        # 搜索页
│   │   ├── SongDetail.vue    # 歌曲详情
│   │   ├── AlbumDetail.vue   # 专辑详情
│   │   ├── LikedSongs.vue    # 我喜欢
│   │   ├── Love520.vue       # 520专题
│   │   └── MyMusic.vue       # 我的音乐
│   ├── stores/         # 状态管理
│   │   └── player.js   # 播放器状态
│   ├── data/           # 静态数据
│   │   ├── songs.json  # 歌曲数据
│   │   └── lyrics.json # 歌词数据
│   ├── router/         # 路由配置
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
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

### GitHub Pages 部署

1. 修改 `vite.config.js` 中的 `base` 为你的仓库名
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
- 进度条 & 控制按钮
- 浮动音符动画

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

所有数据存储在浏览器 localStorage：

| 数据 | 存储键 | 说明 |
|------|--------|------|
| 我喜欢 | `likedSongs` | 收藏的歌曲 ID 列表 |
| 最近播放 | `recentSongs` | 最近播放的歌曲 ID |
| 自定义歌单 | `customPlaylists` | 用户创建的歌单 |

## 🔧 配置说明

### 添加新歌曲

1. 将音频文件放入 `public/audio/`
2. 在 `src/data/songs.json` 中添加歌曲信息
3. 在 `src/data/lyrics.json` 中添加歌词（可选）

### 歌曲数据格式

```json
{
  "id": 15,
  "title": "歌曲名",
  "artist": "歌手",
  "album": "专辑名",
  "albumId": 14,
  "duration": 240,
  "cover": "/music-player/images/封面.jpg",
  "audioUrl": "/music-player/audio/歌曲.mp3",
  "genre": "流行"
}
```

### 歌词格式

```json
{
  "15": {
    "lyrics": "[00:00.00] 歌曲名 - 歌手\n[00:10.50] 第一句歌词\n[00:20.30] 第二句歌词"
  }
}
```

## 🎯 未来计划

- [ ] 键盘快捷键支持
- [ ] 播放队列管理
- [ ] 定时关闭功能
- [ ] Media Session API（锁屏控制）
- [ ] 歌手页面
- [ ] 更多节日专题
- [ ] PWA 离线支持

## 📄 开源协议

[MIT License](LICENSE)

## 🙏 致谢

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/)

---

**一起听 · 听见时光** — 让音乐陪伴每一刻 💕
