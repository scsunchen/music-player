<template>
  <div class="app">
    <!-- 顶部导航 -->
    <header class="header" :style="headerStyle">
      <router-link to="/" class="logo">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        <div class="brand">
          <span class="brand-name">一起听</span>
          <span class="brand-tagline">听见时光</span>
        </div>
      </router-link>
      <div class="header-right">
        <nav class="nav">
          <router-link to="/" class="nav-link" active-class="active">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span>首页</span>
          </router-link>
          <router-link to="/search" class="nav-link" active-class="active">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <span>搜索</span>
          </router-link>
          <router-link to="/my" class="nav-link" active-class="active">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span>我的</span>
          </router-link>
          <router-link to="/stats" class="nav-link" active-class="active">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
            <span>统计</span>
          </router-link>
          <router-link to="/season" class="nav-link nav-link-season" active-class="active">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            <span>季节</span>
          </router-link>
        </nav>
        <!-- 版本号按钮 -->
        <button class="version-btn" @click="showChangelog = true">
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
          </svg>
          <span class="version-text">v{{ currentVersion }}</span>
          <span class="version-dot"></span>
        </button>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main">
      <router-view v-slot="{ Component }">
        <transition name="fade-slide">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部播放器 -->
    <MusicPlayer v-show="!showFullscreen" @open-fullscreen="showFullscreen = true" />

    <!-- 全屏播放页 -->
    <FullscreenPlayer :visible="showFullscreen" @close="showFullscreen = false" />
    
    <!-- 播放队列面板 -->
    <PlayQueue />

    <!-- 桌面歌词 -->
    <DesktopLyrics />

    <!-- 全局 Toast 提示 -->
    <transition name="toast">
      <div v-if="playerStore.toastMessage" class="toast" :style="toastStyle">
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        <span>{{ playerStore.toastMessage }}</span>
      </div>
    </transition>

    <!-- 飞入动画：封面从点击位置飞到右下角队列按钮 -->
    <Teleport to="body">
      <div
        v-if="flyShow"
        class="fly-cover"
        :style="flyStyle"
      >
        <img :src="flyCover" alt="" />
      </div>
    </Teleport>

    <!-- 版本更新日志弹窗 -->
    <ChangelogModal :visible="showChangelog" @close="showChangelog = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from './stores/player'
import MusicPlayer from './components/MusicPlayer.vue'
import FullscreenPlayer from './components/FullscreenPlayer.vue'
import PlayQueue from './components/PlayQueue.vue'
import DesktopLyrics from './components/DesktopLyrics.vue'
import ChangelogModal from './components/ChangelogModal.vue'
import { currentVersion } from './config/changelog'

const router = useRouter()
const playerStore = usePlayerStore()
const showFullscreen = ref(false)
const showChangelog = ref(false)

// 飞入动画状态
const flyShow = ref(false)
const flyCover = ref('')
const flyStyle = ref({})

// 监听 store 的飞入动画触发
watch(() => playerStore.flyAnimation, (fly) => {
  if (!fly) return
  const { song, fromX, fromY } = fly

  // 获取右下角队列按钮位置作为目标点
  const queueBtn = document.querySelector('.btn-queue')
  let toX = window.innerWidth - 30
  let toY = window.innerHeight - 80
  if (queueBtn) {
    const rect = queueBtn.getBoundingClientRect()
    toX = rect.left + rect.width / 2
    toY = rect.top + rect.height / 2
  }

  flyCover.value = song.cover
  flyShow.value = true
  // 起始位置
  flyStyle.value = {
    left: fromX + 'px',
    top: fromY + 'px',
    transform: 'translate(-50%, -50%) scale(1)',
    opacity: '1',
    transition: 'none',
  }

  // 下一帧启动飞行动画
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      flyStyle.value = {
        left: toX + 'px',
        top: toY + 'px',
        transform: 'translate(-50%, -50%) scale(0.2)',
        opacity: '0',
        transition: 'left 0.6s cubic-bezier(0.4, 0, 0.6, 1), top 0.6s cubic-bezier(0.4, 0, 0.6, 1), transform 0.6s cubic-bezier(0.4, 0, 0.6, 1), opacity 0.5s ease 0.1s',
      }
    })
  })

  // 动画结束后隐藏
  setTimeout(() => {
    flyShow.value = false
  }, 700)
})

