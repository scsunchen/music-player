<template>
  <div class="immersive-all-songs" :style="dynamicStyle">
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
          <span class="header-label">ALL SONGS</span>
          <h1 class="header-title">全部歌曲</h1>
        </div>
        <button class="btn-play-all" @click="playAll">
          <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <span>播放全部</span>
        </button>
      </header>

      <!-- 歌曲列表 -->
      <div class="song-list">
        <div
          v-for="(song, i) in playerStore.songs"
          :key="song.id"
          class="song-item"
        >
          <span class="song-index">{{ i + 1 }}</span>
          <div class="song-cover" @click="playerStore.playSong(song)">
            <img :src="song.cover" :alt="song.title" loading="lazy" />
            <div class="song-cover-play" @click.stop="playerStore.playSong(song)">
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
            <button
              class="like-btn" v-like-burst
              :class="{ liked: playerStore.isLiked(song.id) }"
              @click.stop="playerStore.toggleLikeSong(song.id)"
            >
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
            <button class="add-btn" @click.stop="playerStore.insertNext(song)" title="下一首播放">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 10h11v4H3v-4zm14 0h4v4h-4v-4zM5 6l7 4-7 4V6z M14 6l7 4-7 4V6z"/></svg>
            </button>
            <button class="add-btn" @click.stop="playerStore.addToQueue(song)" title="加入队列">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 10h11v4H3v-4zm14 0h2v4h-2v-4zM5 6h2v12H5V6z"/></svg>
            </button>
            <span class="song-duration" v-if="song.duration">{{ formatTime(song.duration) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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

const hasLyrics = (id) => playerStore.hasLyrics(id)

const formatTime = (s) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const playAll = () => {
  if (playerStore.songs.length > 0) {
    const playlist = {
      id: 'all-songs',
      name: '全部歌曲',
      songs: playerStore.songs.map(s => s.id)
    }
    playerStore.playPlaylist(playlist)
  }
}
</script>

<style scoped>
.immersive-all-songs {
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

.btn-play-all {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.2);
  border-radius: 24px;
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 1);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.btn-play-all:hover {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.25);
  transform: scale(1.05);
}

/* 歌曲列表 */
.song-list {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  overflow: hidden;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  transition: background 0.2s;
}

.song-item:last-child {
  border-bottom: none;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.song-item.is-active {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.08);
}

.song-index {
  width: 28px;
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.song-cover {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-cover-play {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.song-cover:hover .song-cover-play {
  opacity: 1;
}

.song-meta {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.song-title {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.song-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.tag-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.tag-badge.lyrics {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15);
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.9);
}

.tag-badge.mv {
  background: rgba(255, 152, 0, 0.15);
  color: rgba(255, 152, 0, 0.9);
}

.like-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.25);
  cursor: pointer;
  padding: 4px;
  display: flex;
  transition: all 0.2s;
}

.like-btn:hover {
  color: rgba(255, 255, 255, 0.6);
}

.like-btn.liked {
  color: #f5576c;
}

.add-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.2);
  transition: all 0.2s;
  display: flex;
  align-items: center;
}
.add-btn:hover {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8);
  transform: scale(1.15);
}

.song-duration {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  min-width: 36px;
  text-align: right;
}
</style>
