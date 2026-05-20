<template>
  <Teleport to="body">
    <Transition name="mv-fade">
      <div v-if="visible" class="mv-overlay" @click.self="close">
        <div class="mv-container">
          <!-- 顶部栏 -->
          <div class="mv-header">
            <div class="mv-title">
              <span class="mv-badge">MV</span>
              <h3>{{ song?.title }} - {{ song?.artist }}</h3>
            </div>
            <button class="btn-close" @click="close">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <!-- 视频区域 -->
          <div class="mv-video-wrapper">
            <!-- 本地视频 -->
            <video
              v-if="isLocalVideo"
              ref="videoRef"
              :src="song.mvUrl"
              controls
              autoplay
              class="mv-video"
              @play="onPlay"
              @pause="onPause"
              @ended="onEnded"
            />

            <!-- 外部嵌入（B站/YouTube iframe） -->
            <iframe
              v-else
              :src="song.mvUrl"
              class="mv-iframe"
              allowfullscreen
              allow="autoplay; fullscreen"
              frameborder="0"
            ></iframe>
          </div>

          <!-- 底部操作 -->
          <div class="mv-footer">
            <button class="btn-action" @click="toggleLike">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span>{{ isLiked ? '已收藏' : '收藏歌曲' }}</span>
            </button>
            <button class="btn-action" @click="addToQueue">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
              </svg>
              <span>加入队列</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePlayerStore } from '../stores/player'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  song: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['close'])

const playerStore = usePlayerStore()
const videoRef = ref(null)

// 判断是否为本地视频
const isLocalVideo = computed(() => {
  if (!props.song?.mvUrl) return false
  return props.song.mvUrl.startsWith('/') || props.song.mvUrl.startsWith('blob:')
})

const isLiked = computed(() => {
  return props.song ? playerStore.isLiked(props.song.id) : false
})

const close = () => {
  // 暂停本地视频
  if (videoRef.value) {
    videoRef.value.pause()
  }
  emit('close')
}

const toggleLike = () => {
  if (props.song) {
    playerStore.toggleLikeSong(props.song.id)
  }
}

const addToQueue = () => {
  if (props.song) {
    playerStore.addToQueue(props.song)
  }
}

const onPlay = () => {
  // 暂停音乐播放
  if (playerStore.isPlaying) {
    playerStore.togglePlay()
  }
}

const onPause = () => {}

const onEnded = () => {}

// ESC 关闭
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.visible) {
    close()
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.mv-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.mv-container {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mv-title {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.mv-badge {
  padding: 2px 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.mv-title h3 {
  margin: 0;
  font-size: 16px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.mv-video-wrapper {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
}

.mv-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.mv-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.mv-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.btn-action svg {
  flex-shrink: 0;
}

/* 动画 */
.mv-fade-enter-active,
.mv-fade-leave-active {
  transition: opacity 0.3s ease;
}

.mv-fade-enter-from,
.mv-fade-leave-to {
  opacity: 0;
}

/* 手机端适配 */
@media (max-width: 480px) {
  .mv-overlay {
    padding: 10px;
  }

  .mv-title h3 {
    font-size: 14px;
  }

  .mv-footer {
    gap: 10px;
  }

  .btn-action {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
