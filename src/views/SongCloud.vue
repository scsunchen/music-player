<template>
  <div class="song-cloud-page">
    <!-- Three.js 画布容器 -->
    <div ref="canvasRef" class="cloud-canvas"></div>

    <!-- 顶部信息栏 -->
    <div class="cloud-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <div class="header-text">
          <h1>🎵 歌曲云图</h1>
          <p>探索 {{ totalSongs }} 首音乐宇宙</p>
        </div>
      </div>
      <div class="header-right">
        <div class="stat-item">
          <span class="stat-label">歌曲总数</span>
          <span class="stat-value">{{ totalSongs }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">歌手数</span>
          <span class="stat-value">{{ artistCount }}</span>
        </div>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="cloud-search" :class="{ mobile: isMobile }">
      <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
      <input
        ref="searchInputRef"
        v-model="searchQuery"
        type="text"
        placeholder="搜索歌曲/歌手..."
        @input="onSearchInput"
        @keydown.enter="selectFirstResult"
      />
      <button v-if="searchQuery" class="search-clear" @click="clearSearch">✕</button>
      <!-- 搜索结果下拉 -->
      <div v-if="searchResults.length > 0 && searchQuery" class="search-results">
        <div
          v-for="(song, i) in searchResults.slice(0, 8)"
          :key="song.id"
          class="search-result-item"
          @click="flyToSong(song)"
        >
          <img :src="song.cover" class="sr-cover" @error="handleImgError" />
          <div class="sr-info">
            <div class="sr-title">{{ song.title }}</div>
            <div class="sr-artist">{{ song.artist }}</div>
          </div>
          <span class="sr-index">{{ i + 1 }}</span>
        </div>
      </div>
    </div>

    <!-- 桌面端：悬浮信息卡片 -->
    <transition name="fade">
      <div
        v-if="hoveredSong && !isMobile"
        class="song-tooltip"
        :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px', '--accent': hoveredSongColor }"
      >
        <div class="tooltip-cover">
          <img :src="hoveredSong.cover" :alt="hoveredSong.title" @error="handleImgError" />
        </div>
        <div class="tooltip-info">
          <div class="tooltip-title">{{ hoveredSong.title }}</div>
          <div class="tooltip-artist">{{ hoveredSong.artist }}</div>
          <div class="tooltip-meta">
            <span>📀 {{ hoveredSong.album }}</span>
            <span>⏱️ {{ formatDuration(hoveredSong.duration) }}</span>
          </div>
        </div>
        <button class="tooltip-play-btn" @click.stop="playHoveredSong">
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <span>播放</span>
        </button>
      </div>
    </transition>

    <!-- 移动端：底部歌曲信息条 -->
    <transition name="slide-up">
      <div v-if="selectedSong && isMobile" class="mobile-song-bar" :style="{ '--accent': selectedSongColor }">
        <div class="msb-cover">
          <img :src="selectedSong.cover" :alt="selectedSong.title" @error="handleImgError" />
        </div>
        <div class="msb-info">
          <div class="msb-title">{{ selectedSong.title }}</div>
          <div class="msb-artist">{{ selectedSong.artist }}</div>
        </div>
        <button class="msb-play-btn" @click="playSelectedSong">
          <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
        </button>
      </div>
    </transition>

    <!-- 右侧布局切换（竖向排列） -->
    <div class="layout-controls" :class="{ mobile: isMobile }">
      <button
        v-for="mode in layoutModes"
        :key="mode.id"
        class="layout-btn"
        :class="{ active: currentMode === mode.id }"
        @click="switchLayout(mode.id)"
        :title="mode.name"
      >
        <span class="btn-icon">{{ mode.icon }}</span>
        <span class="btn-text">{{ mode.name }}</span>
      </button>
    </div>

    <!-- 操作提示 -->
    <div class="tips-bar" v-if="!isMobile">
      <span>🖱️ 拖拽旋转</span>
      <span>🔍 滚轮缩放</span>
      <span>👆 点击播放</span>
      <span>🎵 切歌自动聚焦</span>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>正在构建音乐宇宙...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const router = useRouter()
const playerStore = usePlayerStore()

const canvasRef = ref(null)
const searchInputRef = ref(null)
const loading = ref(true)
const hoveredSong = ref(null)
const hoveredSongColor = ref('#667eea')
const tooltipPos = ref({ x: 0, y: 0 })
const currentMode = ref('sphere')
const totalSongs = ref(0)
const selectedSong = ref(null)
const selectedSongColor = ref('#667eea')
const isMobile = ref(false)

// 搜索相关
const searchQuery = ref('')
const searchResults = ref([])

let scene, camera, renderer, controls
let songPoints = null
let nebulaParticles = null
let innerGlow = null
let coreMesh = null
let raycaster
let mouse = new THREE.Vector2(-10, -10)
let animationId = null
let clock = new THREE.Clock()
let songsData = []
let colorsArray = []
let sizesArray = []
let baseSizes = []
let targetPositions = []
let originalPositions = []
let isTransitioning = false
let transitionProgress = 0
let cameraAnimating = false
let cameraStartPos = new THREE.Vector3()
let cameraTargetPos = new THREE.Vector3()
let cameraAnimProgress = 0

// 功能1: 当前播放歌曲高亮
let highlightRing = null
let highlightPulse = 0
let currentPlayingIndex = -1

// 功能3: 音频频谱可视化
let audioAnalyser = null
let audioSource = null
let freqData = null
let audioContext = null
let beatPulse = 0

// 功能5: 切歌自动聚焦
let focusAnimating = false
let focusStartPos = new THREE.Vector3()
let focusTargetPos = new THREE.Vector3()
let focusProgress = 0
let focusSongIndex = -1

// 各布局对应的相机视角
const layoutCameraViews = {
  sphere:    { dist: 65,  polar: 90,  azimuth: 0,   name: '星云球' },
  galaxy:    { dist: 80,  polar: 65,  azimuth: 0,   name: '银河旋臂' },
  helix:     { dist: 75,  polar: 85,  azimuth: 75,  name: '双螺旋' },
  fireworks: { dist: 70,  polar: 75,  azimuth: 30,  name: '烟花绽放' },
  artist:    { dist: 90,  polar: 80,  azimuth: 20,  name: '歌手聚类' },
}

const layoutModes = [
  { id: 'sphere', name: '星云球', icon: '🌐' },
  { id: 'galaxy', name: '银河旋臂', icon: '🌌' },
  { id: 'helix', name: '双螺旋', icon: '🌀' },
  { id: 'fireworks', name: '烟花绽放', icon: '🎆' },
  { id: 'artist', name: '歌手聚类', icon: '🎤' },
]

const artistCount = computed(() => {
  const artists = new Set(songsData.map(s => s.artist))
  return artists.size
})

// ========== 颜色生成 ==========
function getSongColor(song, index) {
  const hash = (song.title + song.artist + song.id).split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)

  const hue = Math.abs(hash) % 360
  const saturation = 60 + (Math.abs(hash >> 8) % 30)
  const lightness = 55 + (Math.abs(hash >> 16) % 15)

  return { hue, saturation, lightness, hash }
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  return [r, g, b]
}

