<template>
  <transition name="fullscreen">
    <div class="fullscreen-player" v-if="visible && playerStore.currentSong">
      <!-- 动态氛围背景 -->
      <div class="fs-atmosphere">
        <div class="fs-atmosphere__gradient" :style="{ '--accent': accentColor }"></div>
        <div class="fs-atmosphere__noise"></div>
        <div class="fs-atmosphere__orbs">
          <span class="fs-orb fs-orb--1"></span>
          <span class="fs-orb fs-orb--2"></span>
          <span class="fs-orb fs-orb--3"></span>
        </div>
        <!-- 粒子层 -->
        <canvas ref="particleCanvas" class="fs-particles"></canvas>
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
            <div class="fs-vinyl-wrap" :class="{ playing: playerStore.isPlaying }">
              <div class="fs-vinyl-glow" :style="{ '--accent': accentColor }"></div>
              <div class="fs-vinyl" :class="{ spinning: playerStore.isPlaying }">
                <div class="fs-vinyl-disc">
                  <div class="fs-vinyl-grooves"></div>
                  <img :src="playerStore.currentSong.cover" class="fs-cover-img" />
                  <div class="fs-vinyl-center"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 频谱可视化 -->
          <div class="fs-visualizer">
            <MusicVisualizer
              ref="visualizerRef"
              :barCount="32"
              :canvasWidth="280"
              :canvasHeight="50"
              :barWidth="4"
              :barGap="3"
              :smoothing="0.75"
            />
          </div>

          <!-- 歌曲信息 -->
          <div class="fs-song-info">
            <h2 class="fs-title">{{ playerStore.currentSong.title }}</h2>
            <p class="fs-artist">{{ playerStore.currentSong.artist }}</p>
            <p class="fs-album">{{ playerStore.currentSong.album }}</p>
          </div>

          <!-- 进度条 -->
          <div class="fs-progress">
            <span class="fs-time">{{ formatTime(playerStore.currentTime) }}</span>
            <div class="fs-progress-bar" @click="seek" ref="progressBarRef">
              <div class="fs-buffered-bar" :style="{ width: playerStore.bufferedProgress + '%' }"></div>
              <div class="fs-progress-fill" :style="{ width: playerStore.progress + '%' }"></div>
              <div class="fs-progress-glow" :style="{ width: playerStore.progress + '%' }"></div>
              <div class="fs-progress-thumb" :style="{ left: playerStore.progress + '%' }">
                <div class="fs-thumb-ring"></div>
              </div>
            </div>
            <span class="fs-time">{{ formatTime(playerStore.duration) }}</span>
          </div>

          <!-- 控制按钮 -->
          <div class="fs-controls">
            <button class="fs-ctrl-btn fs-btn-like" :class="{ liked: playerStore.isLiked(playerStore.currentSong.id) }" @click="playerStore.toggleLikeSong(playerStore.currentSong.id)">
              <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
            <button class="fs-ctrl-btn" @click="playerStore.prevSong">
              <svg viewBox="0 0 24 24" width="28" height="28"><path fill="currentColor" d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <button class="fs-ctrl-btn fs-btn-play" @click="playerStore.togglePlay">
              <svg v-if="!playerStore.isPlaying" viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
              <svg v-else viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <button class="fs-ctrl-btn" @click="playerStore.nextSong">
              <svg viewBox="0 0 24 24" width="28" height="28"><path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
            <button class="fs-ctrl-btn" @click="playerStore.togglePlayMode" :title="playModeText">
              <svg v-if="playerStore.playMode === 'list'" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
              <svg v-else-if="playerStore.playMode === 'shuffle'" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
              <svg v-else viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>
            </button>
          </div>
        </div>

        <!-- 右侧：歌词 -->
        <div class="fs-right">
          <div class="fs-lyrics" ref="lyricsRef" v-if="lyricsLines.length > 0">
            <p v-for="(line, index) in lyricsLines" :key="index" class="fs-lyric-line" :class="{ active: isCurrentLine(index) }" :ref="el => { if (isCurrentLine(index)) activeLyricEl = el }" @click="seekToLyric(line)">{{ line.text }}</p>
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
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import MusicVisualizer from './MusicVisualizer.vue'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close'])

