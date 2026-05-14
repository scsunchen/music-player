<template>
  <div 
    class="song-item" 
    :class="{ active: isActive }"
    @click="$emit('click')"
  >
    <div class="index" v-if="showIndex">
      <span v-if="!isActive">{{ index + 1 }}</span>
      <svg v-else viewBox="0 0 24 24" width="16" height="16" class="playing-icon">
        <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
    </div>
    <img :src="song.cover" :alt="song.title" class="cover" v-if="showCover" />
    <div class="info">
      <h4 class="title">{{ song.title }}</h4>
      <p class="artist-album">
        <span class="artist">{{ song.artist }}</span>
        <span class="separator" v-if="showAlbum"> - </span>
        <span class="album" v-if="showAlbum">{{ song.album }}</span>
      </p>
    </div>
    <div class="duration" v-if="showDuration">{{ formatDuration(song.duration) }}</div>
    <button class="btn-play" @click.stop="$emit('play')">
      <svg v-if="!isActive" viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M8 5v14l11-7z"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '../stores/player'

const props = defineProps({
  song: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  },
  showIndex: {
    type: Boolean,
    default: false
  },
  showCover: {
    type: Boolean,
    default: true
  },
  showAlbum: {
    type: Boolean,
    default: true
  },
  showDuration: {
    type: Boolean,
    default: true
  }
})

defineEmits(['click', 'play'])

const playerStore = usePlayerStore()

const isActive = computed(() => {
  return playerStore.currentSong?.id === props.song.id
})

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.song-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.song-item.active {
  background: rgba(102, 126, 234, 0.2);
}

.song-item.active .title {
  color: #667eea;
}

.index {
  width: 24px;
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
}

.playing-icon {
  color: #667eea;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.cover {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
}

.info {
  flex: 1;
  min-width: 0;
}

.title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-album {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.separator {
  margin: 0 4px;
}

.duration {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  min-width: 40px;
  text-align: right;
}

.btn-play {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.song-item:hover .btn-play {
  opacity: 1;
}

.btn-play:hover {
  background: rgba(102, 126, 234, 0.3);
  color: #667eea;
}
</style>