// ========== 布局算法 ==========
function getLayoutPosition(mode, index, total, song) {
  const t = index / total
  const seed = (song.id * 9301 + 49297) % 233280 / 233280

  switch (mode) {
    case 'sphere': {
      const phi = Math.acos(1 - 2 * t)
      const theta = Math.PI * (1 + Math.sqrt(5)) * index
      const r = 30 + seed * 8
      return new THREE.Vector3(
        r * Math.cos(theta) * Math.sin(phi),
        r * Math.cos(phi),
        r * Math.sin(theta) * Math.sin(phi)
      )
    }
    case 'galaxy': {
      const arms = 4
      const armIndex = index % arms
      const r = 3 + t * 45
      const twist = t * 6.5
      const angle = twist + (armIndex * Math.PI * 2 / arms) + (seed - 0.5) * 1.2
      const yOffset = (seed - 0.5) * 2.5 * (1 - t * 0.5)
      return new THREE.Vector3(
        Math.cos(angle) * r,
        yOffset,
        Math.sin(angle) * r
      )
    }
    case 'helix': {
      const helixIndex = index % 2
      const r = 16 + seed * 5
      const angle = t * Math.PI * 10 + helixIndex * Math.PI
      const y = (t - 0.5) * 75
      return new THREE.Vector3(
        Math.cos(angle) * r,
        y,
        Math.sin(angle) * r
      )
    }
    case 'fireworks': {
      const phi = Math.acos(2 * seed - 1)
      const theta = 2 * Math.PI * ((index * 0.618033988749895) % 1)
      const r = 8 + Math.pow(t, 0.7) * 42
      return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      )
    }
    case 'artist': {
      // 功能4: 按歌手聚类 — 同歌手聚成球状星团
      if (!artistClusterData) buildArtistClusters()
      const cluster = artistClusterData.get(song.artist)
      if (!cluster) return new THREE.Vector3(0, 0, 0)
      const localIdx = cluster.songIndices.indexOf(index)
      const cT = localIdx / cluster.count
      const cPhi = Math.acos(1 - 2 * (cT + 0.001))
      const cTheta = Math.PI * (1 + Math.sqrt(5)) * localIdx
      const cR = 4 + seed * 3
      return new THREE.Vector3(
        cluster.center.x + cR * Math.cos(cTheta) * Math.sin(cPhi),
        cluster.center.y + cR * Math.cos(cPhi),
        cluster.center.z + cR * Math.sin(cTheta) * Math.sin(cPhi)
      )
    }
    default:
      return new THREE.Vector3(0, 0, 0)
  }
}