// 全屏播放器打开时，给 body 添加标记，暂停页面层动画以减少 GPU 负载
watch(showFullscreen, (val) => {
  document.body.classList.toggle('fs-open', val)
})

// 滚动条动态主题色：随当前歌曲封面主色变化
watch(() => playerStore.themeColor, (color) => {
  const c = color || '#667eea'
  const r = parseInt(c.slice(1, 3), 16)
  const g = parseInt(c.slice(3, 5), 16)
  const b = parseInt(c.slice(5, 7), 16)
  const root = document.documentElement
  root.style.setProperty('--scroll-r', r)
  root.style.setProperty('--scroll-g', g)
  root.style.setProperty('--scroll-b', b)
}, { immediate: true })

// 导航栏动态色
const headerStyle = computed(() => {
  const color = playerStore.themeColor || '#667eea'
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  return {
    '--nav-r': r,
    '--nav-g': g,
    '--nav-b': b,
  }
})

// Toast 动态色
const toastStyle = computed(() => {
  const color = playerStore.themeColor || '#667eea'
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  return {
    '--toast-r': r,
    '--toast-g': g,
    '--toast-b': b,
  }
})

// 处理分享链接
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const shareType = urlParams.get('share')
  const shareId = urlParams.get('id')

  if (shareType && shareId) {
    if (shareType === 'song') {
      const songId = parseInt(shareId)
      const song = playerStore.songs.find(s => s.id === songId)
      if (song) {
        playerStore.playSong(song)
        router.push(`/song/${songId}`)
      }
    } else if (shareType === 'playlist') {
      const playlistId = parseInt(shareId)
      router.push(`/playlist/${playlistId}`)
    }

    // 清理 URL 参数
    window.history.replaceState({}, document.title, window.location.pathname)
  }
})

// 电脑端空格键：播放/暂停（排除输入框聚焦时）
const onKeydown = (e) => {
  if (e.code !== 'Space') return
  // 仅电脑端生效
  if (window.innerWidth < 768) return
  // 排除输入框、文本域、contenteditable
  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  if (document.activeElement?.isContentEditable) return
  // 没有歌曲时不响应
  if (!playerStore.currentSong) return
  // 阻止默认行为（页面滚动 + 按钮原生click），统一由togglePlay处理
  e.preventDefault()
  // 如果焦点在按钮上，先移除焦点避免视觉残留
  if (tag === 'BUTTON') {
    document.activeElement.blur()
  }
  playerStore.togglePlay()
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  min-height: 100vh;
  color: #fff;
}

#app {
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 10, 0.75);
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  text-decoration: none;
}

.logo svg {
  color: rgba(var(--nav-r), var(--nav-g), var(--nav-b), 0.9);
  width: 24px;
  height: 24px;
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.brand-name {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.brand-tagline {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.35);
  font-weight: 400;
  letter-spacing: 2px;
}

.nav {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 10px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s;
}

.nav-link svg {
  width: 16px;
  height: 16px;
}

.nav-link span {
  display: none;
}

.nav-link:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.06);
}

.nav-link.active {
  color: #fff;
  background: rgba(var(--nav-r), var(--nav-g), var(--nav-b), 0.15);
  border: 1px solid rgba(var(--nav-r), var(--nav-g), var(--nav-b), 0.1);
}

/* 版本号按钮 */
.version-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  position: relative;
}

.version-btn svg {
  width: 13px;
  height: 13px;
  color: rgba(var(--nav-r), var(--nav-g), var(--nav-b), 0.8);
  flex-shrink: 0;
}

.version-btn .version-text {
  display: none;
}

.version-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(var(--nav-r), var(--nav-g), var(--nav-b), 1);
  box-shadow: 0 0 8px rgba(var(--nav-r), var(--nav-g), var(--nav-b), 0.6);
  flex-shrink: 0;
  animation: version-pulse 2s ease-in-out infinite;
}

