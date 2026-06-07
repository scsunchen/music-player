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
        <div class="actions">
          <button class="play-all-btn" @click="playAll">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M8 5v14l11-7z"/>
            </svg>
            播放全部
          </button>
          <button class="btn-share" @click="openShare">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
            </svg>
            分享
          </button>
        </div>
      </div>
    </div>

    <div class="song-list">
      <SongItem
        v-for="(song, index) in songs"
        :key="song.id"
        :song="song"
        :index="index"
        :show-index="true"
        :show-cover="false"
        @play="playSongAt(index)"
      />
    </div>

    <!-- 分享弹窗 -->
    <ShareModal
      v-if="playlist"
      :visible="showShare"
      type="playlist"
      :data="playlist"
      @close="showShare = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import SongItem from '../components/SongItem.vue'
import ShareModal from '../components/ShareModal.vue'

const route = useRoute()
const playerStore = usePlayerStore()
const showShare = ref(false)

const playlist = computed(() => {
  const id = parseInt(route?.params?.id)
  if (!id || isNaN(id)) return null
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

const openShare = () => {
  showShare.value = true
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

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
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
}

.play-all-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.btn-share {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-share:hover {
  background: rgba(255, 255, 255, 0.2);
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
