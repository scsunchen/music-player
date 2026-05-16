<template>
  <div class="visualizer" :class="{ active: isPlaying }">
    <!-- 均衡器跳动条 -->
    <div class="equalizer">
      <div 
        v-for="i in barCount" 
        :key="i" 
        class="bar"
        :style="{ 
          animationDelay: `${i * 0.05}s`,
          animationDuration: `${0.3 + Math.random() * 0.5}s`
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '../stores/player'

const playerStore = usePlayerStore()
const isPlaying = ref(false)
const barCount = ref(24)

let audioContext = null
let analyser = null
let dataArray = null
let animationId = null
const bars = ref([])

watch(() => playerStore.isPlaying, (val) => {
  isPlaying.value = val
})

onMounted(() => {
  // 尝试连接 Web Audio API
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 64
    dataArray = new Uint8Array(analyser.frequencyBinCount)
  } catch (e) {
    // Web Audio API 不可用时使用 CSS 动画模拟
  }
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (audioContext) audioContext.close()
})

// 暴露方法让播放器连接音频源
const connectAudio = (audioElement) => {
  if (!audioContext || !analyser) return
  try {
    const source = audioContext.createMediaElementSource(audioElement)
    source.connect(analyser)
    analyser.connect(audioContext.destination)
  } catch (e) {
    // 已经连接过，忽略
  }
}

defineExpose({ connectAudio })
</script>

<style scoped>
.visualizer {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 40px;
  padding: 0 4px;
  opacity: 0.3;
  transition: opacity 0.3s;
}

.visualizer.active {
  opacity: 1;
}

.equalizer {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 100%;
}

.bar {
  width: 3px;
  min-height: 3px;
  border-radius: 2px;
  background: linear-gradient(to top, #667eea, #764ba2, #f093fb);
  animation: none;
}

.visualizer.active .bar {
  animation: bounce var(--duration, 0.4s) ease-in-out infinite alternate;
}

@keyframes bounce {
  0% {
    height: 3px;
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
  100% {
    height: var(--max-h, 32px);
    opacity: 0.8;
  }
}

/* 给每个 bar 不同的最大高度 */
.visualizer.active .bar:nth-child(odd) {
  --max-h: 28px;
  --duration: 0.35s;
}

.visualizer.active .bar:nth-child(3n) {
  --max-h: 38px;
  --duration: 0.5s;
}

.visualizer.active .bar:nth-child(4n) {
  --max-h: 20px;
  --duration: 0.3s;
}

.visualizer.active .bar:nth-child(5n) {
  --max-h: 35px;
  --duration: 0.45s;
}

.visualizer.active .bar:nth-child(7n) {
  --max-h: 40px;
  --duration: 0.55s;
}
</style>