const router = useRouter()
const playerStore = usePlayerStore()
const lyricsRef = ref(null)
const activeLyricEl = ref(null)
const visualizerRef = ref(null)
const particleCanvas = ref(null)
const accentColor = ref('#667eea')

// 主题色提取
const extractColor = () => {
  if (!playerStore.currentSong?.cover) return
  const img = new Image()
  // 仅对远程 URL 设置 crossOrigin，本地图片不需要
  if (playerStore.currentSong.cover.startsWith('http')) {
    img.crossOrigin = 'anonymous'
  }
  img.src = playerStore.currentSong.cover
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1; canvas.height = 1
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, 1, 1)
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
      accentColor.value = `rgb(${r}, ${g}, ${b})`
    } catch (e) {
      console.warn('主题色提取失败:', e)
    }
  }
  img.onerror = () => {
    console.warn('封面图片加载失败:', playerStore.currentSong.cover)
  }
}

watch(() => playerStore.currentSong?.id, extractColor)
onMounted(extractColor)

// 连接频谱可视化
watch(() => playerStore.isPlaying, (val) => {
  if (val && visualizerRef.value) {
    const audio = playerStore.getAudioElement?.()
    if (audio) visualizerRef.value.connectAudio(audio)
  }
})

// 粒子系统
let particleCtx = null
let particles = []
let particleAnimId = null

const initParticles = () => {
  const canvas = particleCanvas.value
  if (!canvas) return
  particleCtx = canvas.getContext('2d')
  resizeParticles()
  createParticles()
  animateParticles()
}

const resizeParticles = () => {
  const canvas = particleCanvas.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

const createParticles = () => {
  particles = []
  const count = window.innerWidth < 768 ? 30 : 60
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2
    })
  }
}

const animateParticles = () => {
  if (!particleCtx || !particleCanvas.value) return
  const ctx = particleCtx
  const canvas = particleCanvas.value
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  particles.forEach(p => {
    p.x += p.speedX
    p.y += p.speedY
    p.pulse += 0.02

    if (p.x < 0) p.x = canvas.width
    if (p.x > canvas.width) p.x = 0
    if (p.y < 0) p.y = canvas.height
    if (p.y > canvas.height) p.y = 0

    const opacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse))
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
    ctx.fill()
  })

  particleAnimId = requestAnimationFrame(animateParticles)
}

onMounted(() => {
  initParticles()
  window.addEventListener('resize', resizeParticles)
})

onUnmounted(() => {
  if (particleAnimId) cancelAnimationFrame(particleAnimId)
  window.removeEventListener('resize', resizeParticles)
})

// 触摸手势
const touchStartY = ref(0)
const touchDeltaY = ref(0)
const onTouchStart = (e) => { touchStartY.value = e.touches[0].clientY }
const onTouchMove = (e) => { touchDeltaY.value = e.touches[0].clientY - touchStartY.value }
const onTouchEnd = () => {
  if (touchDeltaY.value > 100) close()
  touchDeltaY.value = 0
}

const close = () => emit('close')

const goToDetail = () => {
  if (playerStore.currentSong) {
    emit('close')
    setTimeout(() => router.push(`/song/${playerStore.currentSong.id}`), 300)
  }
}

// 歌词
const lyricsLines = computed(() => {
  if (!playerStore.currentSong) return []
  const raw = playerStore.lyricsData[playerStore.currentSong.id]?.lyrics || ''
  return raw.split('\n').filter(l => l.trim()).map(line => {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)/)
    if (match) {
      const time = parseInt(match[1]) * 60 + parseInt(match[2]) + parseInt(match[3]) / (match[3].length === 3 ? 1000 : 100)
      return { time, text: match[4] }
    }
    return null
  }).filter(Boolean)
})

const isCurrentLine = (index) => {
  if (!playerStore.isPlaying || lyricsLines.value.length === 0) return false
  const current = lyricsLines.value[index]
  const next = lyricsLines.value[index + 1]
  if (!current) return false
  return next ? playerStore.currentTime >= current.time && playerStore.currentTime < next.time : playerStore.currentTime >= current.time
}

const seekToLyric = (line) => { if (line?.time !== undefined) playerStore.seekTo(line.time) }

watch(() => playerStore.currentTime, () => {
  if (activeLyricEl.value && lyricsRef.value) {
    const container = lyricsRef.value
    const el = activeLyricEl.value
    const offset = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2
    container.scrollTo({ top: offset, behavior: 'smooth' })
  }
})

