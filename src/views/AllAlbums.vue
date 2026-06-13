<template>
  <div class="all-albums">
    <!-- 头部 -->
    <div class="header">
      <button class="btn-back" @click="goBack">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
      <h1 class="title">全部专辑</h1>
    </div>

    <!-- 专辑网格 -->
    <div class="albums-container">
      <div class="playlist-header">
        <div class="playlist-info">
          <div class="playlist-icon">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
            </svg>
          </div>
          <div class="playlist-meta">
            <h2>全部专辑</h2>
            <p>{{ playerStore.albums.length }} 张专辑</p>
          </div>
        </div>
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
</template>

<script setup>
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import PlaylistCard from '../components/PlaylistCard.vue'

const router = useRouter()
const playerStore = usePlayerStore()

const goBack = () => {
  router.back()
}

const goToAlbum = (id) => {
  router.push(`/album/${id}`)
}

const playAlbum = (album) => {
  playerStore.playAlbum(album)
}
</script>

<style scoped>
.all-albums {
  min-height: 100vh;
  padding-bottom: 100px;
}

/* 头部 */
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.2);
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

/* 专辑列表容器 */
.albums-container {
  padding: 24px;
}

.playlist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.playlist-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.playlist-icon {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.playlist-meta h2 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

.playlist-meta p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}
</style>
