<template>
  <transition name="fullscreen">
    <div 
      class="fullscreen-player" 
      v-if="visible && playerStore.currentSong"
    >
      <!-- 虚化背景 -->
      <div class="fs-bg">
        <img :src="playerStore.currentSong.cover" class="fs-bg-image" />
        <div class="fs-bg-overlay"></div>
      </div>

      <!-- 顶部栏 -->
      <div class="fs-header" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
        <button class="fs-btn-down" @click="close">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
          </svg>
        </button>
        <div class="fs-header-info">
          <p class="fs-header-label">正在播放</p>
          <p class="fs-header-title">{{ playerStore.currentSong.title }}</p>
        </div>
        <button class="fs-btn-more" @click="goToDetail">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>

      <!-- 主内容区域 -->
      <div class="fs-body">
        <!-- 左侧：封面 + 歌曲信息 + 控制 -->
        <div class="fs-left">
          <!-- 封面区域 -->
          <div class="fs-cover-area">
            <div class="fs-vinyl" :class="{ spinning: playerStore.isPlaying }">
              <div class="fs-vinyl-disc">
                <div class="fs-vinyl-grooves"></div>
                <img :src="playerStore.currentSong.cover" class="fs-cover-img" />
                <div class="fs-vinyl-center"></div>
              </div>
            </div>
          </div>

          <!-- 歌曲信息 -->
          <div class="fs-song-info">
            <h2 class="fs-title">{{ playerStore.currentSong.title }}</h2>
            <p class="fs-artist">{{ playerStore.currentSong.artist }} · {{ playerStore.currentSong.album }}</p>
          </div>

          <!-- 进度条 -->
          <div class="fs-progress">
            <span class="fs-time">{{ formatTime(playerStore.currentTime) }}</span>
            <div class="fs-progress-bar" @click="seek">
              <div class="fs-buffered-bar" :style="{ width: playerStore.bufferedProgress + '%' }"></div>
              <div class="fs-progress-fill" :style="{ width: playerStore.progress + '%' }"></div>
              <div class="fs-progress-thumb" :style="{ left: playerStore.progress + '%' }"></div>
            </div>
            <span class="fs-time">{{ formatTime(playerStore.duration) }}</span>
          </div>

          <!-- 控制按钮 -->
          <div class="fs-controls">
            <button 
              class="fs-ctrl-btn fs-btn-like" 
              :class="{ liked: playerStore.isLiked(playerStore.currentSong.id) }"
              @click="playerStore.toggleLikeSong(playerStore.currentSong.id)"
            >
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
            <button class="fs-ctrl-btn" @click="playerStore.prevSong">
              <svg viewBox="0 0 24 24" width="32" height="32">
                <path fill="currentColor" d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            <button class="fs-ctrl-btn fs-btn-play" @click="playerStore.togglePlay">
              <svg v-if="!playerStore.isPlaying" viewBox="0 0 24 24" width="40" height="40">
                <path fill="currentColor" d="M8 5v14l11-7z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="40" height="40">
                <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            </button>
            <button class="fs-ctrl-btn" @click="playerStore.nextSong">
              <svg viewBox="0 0 24 24" width="32" height="32">
                <path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
            <button class="fs-ctrl-btn" @click="playerStore.togglePlayMode" :title="playModeText">
              <!-- 列表循环 -->
              <svg v-if="playerStore.playMode === 'list'" viewBox="0 0 24 24" width="22" height="22">
                <path fill="currentColor" d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
              </svg>
              <!-- 随机播放 -->
              <svg v-else-if="playerStore.playMode === 'shuffle'" viewBox="0 0 24 24" width="22" height="22">
                <path fill="currentColor" d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
              </svg>
              <!-- 单曲循环 -->
              <svg v-else viewBox="0 0 24 24" width="22" height="22">
                <path fill="currentColor" d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 右侧：歌词 -->
        <div class="fs-right">
          <div class="fs-lyrics" ref="lyricsRef" v-if="lyricsLines.length > 0">
            <p 
              v-for="(line, index) in lyricsLines" 
              :key="index"
              class="fs-lyric-line"
              :class="{ active: isCurrentLine(index) }"
              :ref="el => { if (isCurrentLine(index)) activeLyricEl = el }"
              @click="seekToLyric(line)"
            >{{ line.text }}</p>
          </div>
          <div class="fs-no-lyrics" v-else>
            <p>暂无歌词</p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close'])

