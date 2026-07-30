<template>
  <!-- 数据未就绪：骨架屏 -->
  <div class="playlist-skeleton" v-if="!playlist && loading">
    <div class="sk-atmosphere"></div>
    <div class="sk-content">
      <header class="sk-header">
        <div class="sk-back"></div>
        <div class="sk-header-info">
          <div class="sk-header-label"></div>
          <div class="sk-header-title"></div>
        </div>
        <div class="sk-play-all"></div>
      </header>
      <section class="sk-hero">
        <div class="sk-hero-cover"></div>
        <div class="sk-hero-info">
          <div class="sk-hero-desc"></div>
          <div class="sk-hero-desc short"></div>
          <div class="sk-hero-meta">
            <div class="sk-meta-item"></div>
            <div class="sk-meta-item"></div>
            <div class="sk-meta-item"></div>
          </div>
        </div>
      </section>
      <div class="sk-song-list">
        <div class="sk-song-item" v-for="i in 8" :key="i">
          <div class="sk-song-index"></div>
          <div class="sk-song-cover"></div>
          <div class="sk-song-meta">
            <div class="sk-song-title"></div>
            <div class="sk-song-artist"></div>
          </div>
          <div class="sk-song-dur"></div>
        </div>
      </div>
    </div>
  </div>
  <!-- 专属模板分发 -->
  <GuofengInk
    v-else-if="playlist?.template === 'guofeng-ink'"
    :playlist="playlist"
    :songs="songs"
  />
  <!-- 通用模板 -->
  <div class="immersive-playlist" :style="dynamicStyle" v-else-if="playlist">
    <!-- 轻量氛围背景 -->
    <div class="atmosphere">
      <div class="atmo-gradient"></div>
      <div class="atmo-orb atmo-orb-1"></div>
      <div class="atmo-orb atmo-orb-2"></div>
    </div>

    <div class="content-layer">
      <!-- 头部 -->
      <header class="page-header">
        <button class="btn-back" @click="$router.back()">
          <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div class="header-info">
          <span class="header-label">PLAYLIST</span>
          <h1 class="header-title">{{ playlist.name }}</h1>
        </div>
        <button class="btn-play-all" @click="playAll">
          <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <span>播放全部</span>
        </button>
      </header>

      <!-- 歌单封面 + 信息 -->
      <section class="playlist-hero">
        <div class="hero-cover">
          <img :src="playlist.cover" :alt="playlist.name" />
          <div class="hero-cover-shadow"></div>
        </div>
        <div class="hero-info">
          <p class="hero-desc" v-if="playlist.description">{{ playlist.description }}</p>
          <div class="hero-meta">
            <span class="meta-item">
              <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              {{ songs.length }} 首
            </span>
            <span class="meta-item" v-if="playlist.playCount">
              <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
              {{ formatCount(playlist.playCount) }}
            </span>
            <button class="btn-share" @click="openShare">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
              分享
            </button>
          </div>
        </div>
      </section>

      <!-- 歌曲列表 -->
      <section class="section">
        <div class="song-list">
          <div
            v-for="(song, i) in songs"
            :key="song.id"
            class="song-item"
            :class="{ active: playerStore.currentSong?.id === song.id }"
          >
            <span class="song-index" :class="{ playing: playerStore.currentSong?.id === song.id && playerStore.isPlaying }">
              <span v-if="playerStore.currentSong?.id !== song.id">{{ i + 1 }}</span>
              <span class="song-bars" v-else><span class="bar"></span><span class="bar"></span><span class="bar"></span></span>
            </span>
            <div class="song-cover" @click="playSongAt(i)">
              <img :src="song.cover" :alt="song.title" loading="lazy" />
              <div class="song-cover-play" @click.stop="playSongAt(i)">
                <svg viewBox="0 0 24 24" width="14" height="14"><path fill="#fff" d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <div class="song-meta" @click="router.push(`/song/${song.id}`)">
              <span class="song-title">{{ song.title }}</span>
              <span class="song-artist">{{ song.artist }}</span>
            </div>
            <div class="song-actions">
              <span class="tag-badge lyrics" v-if="hasLyrics(song.id)">词</span>
              <span class="tag-badge mv" v-if="song.mvUrl">MV</span>
              <button class="action-btn" @click.stop="playerStore.insertNext(song)" title="下一首播放">
                <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6z"/></svg>
              </button>
              <button class="action-btn" @click.stop="playerStore.addToQueue(song)" title="加入队列">
                <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 10h10v2H3v-2zm0-4h10v2H3V6zm0 8h6v2H3v-2zm11-3v3h-3v2h3v3h2v-3h3v-2h-3v-3z"/></svg>
              </button>
              <button
                class="like-btn" v-like-burst
                :class="{ liked: playerStore.isLiked(song.id) }"
                @click.stop="playerStore.toggleLikeSong(song.id)"
              >
                <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </button>
              <button class="remove-btn" @click.stop="removeSong(song.id)" title="移出歌单">
                <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
              <span class="song-duration" v-if="song.duration">{{ formatTime(song.duration) }}</span>
            </div>
          </div>
          <div v-if="songs.length === 0" class="empty-state">
            <p>歌单里还没有歌曲</p>
          </div>
        </div>
      </section>

      <div class="bottom-space"></div>
    </div>

    <!-- 分享弹窗 -->
    <ShareModal
      v-if="playlist"
      :visible="showShare"
      type="playlist"
      :data="playlist"
      @close="showShare = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import ShareModal from '../components/ShareModal.vue'
