<template>
  <div class="music-player" :class="{ playing: playerStore.isPlaying }" :style="{ '--theme-color': playerStore.themeColor }" v-if="playerStore.currentSong">
    <!-- 浮动音符粒子 -->
    <FloatingNotes />

    <!-- 光波背景 -->
    <div class="glow-bg">
      <div class="glow glow-1"></div>
      <div class="glow glow-2"></div>
      <div class="glow glow-3"></div>
    </div>

    <!-- 歌曲信息 -->
    <div class="song-info" @click="openFullscreen">
      <div class="cover-wrapper" :class="{ playing: playerStore.isPlaying }">
        <!-- 黑胶唱片外圈 -->
        <div class="vinyl-disc">
          <!-- 唱片纹路 -->
          <div class="vinyl-grooves"></div>
          <!-- 封面图（带过渡动画） -->
          <Transition name="cover-fade" mode="out-in">
            <img
              :key="playerStore.currentSong.id"
              :src="playerStore.currentSong.cover"
              :alt="playerStore.currentSong.title"
              class="cover"
            />
          </Transition>
          <!-- 中心孔 -->
          <div class="vinyl-center"></div>
        </div>
      </div>
      <div class="info">
        <Transition name="text-slide" mode="out-in">
          <h4 :key="playerStore.currentSong.id" class="title">{{ playerStore.currentSong.title }}</h4>
        </Transition>
        <Transition name="text-slide" mode="out-in">
          <p :key="playerStore.currentSong.id" class="artist">{{ playerStore.currentSong.artist }}</p>
        </Transition>
      </div>
    </div>
    
    <!-- 播放控制 -->
    <div class="controls">
      <div class="control-buttons">
        <button class="btn-mode" @click="playerStore.togglePlayMode" :title="playModeText">
          {{ playModeIcon }}
        </button>
        <button class="btn-prev" @click="playerStore.prevSong">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>
        <button class="btn-play" @click="playerStore.togglePlay">
          <svg v-if="!playerStore.isPlaying" viewBox="0 0 24 24" width="32" height="32">
            <path fill="currentColor" d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="32" height="32">
            <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
        <button class="btn-next" @click="playerStore.nextSong">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
        <!-- 均衡器可视化 -->
        <MusicVisualizer ref="visualizerRef" />
      </div>
      
      <!-- 进度条 -->
      <div class="progress-container">
        <span class="time">{{ formatTime(playerStore.currentTime) }}</span>
        <div class="progress-bar" @click="seek">
          <div class="buffered-bar" :style="{ width: playerStore.bufferedProgress + '%' }"></div>
          <div class="progress" :style="{ width: playerStore.progress + '%' }">
            <div class="progress-glow"></div>
          </div>
        </div>
        <span class="time">{{ formatTime(playerStore.duration) }}</span>
      </div>
    </div>
    
    <!-- 音量控制 -->
    <div class="volume">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.01" 
        :value="playerStore.volume"
        @input="playerStore.setVolume($event.target.value)"
      />
    </div>
    
    <!-- 队列按钮 -->
    <button class="btn-queue" @click="playerStore.toggleQueue()" :class="{ active: playerStore.playQueue.length > 0 }">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
      </svg>
      <span v-if="playerStore.playQueue.length > 0" class="queue-badge">{{ playerStore.playQueue.length }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import MusicVisualizer from './MusicVisualizer.vue'
import FloatingNotes from './FloatingNotes.vue'

const emit = defineEmits(['open-fullscreen'])

const playerStore = usePlayerStore()
const router = useRouter()
const visualizerRef = ref(null)

// 连接音频可视化（首次播放时连接）
let visualizerConnected = false
watch(() => playerStore.isPlaying, (playing) => {
  if (playing && !visualizerConnected && visualizerRef.value) {
    const audio = playerStore.getAudioElement()
    if (audio) {
      visualizerRef.value.connectAudio(audio)
      visualizerConnected = true
    }
  }
})

// 打开全屏播放页
const openFullscreen = () => {
  emit('open-fullscreen')
}

const playModeIcon = computed(() => {
  const icons = {
    list: '🔁',
    shuffle: '🔀',
    repeat: '🔂'
  }
  return icons[playerStore.playMode]
})

const playModeText = computed(() => {
  const texts = {
    list: '列表循环',
    shuffle: '随机播放',
    repeat: '单曲循环'
  }
  return texts[playerStore.playMode]
})

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const seek = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  const time = percent * playerStore.duration
  playerStore.seekTo(time)
}
</script>

<style scoped>
.music-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 1000;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: all 0.3s;
}