// ========== 歌手聚类数据 ==========
let artistClusterData = null

function buildArtistClusters() {
  artistClusterData = new Map()
  const artistMap = new Map()
  songsData.forEach((song, i) => {
    if (!artistMap.has(song.artist)) {
      artistMap.set(song.artist, [])
    }
    artistMap.get(song.artist).push(i)
  })

  const artists = Array.from(artistMap.keys())
  const numArtists = artists.length
  artists.forEach((artist, ai) => {
    const indices = artistMap.get(artist)
    // 将歌手星团分布在球面上
    const phi = Math.acos(1 - 2 * (ai + 0.5) / numArtists)
    const theta = Math.PI * (1 + Math.sqrt(5)) * ai
    const r = 28 + (indices.length / songsData.length) * 15
    artistClusterData.set(artist, {
      center: new THREE.Vector3(
        r * Math.cos(theta) * Math.sin(phi),
        r * Math.cos(phi),
        r * Math.sin(theta) * Math.sin(phi)
      ),
      songIndices: indices,
      count: indices.length
    })
  })
}

// ========== 创建粒子纹理 ==========
function createParticleTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)')
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}

// ========== 初始化 Three.js ==========
function initThree() {
  const container = canvasRef.value
  const width = container.clientWidth
  const height = container.clientHeight

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x05051a, 0.012)

  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500)
  camera.position.set(0, 0, 65)

  renderer = new THREE.WebGLRenderer({ antialias: !isMobile.value, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(isMobile.value ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.rotateSpeed = 0.4
  controls.minDistance = 20
  controls.maxDistance = 150
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.2
  controls.enablePan = false
  controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN
  }

  raycaster = new THREE.Raycaster()

  createNebula()
  createInnerGlow()
  createCore()
  createSongPoints()
  createHighlightRing()
  initAudioAnalyser()

  loading.value = false
}

// ========== 功能1: 当前播放歌曲高亮光环 ==========
function createHighlightRing() {
  const geometry = new THREE.RingGeometry(3, 5, 64)
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  highlightRing = new THREE.Mesh(geometry, material)
  highlightRing.visible = false
  scene.add(highlightRing)
}

function updateHighlightRing(elapsed) {
  if (!highlightRing) return

  const song = playerStore.currentSong
  if (!song) {
    highlightRing.visible = false
    currentPlayingIndex = -1
    return
  }

  const newIdx = songsData.findIndex(s => s.id === song.id)
  if (newIdx !== currentPlayingIndex) {
    currentPlayingIndex = newIdx
    if (newIdx >= 0) {
      highlightRing.visible = true
      const rgb = colorsArray[newIdx]
      highlightRing.material.color.setRGB(rgb[0], rgb[1], rgb[2])
    } else {
      highlightRing.visible = false
    }
  }

  if (highlightRing.visible && currentPlayingIndex >= 0) {
    const posArr = songPoints.geometry.attributes.position.array
    const x = posArr[currentPlayingIndex * 3]
    const y = posArr[currentPlayingIndex * 3 + 1]
    const z = posArr[currentPlayingIndex * 3 + 2]
    highlightRing.position.set(x, y, z)

    // 脉冲动画
    highlightPulse += 0.05
    const pulse = 1 + Math.sin(highlightPulse) * 0.3
    highlightRing.scale.setScalar(pulse)
    highlightRing.material.opacity = 0.4 + Math.sin(highlightPulse) * 0.2
    // 让光环始终面向相机
    highlightRing.lookAt(camera.position)
  }
}

// ========== 功能3: 音频频谱可视化 ==========
function initAudioAnalyser() {
  try {
    const audioEl = document.querySelector('audio')
    if (!audioEl) return
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    audioSource = audioContext.createMediaElementSource(audioEl)
    audioAnalyser = audioContext.createAnalyser()
    audioAnalyser.fftSize = 64
    audioAnalyser.smoothingTimeConstant = 0.8
    audioSource.connect(audioAnalyser)
    audioAnalyser.connect(audioContext.destination)
    freqData = new Uint8Array(audioAnalyser.frequencyBinCount)
  } catch (e) {
    // 音频上下文可能因跨域限制失败，静默降级
  }
}

function updateAudioVisualization(elapsed) {
  if (!audioAnalyser || !freqData || !songPoints) return
  audioAnalyser.getByteFrequencyData(freqData)

  const sizes = songPoints.geometry.attributes.size.array
  const avgFreq = freqData.reduce((a, b) => a + b, 0) / freqData.length
  beatPulse = avgFreq / 255

  // 根据频段让粒子脉动
  for (let i = 0; i < songsData.length; i++) {
    const freqIdx = i % freqData.length
    const freqVal = freqData[freqIdx] / 255
    const boost = 1 + freqVal * 0.8 + beatPulse * 0.3
    // 不影响悬浮放大逻辑，只做额外叠加
    if (i !== currentPlayingIndex) {
      sizes[i] = baseSizes[i] * boost
    }
  }
  songPoints.geometry.attributes.size.needsUpdate = true

  // 核心随节拍跳动
  if (coreMesh) {
    const breath = 1 + Math.sin(elapsed * 0.8) * 0.15 + beatPulse * 0.4
    coreMesh.scale.setScalar(breath)
  }
}

// ========== 背景星云 ==========
function createNebula() {
  const count = isMobile.value ? 1500 : 4000
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  const palette = [
    [0.4, 0.5, 0.95],
    [0.6, 0.35, 0.85],
    [0.9, 0.45, 0.65],
    [0.3, 0.8, 0.75],
    [0.85, 0.7, 0.35],
    [0.5, 0.8, 0.95],
  ]

  for (let i = 0; i < count; i++) {
    const r = 45 + Math.random() * 80
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6
    positions[i * 3 + 2] = r * Math.cos(phi)

    const c = palette[Math.floor(Math.random() * palette.length)]
    colors[i * 3] = c[0]
    colors[i * 3 + 1] = c[1]
    colors[i * 3 + 2] = c[2]
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const tex = createParticleTexture()
  const material = new THREE.PointsMaterial({
    size: 0.6,
    map: tex,
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  })

  nebulaParticles = new THREE.Points(geometry, material)
  scene.add(nebulaParticles)
}

// ========== 内层光晕 ==========
function createInnerGlow() {
  const count = isMobile.value ? 400 : 1200
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const r = 8 + Math.random() * 28
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)

    const t = Math.random()
    colors[i * 3] = 0.5 + t * 0.3
    colors[i * 3 + 1] = 0.5 + t * 0.2
    colors[i * 3 + 2] = 1.0
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const tex = createParticleTexture()
  const material = new THREE.PointsMaterial({
    size: 1.0,
    map: tex,
    vertexColors: true,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  innerGlow = new THREE.Points(geometry, material)
  scene.add(innerGlow)
}

// ========== 中心核心 ==========
function createCore() {
  const geometry = new THREE.SphereGeometry(2.5, 48, 48)
  const material = new THREE.MeshBasicMaterial({
    color: 0x667eea,
    transparent: true,
    opacity: 0.2,
  })
  coreMesh = new THREE.Mesh(geometry, material)
  scene.add(coreMesh)

  const haloGeo = new THREE.SphereGeometry(5, 32, 32)
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x667eea,
    transparent: true,
    opacity: 0.06,
  })
  const halo = new THREE.Mesh(haloGeo, haloMat)
  coreMesh.add(halo)
}

// ========== 歌曲粒子 ==========
function createSongPoints() {
  const count = songsData.length
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)

  colorsArray = []
  sizesArray = new Float32Array(count)
  baseSizes = new Float32Array(count)
  targetPositions = []
  originalPositions = []

  songsData.forEach((song, i) => {
    const pos = getLayoutPosition(currentMode.value, i, count, song)
    positions[i * 3] = pos.x
    positions[i * 3 + 1] = pos.y
    positions[i * 3 + 2] = pos.z

    targetPositions.push(pos.clone())
    originalPositions.push(pos.clone())

    const colorInfo = getSongColor(song, i)
    const rgb = hslToRgb(colorInfo.hue, colorInfo.saturation, colorInfo.lightness)
    colors[i * 3] = rgb[0]
    colors[i * 3 + 1] = rgb[1]
    colors[i * 3 + 2] = rgb[2]
    colorsArray.push(rgb)

    const sizeBase = 0.8 + (song.duration / 300) * 1.2
    const size = Math.min(sizeBase, 2.5)
    sizes[i] = size
    sizesArray[i] = size
    baseSizes[i] = size
  })

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const tex = createParticleTexture()
  const material = new THREE.PointsMaterial({
    size: 1.5,
    map: tex,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  })

  songPoints = new THREE.Points(geometry, material)
  scene.add(songPoints)
}