const router = useRouter()
const playerStore = usePlayerStore()
const lyricsRef = ref(null)
const activeLyricEl = ref(null)

// 触摸手势
const touchStartY = ref(0)
const touchDeltaY = ref(0)

const onTouchStart = (e) => {
  touchStartY.value = e.touches[0].clientY
}

const onTouchMove = (e) => {
  touchDeltaY.value = e.touches[0].clientY - touchStartY.value
}

const onTouchEnd = () => {
  if (touchDeltaY.value > 100) {
    close()
  }
  touchDeltaY.value = 0
}

// 关闭
const close = () => {
  emit('close')
}

// 跳转详情页
const goToDetail = () => {
  if (playerStore.currentSong) {
    const songId = playerStore.currentSong.id
    emit('close')
    // 等待全屏关闭动画完成后再跳转
    setTimeout(() => {
      router.push(`/song/${songId}`)
    }, 300)
  }
}

// 歌词解析
const lyricsLines = computed(() => {
  if (!playerStore.currentSong) return []
  const raw = playerStore.lyricsData[playerStore.currentSong.id]?.lyrics || ''
  return raw.split('\n')
    .filter(line => line.trim())
    .map(line => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)/)
      if (match) {
        const minutes = parseInt(match[1])
        const seconds = parseInt(match[2])
        const ms = parseInt(match[3])
        const time = minutes * 60 + seconds + ms / (match[3].length === 3 ? 1000 : 100)
        const text = match[4]
        if (!text) return null
        return { time, text }
      }
      return null
    })
    .filter(Boolean)
})

const isCurrentLine = (index) => {
  if (!playerStore.isPlaying || lyricsLines.value.length === 0) return false
  const currentTime = playerStore.currentTime
  const current = lyricsLines.value[index]
  const next = lyricsLines.value[index + 1]
  if (!current) return false
  if (next) {
    return currentTime >= current.time && currentTime < next.time
  }
  return currentTime >= current.time
}

// 点击歌词跳转
const seekToLyric = (line) => {
  if (line && line.time !== undefined) {
    playerStore.seekTo(line.time)
  }
}

// 歌词滚动
watch(() => playerStore.currentTime, () => {
  if (activeLyricEl.value && lyricsRef.value) {
    const container = lyricsRef.value
    const el = activeLyricEl.value
    const containerRect = container.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const offset = elRect.top - containerRect.top - containerRect.height / 3
    container.scrollTo({
      top: container.scrollTop + offset,
      behavior: 'smooth'
    })
  }
})

// 播放模式
const playModeIcon = computed(() => {
  const modes = { list: '🔁', repeat: '🔂', shuffle: '🔀' }
  return modes[playerStore.playMode] || '🔁'
})

const playModeText = computed(() => {
  const texts = { list: '列表循环', repeat: '单曲循环', shuffle: '随机播放' }
  return texts[playerStore.playMode] || '列表循环'
})

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

// 进度跳转
const seek = (e) => {
  const bar = e.currentTarget
  const rect = bar.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  const time = percent * playerStore.duration
  playerStore.seekTo(time)
}
</script>

<style scoped>
.fullscreen-player {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  flex-direction: column;
  background: #0a0a14;
  overflow: hidden;
}

/* 虚化背景 */
.fs-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.fs-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(80px) brightness(0.35) saturate(1.8);
  transform: scale(1.3);
}

.fs-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(10, 10, 20, 0.3) 0%,
    rgba(10, 10, 20, 0.6) 40%,
    rgba(10, 10, 20, 0.95) 100%
  );
}

/* 顶部栏 */
.fs-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  padding-top: max(16px, env(safe-area-inset-top));
}