const playModeText = computed(() => ({ list: '列表循环', repeat: '单曲循环', shuffle: '随机播放' }[playerStore.playMode] || '列表循环'))

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

const seek = (e) => {
  const bar = e.currentTarget
  const rect = bar.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  playerStore.seekTo(percent * playerStore.duration)
}
</script>

<style scoped>
/* 本地字体栈，不依赖 Google Fonts */

.fullscreen-player {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  flex-direction: column;
  background: #07070f;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* ===== 动态氛围背景 ===== */
.fs-atmosphere {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.fs-atmosphere__gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 50% at 30% 20%, var(--accent, #667eea) 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 80% 70%, rgba(118, 75, 162, 0.25) 0%, transparent 50%),
    radial-gradient(ellipse 40% 30% at 50% 90%, rgba(240, 147, 251, 0.1) 0%, transparent 40%),
    linear-gradient(180deg, #07070f 0%, #0c0c1a 30%, #0a0a18 60%, #07070f 100%);
  transition: background 1s ease;
}

.fs-atmosphere__noise {
  position: absolute;
  inset: 0;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
}

.fs-atmosphere__orbs .fs-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.12;
  animation: orbFloat 25s ease-in-out infinite;
}

.fs-orb--1 {
  width: 500px; height: 500px;
  background: var(--accent, #667eea);
  top: -15%; left: -10%;
}

.fs-orb--2 {
  width: 350px; height: 350px;
  background: #764ba2;
  bottom: 5%; right: -8%;
  animation-delay: -8s;
}

.fs-orb--3 {
  width: 250px; height: 250px;
  background: #f093fb;
  top: 60%; left: 50%;
  animation-delay: -16s;
  opacity: 0.06;
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -30px) scale(1.08); }
  66% { transform: translate(-30px, 20px) scale(0.92); }
}

/* 粒子层 */
.fs-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* ===== 顶部栏 ===== */
.fs-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  padding-top: max(16px, env(safe-area-inset-top));
  animation: fadeDown 0.6s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fs-btn-down, .fs-btn-more {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.fs-btn-down:hover, .fs-btn-more:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: scale(1.05);
}

.fs-header-info {
  text-align: center;
  flex: 1;
}

.fs-header-label {
  margin: 0 0 2px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.fs-header-title {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* ===== 主内容区域 ===== */
.fs-body {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.fs-body::-webkit-scrollbar { display: none; }

/* ===== 左侧面板 ===== */
.fs-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 24px 24px;
  gap: 16px;
}

/* 封面区域 */
.fs-cover-area {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: coverIn 0.8s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes coverIn {
  from { opacity: 0; transform: translateY(40px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.fs-vinyl-wrap {
  position: relative;
  width: 280px;
  height: 280px;
}

.fs-vinyl-wrap.playing {
  animation: vinylBreathe 4s ease-in-out infinite;
}

@keyframes vinylBreathe {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.fs-vinyl-glow {
  position: absolute;
  inset: -15%;
  background: var(--accent, #667eea);
  filter: blur(50px);
  opacity: 0.2;
  border-radius: 50%;
  transition: opacity 0.5s;
}

.fs-vinyl-wrap:hover .fs-vinyl-glow {
  opacity: 0.3;
}

.fs-vinyl {
  position: relative;
  width: 100%;
  height: 100%;
}

.fs-vinyl.spinning .fs-vinyl-disc {
  animation: discSpin 12s linear infinite;
}

@keyframes discSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.fs-vinyl-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(145deg, #1a1a1a 0%, #000 50%, #1a1a1a 100%);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.fs-vinyl-grooves {
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: repeating-radial-gradient(circle at center, transparent 0px, transparent 3px, rgba(255,255,255,0.025) 3px, rgba(255,255,255,0.025) 4px);
}

.fs-cover-img {
  width: 170px;
  height: 170px;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 2;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.fs-vinyl-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #07070f;
  border: 2px solid rgba(255, 255, 255, 0.1);
  z-index: 3;
}

/* 频谱可视化 */
.fs-visualizer {
  animation: fadeUp 0.6s 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 歌曲信息 */
.fs-song-info {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: fadeUp 0.6s 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.fs-title {
  font-family: Georgia, 'Times New Roman', 'PingFang SC', 'Songti SC', serif;
  font-size: 26px;
  font-weight: 800;
  line-height: 1.2;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.75) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90vw;
}

.fs-artist {
  margin: 0;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
}

.fs-album {
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.3);
}

/* 进度条 */
.fs-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 340px;
  padding: 8px 0;
  animation: fadeUp 0.6s 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.fs-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  min-width: 36px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

.fs-progress-bar {
  flex: 1;
  height: 5px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  position: relative;
  cursor: pointer;
  transition: height 0.2s;
}

.fs-progress-bar:hover {
  height: 7px;
}

.fs-buffered-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  pointer-events: none;
}

.fs-progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0.7), rgba(255,255,255,0.9));
  border-radius: 3px;
  transition: width 0.1s linear;
}

.fs-progress-glow {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--accent, #667eea);
  border-radius: 3px;
  opacity: 0.4;
  filter: blur(4px);
  transition: width 0.1s linear;
}

.fs-progress-thumb {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.3), 0 0 4px var(--accent, #667eea);
}

.fs-progress-bar:hover .fs-progress-thumb,
.fs-progress-bar:active .fs-progress-thumb {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}

.fs-thumb-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ringPulse 2s ease-in-out infinite;
}

@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.3); opacity: 0; }
}

/* 控制按钮 */
.fs-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 8px 0;
  animation: fadeUp 0.6s 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.fs-ctrl-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 8px;
}

