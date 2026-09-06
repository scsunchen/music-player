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
const loading = ref(true)
const hoveredSong = ref(null)
const hoveredSongColor = ref('#667eea')
const tooltipPos = ref({ x: 0, y: 0 })
const currentMode = ref('sphere')
const totalSongs = ref(0)
const selectedSong = ref(null)
const selectedSongColor = ref('#667eea')
const isMobile = ref(false)

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

// 各布局对应的相机视角
const layoutCameraViews = {
  sphere:    { dist: 65,  polar: 90,  azimuth: 0,   name: '星云球' },
  galaxy:    { dist: 80,  polar: 65,  azimuth: 0,   name: '银河旋臂' },
  helix:     { dist: 75,  polar: 85,  azimuth: 75,  name: '双螺旋' },
  fireworks: { dist: 70,  polar: 75,  azimuth: 30,  name: '烟花绽放' },
}

const layoutModes = [
  { id: 'sphere', name: '星云球', icon: '🌐' },
  { id: 'galaxy', name: '银河旋臂', icon: '🌌' },
  { id: 'helix', name: '双螺旋', icon: '🌀' },
  { id: 'fireworks', name: '烟花绽放', icon: '🎆' },
]

const artistCount = computed(() => {
  const artists = new Set(songsData.map(s => s.artist))
  return artists.size
})