// ========== 布局切换 ==========
function switchLayout(mode) {
  if (isTransitioning || mode === currentMode.value) return
  // 如果切换到 artist 模式，先构建聚类
  if (mode === 'artist') buildArtistClusters()

  isTransitioning = true
  currentMode.value = mode
  transitionProgress = 0
  cameraAnimating = true
  cameraAnimProgress = 0

  controls.enabled = false
  controls.autoRotate = false
  controls.enableDamping = false

  cameraStartPos.copy(camera.position)

  const view = layoutCameraViews[mode]
  const polarRad = view.polar * Math.PI / 180
  const azRad = view.azimuth * Math.PI / 180
  cameraTargetPos.set(
    view.dist * Math.sin(polarRad) * Math.sin(azRad),
    view.dist * Math.cos(polarRad),
    view.dist * Math.sin(polarRad) * Math.cos(azRad)
  )

  const count = songsData.length
  songsData.forEach((song, i) => {
    originalPositions[i].copy(
      new THREE.Vector3(
        songPoints.geometry.attributes.position.array[i * 3],
        songPoints.geometry.attributes.position.array[i * 3 + 1],
        songPoints.geometry.attributes.position.array[i * 3 + 2]
      )
    )
    targetPositions[i] = getLayoutPosition(mode, i, count, song)
  })
}

