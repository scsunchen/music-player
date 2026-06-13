<template>
  <div class="album-page" v-if="album">
    <!-- 动态背景 -->
    <div class="atmosphere">
      <div class="atmosphere__gradient" :style="{ '--accent': accentColor }"></div>
      <div class="atmosphere__noise"></div>
      <div class="atmosphere__orbs">
        <span class="orb orb--1"></span>
        <span class="orb orb--2"></span>
        <span class="orb orb--3"></span>
      </div>
    </div>

    <!-- 顶部导航 -->
    <nav class="topbar">
      <button class="topbar__btn" @click="router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>
      <span class="topbar__label">专辑</span>
      <div class="topbar__spacer"></div>
    </nav>

    <!-- 主视觉 Hero -->
    <header class="hero">
      <div class="hero__cover-wrap">
        <img :src="album.cover" :alt="album.name" class="hero__cover" />
        <div class="hero__cover-glow" :style="{ '--accent': accentColor }"></div>
        <div class="hero__vinyl">
          <div class="hero__vinyl-disc"></div>
        </div>
      </div>

      <div class="hero__info">
        <div class="hero__badge">
          <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          ALBUM
        </div>
        <h1 class="hero__title">{{ album.name }}</h1>
        <p class="hero__artist">{{ album.artist }}</p>
        <div class="hero__meta">
          <span class="hero__meta-item">
            <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
            {{ album.releaseDate }}
          </span>
          <span class="hero__meta-dot"></span>
          <span class="hero__meta-item">
            <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            {{ songs.length }} 首
          </span>
        </div>
        <div class="hero__actions">
          <button class="btn-play" @click="playAll" :style="{ '--accent': accentColor }">
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <span>播放全部</span>
          </button>
          <button class="btn-shuffle" @click="shufflePlay">
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
            <span>随机</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 专辑介绍 -->
    <section class="description" v-if="album.description">
      <div class="description__card">
        <div class="description__quote">"</div>
        <p class="description__text">{{ album.description }}</p>
      </div>
    </section>

    <!-- 曲目列表 -->
    <section class="tracklist">
      <div class="tracklist__header">
        <div class="tracklist__line"></div>
        <h3 class="tracklist__title">曲目列表</h3>
        <div class="tracklist__line"></div>
      </div>

      <div class="tracklist__body">
        <div
          v-for="(song, index) in songs"
          :key="song.id"
          class="track"
          :class="{ active: playerStore.currentSong?.id === song.id }"
          @click="playSongAt(index)"
        >
          <div class="track__number" :class="{ playing: playerStore.currentSong?.id === song.id && playerStore.isPlaying }">
            <span class="track__num" v-if="playerStore.currentSong?.id !== song.id">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="track__bars" v-else>
              <span class="bar"></span><span class="bar"></span><span class="bar"></span>
            </span>
          </div>
          <div class="track__info">
            <span class="track__name">{{ song.title }}</span>
            <span class="track__artist">{{ song.artist }}</span>
          </div>
          <div class="track__duration" v-if="song.duration">{{ formatDuration(song.duration) }}</div>
          <button
            class="track__like"
            :class="{ liked: playerStore.isLiked(song.id) }"
            @click.stop="playerStore.toggleLikeSong(song.id)"
          >
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
        </div>
      </div>
    </section>

    <!-- 底部留白 -->
    <div class="footer-space"></div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()

const album = computed(() => {
  const id = parseInt(route?.params?.id)
  if (!id || isNaN(id)) return null
  return playerStore.albums.find(a => a.id === id)
})

const songs = computed(() => {
  if (!album.value) return []
  return album.value.songs.map(id =>
    playerStore.songs.find(s => s.id === id)
  ).filter(Boolean)
})

// 页面加载时滚动到顶部
onMounted(() => {
  window.scrollTo(0, 0)
})

