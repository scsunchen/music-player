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
          v-for="album in playerStore.albums.slice(0, 4)"
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
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import PlaylistCard from '../components/PlaylistCard.vue'
import SongItem from '../components/SongItem.vue'

const router = useRouter()
const playerStore = usePlayerStore()

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
</script>

<style scoped>
.home {
  padding: 24px;
  padding-bottom: 100px;
}

.section {
  margin-bottom: 32px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 600;
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
