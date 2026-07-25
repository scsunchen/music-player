<template>
  <div class="immersive-song" :style="dynamicStyle" v-if="song">
    <!-- 轻量氛围背景 -->
    <div class="atmosphere">
      <div class="atmo-bg-img" :style="{ backgroundImage: `url(${song.cover})` }"></div>
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
          <span class="header-label">SONG</span>
          <h1 class="header-title">{{ song.title }}</h1>
        </div>
      </header>

      <!-- 歌曲 Hero -->
      <section class="song-hero">
        <div class="hero-cover">
          <img :src="song.cover" :alt="song.title" />
          <div class="hero-cover-glow" v-if="playerStore.isPlaying && playerStore.currentSong?.id === song.id"></div>
        </div>
        <div class="hero-meta">
          <h2 class="hero-title">{{ song.title }}</h2>
          <p class="hero-artist">{{ song.artist }}</p>
          <p class="hero-album">{{ song.album }}</p>
          <div class="hero-tags">
            <span class="hero-tag" v-if="song.duration">{{ formatTime(song.duration) }}</span>
            <span class="hero-tag lyrics" v-if="hasLyrics">词</span>
            <span class="hero-tag mv" v-if="song.mvUrl">MV</span>
            <button
              class="hero-like-btn"
              :class="{ liked: playerStore.isLiked(song.id) }"
              @click="playerStore.toggleLikeSong(song.id)"
            >
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
          </div>
        </div>
      </section>

      <!-- 操作按钮 -->
      <div class="actions">
        <button
          class="btn-play-main"
          @click="handlePlay"
        >
          <svg v-if="!isCurrentPlaying" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          <span>{{ isCurrentPlaying ? '暂停' : '播放' }}</span>
        </button>
        <button v-if="song.mvUrl" class="btn-action" @click="showMV = true" title="观看 MV">
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12zM10 8v6l5-3z"/></svg>
        </button>
        <button class="btn-action" @click="showAddToPlaylist = true" title="添加到歌单">
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"/></svg>
        </button>
        <button class="btn-action" @click="openShare" title="分享">
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
        </button>
      </div>

      <!-- 歌曲简介 -->
      <section class="desc-section" v-if="albumInfo?.description">
        <div class="section-header">
          <h3 class="section-title">歌曲简介</h3>
        </div>
        <div class="desc-card">
          <p class="desc-text">{{ albumInfo.description }}</p>
        </div>
      </section>

      <!-- 歌词 -->
      <section class="lyrics-section" v-if="lyricsLines.length > 0">
        <div class="section-header">
          <h3 class="section-title">歌词</h3>
        </div>
        <div class="lyrics-card">
          <p
            v-for="(line, index) in lyricsLines"
            :key="index"
            class="lyric-line"
            :class="{ active: isCurrentLine(index) }"
          >{{ line.text }}</p>
        </div>
      </section>

      <!-- 相关歌曲 -->
      <section class="related-section" v-if="relatedSongs.length > 0">
        <div class="section-header">
          <h3 class="section-title">相关歌曲</h3>
          <span class="section-count">{{ relatedSongs.length }} 首</span>
        </div>
        <div class="song-list">
          <div
            v-for="s in relatedSongs"
            :key="s.id"
            class="song-item"
          >
            <div class="song-cover" @click="playerStore.playSong(s)">
              <img :src="s.cover" :alt="s.title" loading="lazy" />
              <div class="song-cover-play">
                <svg viewBox="0 0 24 24" width="14" height="14"><path fill="#fff" d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <div class="song-meta" @click="router.push(`/song/${s.id}`)">
                <span class="song-title">{{ s.title }}</span>
              <span class="song-artist">{{ s.artist }}</span>
            </div>
            <div class="song-actions">
              <span class="tag-badge lyrics" v-if="hasLyricsFor(s.id)">词</span>
              <span class="tag-badge mv" v-if="s.mvUrl">MV</span>
              <span class="song-duration" v-if="s.duration">{{ formatTime(s.duration) }}</span>
            </div>
          </div>
        </div>
      </section>

      <div class="bottom-space"></div>
    </div>

    <!-- 添加到歌单弹窗 -->
    <div class="modal-overlay" v-if="showAddToPlaylist" @click="showAddToPlaylist = false">
      <div class="modal" @click.stop>
        <h3 class="modal-title">添加到歌单</h3>
        <div class="modal-list">
          <button
            v-for="playlist in playerStore.customPlaylists"
            :key="playlist.id"
            class="modal-item"
            @click="addToPlaylist(playlist.id)"
          >
            <img :src="playlist.cover" class="modal-item-cover" />
            <span>{{ playlist.name }}</span>
          </button>
          <p v-if="playerStore.customPlaylists.length === 0" class="modal-empty">
            还没有创建歌单
          </p>
        </div>
        <button class="modal-close" @click="showAddToPlaylist = false">取消</button>
      </div>
    </div>
  </div>

  <!-- 不存在 -->
  <div class="not-found" v-else>
    <div class="not-found-icon">
      <svg viewBox="0 0 24 24" width="40" height="40"><path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
    </div>
    <p class="not-found-text">歌曲不存在</p>
    <button class="not-found-btn" @click="$router.push('/')">返回首页</button>
  </div>

  <!-- MV播放器 -->
  <MVPlayer :visible="showMV" :song="song" @close="showMV = false" />

  <!-- 分享弹窗 -->
  <ShareModal
    v-if="song"
    :visible="showShare"
    type="song"
    :data="song"
    @close="showShare = false"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import MVPlayer from '../components/MVPlayer.vue'
