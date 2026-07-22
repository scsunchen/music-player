<template>
  <div class="immersive-liked" :style="dynamicStyle">
    <!-- 轻量氛围背景 -->
    <div class="atmosphere">
      <div class="atmo-gradient"></div>
      <div class="atmo-orb atmo-orb-1"></div>
    </div>

    <div class="content-layer">
      <!-- 头部 -->
      <header class="page-header">
        <button class="btn-back" @click="$router.back()">
          <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div class="header-info">
          <span class="header-label">LIKED SONGS</span>
          <h1 class="header-title">我喜欢</h1>
        </div>
        <button class="btn-play-all" @click="playAll" v-if="likedSongs.length > 0">
          <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <span>播放全部</span>
        </button>
      </header>

      <!-- 空状态 -->
      <div class="empty-state" v-if="likedSongs.length === 0">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" width="40" height="40"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
        <p class="empty-title">还没有收藏喜欢的歌曲</p>
        <p class="empty-hint">点击歌曲列表中的爱心图标，将歌曲添加到这里</p>
        <button class="btn-explore" @click="$router.push('/')">去发现音乐</button>
      </div>

      <!-- 歌曲列表 -->
      <section class="song-list" v-else>
        <div
          v-for="(song, i) in likedSongs"
          :key="song.id"
          class="song-item"
          :class="{ active: playerStore.currentSong?.id === song.id }"
        >
          <span class="song-index" :class="{ playing: playerStore.currentSong?.id === song.id && playerStore.isPlaying }">
            <span v-if="playerStore.currentSong?.id !== song.id">{{ i + 1 }}</span>
            <span class="song-bars" v-else><span class="bar"></span><span class="bar"></span><span class="bar"></span></span>
          </span>
          <div class="song-cover" @click="playerStore.playSong(song)">
            <img :src="song.cover" :alt="song.title" loading="lazy" />
            <div class="song-cover-play">
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
              class="like-btn liked"
              @click.stop="playerStore.toggleLikeSong(song.id)"
            >
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
            <span class="song-duration" v-if="song.duration">{{ formatTime(song.duration) }}</span>
          </div>
        </div>
      </section>

      <div class="bottom-space"></div>
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

const likedSongs = computed(() => playerStore.getLikedSongsList())

const playAll = () => {
  if (likedSongs.value.length > 0) {
    const playlist = {
      id: 'liked',
      name: '我喜欢',
      songs: playerStore.likedSongs
    }
    playerStore.playPlaylist(playlist)
  }
}

const formatTime = (s) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.immersive-liked {
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
  top: -70px;
  right: -50px;
}

@keyframes orbFloat {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(20px, -25px) scale(1.05); }
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
  color: rgba(245, 87, 108, 0.7);
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

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 24px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: rgba(245, 87, 108, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(245, 87, 108, 0.3);
  margin-bottom: 20px;
}

.empty-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
}

.empty-hint {
  margin: 0 0 24px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.25);
  max-width: 280px;
  line-height: 1.5;
}

.btn-explore {
  padding: 12px 28px;
  background: rgba(245, 87, 108, 0.12);
  border: 1px solid rgba(245, 87, 108, 0.2);
  border-radius: 100px;
  color: rgba(245, 87, 108, 0.9);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-explore:hover {
  background: rgba(245, 87, 108, 0.2);
  transform: translateY(-1px);
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
  cursor: pointer;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.song-item:hover .song-cover-play {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
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
