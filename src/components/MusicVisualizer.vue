<template>
  <div class="visualizer" :class="{ active: isPlaying }">
    <canvas ref="canvasRef" :width="canvasWidth" :height="canvasHeight"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '../stores/player'

const props = defineProps({
  barCount: { type: Number, default: 24 },
  canvasWidth: { type: Number, default: 120 },
  canvasHeight: { type: Number, default: 40 },
  barWidth: { type: Number, default: 3 },
  barGap: { type: Number, default: 2 },
  minBarHeight: { type: Number, default: 2 },
  smoothing: { type: Number, default: 0.8 },
})

const playerStore = usePlayerStore()
const canvasRef = ref(null)
const isPlaying = ref(false)

let audioContext = null
let analyser = null
let dataArray = null
let animationId = null
let sourceNode = null
let audioSourceConnected = false
let smoothedData = null

watch(() => playerStore.isPlaying, (val) => {
  isPlaying.value = val
  if (val) {
    startVisualization()
    // 确保 AudioContext 在用户交互后恢复
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume()
    }
  } else {
    stopVisualization()
  }
})

watch(() => playerStore.currentSong, () => {
  // 切歌时重置平滑数据
  if (smoothedData) {
    smoothedData.fill(0)
  }
})

onMounted(() => {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 128
    analyser.smoothingTimeConstant = 0.7
    dataArray = new Uint8Array(analyser.frequencyBinCount)
    smoothedData = new Float32Array(props.barCount)
  } catch (e) {
    console.warn('Web Audio API 不可用，使用 CSS 动画模拟')
  }
})

onUnmounted(() => {
  stopVisualization()
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
})

const startVisualization = () => {
  if (animationId) return
  draw()
}

const stopVisualization = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  // 清空画布
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    ctx.clearRect(0, 0, props.canvasWidth, props.canvasHeight)
  }
}

const draw = () => {
  animationId = requestAnimationFrame(draw)
  
  if (!analyser || !canvasRef.value) return
  
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const { canvasWidth, canvasHeight, barWidth, barGap, minBarHeight, barCount, smoothing } = props
  
  // 获取频率数据
  analyser.getByteFrequencyData(dataArray)
  
  // 清空画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  
  // 将频率数据映射到 barCount 个柱子
  const binCount = dataArray.length
  const binsPerBar = Math.floor(binCount / barCount)
  
  const totalBarWidth = barCount * barWidth + (barCount - 1) * barGap
  const startX = (canvasWidth - totalBarWidth) / 2
  
  for (let i = 0; i < barCount; i++) {
    // 取对应频率范围的平均值
    let sum = 0
    const startBin = i * binsPerBar
    for (let j = startBin; j < startBin + binsPerBar && j < binCount; j++) {
      sum += dataArray[j]
    }
    const value = sum / binsPerBar / 255 // 归一化到 0~1
    
    // 平滑处理
    smoothedData[i] = smoothedData[i] * smoothing + value * (1 - smoothing)
    
    const barHeight = Math.max(minBarHeight, smoothedData[i] * canvasHeight)
    const x = startX + i * (barWidth + barGap)
    const y = canvasHeight - barHeight
    
    // 渐变色
    const gradient = ctx.createLinearGradient(x, canvasHeight, x, y)
    gradient.addColorStop(0, '#667eea')
    gradient.addColorStop(0.5, '#764ba2')
    gradient.addColorStop(1, '#f093fb')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.roundRect(x, y, barWidth, barHeight, 1.5)
    ctx.fill()
  }
}

// 连接音频源（全局只连接一次）
const connectAudio = (audioElement) => {
  if (!audioContext || !analyser || audioSourceConnected) return
  try {
    sourceNode = audioContext.createMediaElementSource(audioElement)
    sourceNode.connect(analyser)
    analyser.connect(audioContext.destination)
    audioSourceConnected = true
  } catch (e) {
    // 已经连接过，忽略
  }
}

const getFrequencyData = () => {
  if (!analyser || !dataArray) return null
  analyser.getByteFrequencyData(dataArray)
  return dataArray
}

defineExpose({ connectAudio, getFrequencyData })
</script>

<style scoped>
.visualizer {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 40px;
  padding: 0 4px;
  opacity: 0.3;
  transition: opacity 0.3s;
}

.visualizer.active {
  opacity: 1;
}

.visualizer canvas {
  display: block;
}
</style>