// 从封面提取主题色（简单实现）
const accentColor = ref('#667eea')
onMounted(() => {
  if (album.value?.cover) {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = album.value.cover
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 1; canvas.height = 1
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, 1, 1)
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
        accentColor.value = `rgb(${r}, ${g}, ${b})`
      } catch (e) {}
    }
  }
})

const playAll = () => {
  if (album.value) playerStore.playAlbum(album.value)
}

const shufflePlay = () => {
  if (songs.value.length === 0) return
  const shuffled = [...songs.value].sort(() => Math.random() - 0.5)
  playerStore.currentPlaylist = shuffled
  playerStore.currentIndex = 0
  playerStore.playSong(shuffled[0])
}

const playSongAt = (index) => {
  if (album.value) {
    playerStore.playPlaylist({ songs: album.value.songs }, index)
  }
}

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
/* 本地字体栈，不依赖 Google Fonts */

.album-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* ===== 大气背景 ===== */
.atmosphere {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.atmosphere__gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 40% at 20% 10%, var(--accent, #667eea) 0%, transparent 60%),
    radial-gradient(ellipse 50% 50% at 80% 80%, rgba(118, 75, 162, 0.3) 0%, transparent 50%),
    linear-gradient(180deg, #0a0a1a 0%, #111128 40%, #0d0d20 100%);
}

.atmosphere__noise {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
}

.atmosphere__orbs .orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: orbFloat 20s ease-in-out infinite;
}

.orb--1 {
  width: 400px; height: 400px;
  background: var(--accent, #667eea);
  top: -10%; left: -5%;
  animation-delay: 0s;
}

.orb--2 {
  width: 300px; height: 300px;
  background: #764ba2;
  bottom: 10%; right: -5%;
  animation-delay: -7s;
}

.orb--3 {
  width: 200px; height: 200px;
  background: #f093fb;
  top: 50%; left: 40%;
  animation-delay: -14s;
  opacity: 0.08;
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-20px, 15px) scale(0.95); }
}

/* ===== 顶部导航 ===== */
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: linear-gradient(180deg, rgba(10, 10, 26, 0.9) 0%, transparent 100%);
  backdrop-filter: blur(12px);
}

.topbar__btn {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.topbar__btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.topbar__label {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
}

.topbar__spacer {
  width: 40px;
}

/* ===== Hero 区域 ===== */
.hero {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 24px 48px;
  gap: 32px;
  animation: heroIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes heroIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 封面 */
.hero__cover-wrap {
  position: relative;
  width: 260px;
  height: 260px;
}

.hero__cover {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  object-fit: cover;
  position: relative;
  z-index: 2;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.08);
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero__cover:hover {
  transform: scale(1.03) rotate(-1deg);
}

.hero__cover-glow {
  position: absolute;
  inset: -20%;
  z-index: 1;
  background: var(--accent, #667eea);
  filter: blur(60px);
  opacity: 0.25;
  border-radius: 50%;
  transition: opacity 0.5s;
}

.hero__cover-wrap:hover .hero__cover-glow {
  opacity: 0.35;
}

/* 唱片装饰 */
.hero__vinyl {
  position: absolute;
  top: 10px;
  right: -30px;
  width: 120px;
  height: 120px;
  z-index: 0;
  animation: vinylPeek 6s ease-in-out infinite;
}

.hero__vinyl-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background:
    repeating-radial-gradient(circle at center, transparent 0, transparent 3px, rgba(255,255,255,0.04) 3px, rgba(255,255,255,0.04) 5px),
    radial-gradient(circle at center, #222 0%, #111 40%, #000 100%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

@keyframes vinylPeek {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  50% { transform: translateX(-8px) rotate(15deg); }
}

/* 信息区 */
.hero__info {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.5);
}

.hero__title {
  font-family: Georgia, 'Times New Roman', 'PingFang SC', 'Songti SC', serif;
  font-size: 36px;
  font-weight: 800;
  line-height: 1.15;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero__artist {
  margin: 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 300;
}

.hero__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.hero__meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.hero__meta-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

/* 按钮 */
.hero__actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.btn-play {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: var(--accent, #667eea);
  border: none;
  border-radius: 28px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.35);
}

.btn-play:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.45);
}

.btn-play:active {
  transform: translateY(0) scale(0.98);
}

.btn-shuffle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 28px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.btn-shuffle:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  transform: translateY(-2px);
}

/* ===== 专辑介绍 ===== */
.description {
  position: relative;
  z-index: 1;
  padding: 0 32px;
  margin-bottom: 40px;
  animation: fadeUp 0.6s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.description__card {
  position: relative;
  padding: 24px 28px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  overflow: hidden;
}

.description__card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 200px;
  height: 200px;
  background: var(--accent, #667eea);
  filter: blur(80px);
  opacity: 0.08;
  border-radius: 50%;
}

.description__quote {
  font-family: Georgia, 'Times New Roman', 'PingFang SC', 'Songti SC', serif;
  font-size: 64px;
  line-height: 0.6;
  color: var(--accent, #667eea);
  opacity: 0.3;
  margin-bottom: 8px;
}

.description__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.55);
  position: relative;
  z-index: 1;
}

/* ===== 曲目列表 ===== */
.tracklist {
  position: relative;
  z-index: 1;
  padding: 0 24px;
  animation: fadeUp 0.6s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.tracklist__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.tracklist__line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);
}

