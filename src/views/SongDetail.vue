<template>
  <div class="song-detail" v-if="song">
    <!-- 虚化封面背景 -->
    <div class="hero-bg">
      <img :src="song.cover" :alt="song.title" class="bg-image" />
      <div class="bg-overlay"></div>
    </div>

    <!-- 返回按钮 -->
    <button class="btn-back" @click="goBack">
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
      </svg>
    </button>

    <!-- 歌曲信息区域 -->
    <div class="song-hero">
      <div class="cover-container">
        <img :src="song.cover" :alt="song.title" class="cover-image" />
        <div class="cover-glow" v-if="playerStore.isPlaying && playerStore.currentSong?.id === song.id"></div>
      </div>
      <div class="song-meta">
        <h1 class="song-title">{{ song.title }}</h1>
        <p class="song-artist">{{ song.artist }}</p>
        <p class="song-album">{{ song.album }}</p>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button 
        class="btn-play-main" 
        :class="{ playing: playerStore.isPlaying && playerStore.currentSong?.id === song.id }"
        @click="handlePlay"
      >
        <svg v-if="!isCurrentPlaying" viewBox="0 0 24 24" width="28" height="28">
          <path fill="currentColor" d="M8 5v14l11-7z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="28" height="28">
          <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
        <span>{{ isCurrentPlaying ? '暂停' : '播放' }}</span>
      </button>
      <button class="btn-action" @click="playerStore.addToPlaylist?.(song.id)">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path fill="currentColor" d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"/>
        </svg>
      </button>
    </div>

    <!-- 歌曲描述 -->
    <div class="song-description" v-if="albumInfo?.description">
      <div class="desc-header">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        <span>歌曲简介</span>
      </div>
      <p class="desc-text">{{ albumInfo.description }}</p>
    </div>

    <!-- 歌词区域 -->
    <div class="lyrics-section" v-if="lyricsLines.length > 0">
      <div class="lyrics-header">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        <span>歌词</span>
      </div>
      <div class="lyrics-content" ref="lyricsRef">
        <p 
          v-for="(line, index) in lyricsLines" 
          :key="index"
          class="lyric-line"
          :class="{ active: isCurrentLine(index) }"
          :ref="el => { if (isCurrentLine(index)) activeLyricEl = el }"
        >{{ line.text }}</p>
        <p v-if="lyricsLines.length === 0" class="no-lyrics">暂无歌词</p>
      </div>
    </div>

    <!-- 相关歌曲 -->
    <div class="related-section" v-if="relatedSongs.length > 0">
      <h3 class="section-title">相关歌曲</h3>
      <div class="song-list">
        <SongItem
          v-for="s in relatedSongs"
          :key="s.id"
          :song="s"
          @play="playerStore.playSong(s)"
        />
      </div>
    </div>
  </div>

  <div class="not-found" v-else>
    <p>歌曲不存在</p>
    <button @click="$router.push('/')">返回首页</button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import SongItem from '../components/SongItem.vue'
import lyricsData from '../data/lyrics.json'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()

const song = ref(null)
const lyricsRef = ref(null)
const activeLyricEl = ref(null)

// 解析歌词
const lyricsLines = computed(() => {
  if (!song.value) return []
  const raw = lyricsData[song.value.id]?.lyrics || ''
  return raw.split('\n')
    .filter(line => line.trim())
    .map(line => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)/)
      if (match) {
        const minutes = parseInt(match[1])
        const seconds = parseInt(match[2])
        const ms = parseInt(match[3])
        const time = minutes * 60 + seconds + ms / (match[3].length === 3 ? 1000 : 100)
        const text = match[4]
        if (!text) return null
        return { time, text }
      }
      return null
    })
    .filter(Boolean)
})

// 专辑信息
const albumInfo = computed(() => {
  if (!song.value) return null
  return playerStore.albums.find(a => a.id === song.value.albumId)
})

// 相关歌曲（同专辑）
const relatedSongs = computed(() => {
  if (!song.value) return []
  const album = playerStore.albums.find(a => a.id === song.value.albumId)
  if (!album) return []
  return album.songs
    .map(id => playerStore.songs.find(s => s.id === id))
    .filter(s => s && s.id !== song.value.id)
    .slice(0, 5)
})

