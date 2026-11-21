<template>
  <div class="lyrics-stage" :style="stageStyle">
    <!-- 背景氛围：封面模糊 + 主题色 + 颗粒 -->
    <div class="bg">
      <div class="bg-cover" :style="{ backgroundImage: `url(${bgCover})` }"></div>
      <div class="bg-tint"></div>
      <div class="bg-grain"></div>
      <div class="bg-scan"></div>
    </div>

    <!-- 顶栏 -->
    <header class="top-bar">
      <button class="back-btn" @click="goBack" aria-label="返回">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>

      <div class="song-info" v-if="currentSong">
        <div class="cover">
          <img :src="currentSong.cover" :alt="currentSong.title" @error="handleImgError" />
        </div>
        <div class="text">
          <h1>{{ currentSong.title }}</h1>
          <p>{{ currentSong.artist }}</p>
        </div>
      </div>

      <div class="mode-tag">
        <span class="dot"></span>
        <span>SING ALONG</span>
      </div>
    </header>

    <!-- 歌词聚焦轨道 -->
    <main class="rail-wrap" ref="wrapRef">
      <div class="rail" ref="trackRef" :style="{ transform: `translateY(${trackOffset}px)` }">
        <p
          v-for="(line, i) in lyricsLines"
          :key="i"
          class="line"
          :class="{
            active: i === activeIndex,
            near: Math.abs(i - activeIndex) === 1,
          }"
          @click="seekToLine(i)"
        >
          <span class="fill">{{ line.text || '♪' }}</span>
        </p>
      </div>
    </main>

    <!-- 底部控制 -->
    <footer class="controls">
      <div class="progress-row">
        <span class="time">{{ formatTime(displayTime) }}</span>
        <div class="progress-bar" @click="seekProgress">
          <div class="progress-fill" :style="{ width: playerStore.progress + '%' }"></div>
        </div>
        <span class="time">{{ formatTime(playerStore.duration) }}</span>
      </div>
      <div class="btns">
        <button class="ctrl" @click="playerStore.prevSong" aria-label="上一首">
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
        </button>
        <button class="ctrl play-btn" @click="playerStore.togglePlay" aria-label="播放/暂停">
          <svg v-if="!playerStore.isPlaying" viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <svg v-else viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>
        <button class="ctrl" @click="playerStore.nextSong" aria-label="下一首">
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>
      </div>
    </footer>

    <!-- 无歌词 -->
    <div v-if="!loading && lyricsLines.length === 0" class="empty">
      <p>暂无歌词</p>
      <span>这首歌还没有歌词文件</span>
    </div>

    <!-- 载入中 -->
    <div v-if="loading" class="loading">
      <span class="spinner"></span>
      <p>正在载入歌词…</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { resolveUrl } from '../utils/baseUrl'

const router = useRouter()
const route = useRoute()
const playerStore = usePlayerStore()

const loading = ref(true)
const wrapRef = ref(null)
const trackRef = ref(null)

const activeIndex = ref(-1)
const trackOffset = ref(0)
const displayTime = ref(0)

const currentSong = computed(() => playerStore.currentSong)

// 解析 LRC 歌词
const lyricsLines = computed(() => {
  if (!currentSong.value) return []
  const raw = playerStore.lyricsData?.[currentSong.value.id]?.lyrics || ''
  if (!raw) return []
  return raw
    .split('\n')
    .filter((l) => l.trim())
    .map((line) => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)/)
      if (!match) return null
      const ms = match[3].length === 3 ? parseInt(match[3]) : parseInt(match[3]) * 10
      const time = parseInt(match[1]) * 60 + parseInt(match[2]) + ms / 1000
      return { time, text: match[4].trim() }
    })
    .filter(Boolean)
})

// 背景封面
const bgCover = computed(() => {
  if (currentSong.value?.cover) return currentSong.value.cover
  return resolveUrl('images/covers/fenghuang_chuanqi_hero.jpg')
})

// 主题色变量
const stageStyle = computed(() => {
  const color = playerStore.themeColor || '#c99a5b'
  return {
    '--accent': color,
    '--accent-r': parseInt(color.slice(1, 3), 16),
    '--accent-g': parseInt(color.slice(3, 5), 16),
    '--accent-b': parseInt(color.slice(5, 7), 16),
  }
})

// ========== 轨道居中 ==========
let activeEl = null

function centerActive() {
  const wrap = wrapRef.value
  const track = trackRef.value
  if (!wrap || !track) return

  const lines = track.querySelectorAll('.line')
  if (!lines.length) {
    trackOffset.value = 0
    return
  }

  const idx = activeIndex.value >= 0 ? activeIndex.value : 0
  const el = lines[idx]
  if (!el) return

  activeEl = el
  const offset = el.offsetTop + el.offsetHeight / 2 - wrap.clientHeight / 2
  trackOffset.value = -offset
}

