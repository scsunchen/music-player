<template>
  <div class="lyrics-cloud-page">
    <div ref="canvasRef" class="lc-canvas"></div>

    <!-- 背景渐变 -->
    <div class="bg-gradient" :style="bgStyle"></div>

    <!-- 顶部信息栏 -->
    <div class="top-bar">
      <div class="left">
        <button class="back-btn" @click="goBack">
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
      </div>
      <div class="right">
        <span class="mode-tag">🎵 歌词云</span>
      </div>
    </div>

    <!-- 底部控制栏 -->
    <div class="bottom-controls" @mouseenter="showControls = true" @mouseleave="showControls = false">
      <div class="progress-row">
        <span class="time">{{ formatTime(smoothCurrentTime) }}</span>
        <div class="progress-bar" @click="seekProgress">
          <div class="progress-fill" :style="{ width: playerStore.progress + '%' }"></div>
        </div>
        <span class="time">{{ formatTime(playerStore.duration) }}</span>
      </div>
      <div class="control-btns">
        <button class="ctrl-btn" @click="playerStore.prevSong">
          <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
        </button>
        <button class="ctrl-btn play-btn" @click="playerStore.togglePlay">
          <svg v-if="!playerStore.isPlaying" viewBox="0 0 24 24" width="28" height="28"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <svg v-else viewBox="0 0 24 24" width="28" height="28"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>
        <button class="ctrl-btn" @click="playerStore.nextSong">
          <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>
      </div>
    </div>

    <!-- 提示 -->
    <div class="tips" v-if="!isMobile">
      <span>🖱️ 拖拽旋转</span>
      <span>🔍 滚轮缩放</span>
    </div>

    <!-- 暂无歌词 -->
    <div v-if="lyricsLines.length === 0 && !loading" class="no-lyrics">
      <p>暂无歌词</p>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>正在生成歌词云...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const router = useRouter()
const route = useRoute()
const playerStore = usePlayerStore()

const canvasRef = ref(null)
const loading = ref(true)
const showControls = ref(false)
const isMobile = ref(false)
const smoothCurrentTime = ref(0)

let scene, camera, renderer, controls
let lyricMeshes = []
let lyricData = []
let animationId = null
let clock = new THREE.Clock()
let currentLineIndex = -1
let transitionProgress = 1
let prevLineIndex = -1
let smoothTimeRaf = null
let lastFrameTime = 0

const currentSong = computed(() => playerStore.currentSong)

// 解析 LRC 歌词
const lyricsLines = computed(() => {
  if (!currentSong.value) return []
  const raw = playerStore.lyricsData?.[currentSong.value.id]?.lyrics || ''
  if (!raw) return []
  return raw.split('\n').filter(l => l.trim()).map(line => {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)/)
    if (match) {
      const time = parseInt(match[1]) * 60 + parseInt(match[2]) + parseInt(match[3]) / (match[3].length === 3 ? 1000 : 100)
      return { time, text: match[4] }
    }
    return null
  }).filter(Boolean)
})

// 主题色板
const colorPalette = [
  0x667eea, 0x764ba2, 0xbc4eff, 0x4facfe,
  0x00f2fe, 0x43e97b, 0xfa709a, 0xfeca57,
  0xff6b6b, 0xa29bfe, 0xfd79a8, 0x74b9ff,
]

const bgStyle = computed(() => {
  const accent = currentSong.value?.accent || '#667eea'
  return {
    '--accent': accent,
  }
})

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

// ========== Three.js 初始化 ==========
function initThree() {
  const canvas = canvasRef.value
  if (!canvas) return

  const w = canvas.clientWidth
  const h = canvas.clientHeight

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x05051a, 0.008)

  camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000)
  camera.position.set(0, 0, 120)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(w, h)
  renderer.setClearColor(0x000000, 0)
  canvas.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.3
  controls.enablePan = false
  controls.minDistance = 40
  controls.maxDistance = 250
}

