<template>
  <div class="album-detail" v-if="album">
    <div class="header">
      <img :src="album.cover" :alt="album.name" class="cover" />
      <div class="info">
        <span class="type">专辑</span>
        <h1 class="name">{{ album.name }}</h1>
        <p class="artist">{{ album.artist }}</p>
        <p class="meta">
          <span>{{ album.releaseDate }}</span>
          <span> · {{ songs.length }} 首歌曲</span>
        </p>
        <button class="play-all-btn" @click="playAll">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M8 5v14l11-7z"/>
          </svg>
          播放专辑
        </button>
      </div>
    </div>

    <div class="song-list">
      <SongItem
        v-for="(song, index) in songs"
        :key="song.id"
        :song="song"
        :index="index"
        :show-index="true"
        :show-album="false"
        @play="playSongAt(index)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import SongItem from '../components/SongItem.vue'

const route = useRoute()
const playerStore = usePlayerStore()

const album = computed(() => {
  const id = parseInt(route.params.id)
  return playerStore.albums.find(a => a.id === id)
})

const songs = computed(() => {
  if (!album.value) return []
  return album.value.songs.map(id => 
    playerStore.songs.find(s => s.id === id)
  ).filter(Boolean)
})

const playAll = () => {
  if (album.value) {
    playerStore.playAlbum(album.value)
  }
}

const playSongAt = (index) => {
  if (album.value) {
    playerStore.playPlaylist({ songs: album.value.songs }, index)
  }
}
</script>

<style scoped>
.album-detail {
  padding: 24px;
  padding-bottom: 100px;
}

.header {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

.cover {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.type {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
}

.name {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.artist {
  margin: 0 0 8px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.meta {
  margin: 0 0 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.play-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 24px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  width: fit-content;
  max-width: 200px;
}

.play-all-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.song-list {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
}

@media (max-width: 600px) {
  .header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .cover {
    width: 160px;
    height: 160px;
  }
}
</style>