import ShareModal from '../components/ShareModal.vue'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()

const song = ref(null)
const showAddToPlaylist = ref(false)
const showMV = ref(false)
const showShare = ref(false)

const dynamicStyle = computed(() => {
  const color = playerStore.themeColor || '#667eea'
  return {
    '--dynamic-r': parseInt(color.slice(1, 3), 16),
    '--dynamic-g': parseInt(color.slice(3, 5), 16),
    '--dynamic-b': parseInt(color.slice(5, 7), 16),
  }
})

const hasLyrics = computed(() => song.value ? playerStore.hasLyrics(song.value.id) : false)
const hasLyricsFor = (id) => playerStore.hasLyrics(id)

const lyricsLines = computed(() => {
  if (!song.value) return []
  const raw = playerStore.lyricsData[song.value.id]?.lyrics || ''
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

const albumInfo = computed(() => {
  if (!song.value) return null
  return playerStore.albums.find(a => a.id === song.value.albumId)
})

const relatedSongs = computed(() => {
  if (!song.value) return []
  const album = playerStore.albums.find(a => a.id === song.value.albumId)
  if (!album) return []
  return album.songs
    .map(id => playerStore.songs.find(s => s.id === id))
    .filter(s => s && s.id !== song.value.id)
    .slice(0, 5)
})

const isCurrentPlaying = computed(() => {
  return playerStore.isPlaying && playerStore.currentSong?.id === song.value?.id
})

const isCurrentLine = (index) => {
  if (!playerStore.isPlaying || lyricsLines.value.length === 0) return false
  const currentTime = playerStore.currentTime
  const current = lyricsLines.value[index]
  const next = lyricsLines.value[index + 1]
  if (!current) return false
  if (next) return currentTime >= current.time && currentTime < next.time
  return currentTime >= current.time
}

const loadSong = () => {
  const id = parseInt(route?.params?.id)
  if (!id || isNaN(id)) { song.value = null; return }
  song.value = playerStore.songs.find(s => s.id === id) || null
  // 按需加载歌词（查看歌曲详情时预加载）
  if (song.value) {
    playerStore.loadLyricsForSong(song.value.id)
  }
}

const handlePlay = () => {
  if (!song.value) return
  if (isCurrentPlaying.value) {
    playerStore.togglePlay()
  } else {
    playerStore.playSong(song.value)
  }
}

const addToPlaylist = (playlistId) => {
  if (song.value) {
    playerStore.addToPlaylist(playlistId, song.value.id)
    showAddToPlaylist.value = false
  }
}

const openShare = () => {
  showShare.value = true
}

const formatTime = (s) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

onMounted(() => {
  loadSong()
  window.scrollTo(0, 0)
})

watch(() => route?.params?.id, () => {
  loadSong()
  nextTick(() => window.scrollTo(0, 0))
})
</script>

<style scoped>
.immersive-song {
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
  width: 350px;
  height: 350px;
  top: -100px;
  left: -80px;
}

@keyframes orbFloat {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(25px, -30px) scale(1.06); }
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
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.15);
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

/* Hero */
.song-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.hero-cover {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

@media (min-width: 768px) {
  .hero-cover { width: 240px; height: 240px; }
}

.hero-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-cover-glow {
  position: absolute;
  inset: -6px;
  border-radius: 26px;
  border: 2px solid rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.4);
  animation: coverPulse 2.5s ease-in-out infinite;
}

@keyframes coverPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.03); opacity: 0.15; }
}

