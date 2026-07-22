<template>
  <div class="immersive-album" :style="dynamicStyle" v-if="album">
    <!-- 氛围背景 -->
    <div class="atmosphere">
      <div class="atmo-bg-img" :style="{ backgroundImage: `url(${album.cover})` }"></div>
      <div class="atmo-gradient"></div>
      <div class="atmo-orb atmo-orb-1"></div>
      <div class="atmo-orb atmo-orb-2"></div>
      <div class="atmo-orb atmo-orb-3"></div>
    </div>

    <div class="content-layer">
      <!-- 头部 -->
      <header class="page-header">
        <button class="btn-back" @click="$router.back()">
          <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div class="header-info">
          <span class="header-label">ALBUM</span>
          <h1 class="header-title">{{ album.name }}</h1>
        </div>
        <button class="btn-play-all" @click="playAll">
          <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <span>播放全部</span>
        </button>
      </header>

      <!-- 专辑 Hero -->
      <section class="album-hero">
        <div class="hero-cover-wrap">
          <img :src="album.cover" :alt="album.name" />
          <div class="hero-cover-shadow"></div>
        </div>
        <div class="hero-meta">
          <p class="hero-artist">{{ album.artist }}</p>
          <div class="hero-tags">
            <span class="hero-tag" v-if="album.releaseDate">
              <svg viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
              {{ album.releaseDate }}
            </span>
            <span class="hero-tag">
              <svg viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              {{ songs.length }} 首
            </span>
          </div>
          <div class="hero-actions">
            <button class="btn-shuffle" @click="shufflePlay">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
              <span>随机播放</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 专辑介绍 -->
      <section class="desc-section" v-if="album.description">
        <div class="desc-card">
          <p class="desc-text">{{ album.description }}</p>
        </div>
      </section>

      <!-- 曲目列表 -->
      <section class="section">
        <div class="section-header">
          <h3 class="section-title">曲目列表</h3>
          <span class="section-count">{{ songs.length }} 首</span>
        </div>
        <div class="song-list">
          <div
            v-for="(song, index) in songs"
            :key="song.id"
            class="song-item"
            :class="{ active: playerStore.currentSong?.id === song.id }"
          >
            <div class="song-index" :class="{ playing: playerStore.currentSong?.id === song.id && playerStore.isPlaying }">
              <span class="song-num" v-if="playerStore.currentSong?.id !== song.id">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="song-bars" v-else>
                <span class="bar"></span><span class="bar"></span><span class="bar"></span>
              </span>
            </div>
            <div class="song-cover" @click="playSongAt(index)">
              <img :src="song.cover" :alt="song.title" loading="lazy" />
              <div class="song-cover-play">
                <svg viewBox="0 0 24 24" width="14" height="14"><path fill="#fff" d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <div class="song-meta" @click="router.push(`/song/${song.id}`)">
              <span class="song-title" :class="{ active: playerStore.currentSong?.id === song.id }">{{ song.title }}</span>
              <span class="song-artist">{{ song.artist }}</span>
            </div>
            <div class="song-actions">
              <span class="tag-badge lyrics" v-if="hasLyrics(song.id)">词</span>
              <span class="tag-badge mv" v-if="song.mvUrl">MV</span>
              <button
                class="like-btn" v-like-burst
                :class="{ liked: playerStore.isLiked(song.id) }"
                @click.stop="playerStore.toggleLikeSong(song.id)"
              >
                <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </button>
              <span class="song-duration" v-if="song.duration">{{ formatTime(song.duration) }}</span>
            </div>
          </div>
        </div>
      </section>

      <div class="bottom-space"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'

const route = useRoute()
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

const lyricsMap = computed(() => {
  const map = {}
  if (playerStore.lyricsData) {
    for (const id in playerStore.lyricsData) {
      const d = playerStore.lyricsData[id]
      map[id] = d && d.lyrics && d.lyrics.trim().length > 0
    }
  }
  return map
})
const hasLyrics = (id) => lyricsMap.value[id] || false

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