import GuofengInk from './GuofengInk.vue'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()
const showShare = ref(false)

// 数据加载状态：数据未就绪且无错误时显示骨架屏
const loading = computed(() => !playerStore.dataLoaded && !playerStore.dataLoadError)

const dynamicStyle = computed(() => {
  const color = playerStore.themeColor || '#667eea'
  return {
    '--dynamic-r': parseInt(color.slice(1, 3), 16),
    '--dynamic-g': parseInt(color.slice(3, 5), 16),
    '--dynamic-b': parseInt(color.slice(5, 7), 16),
  }
})

const hasLyrics = (id) => playerStore.hasLyrics(id)

const playlist = computed(() => {
  const id = parseInt(route?.params?.id)
  if (!id || isNaN(id)) return null
  return playerStore.allPlaylists.find(p => p.id === id) ||
         playerStore.customPlaylists.find(p => p.id === id)
})

const songs = computed(() => {
  if (!playlist.value) return []
  const importedMap = {}
  if (playlist.value.importedSongs) {
    for (const s of playlist.value.importedSongs) {
      importedMap[s.id] = s
    }
  }
  return playlist.value.songs.map(id =>
    importedMap[id] || playerStore.songs.find(s => s.id === id)
  ).filter(Boolean)
})

const formatCount = (count) => {
  if (count >= 10000) return (count / 10000).toFixed(1) + '万'
  return count
}

const formatTime = (s) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const playAll = () => {
  if (playlist.value) playerStore.playPlaylist(playlist.value)
}

const playSongAt = (index) => {
  if (playlist.value) playerStore.playPlaylist(playlist.value, index)
}

const removeSong = (songId) => {
  if (playlist.value) {
    playerStore.removeFromPlaylist(playlist.value.id, songId)
  }
}

const openShare = () => {
  showShare.value = true
}
</script>

<style scoped>
/* ===== 骨架屏 ===== */
.playlist-skeleton {
  position: relative;
  min-height: 100vh;
  background: #0a0a0a;
  overflow-x: hidden;
}

.sk-atmosphere {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at 20% 20%, rgba(102,126,234,0.06) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 80%, rgba(102,126,234,0.04) 0%, transparent 50%),
              linear-gradient(180deg, rgba(10,10,10,0.3) 0%, #0a0a0a 100%);
  pointer-events: none;
}

.sk-content {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 32px 0;
}

@media (min-width: 768px) { .sk-content { padding: 48px 48px 0; max-width: 1400px; } }
@media (min-width: 1200px) { .sk-content { padding: 48px 64px 0; max-width: 1600px; } }

.sk-shimmer {
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 200% 100%;
  animation: skShimmer 1.5s infinite;
  border-radius: 6px;
}

/* 所有骨架块共用 shimmer 效果 */
.sk-back, .sk-header-label, .sk-header-title, .sk-play-all,
.sk-hero-cover, .sk-hero-desc, .sk-meta-item,
.sk-song-index, .sk-song-cover, .sk-song-title, .sk-song-artist, .sk-song-dur {
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 200% 100%;
  animation: skShimmer 1.5s infinite;
  border-radius: 6px;
}