// ========== 缓动函数 ==========
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ========== 功能2: 搜索定位 ==========
function onSearchInput() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  const q = searchQuery.value.toLowerCase()
  searchResults.value = songsData.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.artist.toLowerCase().includes(q)
  )
}

function selectFirstResult() {
  if (searchResults.value.length > 0) {
    flyToSong(searchResults.value[0])
  }
}

function flyToSong(song) {
  const idx = songsData.findIndex(s => s.id === song.id)
  if (idx < 0) return

  searchQuery.value = ''
  searchResults.value = []

  // 获取粒子当前位置
  const posArr = songPoints.geometry.attributes.position.array
  const targetX = posArr[idx * 3]
  const targetY = posArr[idx * 3 + 1]
  const targetZ = posArr[idx * 3 + 2]

  // 启动聚焦动画
  focusAnimating = true
  focusProgress = 0
  focusSongIndex = idx
  focusStartPos.copy(camera.position)

  // 相机目标位置：粒子前方一定距离
  const dir = new THREE.Vector3(targetX, targetY, targetZ).normalize()
  const dist = 20
  focusTargetPos.set(
    targetX + dir.x * dist,
    targetY + dir.y * dist,
    targetZ + dir.z * dist
  )

  // 暂停自动旋转
  controls.autoRotate = false
  controls.enabled = false

  // 高亮该粒子
  const rgb = colorsArray[idx]
  selectedSong.value = song
  selectedSongColor.value = `rgb(${Math.round(rgb[0]*255)}, ${Math.round(rgb[1]*255)}, ${Math.round(rgb[2]*255)})`
  createBurstEffect(song)
}

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
}

// ========== 功能5: 切歌自动聚焦 ==========
function onPlayerSongChange(newSong) {
  if (!newSong || !songPoints) return
  const idx = songsData.findIndex(s => s.id === newSong.id)
  if (idx < 0) return

  // 如果当前正在过渡或聚焦动画中，不中断
  if (isTransitioning) return

  // 获取粒子位置
  const posArr = songPoints.geometry.attributes.position.array
  const targetX = posArr[idx * 3]
  const targetY = posArr[idx * 3 + 1]
  const targetZ = posArr[idx * 3 + 2]

  focusAnimating = true
  focusProgress = 0
  focusSongIndex = idx
  focusStartPos.copy(camera.position)

  const dir = new THREE.Vector3(targetX, targetY, targetZ).normalize()
  const dist = 25
  focusTargetPos.set(
    targetX + dir.x * dist,
    targetY + dir.y * dist,
    targetZ + dir.z * dist
  )

  controls.autoRotate = false
  controls.enabled = false
}

// 监听播放器切歌
watch(() => playerStore.currentSong?.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    // 延迟一点确保粒子位置已更新
    setTimeout(() => {
      if (playerStore.currentSong) {
        onPlayerSongChange(playerStore.currentSong)
      }
    }, 100)
  }
})