onMounted(() => {
  window.scrollTo(0, 0)
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

const formatTime = (s) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.immersive-album {
  position: relative;
  min-height: 100vh;
  background: #0a0a0a;
  color: rgba(255, 255, 255, 0.85);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  padding-bottom: 100px;
  overflow-x: hidden;
}

/* 氛围背景（保留光球） */
.atmosphere {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.atmo-bg-img {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(60px) brightness(0.4) saturate(1.5);
  transform: scale(1.4);
  opacity: 0.6;
  backface-visibility: hidden;
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
  width: 400px;
  height: 400px;
  top: -10%;
  left: -8%;
  box-shadow: 0 0 140px 50px rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.1);
  animation-delay: 0s;
}

.atmo-orb-2 {
  width: 280px;
  height: 280px;
  bottom: 10%;
  right: -6%;
  box-shadow: 0 0 120px 40px rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.06);
  animation-delay: -6s;
}

.atmo-orb-3 {
  width: 180px;
  height: 180px;
  top: 45%;
  left: 35%;
  box-shadow: 0 0 80px 25px rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.04);
  animation-delay: -12s;
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(25px, -20px) scale(1.05); }
  66% { transform: translate(-15px, 12px) scale(0.95); }
}

/* 内容层 */
.content-layer {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 32px 0;
}

@media (min-width: 768px) {
  .content-layer { padding: 48px 48px 0; }
}
@media (min-width: 1200px) {
  .content-layer { padding: 48px 64px 0; max-width: 1000px; }
}

/* 页头 */
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 36px;
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
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
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-play-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15);
  border: 1px solid rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.2);
  border-radius: 100px;
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.9);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.btn-play-all:hover {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.25);
  transform: translateY(-1px);
}

/* 专辑 Hero */
.album-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 36px;
}

.hero-cover-wrap {
  position: relative;
  width: 200px;
  height: 200px;
  margin-bottom: 24px;
}

@media (min-width: 768px) {
  .album-hero {
    flex-direction: row;
    align-items: flex-end;
    gap: 36px;
  }
  .hero-cover-wrap {
    width: 260px;
    height: 260px;
    margin-bottom: 0;
    flex-shrink: 0;
  }
}

.hero-cover-wrap img {
  width: 100%;
  height: 100%;
  border-radius: 18px;
  object-fit: cover;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.hero-cover-shadow {
  position: absolute;
  inset: -4px;
  border-radius: 22px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

.hero-meta {
  text-align: center;
}

@media (min-width: 768px) {
  .hero-meta {
    text-align: left;
    flex: 1;
    min-width: 0;
    padding-bottom: 8px;
  }
}

.hero-artist {
  margin: 0 0 10px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
}

.hero-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;
}

@media (min-width: 768px) {
  .hero-tags { justify-content: flex-start; }
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.hero-tag svg {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.5);
}

.hero-actions {
  display: flex;
  justify-content: center;
}

@media (min-width: 768px) {
  .hero-actions { justify-content: flex-start; }
}

.btn-shuffle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-shuffle:hover {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.08);
  border-color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.12);
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8);
}

/* 专辑介绍 */
.desc-section {
  margin-bottom: 36px;
}

.desc-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 20px 24px;
}

.desc-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.45);
}

/* 区块 */
.section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.section-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.25);
}

/* 歌曲列表 */
.song-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  transition: all 0.3s;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.song-item:hover .song-cover-play {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.song-item.active {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.06);
}

.song-index {
  width: 32px;
  text-align: center;
  flex-shrink: 0;
}

.song-num {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.15);
  font-variant-numeric: tabular-nums;
}

.song-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
  justify-content: center;
}

.song-bars .bar {
  width: 3px;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8);
  border-radius: 2px;
  animation: barBounce 0.8s ease-in-out infinite;
}

.song-bars .bar:nth-child(1) { height: 60%; animation-delay: 0s; }
.song-bars .bar:nth-child(2) { height: 100%; animation-delay: 0.15s; }
.song-bars .bar:nth-child(3) { height: 40%; animation-delay: 0.3s; }

@keyframes barBounce {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.4); }
}

.song-cover {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.03);
  position: relative;
  cursor: pointer;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-cover-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.song-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
}

.song-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
}

.song-title.active {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.9);
}

.song-artist {
  font-size: 12px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.35);
}

.song-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  height: 16px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  border-radius: 3px;
  flex-shrink: 0;
}

.tag-badge.lyrics {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8);
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.1);
  border: 1px solid rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15);
}

.tag-badge.mv {
  color: rgba(255, 138, 101, 0.8);
  background: rgba(255, 138, 101, 0.1);
  border: 1px solid rgba(255, 138, 101, 0.15);
}

.like-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.2);
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.like-btn:hover {
  color: rgba(245, 87, 108, 0.7);
  transform: scale(1.15);
}

.like-btn.liked {
  color: #f5576c;
}

.song-duration {
  font-size: 12px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.25);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.bottom-space {
  height: 40px;
}
</style>