// 是否正在播放当前歌曲
const isCurrentPlaying = computed(() => {
  return playerStore.isPlaying && playerStore.currentSong?.id === song.value?.id
})

// 判断当前歌词行
const isCurrentLine = (index) => {
  if (!playerStore.isPlaying || lyricsLines.value.length === 0) return false
  const currentTime = playerStore.currentTime
  const current = lyricsLines.value[index]
  const next = lyricsLines.value[index + 1]
  if (!current) return false
  if (next) {
    return currentTime >= current.time && currentTime < next.time
  }
  return currentTime >= current.time
}

// 加载歌曲
const loadSong = () => {
  const id = parseInt(route.params.id)
  song.value = playerStore.songs.find(s => s.id === id) || null
}

// 播放/暂停
const handlePlay = () => {
  if (!song.value) return
  if (isCurrentPlaying.value) {
    playerStore.togglePlay()
  } else {
    playerStore.playSong(song.value)
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 歌词自动滚动
watch(() => playerStore.currentTime, () => {
  if (activeLyricEl.value && lyricsRef.value) {
    const container = lyricsRef.value
    const el = activeLyricEl.value
    const containerRect = container.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const offset = elRect.top - containerRect.top - containerRect.height / 3
    container.scrollTo({
      top: container.scrollTop + offset,
      behavior: 'smooth'
    })
  }
})

onMounted(() => {
  loadSong()
})

watch(() => route.params.id, () => {
  loadSong()
  nextTick(() => {
    window.scrollTo(0, 0)
  })
})
</script>

<style scoped>
.song-detail {
  min-height: 100vh;
  padding-bottom: 100px;
  position: relative;
}

/* 虚化封面背景 */
.hero-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 400px;
  z-index: 0;
  overflow: hidden;
}

.bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(40px) brightness(0.4) saturate(1.5);
  transform: scale(1.2);
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(18, 18, 30, 0.3) 0%,
    rgba(18, 18, 30, 0.7) 60%,
    rgba(18, 18, 30, 1) 100%
  );
}

/* 返回按钮 */
.btn-back {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 100;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* 歌曲信息 */
.song-hero {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 24px 24px;
}

.cover-container {
  position: relative;
  margin-bottom: 24px;
}

.cover-image {
  width: 220px;
  height: 220px;
  border-radius: 20px;
  object-fit: cover;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
}

.cover-glow {
  position: absolute;
  inset: -8px;
  border-radius: 28px;
  border: 2px solid rgba(102, 126, 234, 0.4);
  animation: coverPulse 2s ease-in-out infinite;
}

@keyframes coverPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.04); opacity: 0.2; }
}

.song-meta {
  text-align: center;
}

.song-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

.song-artist {
  margin: 0 0 4px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
}

.song-album {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

/* 操作按钮 */
.actions {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 0 24px 32px;
}

.btn-play-main {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 28px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-play-main:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.btn-play-main.playing {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.btn-action {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-action:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

/* 歌曲描述 */
.song-description {
  position: relative;
  z-index: 1;
  margin: 0 24px 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.desc-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 600;
}

.desc-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.55);
}

/* 歌词区域 */
.lyrics-section {
  position: relative;
  z-index: 1;
  margin: 0 24px 32px;
}

.lyrics-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 600;
}

.lyrics-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px 0;
  scroll-behavior: smooth;
}

.lyrics-content::-webkit-scrollbar {
  width: 4px;
}

.lyrics-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.lyric-line {
  margin: 0;
  padding: 10px 16px;
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.35);
  transition: all 0.4s ease;
  border-radius: 8px;
}

.lyric-line.active {
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.1);
}

.no-lyrics {
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  padding: 40px 0;
}

/* 相关歌曲 */
.related-section {
  position: relative;
  z-index: 1;
  margin: 0 24px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.song-list {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: rgba(255, 255, 255, 0.5);
  gap: 16px;
}

.not-found button {
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 20px;
  color: #fff;
  cursor: pointer;
}
</style>