function seekToLine(index) {
  const line = lyricsLines.value[index]
  if (!line) return
  smoothTime = line.time
  activeIndex.value = index
  nextTick(centerActive)
  playerStore.seekTo(line.time)
}

function goBack() {
  if (route.query.from === 'fullscreen') {
    router.back()
  } else {
    router.push('/')
  }
}

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return m + ':' + String(s).padStart(2, '0')
}

function handleImgError(e) {
  e.target.style.display = 'none'
}

function seekProgress(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const ratio = (e.clientX - rect.left) / rect.width
  playerStore.seekTo(ratio * playerStore.duration)
}

// ========== 播放时钟 + 逐字进度 ==========
let smoothTime = 0
let lastTs = 0
let rafId = null

function setFill(percent) {
  if (activeEl) activeEl.style.setProperty('--p', percent.toFixed(1))
}

function tick(ts) {
  rafId = requestAnimationFrame(tick)

  const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.12) : 0.016
  lastTs = ts

  const storeTime = playerStore.currentTime || 0
  const duration = playerStore.duration || 0

  if (playerStore.isPlaying) smoothTime += dt
  // 与播放器时间校准（seek / 切歌时）
  if (Math.abs(storeTime - smoothTime) > 0.3) smoothTime = storeTime
  if (duration && smoothTime > duration) smoothTime = duration

  const whole = Math.floor(smoothTime)
  if (whole !== displayTime.value) displayTime.value = whole

  const lines = lyricsLines.value
  if (!lines.length) return

  // 定位当前行
  let idx = -1
  for (let i = lines.length - 1; i >= 0; i--) {
    if (smoothTime >= lines[i].time) {
      idx = i
      break
    }
  }

  if (idx !== activeIndex.value) {
    activeIndex.value = idx
    nextTick(centerActive)
  }

  // 当前行逐字填充进度
  if (idx >= 0) {
    const start = lines[idx].time
    const end = idx + 1 < lines.length ? lines[idx + 1].time : (duration || start + 4)
    const span = Math.max(end - start, 1.2)
    const p = Math.min(100, Math.max(0, ((smoothTime - start) / span) * 100))
    setFill(p)
  }
}

// ========== 响应式 ==========
function onResize() {
  centerActive()
}

// ========== 数据加载 ==========
async function ensureLyrics(songId) {
  if (!songId) return
  if (lyricsLines.value.length > 0) return
  try {
    await playerStore.loadLyricsForSong?.(songId)
  } catch (e) { /* ignore */ }
}

watch(() => playerStore.currentSong?.id, async (newId) => {
  loading.value = true
  activeIndex.value = -1
  smoothTime = 0
  await ensureLyrics(newId)
  await nextTick()
  loading.value = false
  centerActive()
})

watch(() => lyricsLines.value.length, async () => {
  if (lyricsLines.value.length > 0) {
    loading.value = false
    await nextTick()
    centerActive()
  }
})

onMounted(async () => {
  await ensureLyrics(currentSong.value?.id)
  await nextTick()

  loading.value = false
  centerActive()

  // 从当前播放进度开始
  smoothTime = playerStore.currentTime || 0
  lastTs = 0
  rafId = requestAnimationFrame(tick)

  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.lyrics-stage {
  --cream: 240, 231, 216;
  --mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;

  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  background: #07070a;
  color: rgba(var(--cream), 0.9);
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  overflow: hidden;
}

/* ===== 背景 ===== */
.bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.bg-cover {
  position: absolute;
  inset: -10%;
  background-size: cover;
  background-position: center;
  filter: blur(72px) saturate(1.3) brightness(0.28);
  transform: scale(1.15);
  animation: bgDrift 40s ease-in-out infinite alternate;
}

@keyframes bgDrift {
  0% { transform: scale(1.12) translate(0, 0); }
  100% { transform: scale(1.22) translate(-2%, -2%); }
}

.bg-tint {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 24%, rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.18) 0%, transparent 58%),
    linear-gradient(180deg, rgba(7, 7, 10, 0.5) 0%, rgba(7, 7, 10, 0.84) 62%, #07070a 100%);
}

.bg-grain {
  position: absolute;
  inset: 0;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px;
}

.bg-scan {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.015) 0px,
    rgba(255, 255, 255, 0.015) 1px,
    transparent 1px,
    transparent 3px
  );
}

