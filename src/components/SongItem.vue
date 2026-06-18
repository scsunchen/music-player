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
    <img v-if="showCover" :src="song.cover" :alt="song.title" class="cover" loading="lazy" />
    <div class="info" @click.stop="goToDetail">
      <h4 class="title">{{ song.title }}</h4>
      <p class="artist-album">
        <span class="artist">{{ song.artist }}</span>
        <span class="separator" v-if="showAlbum"> - </span>
        <span class="album" v-if="showAlbum">{{ song.album }}</span>
        <span class="lyrics-badge" v-if="hasLyrics" title="有歌词">词</span>
      </p>
    </div>
    <div class="duration" v-if="showDuration">{{ formatDuration(song.duration) }}</div>
    <button 
      class="btn-like" 
      :class="{ liked: isLiked }"
      @click.stop="toggleLike"
    >
      <svg viewBox="0 0 24 24" width="18" height="18">
        <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </button>
    <button class="btn-queue" @click.stop="addToQueue" title="添加到队列">
      <svg viewBox="0 0 24 24" width="18" height="18">
        <path fill="currentColor" d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
      </svg>
    </button>
    <button class="btn-play" @click.stop="handlePlayClick">
      <svg v-if="!isActive || !playerStore.isPlaying" viewBox="0 0 24 24" width="20" height="20">
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
import { useRouter } from 'vue-router'
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

const emit = defineEmits(['click', 'play'])

const router = useRouter()
const playerStore = usePlayerStore()

const isActive = computed(() => {
  return playerStore.currentSong?.id === props.song.id
})

const handlePlayClick = () => {
  if (isActive.value && playerStore.isPlaying) {
    // 当前歌曲正在播放，暂停
    playerStore.togglePlay()
  } else {
    // 播放歌曲
    emit('play')
  }
}

const isLiked = computed(() => {
  return playerStore.isLiked(props.song.id)
})

const hasLyrics = computed(() => {
  const data = playerStore.lyricsData[props.song.id]
  return data && data.lyrics && data.lyrics.trim().length > 0
})

const toggleLike = () => {
  playerStore.toggleLikeSong(props.song.id)
}

const addToQueue = () => {
  playerStore.addToQueue(props.song)
}

const goToDetail = () => {
  router.push(`/song/${props.song.id}`)
}

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

.lyrics-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
  padding: 0 5px;
  height: 16px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  color: rgba(102, 126, 234, 0.8);
  background: rgba(102, 126, 234, 0.12);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 3px;
  vertical-align: middle;
  flex-shrink: 0;
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

.btn-like {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.song-item:hover .btn-like {
  opacity: 1;
}

.btn-like:hover {
  color: rgba(245, 87, 108, 0.8);
}

.btn-like.liked {
  opacity: 1;
  color: #f5576c;
}

.btn-like.liked:hover {
  color: rgba(245, 87, 108, 0.7);
}

.btn-queue {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.song-item:hover .btn-queue {
  opacity: 1;
}

.btn-queue:hover {
  color: var(--theme-color, #667eea);
  background: rgba(102, 126, 234, 0.2);
}
</style>