// ========== 创建文字纹理 ==========
function createTextTexture(text, color, fontSize = 48) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const dpr = 2

  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif`
  const metrics = ctx.measureText(text)
  const textWidth = Math.max(metrics.width, 10)
  const padding = fontSize * 0.6

  canvas.width = (textWidth + padding * 2) * dpr
  canvas.height = fontSize * 2.2 * dpr

  ctx.scale(dpr, dpr)
  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const x = (textWidth + padding * 2) / 2
  const y = fontSize * 1.1

  // 发光层
  ctx.shadowColor = '#' + color.toString(16).padStart(6, '0')
  ctx.shadowBlur = 20
  ctx.fillStyle = '#' + color.toString(16).padStart(6, '0')
  ctx.globalAlpha = 0.3
  ctx.fillText(text, x, y)

  // 主体文字
  ctx.shadowBlur = 0
  ctx.globalAlpha = 1
  ctx.fillStyle = '#ffffff'
  ctx.fillText(text, x, y)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return {
    texture,
    width: textWidth + padding * 2,
    height: fontSize * 2.2,
  }
}

// ========== 球面上随机分布 ==========
function getRandomSpherePosition(radius) {
  const u = Math.random()
  const v = Math.random()
  const theta = 2 * Math.PI * u
  const phi = Math.acos(2 * v - 1)
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.sin(phi) * Math.sin(theta) * 0.5,
    z: radius * Math.cos(phi),
  }
}

// ========== 构建歌词云 ==========
function buildLyricsCloud() {
  // 清理旧的
  lyricMeshes.forEach(m => {
    scene.remove(m)
    m.geometry.dispose()
    m.material.map?.dispose()
    m.material.dispose()
  })
  lyricMeshes = []
  lyricData = []

  const lines = lyricsLines.value
  if (lines.length === 0) return

  const baseRadius = isMobile.value ? 45 : 60

  lines.forEach((line, i) => {
    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
    const baseSize = isMobile.value ? 22 : 32
    const fontSize = baseSize + Math.random() * (baseSize * 0.8)
    const { texture, width, height } = createTextTexture(line.text || '', color, fontSize)

    const scaleFactor = isMobile.value ? 0.12 : 0.15
    const geometry = new THREE.PlaneGeometry(width * scaleFactor, height * scaleFactor)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.45 + Math.random() * 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
    })

    const mesh = new THREE.Mesh(geometry, material)
    const pos = getRandomSpherePosition(baseRadius + Math.random() * 25)
    mesh.position.set(pos.x, pos.y, pos.z)

    mesh.rotation.y = Math.random() * Math.PI * 2
    mesh.rotation.x = (Math.random() - 0.5) * 0.5

    scene.add(mesh)
    lyricMeshes.push(mesh)
    lyricData.push({
      index: i,
      text: line.text,
      color,
      originalPos: mesh.position.clone(),
      originalScale: mesh.scale.clone(),
      originalOpacity: material.opacity,
      originalRotation: mesh.rotation.clone(),
      isActive: false,
      floatOffset: Math.random() * Math.PI * 2,
      floatSpeed: 0.5 + Math.random() * 0.5,
      floatAmplitude: 1 + Math.random() * 2,
    })
  })
}

// ========== 当前行切换 ==========
function updateCurrentLine() {
  const t = playerStore.currentTime
  const lines = lyricsLines.value
  if (lines.length === 0) return

  let newIdx = -1
  for (let i = lines.length - 1; i >= 0; i--) {
    if (t >= lines[i].time) {
      newIdx = i
      break
    }
  }

  if (newIdx !== currentLineIndex && newIdx >= 0) {
    prevLineIndex = currentLineIndex
    currentLineIndex = newIdx
    transitionProgress = 0

    if (prevLineIndex >= 0 && lyricData[prevLineIndex]) {
      lyricData[prevLineIndex].isActive = false
    }
    if (lyricData[currentLineIndex]) {
      lyricData[currentLineIndex].isActive = true
    }

    // 相机轻微推近
    if (controls) {
      // 不打断用户操作，只是轻微调整 autoRotate
    }
  }
}

// ========== 动画循环 ==========
function animate() {
  animationId = requestAnimationFrame(animate)
  const dt = Math.min(clock.getDelta(), 0.05)
  const elapsed = clock.elapsedTime

  updateCurrentLine()

  // 过渡进度
  if (transitionProgress < 1) {
    transitionProgress += dt * 2
    if (transitionProgress > 1) transitionProgress = 1
  }

  const t = easeOutCubic(transitionProgress)

  // 更新每个歌词粒子
  lyricData.forEach((data, i) => {
    const mesh = lyricMeshes[i]
    if (!mesh) return

    if (data.isActive) {
      // 当前行：飞到正前方
      const targetZ = 40
      mesh.position.x = data.originalPos.x + (0 - data.originalPos.x) * t
      mesh.position.y = data.originalPos.y + (0 - data.originalPos.y) * t
      mesh.position.z = data.originalPos.z + (targetZ - data.originalPos.z) * t

      const scaleMultiplier = 2.5
      mesh.scale.x = data.originalScale.x + (data.originalScale.x * scaleMultiplier - data.originalScale.x) * t
      mesh.scale.y = data.originalScale.y + (data.originalScale.y * scaleMultiplier - data.originalScale.y) * t

      mesh.rotation.y = data.originalRotation.y + (0 - data.originalRotation.y) * t
      mesh.rotation.x = data.originalRotation.x + (0 - data.originalRotation.x) * t

      // 发光脉冲
      const pulse = 0.7 + 0.3 * Math.sin(elapsed * 3)
      mesh.material.opacity = data.originalOpacity + (1 - data.originalOpacity) * t * pulse

    } else if (i === prevLineIndex && transitionProgress < 1) {
      // 上一行：飞回原位
      const reverseT = 1 - t
      mesh.position.x = data.originalPos.x + (0 - data.originalPos.x) * reverseT
      mesh.position.y = data.originalPos.y + (0 - data.originalPos.y) * reverseT
      mesh.position.z = data.originalPos.z + (40 - data.originalPos.z) * reverseT

      const scaleMultiplier = 2.5
      mesh.scale.x = data.originalScale.x + (data.originalScale.x * scaleMultiplier - data.originalScale.x) * reverseT
      mesh.scale.y = data.originalScale.y + (data.originalScale.y * scaleMultiplier - data.originalScale.y) * reverseT

      mesh.rotation.y = data.originalRotation.y + (0 - data.originalRotation.y) * reverseT
      mesh.rotation.x = data.originalRotation.x + (0 - data.originalRotation.x) * reverseT

      mesh.material.opacity = data.originalOpacity + (1 - data.originalOpacity) * reverseT

    } else {
      // 普通行：轻微漂浮
      const floatY = Math.sin(elapsed * data.floatSpeed + data.floatOffset) * data.floatAmplitude
      const floatX = Math.cos(elapsed * data.floatSpeed * 0.7 + data.floatOffset) * data.floatAmplitude * 0.5
      mesh.position.y = data.originalPos.y + floatY
      mesh.position.x = data.originalPos.x + floatX
    }
  })

  if (controls) controls.update()
  if (renderer && scene && camera) renderer.render(scene, camera)
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3)
}

// ========== 平滑时间 ==========
function updateSmoothTime() {
  smoothTimeRaf = requestAnimationFrame(updateSmoothTime)
  const now = performance.now()
  const dt = lastFrameTime ? (now - lastFrameTime) / 1000 : 0.016
  lastFrameTime = now

  if (playerStore.isPlaying) {
    smoothCurrentTime.value += dt
    if (smoothCurrentTime.value > playerStore.duration) {
      smoothCurrentTime.value = playerStore.duration
    }
  }
}

// 监听播放器时间校准
watch(() => playerStore.currentTime, (val) => {
  if (Math.abs(val - smoothCurrentTime.value) > 0.5) {
    smoothCurrentTime.value = val
  }
})

// ========== 响应式 ==========
function onResize() {
  if (!renderer || !camera) return
  const canvas = canvasRef.value
  if (!canvas) return

  const w = canvas.clientWidth
  const h = canvas.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)

  const wasMobile = isMobile.value
  isMobile.value = w < 768
  if (wasMobile !== isMobile.value && lyricsLines.value.length > 0) {
    buildLyricsCloud()
  }
}

// ========== 监听歌曲/歌词变化 ==========
watch(() => playerStore.currentSong?.id, async (newId) => {
  loading.value = true
  currentLineIndex = -1
  prevLineIndex = -1
  // 主动加载新歌曲的歌词
  if (newId) {
    try {
      await playerStore.loadLyricsForSong?.(newId)
    } catch (e) { /* ignore */ }
  }
  await nextTick()
  if (lyricsLines.value.length > 0) {
    buildLyricsCloud()
  }
  loading.value = false
})

watch(() => lyricsLines.value.length, () => {
  if (lyricsLines.value.length > 0 && loading.value) {
    nextTick(() => {
      buildLyricsCloud()
      loading.value = false
    })
  }
})

// ========== 生命周期 ==========
onMounted(async () => {
  isMobile.value = window.innerWidth < 768
  initThree()

  // 主动加载歌词
  if (currentSong.value?.id && lyricsLines.value.length === 0) {
    try {
      await playerStore.loadLyricsForSong?.(currentSong.value.id)
    } catch (e) { /* ignore */ }
  }

  // 等待歌词加载
  if (lyricsLines.value.length > 0) {
    buildLyricsCloud()
    loading.value = false
  } else {
    // 再等一下歌词加载
    setTimeout(() => {
      if (lyricsLines.value.length > 0) {
        buildLyricsCloud()
      }
      loading.value = false
    }, 1500)
  }

  lastFrameTime = performance.now()
  smoothTimeRaf = requestAnimationFrame(updateSmoothTime)
  animationId = requestAnimationFrame(animate)
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (animationId) cancelAnimationFrame(animationId)
  if (smoothTimeRaf) cancelAnimationFrame(smoothTimeRaf)

  lyricMeshes.forEach(m => {
    m.geometry.dispose()
    m.material.map?.dispose()
    m.material.dispose()
  })
  if (renderer) {
    renderer.dispose()
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }
  if (controls) controls.dispose()
})
</script>

<style scoped>
.lyrics-cloud-page {
  position: fixed;
  inset: 0;
  background: #05051a;
  overflow: hidden;
  z-index: 2000;
}

.lc-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background:
    radial-gradient(ellipse at 20% 80%, color-mix(in srgb, var(--accent, #667eea) 20%, transparent) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(188, 78, 255, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(15, 15, 35, 0.5) 0%, #05051a 70%);
}

/* 顶部栏 */
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 10;
  pointer-events: none;
}
.top-bar > * {
  pointer-events: auto;
}
.left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}
.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cover {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}
.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.text h1 {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
}
.text p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}
.mode-tag {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 底部控制栏 */
.bottom-controls {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 90%;
  max-width: 500px;
}
.progress-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}
.time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  min-width: 32px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #bc4eff);
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
  transition: width 0.1s linear;
}
.control-btns {
  display: flex;
  align-items: center;
  gap: 24px;
}
.ctrl-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.ctrl-btn:hover {
  color: #fff;
  transform: scale(1.1);
}
.play-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
}
.play-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

/* 提示 */
.tips {
  position: absolute;
  bottom: 110px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  z-index: 5;
  pointer-events: none;
  display: flex;
  gap: 16px;
}

/* 暂无歌词 */
.no-lyrics {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 16px;
  z-index: 5;
}

/* 加载中 */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(5, 5, 26, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 100;
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.loading-overlay p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 移动端 */
@media (max-width: 767px) {
  .top-bar {
    padding: 14px 16px;
  }
  .cover {
    width: 40px;
    height: 40px;
    border-radius: 8px;
  }
  .text h1 {
    font-size: 15px;
  }
  .text p {
    font-size: 12px;
  }
  .mode-tag {
    display: none;
  }
  .bottom-controls {
    bottom: 24px;
    padding-bottom: max(0px, env(safe-area-inset-bottom));
  }
  .play-btn {
    width: 52px;
    height: 52px;
  }
  .tips {
    display: none;
  }
}
</style>