@keyframes version-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.version-btn:hover {
  background: rgba(var(--nav-r), var(--nav-g), var(--nav-b), 0.12);
  border-color: rgba(var(--nav-r), var(--nav-g), var(--nav-b), 0.3);
  color: rgba(var(--nav-r), var(--nav-g), var(--nav-b), 1);
}

.version-btn:hover .version-dot {
  animation: none;
  opacity: 1;
}

.version-btn:active {
  transform: scale(0.92);
}

@media (min-width: 768px) {
  .header {
    padding: 14px 32px;
    gap: 24px;
  }

  .logo {
    gap: 10px;
    font-size: 20px;
  }

  .logo svg {
    width: 28px;
    height: 28px;
  }

  .brand-name {
    font-size: 20px;
    letter-spacing: 2px;
  }

  .brand-tagline {
    font-size: 11px;
    letter-spacing: 4px;
  }

  .nav {
    gap: 6px;
  }

  .nav-link {
    gap: 6px;
    padding: 8px 14px;
    border-radius: 10px;
    font-size: 13px;
  }

  .nav-link svg {
    width: 18px;
    height: 18px;
  }

  .nav-link span {
    display: inline;
  }

  .version-btn {
    padding: 7px 14px;
    gap: 6px;
    font-size: 12px;
  }

  .version-btn svg {
    width: 15px;
    height: 15px;
  }

  .version-btn .version-text {
    display: inline;
  }
}

.main {
  flex: 1;
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}

/* 滚动条样式 — 随歌曲主题色动态变化 */
html {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--scroll-r, 102), var(--scroll-g, 126), var(--scroll-b, 234), 0.5) transparent;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(var(--scroll-r, 102), var(--scroll-g, 126), var(--scroll-b, 234), 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--scroll-r, 102), var(--scroll-g, 126), var(--scroll-b, 234), 0.8);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* ==================== View Transitions API 样式 ==================== */

/* 默认过渡：淡入淡出 */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.4s;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* 向左滑动（进入右侧页面） */
html[data-transition="left"] ::view-transition-old(root) {
  animation: slide-out-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

html[data-transition="left"] ::view-transition-new(root) {
  animation: slide-in-right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 向右滑动（进入左侧页面） */
html[data-transition="right"] ::view-transition-old(root) {
  animation: slide-out-right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

html[data-transition="right"] ::view-transition-new(root) {
  animation: slide-in-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 缩放入场（进入详情页） */
html[data-transition="in"] ::view-transition-old(root) {
  animation: fade-out 0.3s ease;
}

html[data-transition="in"] ::view-transition-new(root) {
  animation: scale-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 关键帧动画 */
@keyframes slide-out-left {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-30%); opacity: 0; }
}

@keyframes slide-in-right {
  from { transform: translateX(30%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-out-right {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(30%); opacity: 0; }
}

@keyframes slide-in-left {
  from { transform: translateX(-30%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* 不支持 View Transitions 的浏览器回退 */
@supports not (view-transition-name: none) {
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.3s ease;
  }
}

/* 全屏播放器打开时：暂停页面层所有动画，释放 GPU 给播放器 */
body.fs-open .guofeng-page .atmo-orb,
body.fs-open .guofeng-page .ink-wash,
body.fs-open .guofeng-page .mountain-silhouette,
body.fs-open .guofeng-page .poem-line,
body.fs-open .guofeng-page .vinyl-disc,
body.fs-open .guofeng-page .song-bars .bar,
body.fs-open .immersive-playlist .atmo-orb,
body.fs-open .immersive-all-playlists .atmo-orb,
body.fs-open .home-page .atmo-orb {
  animation-play-state: paused !important;
}

/* ==================== Toast 提示 ==================== */
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(20, 20, 28, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--toast-r), var(--toast-g), var(--toast-b), 0.25);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(var(--toast-r), var(--toast-g), var(--toast-b), 0.1);
  pointer-events: none;
  white-space: nowrap;
}

.toast svg {
  color: rgba(var(--toast-r), var(--toast-g), var(--toast-b), 0.9);
  flex-shrink: 0;
}

.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

/* ==================== 飞入动画 ==================== */
.fly-cover {
  position: fixed;
  z-index: 3000;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  pointer-events: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.fly-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