.fs-btn-down,
.fs-btn-more {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.fs-btn-down:hover,
.fs-btn-more:hover {
  background: rgba(255, 255, 255, 0.2);
}

.fs-header-info {
  text-align: center;
  flex: 1;
}

.fs-header-label {
  margin: 0 0 2px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.fs-header-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 封面区域 */
.fs-cover-area {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  flex-shrink: 0;
}

.fs-vinyl {
  position: relative;
}

.fs-vinyl-disc {
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: linear-gradient(145deg, #1a1a1a 0%, #000 50%, #1a1a1a 100%);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
}

.fs-vinyl-grooves {
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    transparent 0px,
    transparent 3px,
    rgba(255, 255, 255, 0.03) 3px,
    rgba(255, 255, 255, 0.03) 4px
  );
}

.fs-cover-img {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 2;
}

.fs-vinyl-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #0a0a14;
  border: 2px solid #333;
  z-index: 3;
}

.fs-vinyl.spinning .fs-vinyl-disc {
  animation: fsDiscSpin 12s linear infinite;
}

@keyframes fsDiscSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 歌曲信息 */
.fs-song-info {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 0 24px 16px;
  flex-shrink: 0;
}

.fs-title {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

.fs-artist {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

/* 进度条 */
.fs-progress {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 24px 16px;
  flex-shrink: 0;
}

.fs-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  min-width: 36px;
  text-align: center;
}

.fs-progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

/* 缓冲进度条 */
.fs-buffered-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  pointer-events: none;
  z-index: 0;
}

.fs-progress-bar:hover {
  height: 6px;
}

.fs-progress-bar:hover .fs-progress-thumb {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.fs-progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
  position: relative;
  transition: width 0.1s linear;
}

.fs-progress-thumb {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 控制按钮 */
.fs-controls {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 0 24px 20px;
  flex-shrink: 0;
}

.fs-ctrl-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 8px;
}

.fs-ctrl-btn:hover {
  color: #fff;
  transform: scale(1.1);
}

.fs-btn-play {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
}

.fs-btn-play:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.fs-btn-like {
  font-size: 20px;
}

.fs-btn-like.liked {
  color: #f5576c;
}

/* 歌词区域 */
.fs-lyrics {
  position: relative;
  z-index: 10;
  flex: 1;
  overflow-y: auto;
  padding: 8px 32px 32px;
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 15%,
    black 85%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 15%,
    black 85%,
    transparent 100%
  );
}

.fs-lyrics::-webkit-scrollbar {
  display: none;
}

.fs-lyric-line {
  margin: 0;
  padding: 10px 0;
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.25);
  transition: all 0.4s ease;
  text-align: center;
  cursor: pointer;
}

.fs-lyric-line:hover {
  color: rgba(255, 255, 255, 0.5);
}

.fs-lyric-line.active {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

/* 过渡动画 */
.fullscreen-enter-active,
.fullscreen-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fullscreen-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.fullscreen-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* 主内容区域 - 默认手机：上下布局 */
.fs-body {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

/* 左侧面板 */
.fs-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

/* 右侧歌词面板 */
.fs-right {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  width: 100%;
  margin-top: 20px;
}

/* 无歌词提示 */
.fs-no-lyrics {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.3);
  font-size: 16px;
}

/* 移动端隐藏歌词 */
@media (max-width: 767px) {
  .fs-right {
    display: none;
  }
}

/* 电脑端：左右布局 */
@media (min-width: 768px) {
  .fs-body {
    flex-direction: row;
    padding: 0 40px 40px;
    gap: 48px;
    max-width: 900px;
    width: 100%;
    margin: 0 auto;
    justify-content: center;
  }

  .fs-left {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .fs-right {
    display: flex;
    flex-direction: column;
    flex: 1;
    max-width: 400px;
    align-items: center;
  }

  .fs-vinyl-disc {
    width: 320px;
    height: 320px;
  }

  .fs-cover-img {
    width: 200px;
    height: 200px;
  }

  .fs-cover-area {
    padding: 0;
    margin-bottom: 32px;
  }

  .fs-title {
    font-size: 28px;
  }

  .fs-artist {
    font-size: 15px;
  }

  .fs-song-info {
    padding: 0 0 24px;
  }

  .fs-progress {
    width: 100%;
    max-width: 380px;
    padding: 8px 0 24px;
  }

  .fs-controls {
    gap: 28px;
    padding: 0;
  }

  .fs-lyrics {
    width: 100%;
    padding: 20px 16px;
    mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      black 10%,
      black 90%,
      transparent 100%
    );
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      black 10%,
      black 90%,
      transparent 100%
    );
  }

  .fs-lyric-line {
    font-size: 17px;
    padding: 12px 0;
    text-align: center;
  }

  .fs-lyric-line.active {
    font-size: 20px;
  }

  .fs-no-lyrics {
    display: flex;
  }
}

@media (min-width: 1024px) {
  .fs-body {
    max-width: 1000px;
    gap: 64px;
  }

  .fs-left {
    width: 360px;
  }

  .fs-vinyl-disc {
    width: 320px;
    height: 320px;
  }

  .fs-cover-img {
    width: 200px;
    height: 200px;
  }

  .fs-right {
    max-width: 440px;
  }
}
</style>