.fs-ctrl-btn:hover {
  color: #fff;
  transform: scale(1.12);
}

.fs-btn-play {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fs-btn-play:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: scale(1.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.fs-btn-play:active {
  transform: scale(0.96);
}

.fs-btn-like.liked {
  color: #f5576c;
}

/* 歌词区域 */
.fs-right {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  width: 100%;
  margin-top: 16px;
}

.fs-lyrics {
  flex: 1;
  overflow-y: auto;
  padding: 8px 32px 32px;
  mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
}

.fs-lyrics::-webkit-scrollbar { display: none; }

.fs-lyric-line {
  margin: 0;
  padding: 10px 0;
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.22);
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
  cursor: pointer;
}

.fs-lyric-line:hover {
  color: rgba(255, 255, 255, 0.45);
}

.fs-lyric-line.active {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.15);
}

.fs-no-lyrics {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.2);
  font-size: 15px;
}

/* 过渡动画 */
.fullscreen-enter-active,
.fullscreen-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.fullscreen-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.fullscreen-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* ===== 移动端隐藏歌词 ===== */
@media (max-width: 767px) {
  .fs-right { display: none; }
  .fs-vinyl-wrap { width: 240px; height: 240px; }
  .fs-cover-img { width: 145px; height: 145px; }
  .fs-title { font-size: 22px; }
  .fs-visualizer { transform: scale(0.85); }
}

/* ===== 桌面端 ===== */
@media (min-width: 768px) {
  .fs-body {
    flex-direction: row;
    padding: 0 40px 40px;
    gap: 48px;
    max-width: 1000px;
    margin: 0 auto;
    justify-content: center;
    overflow-y: hidden;
  }

  .fs-left {
    width: 400px;
    min-width: 400px;
    flex-shrink: 0;
    justify-content: center;
    padding: 0;
    gap: 20px;
  }

  .fs-vinyl-wrap { width: 320px; height: 320px; }
  .fs-cover-img { width: 195px; height: 195px; }

  .fs-title { font-size: 30px; }
  .fs-artist { font-size: 16px; }

  .fs-progress { max-width: 380px; }

  .fs-controls { gap: 28px; }

  .fs-right {
    display: flex;
    flex: 1;
    max-width: 420px;
    min-width: 0;
    margin-top: 0;
  }

  .fs-lyrics {
    padding: 20px 16px;
    mask-image: linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%);
  }

  .fs-lyric-line { font-size: 16px; padding: 12px 0; }
  .fs-lyric-line.active { font-size: 20px; }
}

@media (min-width: 1024px) {
  .fs-body { max-width: 1100px; gap: 64px; }
  .fs-left { width: 440px; }
  .fs-vinyl-wrap { width: 340px; height: 340px; }
  .fs-cover-img { width: 210px; height: 210px; }
  .fs-right { max-width: 460px; }
}
</style>
