<template>
  <div class="all-playlists">
    <!-- 头部 -->
    <div class="header">
      <button class="btn-back" @click="goBack">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
      <h1 class="title">推荐歌单</h1>
    </div>

    <!-- 歌单网格 -->
    <div class="playlists-container">
      <div class="playlist-header">
        <div class="playlist-info">
          <div class="playlist-icon">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path fill="currentColor" d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
            </svg>
          </div>
          <div class="playlist-meta">
            <h2>推荐歌单</h2>
            <p>{{ playerStore.recommendPlaylists.length }} 个歌单</p>
          </div>
        </div>
      </div>

      <div class="playlist-grid">
        <PlaylistCard
          v-for="playlist in playerStore.recommendPlaylists"
          :key="playlist.id"
          :playlist="playlist"
          @click="goToPlaylist(playlist.id)"
          @play="playPlaylist(playlist)"
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

const goToPlaylist = (id) => {
  router.push(`/playlist/${id}`)
}

const playPlaylist = (playlist) => {
  playerStore.playPlaylist(playlist)
}
</script>

<style scoped>
.all-playlists {
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

/* 歌单列表容器 */
.playlists-container {
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