/* ===== 顶栏 ===== */
.top-bar {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(var(--cream), 0.07);
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 2px;
  border: 1px solid rgba(var(--cream), 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(var(--cream), 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.3s;
}

.back-btn:hover {
  border-color: rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.5);
  color: rgba(var(--accent-r), var(--accent-g), var(--accent-b), 1);
}

.song-info {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
  flex: 1;
}

.song-info .cover {
  width: 38px;
  height: 38px;
  border-radius: 2px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(var(--cream), 0.1);
}

.song-info .cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info .text {
  min-width: 0;
}

.song-info h1 {
  margin: 0 0 2px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: rgba(var(--cream), 0.92);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-info p {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: rgba(var(--cream), 0.38);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mode-tag {
  display: none;
  align-items: center;
  gap: 8px;
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.24em;
  color: rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.8);
  flex-shrink: 0;
}

.mode-tag .dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(var(--accent-r), var(--accent-g), var(--accent-b), 1);
  box-shadow: 0 0 8px rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.9);
  animation: dotPulse 2.2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 0.35; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* ===== 歌词轨道 ===== */
.rail-wrap {
  position: relative;
  z-index: 2;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%);
  mask-image: linear-gradient(180deg, transparent 0%, #000 16%, #000 84%, transparent 100%);
}

.rail {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 40vh 24px;
  transition: transform 0.66s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

/* 行高固定，避免当前行字号变化导致 offsetTop 漂移、居中不准 */
.line {
  margin: 0 auto;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 820px;
  text-align: center;
  font-size: 17px;
  line-height: 1.3;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: rgba(var(--cream), 0.26);
  transform: scale(0.94);
  transition: color 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), font-size 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}

.line .fill {
  display: inline;
}

.line.near {
  color: rgba(var(--cream), 0.5);
  transform: scale(0.975);
}

.line.active {
  font-size: 25px;
  font-weight: 600;
  color: rgba(var(--cream), 0.28);
  transform: scale(1);
  cursor: default;
}

/* 逐字点亮：文字渐变裁切 */
.line.active .fill {
  color: transparent;
  background-image: linear-gradient(
    90deg,
    var(--accent) 0%,
    var(--accent) calc(var(--p, 0) * 1%),
    rgba(var(--cream), 0.3) calc(var(--p, 0) * 1%),
    rgba(var(--cream), 0.3) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  filter: drop-shadow(0 0 18px rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.35));
}

.line:hover:not(.active) {
  color: rgba(var(--cream), 0.72);
}

/* ===== 底部控制 ===== */
.controls {
  position: relative;
  z-index: 3;
  padding: 14px 20px calc(18px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid rgba(var(--cream), 0.07);
  background: linear-gradient(180deg, rgba(7, 7, 10, 0) 0%, rgba(7, 7, 10, 0.85) 60%);
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.time {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: rgba(var(--cream), 0.32);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.progress-bar {
  flex: 1;
  height: 2px;
  background: rgba(var(--cream), 0.12);
  cursor: pointer;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: rgba(var(--accent-r), var(--accent-g), var(--accent-b), 1);
  box-shadow: 0 0 12px rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.5);
  transition: width 0.15s linear;
}

.btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 26px;
}

.ctrl {
  background: none;
  border: none;
  color: rgba(var(--cream), 0.5);
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s, transform 0.3s;
}

.ctrl:hover {
  color: rgba(var(--cream), 0.95);
  transform: scale(1.08);
}

.play-btn {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1px solid rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.5);
  background: rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.1);
  color: rgba(var(--accent-r), var(--accent-g), var(--accent-b), 1);
}

.play-btn:hover {
  background: rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.18);
  border-color: rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.9);
}

/* ===== 空态 / 载入 ===== */
.empty,
.loading {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  pointer-events: none;
}

.empty p {
  margin: 0;
  font-size: 15px;
  letter-spacing: 0.1em;
  color: rgba(var(--cream), 0.6);
}

.empty span {
  font-size: 11px;
  letter-spacing: 0.06em;
  color: rgba(var(--cream), 0.25);
}

.loading p {
  margin: 0;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  color: rgba(var(--cream), 0.35);
}

.spinner {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid rgba(var(--cream), 0.15);
  border-top-color: rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.9);
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== 平板 / 桌面 ===== */
@media (min-width: 768px) {
  .top-bar {
    padding: 20px 40px;
    gap: 18px;
  }

  .mode-tag {
    display: flex;
  }

  .song-info .cover {
    width: 44px;
    height: 44px;
  }

  .song-info h1 {
    font-size: 15px;
  }

  .rail {
    padding: 40vh 40px;
  }

  .line {
    height: 60px;
    font-size: 20px;
    max-width: 960px;
  }

  .line.active {
    font-size: 36px;
  }

  .controls {
    padding: 16px 40px calc(22px + env(safe-area-inset-bottom, 0px));
  }

  .progress-row {
    max-width: 720px;
    margin: 0 auto 14px;
  }
}

@media (min-width: 1200px) {
  .line.active {
    font-size: 42px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bg-cover,
  .mode-tag .dot,
  .spinner {
    animation: none !important;
  }
  .rail {
    transition: none;
  }
}
</style>