// ========== 颜色生成 ==========
function getSongColor(song, index) {
  // 根据歌曲信息生成伪随机但稳定的颜色
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
      // 斐波那契球面分布
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
      // 银河旋臂（4 条旋臂，扁平盘状）
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
      // 双螺旋（纵向拉长）
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
      // 烟花绽放（放射状，外层更稀疏）
      const phi = Math.acos(2 * seed - 1)
      const theta = 2 * Math.PI * ((index * 0.618033988749895) % 1)
      const r = 8 + Math.pow(t, 0.7) * 42
      return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      )
    }
    default:
      return new THREE.Vector3(0, 0, 0)
  }
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

  // 场景
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x05051a, 0.012)

  // 相机
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500)
  camera.position.set(0, 0, 65)

  // 渲染器 - 移动端降低像素比
  renderer = new THREE.WebGLRenderer({ antialias: !isMobile.value, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(isMobile.value ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  // 控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.rotateSpeed = 0.4
  controls.minDistance = 20
  controls.maxDistance = 150
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.2
  controls.enablePan = false
  // 移动端触摸设置
  controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN
  }

  // Raycaster
  raycaster = new THREE.Raycaster()

  // 创建背景星云
  createNebula()

  // 创建内层光晕
  createInnerGlow()

  // 创建中心核心
  createCore()

  // 创建歌曲粒子
  createSongPoints()

  loading.value = false
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
  // 核心球
  const geometry = new THREE.SphereGeometry(2.5, 48, 48)
  const material = new THREE.MeshBasicMaterial({
    color: 0x667eea,
    transparent: true,
    opacity: 0.2,
  })
  coreMesh = new THREE.Mesh(geometry, material)
  scene.add(coreMesh)

  // 光晕层
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

    // 大小基于时长或随机，营造层次感
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
  isTransitioning = true
  currentMode.value = mode
  transitionProgress = 0
  cameraAnimating = true
  cameraAnimProgress = 0

  // 完全禁用 OrbitControls，防止内部阻尼状态覆盖手动相机动画
  controls.enabled = false
  controls.autoRotate = false
  controls.enableDamping = false

  // 保存当前相机位置
  cameraStartPos.copy(camera.position)

  // 计算目标相机位置
  const view = layoutCameraViews[mode]
  const polarRad = view.polar * Math.PI / 180
  const azRad = view.azimuth * Math.PI / 180
  cameraTargetPos.set(
    view.dist * Math.sin(polarRad) * Math.sin(azRad),
    view.dist * Math.cos(polarRad),
    view.dist * Math.sin(polarRad) * Math.cos(azRad)
  )

  // 计算新目标位置
  const count = songsData.length
  songsData.forEach((song, i) => {
    const newPos = getLayoutPosition(mode, i, count, song)
    originalPositions[i].copy(
      new THREE.Vector3(
        songPoints.geometry.attributes.position.array[i * 3],
        songPoints.geometry.attributes.position.array[i * 3 + 1],
        songPoints.geometry.attributes.position.array[i * 3 + 2]
      )
    )
    targetPositions[i] = newPos
  })
}

// ========== 缓动函数 ==========
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ========== 动画循环 ==========
function animate() {
  animationId = requestAnimationFrame(animate)
  // 先取 delta（更新内部时间戳），再读 elapsedTime
  // 不能先调 getElapsedTime() 再调 getDelta()，否则 delta≈0
  const delta = clock.getDelta()
  const elapsed = clock.elapsedTime

  // 布局过渡动画
  if (isTransitioning) {
    // 安全限制：delta 异常时用固定值
    const dt = Math.min(delta, 0.05)
    transitionProgress += dt * 0.8
    if (transitionProgress >= 1) {
      transitionProgress = 1
      isTransitioning = false
      cameraAnimating = false
      // 恢复 OrbitControls，从新相机位置重新开始
      controls.autoRotate = true
      controls.enableDamping = true
      controls.enabled = true
      // update() 会读取当前相机位置，重新推导内部球面坐标
      controls.update()
    }
    const t = easeInOutCubic(transitionProgress)

    // 粒子位置过渡
    const posArr = songPoints.geometry.attributes.position.array
    for (let i = 0; i < songsData.length; i++) {
      const start = originalPositions[i]
      const end = targetPositions[i]
      posArr[i * 3] = start.x + (end.x - start.x) * t
      posArr[i * 3 + 1] = start.y + (end.y - start.y) * t
      posArr[i * 3 + 2] = start.z + (end.z - start.z) * t
    }
    songPoints.geometry.attributes.position.needsUpdate = true

    // 相机视角平滑过渡
    if (cameraAnimating) {
      camera.position.lerpVectors(cameraStartPos, cameraTargetPos, t)
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

  // 核心呼吸
  if (coreMesh) {
    const breath = 1 + Math.sin(elapsed * 0.8) * 0.15
    coreMesh.scale.setScalar(breath)
  }

  // 根据动态色系更新核心颜色
  if (coreMesh && playerStore.themeColor) {
    const color = new THREE.Color(playerStore.themeColor)
    coreMesh.material.color.lerp(color, 0.02)
  }

  // Raycaster 检测悬浮（过渡期间跳过，避免干扰相机动画）
  if (songPoints && mouse.x > -9 && !isTransitioning && controls.enabled) {
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
      // 悬浮放大
      const sizes = songPoints.geometry.attributes.size.array
      for (let i = 0; i < sizes.length; i++) {
        if (i === idx) {
          sizes[i] += (baseSizes[i] * 2.5 - sizes[i]) * 0.15
        } else {
          sizes[i] += (baseSizes[i] - sizes[i]) * 0.05
        }
      }
      songPoints.geometry.attributes.size.needsUpdate = true
      controls.autoRotate = false
    } else {
      if (hoveredSong.value) {
        hoveredSong.value = null
        // 恢复大小
        const sizes = songPoints.geometry.attributes.size.array
        for (let i = 0; i < sizes.length; i++) {
          sizes[i] = baseSizes[i]
        }
        songPoints.geometry.attributes.size.needsUpdate = true
        controls.autoRotate = true
      }
    }
  }

  // 正常帧调用 controls.update()，过渡期间完全跳过
  if (!isTransitioning && controls.enabled) {
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
    // 播放歌曲
    playerStore.playSong(hoveredSong.value)
    // 粒子爆裂效果
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

// 移动端触摸：轻触选中歌曲，显示底部信息条
let touchStartTime = 0
let touchStartPos = { x: 0, y: 0 }

function onTouchStart(e) {
  if (e.touches.length !== 1) return
  touchStartTime = Date.now()
  touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
}

function onTouchEnd(e) {
  // 只处理单指轻触（短时间 + 小位移 = tap）
  if (Date.now() - touchStartTime > 300) return
  const dx = e.changedTouches[0].clientX - touchStartPos.x
  const dy = e.changedTouches[0].clientY - touchStartPos.y
  if (Math.sqrt(dx * dx + dy * dy) > 20) return // 移动超过 20px 不算 tap

  const rect = canvasRef.value.getBoundingClientRect()
  const touch = e.changedTouches[0]
  mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1

  // 检测点击的粒子
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
  // 找到歌曲粒子位置
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
    // fallback
    const { resolveUrl } = (await import('../utils/baseUrl'))
    const res = await fetch(resolveUrl('data/songs.json'))
    const data = await res.json()
    songsData = data.songs || data
    totalSongs.value = songsData.length
  }
}

// ========== 生命周期 ==========
onMounted(async () => {
  // 检测移动端
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth < 768

  await loadSongs()
  await nextTick()
  initThree()
  animate()

  window.addEventListener('resize', onResize)
  canvasRef.value.addEventListener('mousemove', onMouseMove)
  canvasRef.value.addEventListener('click', onClick)
  // 触摸事件
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
  top: calc(50% - 140px);
  transform: translateY(-50%);
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
  top: calc(50% - 140px);
  bottom: auto;
  transform: translateY(-50%);
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
