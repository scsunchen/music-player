<template>
  <div class="home">
    <!-- Banner 区域 -->
    <section class="banner-section">
      <div class="banner-card daily-card" @click="playDailySongs">
        <div class="banner-bg"></div>
        <div class="banner-content">
          <div class="banner-icon">
            <svg viewBox="0 0 24 24" width="40" height="40">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div class="banner-text">
            <h3>每日10首</h3>
            <p>为你精心挑选的今日推荐</p>
          </div>
          <button class="banner-play-btn">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
        <div class="banner-songs-preview">
          <span v-for="(song, i) in dailySongs.slice(0, 5)" :key="i" class="song-tag">{{ song.title }}</span>
          <span class="song-tag more">+{{ dailySongs.length - 5 }}</span>
        </div>
      </div>
    </section>

    <!-- 推荐播放列表 -->
    <section class="section">
      <h2 class="section-title">推荐歌单</h2>
      <div class="playlist-grid">
        <PlaylistCard
          v-for="playlist in playerStore.recommendPlaylists"
          :key="playlist.id"
          :playlist="playlist"
          @click="goToPlaylist(playlist.id)"
          @play="playPlaylist(playlist)"
        />
      </div>
    </section>

    <!-- 最新歌曲 -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">最新歌曲</h2>
        <span class="badge-new">NEW</span>
      </div>
      <div class="song-list">
        <SongItem
          v-for="(song, index) in latestSongs"
          :key="song.id"
          :song="song"
          :index="index"
          :show-index="true"
          @play="playerStore.playSong(song)"
        />
      </div>
    </section>

    <!-- 热门歌曲 -->
    <section class="section">
      <h2 class="section-title">热门歌曲</h2>
      <div class="song-list">
        <SongItem
          v-for="(song, index) in playerStore.songs.slice(0, 6)"
          :key="song.id"
          :song="song"
          :index="index"
          :show-index="true"
          @play="playerStore.playSong(song)"
        />
      </div>
    </section>

    <!-- 新专辑 -->
    <section class="section">
      <h2 class="section-title">新专辑</h2>
      <div class="playlist-grid">
        <PlaylistCard
          v-for="album in latestAlbums"
          :key="album.id"
          :playlist="album"
          @click="goToAlbum(album.id)"
          @play="playAlbum(album)"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import PlaylistCard from '../components/PlaylistCard.vue'
import SongItem from '../components/SongItem.vue'

const router = useRouter()
const playerStore = usePlayerStore()

// 最新歌曲（按id倒序，取最新的6首）
const latestSongs = computed(() => {
  return [...playerStore.songs].sort((a, b) => b.id - a.id).slice(0, 6)
})

// 每日10首（随机选取10首）
const dailySongs = computed(() => {
  const shuffled = [...playerStore.songs].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 10)
})

// 新专辑（包含《风来的方向》，按id倒序）
const latestAlbums = computed(() => {
  return [...playerStore.albums].sort((a, b) => b.id - a.id).slice(0, 5)
})

const goToPlaylist = (id) => {
  router.push(`/playlist/${id}`)
}

const goToAlbum = (id) => {
  router.push(`/album/${id}`)
}

const playPlaylist = (playlist) => {
  playerStore.playPlaylist(playlist)
}

const playAlbum = (album) => {
  playerStore.playAlbum(album)
}

const playDailySongs = () => {
  const playlist = {
    id: 'daily',
    name: '每日10首',
    songs: dailySongs.value.map(s => s.id)
  }
  playerStore.playPlaylist(playlist)
}
</script>

<style scoped>
.home {
  padding: 24px;
  padding-bottom: 100px;
}

/* Banner 区域 */
.banner-section {
  margin-bottom: 32px;
}

.banner-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.banner-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.25);
}

.banner-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  opacity: 0.9;
}

.banner-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.banner-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 28px 32px;
  z-index: 1;
}

.banner-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.banner-text {
  flex: 1;
}

.banner-text h3 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

.banner-text p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.banner-play-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.banner-play-btn:hover {
  transform: scale(1.1);
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

/* 歌曲标签预览 */
.banner-songs-preview {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 32px 24px;
  z-index: 1;
}

.song-tag {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
}

.song-tag.more {
  background: rgba(255, 255, 255, 0.25);
  font-weight: 600;
}

.section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

.badge-new {
  padding: 2px 8px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
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
</style>
