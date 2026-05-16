<template>
  <div class="liked-songs">
    <!-- 头部 -->
    <div class="header">
      <button class="btn-back" @click="goBack">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
      <h1 class="title">我喜欢</h1>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="likedSongs.length === 0">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" width="64" height="64">
          <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      <p class="empty-text">还没有收藏喜欢的歌曲</p>
      <p class="empty-hint">点击歌曲列表中的爱心图标，将歌曲添加到"我喜欢"</p>
      <button class="btn-explore" @click="goHome">去发现音乐</button>
    </div>

    <!-- 歌曲列表 -->
    <div class="songs-container" v-else>
      <div class="playlist-header">
        <div class="playlist-info">
          <div class="playlist-icon">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div class="playlist-meta">
            <h2>我喜欢</h2>
            <p>{{ likedSongs.length }} 首歌曲</p>
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
          v-for="(song, index) in likedSongs"
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
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import SongItem from '../components/SongItem.vue'

const router = useRouter()
const playerStore = usePlayerStore()

const likedSongs = computed(() => {
  return playerStore.getLikedSongsList()
})

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}

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
</script>

<style scoped>
.liked-songs {
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

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}

.empty-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(245, 87, 108, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(245, 87, 108, 0.5);
  margin-bottom: 24px;
}

.empty-text {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.empty-hint {
  margin: 0 0 24px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.btn-explore {
  padding: 12px 32px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  border-radius: 24px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-explore:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(245, 87, 108, 0.4);
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
  box-shadow: 0 8px 24px rgba(245, 87, 108, 0.4);
}

.song-list {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
}
</style>
