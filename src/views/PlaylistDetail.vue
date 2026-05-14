<template>
  <div class="playlist-detail" v-if="playlist">
    <div class="header">
      <img :src="playlist.cover" :alt="playlist.name" class="cover" />
      <div class="info">
        <h1 class="name">{{ playlist.name }}</h1>
        <p class="description" v-if="playlist.description">{{ playlist.description }}</p>
        <p class="meta">
          <span>{{ songs.length }} 首歌曲</span>
          <span v-if="playlist.playCount"> · {{ formatCount(playlist.playCount) }} 次播放</span>
        </p>
        <button class="play-all-btn" @click="playAll">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M8 5v14l11-7z"/>
          </svg>
          播放全部
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

const playlist = computed(() => {
  const id = parseInt(route.params.id)
  return playerStore.recommendPlaylists.find(p => p.id === id) ||
         playerStore.customPlaylists.find(p => p.id === id)
})

const songs = computed(() => {
  if (!playlist.value) return []
  return playlist.value.songs.map(id => 
    playerStore.songs.find(s => s.id === id)
  ).filter(Boolean)
})

const formatCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count
}

const playAll = () => {
  if (playlist.value) {
    playerStore.playPlaylist(playlist.value)
  }
}

const playSongAt = (index) => {
  if (playlist.value) {
    playerStore.playPlaylist(playlist.value, index)
  }
}
</script>

<style scoped>
.playlist-detail {
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

.name {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.description {
  margin: 0 0 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
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