.tracklist__title {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
}

.tracklist__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.track {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid transparent;
}

.track:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.06);
  transform: translateX(4px);
}

.track.active {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
}

.track.active .track__name {
  color: var(--accent, #667eea);
}

/* 序号 */
.track__number {
  width: 32px;
  text-align: center;
  flex-shrink: 0;
}

.track__num {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.25);
  font-variant-numeric: tabular-nums;
}

.track__bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
  justify-content: center;
}

.track__bars .bar {
  width: 3px;
  background: var(--accent, #667eea);
  border-radius: 2px;
  animation: barBounce 0.8s ease-in-out infinite;
}

.track__bars .bar:nth-child(1) { height: 60%; animation-delay: 0s; }
.track__bars .bar:nth-child(2) { height: 100%; animation-delay: 0.15s; }
.track__bars .bar:nth-child(3) { height: 40%; animation-delay: 0.3s; }

@keyframes barBounce {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.4); }
}

/* 歌曲信息 */
.track__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.track__name {
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
}

.track__artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track__duration {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.25);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.track__like {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s;
  opacity: 0;
  flex-shrink: 0;
}

.track:hover .track__like {
  opacity: 1;
}

.track__like:hover {
  color: #f5576c;
  background: rgba(245, 87, 108, 0.1);
}

.track__like.liked {
  opacity: 1;
  color: #f5576c;
}

/* ===== 底部留白 ===== */
.footer-space {
  height: 120px;
}

/* ===== 响应式 ===== */
@media (min-width: 768px) {
  .hero {
    flex-direction: row;
    align-items: flex-end;
    padding: 48px 48px 56px;
    gap: 48px;
    max-width: 900px;
    margin: 0 auto;
  }

  .hero__cover-wrap {
    width: 300px;
    height: 300px;
    flex-shrink: 0;
  }

  .hero__vinyl {
    width: 140px;
    height: 140px;
    right: -40px;
  }

  .hero__info {
    align-items: flex-start;
    text-align: left;
  }

  .hero__title {
    font-size: 42px;
  }

  .hero__actions {
    justify-content: flex-start;
  }

  .description {
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
    padding: 0 48px;
  }

  .tracklist {
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
    padding: 0 48px;
  }
}

@media (max-width: 767px) {
  .hero__cover-wrap {
    width: 220px;
    height: 220px;
  }

  .hero__title {
    font-size: 28px;
  }

  .hero__vinyl {
    width: 90px;
    height: 90px;
    right: -20px;
  }

  .btn-play {
    padding: 12px 24px;
    font-size: 14px;
  }

  .btn-shuffle {
    padding: 12px 18px;
    font-size: 14px;
  }
}
</style>