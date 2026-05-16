<template>
  <div class="home">
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

    <!-- 每日10首 -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">每日10首</h2>
        <span class="badge-daily">今日推荐</span>
      </div>
      <div class="daily-songs-card">
        <div class="daily-header">
          <div class="daily-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div class="daily-info">
            <h3>为你精心挑选</h3>
            <p>根据你的喜好推荐今日必听</p>
          </div>
          <button class="btn-play-all" @click="playDailySongs">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M8 5v14l11-7z"/>
            </svg>
            播放全部
          </button>
        </div>
        <div class="song-list compact">
          <SongItem
            v-for="(song, index) in dailySongs"
            :key="song.id"
            :song="song"
            :index="index"
            :show-index="true"
            :show-cover="false"
            @play="playerStore.playSong(song)"
          />
        </div>
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

.badge-daily {
  padding: 2px 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.song-list.compact :deep(.song-item) {
  padding: 10px 16px;
}

/* 每日10首卡片 */
.daily-songs-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  overflow: hidden;
}

.daily-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.daily-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.daily-info {
  flex: 1;
}

.daily-info h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.daily-info p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.btn-play-all {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 20px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.btn-play-all:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}
</style>
