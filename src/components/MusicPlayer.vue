<template>
  <div class="music-player" :class="{ playing: playerStore.isPlaying }" v-if="playerStore.currentSong">
    <!-- 浮动音符粒子 -->
    <FloatingNotes />

    <!-- 光波背景 -->
    <div class="glow-bg">
      <div class="glow glow-1"></div>
      <div class="glow glow-2"></div>
      <div class="glow glow-3"></div>
    </div>

    <!-- 歌曲信息 -->
    <div class="song-info">
      <div class="cover-wrapper">
        <img 
          :src="playerStore.currentSong.cover" 
          :alt="playerStore.currentSong.title"
          class="cover"
        />
        <!-- 封面脉冲光环 -->
        <div class="cover-pulse" v-if="playerStore.isPlaying"></div>
        <div class="cover-ring" v-if="playerStore.isPlaying"></div>
      </div>
      <div class="info">
        <h4 class="title">{{ playerStore.currentSong.title }}</h4>
        <p class="artist">{{ playerStore.currentSong.artist }}</p>
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
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePlayerStore } from '../stores/player'
import MusicVisualizer from './MusicVisualizer.vue'
import FloatingNotes from './FloatingNotes.vue'

const playerStore = usePlayerStore()
const visualizerRef = ref(null)

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
  border-top-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3), 0 -2px 30px rgba(102, 126, 234, 0.15);
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
  background: rgba(102, 126, 234, 0.15);
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

.cover-wrapper {
  position: relative;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.cover {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 2;
  transition: transform 0.3s;
}

.music-player.playing .cover {
  transform: scale(1.02);
}

/* 封面脉冲光环 */
.cover-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.6);
  animation: coverPulse 2s ease-in-out infinite;
  z-index: 1;
}

@keyframes coverPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.2;
  }
}

/* 封面旋转光环 */
.cover-ring {
  position: absolute;
  inset: -8px;
  border-radius: 16px;
  border: 1px solid transparent;
  border-top-color: rgba(240, 147, 251, 0.5);
  border-right-color: rgba(102, 126, 234, 0.5);
  animation: coverSpin 3s linear infinite;
  z-index: 0;
}

@keyframes coverSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  transition: text-shadow 0.3s;
}

.music-player.playing .title {
  text-shadow: 0 0 10px rgba(102, 126, 234, 0.3);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: #fff !important;
  position: relative;
}

.btn-play::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
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
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%) !important;
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

.progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
  transition: width 0.1s;
  position: relative;
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
  box-shadow: 0 0 8px rgba(102, 126, 234, 0.8), 0 0 16px rgba(118, 75, 162, 0.4);
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
</style>