@keyframes skShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.sk-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.sk-back { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; }
.sk-header-info { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.sk-header-label { width: 60px; height: 10px; }
.sk-header-title { width: 180px; height: 24px; }
.sk-play-all { width: 120px; height: 40px; border-radius: 100px; flex-shrink: 0; }

.sk-hero {
  display: flex;
  gap: 24px;
  margin-bottom: 36px;
  align-items: flex-end;
}

.sk-hero-cover { width: 140px; height: 140px; border-radius: 16px; flex-shrink: 0; }
.sk-hero-info { flex: 1; padding-bottom: 4px; }
.sk-hero-desc { width: 100%; height: 14px; margin-bottom: 8px; }
.sk-hero-desc.short { width: 60%; }
.sk-hero-meta { display: flex; gap: 16px; margin-top: 14px; }
.sk-meta-item { width: 80px; height: 24px; border-radius: 100px; }

.sk-song-list { display: flex; flex-direction: column; gap: 2px; }
.sk-song-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 14px;
}
.sk-song-index { width: 24px; height: 14px; flex-shrink: 0; }
.sk-song-cover { width: 48px; height: 48px; border-radius: 10px; flex-shrink: 0; }
.sk-song-meta { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.sk-song-title { width: 50%; height: 14px; }
.sk-song-artist { width: 30%; height: 12px; }
.sk-song-dur { width: 30px; height: 12px; flex-shrink: 0; }

@media (max-width: 768px) {
  .sk-content { padding: 20px 20px 0; }
  .sk-hero-cover { width: 100px; height: 100px; }
  .sk-song-cover { width: 42px; height: 42px; }
}

/* ===== 正常内容样式 ===== */
.immersive-playlist {
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
  width: 350px;
  height: 350px;
  top: -100px;
  left: -80px;
}

.atmo-orb-2 {
  width: 250px;
  height: 250px;
  bottom: 10%;
  right: -60px;
  animation-delay: -6s;
}

@keyframes orbFloat {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(25px, -30px) scale(1.08); }
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
  margin-bottom: 32px;
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

/* 歌单 Hero */
.playlist-hero {
  display: flex;
  gap: 24px;
  margin-bottom: 36px;
  align-items: flex-end;
}

.hero-cover {
  width: 140px;
  height: 140px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  position: relative;
}

.hero-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-cover-shadow {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

.hero-info {
  flex: 1;
  min-width: 0;
  padding-bottom: 4px;
}

.hero-desc {
  margin: 0 0 10px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}

.meta-item svg {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.5);
}

.btn-share {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-share:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

/* 区块 */
.section { margin-bottom: 20px; }

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
  cursor: pointer;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.song-item.active .song-title {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.95);
}

.song-item.active .song-artist {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.5);
}

.song-item:hover .song-cover-play {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.song-item:hover .remove-btn {
  opacity: 1;
}

.song-index {
  width: 24px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.12);
  text-align: center;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.song-index.playing {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.85);
}

.song-bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}

.song-bars .bar {
  width: 3px;
  border-radius: 1px;
  background: currentColor;
  animation: songBar 0.8s ease-in-out infinite alternate;
}

.song-bars .bar:nth-child(1) { height: 6px; animation-delay: 0s; }
.song-bars .bar:nth-child(2) { height: 10px; animation-delay: 0.2s; }
.song-bars .bar:nth-child(3) { height: 4px; animation-delay: 0.4s; }

@keyframes songBar {
  0% { height: 4px; }
  100% { height: 14px; }
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

.action-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.2);
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.action-btn:hover {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8);
  transform: scale(1.15);
}
.action-btn:active {
  transform: scale(0.9);
}

.like-btn:hover {
  color: rgba(245, 87, 108, 0.7);
  transform: scale(1.15);
}

.like-btn.liked {
  color: #f5576c;
}

.remove-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.15);
  opacity: 0;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.remove-btn:hover {
  color: rgba(255, 82, 82, 0.8);
  transform: scale(1.1);
}

.song-duration {
  font-size: 12px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.25);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 48px;
}

.empty-state p {
  margin: 0;
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
}

.bottom-space {
  height: 40px;
}

/* 响应式 */
@media (max-width: 600px) {
  .playlist-hero {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .hero-cover {
    width: 180px;
    height: 180px;
  }

  .hero-meta {
    justify-content: center;
  }

  .header-title {
    font-size: 20px;
  }

  .page-header {
    flex-wrap: wrap;
  }
}
</style>
