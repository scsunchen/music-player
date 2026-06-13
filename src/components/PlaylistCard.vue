<template>
  <div class="playlist-card" @click="$emit('click')">
    <div class="cover-wrapper">
      <img :src="playlist.cover" :alt="playlist.name" class="cover" />
      <div class="play-overlay">
        <button class="play-btn" @click.stop="$emit('play')">
          <svg viewBox="0 0 24 24" width="32" height="32">
            <path fill="currentColor" d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>
    </div>
    <h4 class="name">{{ playlist.name }}</h4>
    <p class="meta">
      <span v-if="playlist.playCount">{{ formatCount(playlist.playCount) }} 次播放</span>
      <span v-else>{{ playlist.songs?.length || 0 }} 首歌曲</span>
    </p>
  </div>
</template>

<script setup>
defineProps({
  playlist: {
    type: Object,
    required: true
  }
})

defineEmits(['click', 'play'])

const formatCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count
}
</script>

<style scoped>
.playlist-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.playlist-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
}

.cover-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.playlist-card:hover .play-overlay {
  opacity: 1;
}

.play-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.9);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-btn:hover {
  transform: scale(1.1);
}

.name {
  margin: 10px 0 2px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}
</style>