.hero-meta {
  text-align: center;
}

.hero-title {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.hero-artist {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
}

.hero-album {
  margin: 0 0 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
}

.hero-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.hero-tag.lyrics {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8);
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.1);
  border-color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15);
}

.hero-tag.mv {
  color: rgba(255, 138, 101, 0.8);
  background: rgba(255, 138, 101, 0.1);
  border-color: rgba(255, 138, 101, 0.15);
}

.hero-like-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(245, 87, 108, 0.06);
  border: 1px solid rgba(245, 87, 108, 0.1);
  color: rgba(255, 255, 255, 0.25);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.hero-like-btn:hover {
  background: rgba(245, 87, 108, 0.15);
  color: rgba(245, 87, 108, 0.8);
  transform: scale(1.1);
}

.hero-like-btn.liked {
  color: #f5576c;
  background: rgba(245, 87, 108, 0.15);
  border-color: rgba(245, 87, 108, 0.2);
}

/* 操作按钮 */
.actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}

.btn-play-main {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15);
  border: 1px solid rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.25);
  border-radius: 100px;
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.9);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-play-main:hover {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.25);
  transform: translateY(-1px);
}

.btn-action {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-action:hover {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.1);
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8);
}

/* 区块 */
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

/* 歌曲简介 */
.desc-section {
  margin-bottom: 36px;
}

.desc-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 20px;
}

.desc-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.45);
}

/* 歌词 */
.lyrics-section {
  margin-bottom: 36px;
}

.lyrics-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 20px 24px;
  max-height: 500px;
  overflow-y: auto;
}

.lyrics-card::-webkit-scrollbar {
  width: 4px;
}

.lyrics-card::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
}

.lyric-line {
  margin: 0;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  transition: all 0.3s;
}

.lyric-line.active {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.95);
  font-weight: 600;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.08);
}

/* 相关歌曲 */
.related-section {
  margin-bottom: 20px;
}

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

/* 不存在 */
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.not-found-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.08);
  margin-bottom: 16px;
}

.not-found-text {
  margin: 0 0 16px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.4);
}

.not-found-btn {
  padding: 12px 28px;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.12);
  border: 1px solid rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.2);
  border-radius: 100px;
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.9);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.not-found-btn:hover {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.2);
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  width: 90%;
  max-width: 400px;
  background: #141416;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  padding: 24px;
}

.modal-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.modal-list {
  max-height: 300px;
  overflow-y: auto;
}

.modal-item {
  width: 100%;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.modal-item:hover {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.1);
  border-color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15);
}

.modal-item-cover {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.modal-empty {
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  padding: 16px;
  margin: 0;
}

.modal-close {
  width: 100%;
  padding: 12px;
  margin-top: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}
</style>
