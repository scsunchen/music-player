<template>
  <div class="search-page">
    <div class="search-header">
      <div class="search-input-wrapper">
        <svg viewBox="0 0 24 24" width="20" height="20" class="search-icon">
          <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="搜索歌曲、歌手、专辑"
          class="search-input"
          @input="handleSearch"
          @keyup.enter="saveSearchHistory"
        />
      </div>
    </div>

    <!-- 搜索历史 -->
    <div class="search-history" v-if="!searchQuery && searchHistory.length > 0">
      <div class="history-header">
        <h3 class="history-title">搜索历史</h3>
        <button class="clear-btn" @click="clearHistory">清空</button>
      </div>
      <div class="history-list">
        <span 
          v-for="(item, index) in searchHistory" 
          :key="index"
          class="history-item"
          @click="searchQuery = item"
        >
          {{ item }}
        </span>
      </div>
    </div>

    <div class="search-results" v-if="searchQuery">
      <div class="result-section" v-if="filteredSongs.length > 0">
        <h3 class="result-title">歌曲</h3>
        <div class="song-list">
          <SongItem
            v-for="song in filteredSongs"
            :key="song.id"
            :song="song"
            @play="playerStore.playSong(song)"
          />
        </div>
      </div>

      <div class="result-section" v-if="filteredAlbums.length > 0">
        <h3 class="result-title">专辑</h3>
        <div class="playlist-grid">
          <PlaylistCard
            v-for="album in filteredAlbums"
            :key="album.id"
            :playlist="album"
            @click="goToAlbum(album.id)"
            @play="playAlbum(album)"
          />
        </div>
      </div>

      <div class="no-results" v-if="filteredSongs.length === 0 && filteredAlbums.length === 0">
        <p>未找到相关结果</p>
      </div>
    </div>

    <!-- 未搜索时展示歌曲库 -->
    <div class="library-view" v-else>
      <!-- 全部歌曲 -->
      <div class="library-section">
        <div class="section-header">
          <h3 class="section-title">全部歌曲</h3>
          <span class="song-count">共 {{ playerStore.songs.length }} 首</span>
        </div>
        <div class="song-list">
          <SongItem
            v-for="(song, index) in playerStore.songs"
            :key="song.id"
            :song="song"
            :index="index"
            :show-index="true"
            @play="playerStore.playSong(song)"
          />
        </div>
      </div>

      <!-- 全部专辑 -->
      <div class="library-section">
        <div class="section-header">
          <h3 class="section-title">全部专辑</h3>
          <span class="song-count">共 {{ playerStore.albums.length }} 张</span>
        </div>
        <div class="playlist-grid">
          <PlaylistCard
            v-for="album in playerStore.albums"
            :key="album.id"
            :playlist="album"
            @click="goToAlbum(album.id)"
            @play="playAlbum(album)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import SongItem from '../components/SongItem.vue'
import PlaylistCard from '../components/PlaylistCard.vue'

const router = useRouter()
const playerStore = usePlayerStore()

const searchQuery = ref('')
const debouncedQuery = ref('')
let debounceTimer = null

// 搜索历史
const searchHistory = ref([])
const MAX_HISTORY = 10

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
  // 去重并移到最前
  searchHistory.value = [query, ...searchHistory.value.filter(h => h !== query)].slice(0, MAX_HISTORY)
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// 清空搜索历史
const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
}

// 初始化加载
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

const handleSearch = () => {
  // 搜索逻辑已在 computed 中处理
}

const goToAlbum = (id) => {
  router.push(`/album/${id}`)
}

const playAlbum = (album) => {
  playerStore.playAlbum(album)
}
</script>

<style scoped>
.search-page {
  padding: 24px;
  padding-bottom: 100px;
}

.search-header {
  margin-bottom: 24px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: rgba(255, 255, 255, 0.5);
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  font-size: 14px;
  color: #fff;
  outline: none;
  transition: all 0.3s;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(102, 126, 234, 0.5);
}

.result-section {
  margin-bottom: 32px;
}

.result-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.song-list {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
}

/* 搜索历史 */
.search-history {
  margin-bottom: 24px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.clear-btn {
  padding: 4px 12px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  cursor: pointer;
}

.clear-btn:hover {
  color: #f5576c;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-item {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:hover {
  background: rgba(102, 126, 234, 0.3);
  color: #fff;
}

.no-results {
  text-align: center;
  padding: 48px 24px;
  color: rgba(255, 255, 255, 0.4);
}

/* 歌曲库视图 */
.library-view {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.library-section {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.song-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}
</style>