// ========== 动画循环 ==========
function animate() {
  animationId = requestAnimationFrame(animate)
  const delta = clock.getDelta()
  const elapsed = clock.elapsedTime

  // 布局过渡动画
  if (isTransitioning) {
    const dt = Math.min(delta, 0.05)
    transitionProgress += dt * 0.8
    if (transitionProgress >= 1) {
      transitionProgress = 1
      isTransitioning = false
      cameraAnimating = false
      controls.autoRotate = true
      controls.enableDamping = true
      controls.enabled = true
      controls.update()
    }
    const t = easeInOutCubic(transitionProgress)

    const posArr = songPoints.geometry.attributes.position.array
    for (let i = 0; i < songsData.length; i++) {
      const start = originalPositions[i]
      const end = targetPositions[i]
      posArr[i * 3] = start.x + (end.x - start.x) * t
      posArr[i * 3 + 1] = start.y + (end.y - start.y) * t
      posArr[i * 3 + 2] = start.z + (end.z - start.z) * t
    }
    songPoints.geometry.attributes.position.needsUpdate = true

    if (cameraAnimating) {
      camera.position.lerpVectors(cameraStartPos, cameraTargetPos, t)
      camera.lookAt(0, 0, 0)
    }
  } else if (focusAnimating) {
    // 功能5: 相机聚焦动画
    const dt = Math.min(delta, 0.05)
    focusProgress += dt * 1.2
    if (focusProgress >= 1) {
      focusProgress = 1
      focusAnimating = false
      controls.autoRotate = true
      controls.enableDamping = true
      controls.enabled = true
      controls.update()
    }
    const t = easeInOutCubic(focusProgress)
    camera.position.lerpVectors(focusStartPos, focusTargetPos, t)

    // 聚焦目标粒子位置
    if (focusSongIndex >= 0) {
      const posArr = songPoints.geometry.attributes.position.array
      const tx = posArr[focusSongIndex * 3]
      const ty = posArr[focusSongIndex * 3 + 1]
      const tz = posArr[focusSongIndex * 3 + 2]
      camera.lookAt(tx, ty, tz)
    } else {
      camera.lookAt(0, 0, 0)
    }
  } else {
    // 轻微浮动
    const posArr = songPoints.geometry.attributes.position.array
    for (let i = 0; i < songsData.length; i++) {
      const float = Math.sin(elapsed * 0.4 + i * 0.013) * 0.15
      posArr[i * 3 + 1] = targetPositions[i].y + float
    }
    songPoints.geometry.attributes.position.needsUpdate = true
  }

  // 星云旋转
  if (nebulaParticles) {
    nebulaParticles.rotation.y = elapsed * 0.015
    nebulaParticles.rotation.x = Math.sin(elapsed * 0.01) * 0.1
  }
  if (innerGlow) {
    innerGlow.rotation.y = -elapsed * 0.025
  }

  // 核心呼吸（如果没有音频分析则用默认动画）
  if (coreMesh && !audioAnalyser) {
    const breath = 1 + Math.sin(elapsed * 0.8) * 0.15
    coreMesh.scale.setScalar(breath)
  }

  // 根据动态色系更新核心颜色
  if (coreMesh && playerStore.themeColor) {
    const color = new THREE.Color(playerStore.themeColor)
    coreMesh.material.color.lerp(color, 0.02)
  }

  // 功能1: 更新当前播放高亮光环
  updateHighlightRing(elapsed)

  // 功能3: 更新音频频谱可视化
  if (!isTransitioning && !focusAnimating) {
    updateAudioVisualization(elapsed)
  }

  // Raycaster 检测悬浮（过渡/聚焦期间跳过）
  if (songPoints && mouse.x > -9 && !isTransitioning && !focusAnimating && controls.enabled) {
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObject(songPoints)

    if (intersects.length > 0) {
      const idx = intersects[0].index
      const song = songsData[idx]
      if (hoveredSong.value?.id !== song.id) {
        hoveredSong.value = song
        const rgb = colorsArray[idx]
        hoveredSongColor.value = `rgb(${Math.round(rgb[0]*255)}, ${Math.round(rgb[1]*255)}, ${Math.round(rgb[2]*255)})`
      }
      const sizes = songPoints.geometry.attributes.size.array
      for (let i = 0; i < sizes.length; i++) {
        if (i === idx) {
          sizes[i] += (baseSizes[i] * 2.5 - sizes[i]) * 0.15
        } else if (i !== currentPlayingIndex) {
          sizes[i] += (baseSizes[i] - sizes[i]) * 0.05
        }
      }
      songPoints.geometry.attributes.size.needsUpdate = true
      controls.autoRotate = false
    } else {
      if (hoveredSong.value) {
        hoveredSong.value = null
        const sizes = songPoints.geometry.attributes.size.array
        for (let i = 0; i < sizes.length; i++) {
          if (i !== currentPlayingIndex) {
            sizes[i] = baseSizes[i]
          }
        }
        songPoints.geometry.attributes.size.needsUpdate = true
        controls.autoRotate = true
      }
    }
  }

  if (!isTransitioning && !focusAnimating && controls.enabled) {
    controls.update()
  }
  renderer.render(scene, camera)
}

// ========== 事件处理 ==========
function onMouseMove(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  tooltipPos.value = { x: e.clientX + 16, y: e.clientY + 16 }
}

function onClick() {
  if (hoveredSong.value) {
    playerStore.playSong(hoveredSong.value)
    createBurstEffect(hoveredSong.value)
  }
}

function playHoveredSong() {
  if (hoveredSong.value) {
    playerStore.playSong(hoveredSong.value)
    createBurstEffect(hoveredSong.value)
    hoveredSong.value = null
  }
}

// 移动端触摸
let touchStartTime = 0
let touchStartPos = { x: 0, y: 0 }

function onTouchStart(e) {
  if (e.touches.length !== 1) return
  touchStartTime = Date.now()
  touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
}

