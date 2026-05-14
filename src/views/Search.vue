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
        />
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

    <div class="search-placeholder" v-else>
      <p>输入关键词搜索歌曲、歌手或专辑</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import SongItem from '../components/SongItem.vue'
import PlaylistCard from '../components/PlaylistCard.vue'

const router = useRouter()
const playerStore = usePlayerStore()

const searchQuery = ref('')

const filteredSongs = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return playerStore.songs.filter(song => 
    song.title.toLowerCase().includes(query) ||
    song.artist.toLowerCase().includes(query) ||
    song.album.toLowerCase().includes(query)
  )
})

const filteredAlbums = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return playerStore.albums.filter(album =>
    album.name.toLowerCase().includes(query) ||
    album.artist.toLowerCase().includes(query)
  )
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

.no-results,
.search-placeholder {
  text-align: center;
  padding: 48px 24px;
  color: rgba(255, 255, 255, 0.4);
}
</style>
