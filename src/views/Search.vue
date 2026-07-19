<template>
  <div class="immersive-search" :style="dynamicStyle">
    <!-- 轻量氛围背景 -->
    <div class="atmosphere">
      <div class="atmo-gradient"></div>
      <div class="atmo-orb atmo-orb-1"></div>
    </div>

    <div class="content-layer">
      <!-- 页面标题 -->
      <header class="page-header">
        <span class="header-label">SEARCH</span>
        <h1 class="header-title">搜索</h1>
      </header>

      <!-- 搜索框 -->
      <div class="search-bar">
        <svg viewBox="0 0 24 24" width="18" height="18" class="search-icon">
          <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索歌曲、歌手、专辑..."
          class="search-input"
          @input="handleSearch"
          @keyup.enter="saveSearchHistory"
        />
        <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>

      <!-- 搜索历史 -->
      <section class="history-section" v-if="!searchQuery && searchHistory.length > 0">
        <div class="section-header">
          <h3 class="section-title">搜索历史</h3>
          <button class="clear-history-btn" @click="clearHistory">
            <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            清空
          </button>
        </div>
        <div class="history-tags">
          <span
            v-for="(item, index) in searchHistory"
            :key="index"
            class="history-tag"
            @click="searchQuery = item"
          >
            <svg viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M13 3a9 9 0 00-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21a9 9 0 000-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
            {{ item }}
          </span>
        </div>
      </section>

      <!-- 搜索结果 -->
      <section v-if="searchQuery">
        <!-- 歌曲结果 -->
        <div class="result-section" v-if="filteredSongs.length > 0">
          <div class="section-header">
            <h3 class="section-title">歌曲</h3>
            <span class="section-count">{{ filteredSongs.length }} 首</span>
          </div>
          <div class="song-list">
            <div
              v-for="song in filteredSongs"
              :key="song.id"
              class="song-item"
            >
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
                  class="like-btn"
                  :class="{ liked: playerStore.isLiked(song.id) }"
                  @click.stop="playerStore.toggleLikeSong(song.id)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </button>
                <button class="add-btn" @click.stop="showAddModal(song)" title="添加到歌单">
                  <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                </button>
                <span class="song-duration" v-if="song.duration">{{ formatTime(song.duration) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 专辑结果 -->
        <div class="result-section" v-if="filteredAlbums.length > 0">
          <div class="section-header">
            <h3 class="section-title">专辑</h3>
            <span class="section-count">{{ filteredAlbums.length }} 张</span>
          </div>
          <div class="album-grid">
            <div
              v-for="album in filteredAlbums"
              :key="album.id"
              class="album-card"
              @click="goToAlbum(album.id)"
            >
              <div class="album-cover">
                <img :src="album.cover" :alt="album.name" loading="lazy" />
                <div class="album-cover-play" @click.stop="playAlbum(album)">
                  <svg viewBox="0 0 24 24" width="14" height="14"><path fill="#fff" d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <div class="album-info">
                <span class="album-name">{{ album.name }}</span>
                <span class="album-meta">{{ album.songs?.length || 0 }} 首</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 无结果 -->
        <div class="empty-state" v-if="filteredSongs.length === 0 && filteredAlbums.length === 0">
          <svg viewBox="0 0 24 24" width="40" height="40" class="empty-icon"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <p>未找到「{{ searchQuery }}」相关结果</p>
        </div>
      </section>

      <!-- 未搜索时展示歌曲库 -->
      <section v-else>
        <!-- 全部歌曲 -->
        <div class="library-section">
          <div class="section-header">
            <h3 class="section-title">全部歌曲</h3>
            <span class="section-count">{{ playerStore.songs.length }} 首</span>
          </div>
          <div class="song-list">
            <div
              v-for="song in playerStore.songs"
              :key="song.id"
              class="song-item"
            >
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
                  class="like-btn"
                  :class="{ liked: playerStore.isLiked(song.id) }"
                  @click.stop="playerStore.toggleLikeSong(song.id)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </button>
                <span class="song-duration" v-if="song.duration">{{ formatTime(song.duration) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 全部专辑 -->
        <div class="library-section">
          <div class="section-header">
            <h3 class="section-title">全部专辑</h3>
            <span class="section-count">{{ playerStore.albums.length }} 张</span>
          </div>
          <div class="album-grid">
            <div
              v-for="album in playerStore.albums"
              :key="album.id"
              class="album-card"
              @click="goToAlbum(album.id)"
            >
              <div class="album-cover">
                <img :src="album.cover" :alt="album.name" loading="lazy" />
                <div class="album-cover-play" @click.stop="playAlbum(album)">
                  <svg viewBox="0 0 24 24" width="14" height="14"><path fill="#fff" d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <div class="album-info">
                <span class="album-name">{{ album.name }}</span>
                <span class="album-meta">{{ album.songs?.length || 0 }} 首</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="bottom-space"></div>
    </div>

    <!-- 添加到歌单弹窗 -->
    <div class="modal-overlay" v-if="showModal" @click="closeModal">
      <div class="modal" @click.stop>
        <h3 class="modal-title">添加到歌单</h3>
        <div class="modal-list">
          <button
            v-for="playlist in playerStore.customPlaylists"
            :key="playlist.id"
            class="modal-item"
            :class="{ disabled: playlist.songs.includes(selectedSong?.id) }"
            @click="addToPlaylist(playlist.id)"
          >
            <img :src="playlist.cover" class="modal-item-cover" />
            <div class="modal-item-info">
              <span>{{ playlist.name }}</span>
              <span v-if="playlist.songs.includes(selectedSong?.id)" class="modal-item-hint">已添加</span>
            </div>
          </button>
          <p v-if="playerStore.customPlaylists.length === 0" class="modal-empty">
            请先创建一个歌单
          </p>
        </div>
        <button class="modal-close" @click="closeModal">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'

const router = useRouter()
const playerStore = usePlayerStore()

const searchQuery = ref('')
const debouncedQuery = ref('')
let debounceTimer = null

// 搜索历史
const searchHistory = ref([])
const MAX_HISTORY = 10

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

// 加载搜索历史
const loadSearchHistory = () => {
  const saved = localStorage.getItem('searchHistory')
  if (saved) {
    try {
      searchHistory.value = JSON.parse(saved)
    } catch (e) {}
  }
}

// 保存搜索历史
const saveSearchHistory = () => {
  if (!searchQuery.value.trim()) return
  const query = searchQuery.value.trim()
  searchHistory.value = [query, ...searchHistory.value.filter(h => h !== query)].slice(0, MAX_HISTORY)
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// 清空搜索历史
const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
}

loadSearchHistory()

// 防抖处理搜索输入
watch(searchQuery, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = val
  }, 300)
})

const filteredSongs = computed(() => {
  if (!debouncedQuery.value) return []
  const query = debouncedQuery.value.toLowerCase()
  return playerStore.songs.filter(song => {
    const title = song.title?.toLowerCase() || ''
    const artist = song.artist?.toLowerCase() || ''
    const album = song.album?.toLowerCase() || ''
    return title.includes(query) || artist.includes(query) || album.includes(query)
  })
})

const filteredAlbums = computed(() => {
  if (!debouncedQuery.value) return []
  const query = debouncedQuery.value.toLowerCase()
  return playerStore.albums.filter(album => {
    const name = album.name?.toLowerCase() || ''
    return name.includes(query)
  })
})

const handleSearch = () => {}

const goToAlbum = (id) => router.push(`/album/${id}`)
const playAlbum = (album) => playerStore.playAlbum(album)

const formatTime = (s) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

// 添加到歌单弹窗
const showModal = ref(false)
const selectedSong = ref(null)
const showAddModal = (song) => {
  selectedSong.value = song
  showModal.value = true
}
const closeModal = () => {
  showModal.value = false
  selectedSong.value = null
}
const addToPlaylist = (playlistId) => {
  if (selectedSong.value) {
    playerStore.addToPlaylist(playlistId, selectedSong.value.id)
    closeModal()
  }
}

// 防抖处理搜索输入
watch(searchQuery, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = val
  }, 300)
})