function onTouchEnd(e) {
  if (Date.now() - touchStartTime > 300) return
  const dx = e.changedTouches[0].clientX - touchStartPos.x
  const dy = e.changedTouches[0].clientY - touchStartPos.y
  if (Math.sqrt(dx * dx + dy * dy) > 20) return

  const rect = canvasRef.value.getBoundingClientRect()
  const touch = e.changedTouches[0]
  mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObject(songPoints)
  if (intersects.length > 0) {
    const idx = intersects[0].index
    const song = songsData[idx]
    selectedSong.value = song
    const rgb = colorsArray[idx]
    selectedSongColor.value = `rgb(${Math.round(rgb[0]*255)}, ${Math.round(rgb[1]*255)}, ${Math.round(rgb[2]*255)})`
    createBurstEffect(song)
  } else {
    selectedSong.value = null
  }
}

function playSelectedSong() {
  if (selectedSong.value) {
    playerStore.playSong(selectedSong.value)
  }
}

function onResize() {
  if (!renderer || !camera) return
  const width = canvasRef.value.clientWidth
  const height = canvasRef.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

// ========== 爆裂效果 ==========
function createBurstEffect(song) {
  const idx = songsData.findIndex(s => s.id === song.id)
  if (idx < 0) return

  const posArr = songPoints.geometry.attributes.position.array
  const pos = new THREE.Vector3(
    posArr[idx * 3],
    posArr[idx * 3 + 1],
    posArr[idx * 3 + 2]
  )

  const count = 50
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const velocities = []

  const rgb = colorsArray[idx]

  for (let i = 0; i < count; i++) {
    positions[i * 3] = pos.x
    positions[i * 3 + 1] = pos.y
    positions[i * 3 + 2] = pos.z

    colors[i * 3] = rgb[0]
    colors[i * 3 + 1] = rgb[1]
    colors[i * 3 + 2] = rgb[2]

    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const speed = 0.2 + Math.random() * 0.4
    velocities.push(new THREE.Vector3(
      speed * Math.sin(phi) * Math.cos(theta),
      speed * Math.sin(phi) * Math.sin(theta),
      speed * Math.cos(phi)
    ))
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const tex = createParticleTexture()
  const mat = new THREE.PointsMaterial({
    size: 1.2,
    map: tex,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  const points = new THREE.Points(geometry, mat)
  scene.add(points)

  let life = 1.0
  function burst() {
    if (life <= 0) {
      scene.remove(points)
      geometry.dispose()
      mat.dispose()
      return
    }
    const pArr = geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pArr[i * 3] += velocities[i].x
      pArr[i * 3 + 1] += velocities[i].y
      pArr[i * 3 + 2] += velocities[i].z
      velocities[i].multiplyScalar(0.97)
    }
    geometry.attributes.position.needsUpdate = true
    life -= 0.015
    mat.opacity = life
    requestAnimationFrame(burst)
  }
  burst()
}

// ========== 工具函数 ==========
function formatDuration(seconds) {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

function handleImgError(e) {
  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23222" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%23666" font-size="12">🎵</text></svg>'
}

function goBack() {
  router.back()
}

// ========== 加载数据 ==========
async function loadSongs() {
  try {
    const { loadAllSongs } = await import('../utils/songLoader')
    const data = await loadAllSongs()
    songsData = data.songs || data
    totalSongs.value = songsData.length
  } catch (e) {
    const { resolveUrl } = (await import('../utils/baseUrl'))
    const res = await fetch(resolveUrl('data/songs.json'))
    const data = await res.json()
    songsData = data.songs || data
    totalSongs.value = songsData.length
  }
}

// ========== 生命周期 ==========
onMounted(async () => {
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth < 768

  await loadSongs()
  await nextTick()
  initThree()
  animate()

  window.addEventListener('resize', onResize)
  canvasRef.value.addEventListener('mousemove', onMouseMove)
  canvasRef.value.addEventListener('click', onClick)
  canvasRef.value.addEventListener('touchstart', onTouchStart, { passive: true })
  canvasRef.value.addEventListener('touchend', onTouchEnd, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) {
    renderer.dispose()
    canvasRef.value?.removeChild(renderer.domElement)
  }
  if (controls) controls.dispose()
  if (audioContext) {
    audioContext.close()
  }
})
</script>

<style scoped>
.song-cloud-page {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #05051a;
}

.cloud-canvas {
  width: 100%;
  height: 100%;
  cursor: grab;
}
.cloud-canvas:active {
  cursor: grabbing;
}

/* 顶部栏 */
.cloud-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 10;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(180deg, rgba(5,5,26,0.85) 0%, transparent 100%);
  pointer-events: none;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  pointer-events: auto;
}

.back-btn {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}
.back-btn:hover {
  background: rgba(255,255,255,0.2);
  color: #fff;
}

.header-text h1 {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
  margin: 0;
}
.header-text p {
  color: rgba(255,255,255,0.45);
  font-size: 12px;
  margin: 2px 0 0 0;
}

.header-right {
  display: flex;
  gap: 24px;
  pointer-events: auto;
}

.stat-item {
  text-align: right;
}
.stat-label {
  display: block;
  color: rgba(255,255,255,0.4);
  font-size: 11px;
}
.stat-value {
  display: block;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin-top: 2px;
}

/* 搜索框 */
.cloud-search {
  position: fixed;
  top: 72px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 15;
  width: 320px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(15, 15, 35, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 24px;
  padding: 8px 16px;
  transition: border-color 0.25s;
}
.cloud-search:focus-within {
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.15);
}
.cloud-search.mobile {
  width: calc(100% - 32px);
  top: 64px;
}
.search-icon {
  color: rgba(255,255,255,0.4);
  flex-shrink: 0;
}
.cloud-search input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #fff;
  font-size: 14px;
  font-family: inherit;
}
.cloud-search input::placeholder {
  color: rgba(255,255,255,0.3);
}
.search-clear {
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 50%;
  transition: all 0.2s;
}
.search-clear:hover {
  color: #fff;
  background: rgba(255,255,255,0.1);
}

/* 搜索结果下拉 */
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  overflow: hidden;
  max-height: 320px;
  overflow-y: auto;
  scrollbar-width: none;
}
.search-results::-webkit-scrollbar {
  display: none;
}
.search-result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
}
.search-result-item:hover {
  background: rgba(255,255,255,0.08);
}
.sr-cover {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}
.sr-info {
  flex: 1;
  min-width: 0;
}
.sr-title {
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sr-artist {
  color: rgba(255,255,255,0.5);
  font-size: 11px;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sr-index {
  color: rgba(255,255,255,0.2);
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

/* 悬浮卡片 */
.song-tooltip {
  position: fixed;
  z-index: 100;
  pointer-events: auto;
  width: 260px;
  background: rgba(15, 15, 35, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 40px var(--accent, #667eea33);
}

.tooltip-cover {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
  background: rgba(255,255,255,0.05);
}
.tooltip-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tooltip-title {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tooltip-artist {
  color: rgba(255,255,255,0.6);
  font-size: 13px;
  margin-bottom: 8px;
}
.tooltip-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: rgba(255,255,255,0.4);
  font-size: 11px;
}
.tooltip-play-btn {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  background: none;
  border-left: none;
  border-right: none;
  border-bottom: none;
  color: var(--accent, #667eea);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.tooltip-play-btn:hover {
  color: #fff;
  background: var(--accent, #667eea);
  margin: 10px -14px -14px -14px;
  padding: 12px 14px;
  border-radius: 0 0 14px 14px;
}

/* 右侧竖排布局控制 */
.layout-controls {
  position: fixed;
  right: 16px;
  bottom: calc(50% + 40px);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(15, 15, 35, 0.65);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 6px;
}
.layout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.5);
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  transition: all 0.25s;
  white-space: nowrap;
}
.layout-btn:hover {
  color: rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.08);
}
.layout-btn.active {
  background: rgba(255,255,255,0.15);
  color: #fff;
}
.btn-icon { font-size: 16px; }

/* 操作提示 */
.tips-bar {
  position: fixed;
  bottom: 96px;
  left: 20px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  color: rgba(255,255,255,0.3);
  font-size: 12px;
}

/* 加载 */
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #05051a;
  color: rgba(255,255,255,0.5);
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255,255,255,0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loading-overlay p {
  font-size: 14px;
  letter-spacing: 2px;
  margin: 0;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* 上滑过渡 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* ========== 移动端适配 ========== */
@media (max-width: 768px) {
  .cloud-header {
    padding: 12px 16px;
  }
  .header-text h1 {
    font-size: 17px;
  }
  .header-text p {
    font-size: 11px;
  }
  .header-right {
    gap: 14px;
  }
  .stat-value {
    font-size: 15px;
  }
  .stat-label {
    font-size: 10px;
  }
  .back-btn {
    width: 36px;
    height: 36px;
  }
}

/* 移动端布局控制（右侧竖排，仅图标） */
.layout-controls.mobile {
  right: 8px;
  bottom: calc(50% + 40px);
  padding: 4px;
  gap: 2px;
}
.layout-controls.mobile .layout-btn {
  padding: 8px 10px;
  font-size: 16px;
  flex-direction: column;
  gap: 2px;
}
.layout-controls.mobile .btn-text {
  font-size: 9px;
}

/* 移动端底部歌曲条 */
.mobile-song-bar {
  position: fixed;
  bottom: 96px;
  left: 12px;
  right: 12px;
  z-index: 15;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(15, 15, 35, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.3), 0 0 30px var(--accent, #667eea33);
}
.msb-cover {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255,255,255,0.05);
}
.msb-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.msb-info {
  flex: 1;
  min-width: 0;
}
.msb-title {
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.msb-artist {
  color: rgba(255,255,255,0.5);
  font-size: 12px;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.msb-play-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--accent, #667eea);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 12px var(--accent, #667eea66);
}
.msb-play-btn:active {
  transform: scale(0.95);
}
</style>
