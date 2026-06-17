<template>
  <div class="hot-songs">
    <!-- 头部 -->
    <div class="header">
      <button class="btn-back" @click="goBack">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
      <h1 class="title">热门歌曲</h1>
    </div>

    <!-- 歌曲列表 -->
    <div class="songs-container">
      <div class="playlist-header">
        <div class="playlist-info">
          <div class="playlist-icon">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path fill="currentColor" d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
            </svg>
          </div>
          <div class="playlist-meta">
            <h2>热门歌曲</h2>
            <p>{{ playerStore.songs.length }} 首歌曲</p>
          </div>
        </div>
        <button class="btn-play-all" @click="playAll">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M8 5v14l11-7z"/>
          </svg>
          播放全部
        </button>
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
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import SongItem from '../components/SongItem.vue'

const router = useRouter()
const playerStore = usePlayerStore()

const goBack = () => {
  router.back()
}

const playAll = () => {
  if (playerStore.songs.length > 0) {
    const playlist = {
      id: 'hot-songs',
      name: '热门歌曲',
      songs: playerStore.songs.map(s => s.id)
    }
    playerStore.playPlaylist(playlist)
  }
}
</script>

<style scoped>
.hot-songs {
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

/* 歌曲列表容器 */
.songs-container {
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
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
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

.btn-play-all {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border: none;
  border-radius: 24px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-play-all:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(255, 107, 107, 0.4);
}

.song-list {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
}
</style>