</script>

<style scoped>
.immersive-search {
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
  width: 280px;
  height: 280px;
  top: -70px;
  right: -30px;
}

@keyframes orbFloat {
  0% { transform: translate(0, 0); }
  100% { transform: translate(18px, -22px); }
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
  margin-bottom: 24px;
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

/* 搜索框 */
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 32px;
}

.search-icon {
  position: absolute;
  left: 18px;
  color: rgba(255, 255, 255, 0.3);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 14px 48px 14px 50px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  font-size: 15px;
  color: #fff;
  outline: none;
  transition: all 0.3s;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.3);
  box-shadow: 0 0 0 3px rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.06);
}

.clear-search {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.clear-search:hover {
  color: rgba(255, 255, 255, 0.7);
}

/* 搜索历史 */
.history-section {
  margin-bottom: 36px;
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

.clear-history-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.clear-history-btn:hover {
  color: rgba(255, 82, 82, 0.8);
  background: rgba(255, 82, 82, 0.08);
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: all 0.25s;
}

.history-tag:hover {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.1);
  border-color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15);
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.9);
}

.history-tag svg {
  color: rgba(255, 255, 255, 0.2);
}

.history-tag:hover svg {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.5);
}

/* 结果区块 */
.result-section {
  margin-bottom: 40px;
}

.library-section {
  margin-bottom: 48px;
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

/* 专辑网格 */
.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

@media (min-width: 768px) {
  .album-grid { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); }
}

.album-card {
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.album-card:hover {
  transform: translateY(-4px);
}

.album-card:hover .album-cover-play {
  opacity: 1;
}

.album-cover {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  position: relative;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.album-card:hover .album-cover img {
  transform: scale(1.04);
}

.album-cover-play {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s;
  pointer-events: none;
}

.album-cover-play::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 12px;
}

.album-cover-play svg,
.album-cover-play::before {
  position: relative;
}

.album-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.album-name {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.25);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 24px;
}

.empty-icon {
  color: rgba(255, 255, 255, 0.08);
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0;
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
}

.bottom-space {
  height: 40px;
}

/* ===== 添加到歌单按钮 ===== */
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
}

/* ===== 添加到歌单弹窗 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #1a1a1e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  width: 320px;
  max-width: 90vw;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}
.modal-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.modal-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
}
.modal-item:hover {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.1);
  border-color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15);
}
.modal-item.disabled {
  opacity: 0.4;
  pointer-events: none;
}
.modal-item-cover {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
}
.modal-item-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}
.modal-item-hint {
  font-size: 11px;
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.6);
}
.modal-empty {
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
  padding: 20px 0;
}
.modal-close {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 10px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}
</style>
