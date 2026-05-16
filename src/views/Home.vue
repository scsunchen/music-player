<template>
  <div class="home">
    <!-- Banner 区域 -->
    <section class="banner-section">
      <div class="banner-row">
        <!-- 每日10首 -->
        <div class="banner-card daily-card" @click="playDailySongs">
          <div class="banner-bg"></div>
          <div class="banner-content">
            <div class="banner-icon">
              <svg viewBox="0 0 24 24" width="36" height="36">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div class="banner-text">
              <h3>每日10首</h3>
              <p>为你精心挑选</p>
            </div>
            <button class="banner-play-btn">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 我喜欢 -->
        <div class="banner-card liked-card" @click="goToLikedSongs">
          <div class="banner-bg liked-bg"></div>
          <div class="banner-content">
            <div class="banner-icon liked-icon">
              <svg viewBox="0 0 24 24" width="36" height="36">
                <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div class="banner-text">
              <h3>我喜欢</h3>
              <p>{{ likedCount }} 首收藏</p>
            </div>
            <button class="banner-play-btn">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
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

    <!-- 最新歌曲 & 热门歌曲 -->
    <section class="section songs-two-column">
      <div class="songs-column">
        <div class="section-header">
          <h2 class="section-title">最新歌曲 <span class="badge-new">NEW</span></h2>
        </div>
        <div class="song-list compact">
          <SongItem
            v-for="(song, index) in latestSongs"
            :key="song.id"
            :song="song"
            :index="index"
            :show-index="true"
            @play="playerStore.playSong(song)"
          />
        </div>
      </div>
      <div class="songs-column">
        <div class="section-header">
          <h2 class="section-title">热门歌曲 <span class="badge-hot">HOT</span></h2>
        </div>
        <div class="song-list compact">
          <SongItem
            v-for="(song, index) in playerStore.songs.slice(0, 6)"
            :key="song.id"
            :song="song"
            :index="index"
            :show-index="true"
            @play="playerStore.playSong(song)"
          />
        </div>
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

// 我喜欢歌曲数量
const likedCount = computed(() => {
  return playerStore.likedSongs.length
})

// 跳转到我喜欢列表
const goToLikedSongs = () => {
  router.push('/liked')
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

.banner-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

.liked-card:hover {
  box-shadow: 0 12px 40px rgba(245, 87, 108, 0.25);
}

.banner-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  opacity: 0.9;
}

.liked-bg {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #ff6b6b 100%);
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

.liked-icon {
  background: rgba(255, 255, 255, 0.25);
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
  display: inline-block;
  padding: 2px 6px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  margin-left: 8px;
  vertical-align: middle;
}

.badge-hot {
  display: inline-block;
  padding: 2px 6px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  margin-left: 8px;
  vertical-align: middle;
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

/* 两列歌曲布局 - 默认手机端：两行 */
.songs-two-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.songs-column {
  min-width: 0;
}

.songs-column .section-title {
  margin-bottom: 16px;
}

.song-list.compact :deep(.song-item) {
  padding: 10px 12px;
}

.song-list.compact :deep(.cover) {
  width: 40px;
  height: 40px;
}

.song-list.compact :deep(.title) {
  font-size: 13px;
}

.song-list.compact :deep(.artist-album) {
  font-size: 11px;
}

/* 电脑端：一行两列 */
@media (min-width: 768px) {
  .songs-two-column {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-items: stretch;
  }

  .songs-column {
    display: flex;
    flex-direction: column;
  }

  .songs-column .section-header {
    flex-shrink: 0;
    margin-bottom: 16px;
  }

  .songs-column .song-list {
    flex: 1;
  }
}
</style>
