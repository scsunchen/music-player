<template>
  <div class="immersive-all-albums" :style="dynamicStyle">
    <!-- 轻量氛围背景 -->
    <div class="atmosphere">
      <div class="atmo-gradient"></div>
      <div class="atmo-orb atmo-orb-1"></div>
    </div>

    <div class="content-layer">
      <!-- 页面头部 -->
      <header class="page-header">
        <button class="btn-back" @click="router.back()">
          <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div class="header-info">
          <span class="header-label">ALBUMS</span>
          <h1 class="header-title">全部专辑</h1>
        </div>
      </header>

      <!-- 专辑信息 -->
      <div class="info-bar">
        <div class="info-icon">
          <svg viewBox="0 0 24 24" width="28" height="28"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>
        </div>
        <div class="info-text">
          <h2>全部专辑</h2>
          <p>{{ playerStore.albums.length }} 张专辑</p>
        </div>
      </div>

      <!-- 专辑网格 -->
      <div class="album-grid">
        <div
          v-for="album in playerStore.albums"
          :key="album.id"
          class="album-card"
        >
          <div class="card-cover" @click="router.push(`/album/${album.id}`)">
            <img :src="album.cover" :alt="album.name" loading="lazy" />
            <div class="card-cover-play" @click.stop="playerStore.playAlbum(album)">
              <svg viewBox="0 0 24 24" width="14" height="14"><path fill="#fff" d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <div class="card-info">
            <span class="card-name">{{ album.name }}</span>
            <span class="card-artist">{{ album.artist || '' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'

const router = useRouter()
const playerStore = usePlayerStore()

const dynamicStyle = computed(() => {
  const color = playerStore.themeColor || '#667eea'
  return {
    '--dynamic-r': parseInt(color.slice(1, 3), 16),
    '--dynamic-g': parseInt(color.slice(3, 5), 16),
    '--dynamic-b': parseInt(color.slice(5, 7), 16),
  }
})
</script>

<style scoped>
.immersive-all-albums {
  position: relative;
  min-height: 100vh;
  background: #0a0a0a;
  color: rgba(255, 255, 255, 0.85);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  padding-bottom: 100px;
  overflow-x: hidden;
}

/* 轻量氛围背景 */
.atmosphere {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.atmo-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 20%, rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 80%, rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.1) 0%, transparent 50%),
    linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.7) 60%, #0a0a0a 100%);
}

.atmo-orb {
  position: absolute;
  border-radius: 50%;
  box-shadow: 0 0 120px 40px rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15);
  opacity: 1;
  animation: orbFloat 12s ease-in-out infinite alternate;
}

.atmo-orb-1 {
  width: 300px;
  height: 300px;
  top: -60px;
  right: -40px;
}

@keyframes orbFloat {
  0% { transform: translate(0, 0); }
  100% { transform: translate(20px, -25px); }
}

/* 内容层 */
.content-layer {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 32px 0;
}

@media (min-width: 768px) {
  .content-layer { padding: 48px 48px 0; max-width: 1400px; }
}
@media (min-width: 1200px) {
  .content-layer { padding: 48px 64px 0; max-width: 1600px; }
}

/* 页头 */
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.btn-back {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.btn-back:hover {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15);
  border-color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.2);
}

.header-info {
  flex: 1;
  min-width: 0;
}

.header-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.7);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.header-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

/* 信息栏 */
.info-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.info-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.12);
  border: 1px solid rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 1);
  flex-shrink: 0;
}

.info-text h2 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.info-text p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

/* 专辑网格 */
.album-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 768px) {
  .album-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
}
@media (min-width: 1200px) {
  .album-grid { grid-template-columns: repeat(5, 1fr); gap: 20px; }
}

.album-card {
  border-radius: 14px;
  transition: all 0.3s;
}

.album-card:hover {
  transform: translateY(-4px);
}

.card-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-cover-play {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s;
}

.card-cover:hover .card-cover-play {
  opacity: 1;
}

.card-info {
  padding: 10px 4px 0;
}

.card-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-artist {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