/* 播放状态顶部发光边框 */
.music-player.playing {
  border-top-color: var(--theme-color);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3), 0 -2px 30px color-mix(in srgb, var(--theme-color) 15%, transparent);
}

/* 光波背景 */
.glow-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0;
  transition: opacity 0.5s;
}

.music-player.playing .glow {
  opacity: 1;
}

.glow-1 {
  width: 200px;
  height: 200px;
  background: color-mix(in srgb, var(--theme-color) 15%, transparent);
  top: -100px;
  left: 10%;
  animation: glowDrift1 4s ease-in-out infinite;
}

.glow-2 {
  width: 150px;
  height: 150px;
  background: rgba(118, 75, 162, 0.12);
  top: -80px;
  left: 50%;
  animation: glowDrift2 5s ease-in-out infinite;
}

.glow-3 {
  width: 180px;
  height: 180px;
  background: rgba(240, 147, 251, 0.1);
  top: -90px;
  right: 15%;
  animation: glowDrift3 3.5s ease-in-out infinite;
}

@keyframes glowDrift1 {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(30px); }
}

@keyframes glowDrift2 {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-20px); }
}

@keyframes glowDrift3 {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-25px); }
}

/* 歌曲信息 */
.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  z-index: 1;
}

/* 黑胶唱片封面 */
.cover-wrapper {
  position: relative;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  cursor: pointer;
}

.cover-wrapper:hover {
  transform: scale(1.05);
}

/* 黑胶唱片外圈 */
.vinyl-disc {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(145deg, #1a1a1a 0%, #000000 50%, #1a1a1a 100%);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.5),
    inset 0 1px 2px rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 唱片纹路 */
.vinyl-grooves {
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    transparent 0px,
    transparent 2px,
    rgba(255, 255, 255, 0.03) 2px,
    rgba(255, 255, 255, 0.03) 3px
  );
}

/* 封面图 */
.cover {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 2;
  transition: transform 0.3s;
}

/* 中心孔 */
.vinyl-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #0f0f1a;
  border: 1px solid #333;
  z-index: 3;
}

/* 播放时旋转 */
.cover-wrapper.playing .vinyl-disc {
  animation: discSpin 8s linear infinite;
}

@keyframes discSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.info:hover {
  opacity: 0.8;
}

.info:hover .title {
  text-decoration: underline;
}

.title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  transition: text-shadow 0.3s;
}

.music-player.playing .title {
  text-shadow: 0 0 10px color-mix(in srgb, var(--theme-color) 30%, transparent);
}

.artist {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* 播放控制 */
.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 600px;
  z-index: 1;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-buttons button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-buttons button:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.btn-play {
  width: 48px;
  height: 48px;
  background: var(--theme-color) !important;
  color: #fff !important;
  position: relative;
}

.btn-play::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: var(--theme-color);
  opacity: 0;
  z-index: -1;
  filter: blur(8px);
  transition: opacity 0.3s;
}

.music-player.playing .btn-play::after {
  opacity: 0.5;
  animation: playBtnGlow 2s ease-in-out infinite;
}

@keyframes playBtnGlow {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

.btn-play:hover {
  transform: scale(1.05);
  filter: brightness(1.15);
}

.btn-mode {
  font-size: 18px;
}

/* 进度条 */
.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  min-width: 40px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

/* 缓冲进度条 */
.buffered-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  pointer-events: none;
  z-index: 0;
}

.progress {
  height: 100%;
  background: var(--theme-color);
  border-radius: 2px;
  transition: width 0.1s;
  position: relative;
  z-index: 1;
}

/* 进度条发光点 */
.progress-glow {
  position: absolute;
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 8px var(--theme-color), 0 0 16px color-mix(in srgb, var(--theme-color) 40%, transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.music-player.playing .progress-glow {
  opacity: 1;
}

/* 音量控制 */
.volume {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 150px;
  color: rgba(255, 255, 255, 0.7);
  z-index: 1;
}

.volume input[type="range"] {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  cursor: pointer;
}

.volume input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
}

/* 队列按钮 */
.btn-queue {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 1;
}

.btn-queue:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.btn-queue.active {
  color: var(--theme-color);
}

.queue-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #f5576c;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 封面渐变过渡 */
.cover-fade-enter-active,
.cover-fade-leave-active {
  transition: all 0.4s ease;
}

.cover-fade-enter-from {
  opacity: 0;
  transform: scale(1.1);
}

.cover-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 文字滑动过渡 */
.text-slide-enter-active,
.text-slide-leave-active {
  transition: all 0.3s ease;
}

.text-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.text-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
