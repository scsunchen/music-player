<template>
  <div class="floating-notes" :class="{ active: isPlaying }">
    <div 
      v-for="note in notes" 
      :key="note.id"
      class="note"
      :class="note.type"
      :style="{
        left: note.x + '%',
        animationDuration: note.duration + 's',
        animationDelay: note.delay + 's',
        fontSize: note.size + 'px',
        opacity: 0
      }"
    >{{ note.symbol }}</div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { usePlayerStore } from '../stores/player'

const playerStore = usePlayerStore()
const isPlaying = ref(false)

const symbols = ['♪', '♫', '♬', '♩', '⚡', '✦', '✧', '❋']
const types = ['note', 'lightning', 'sparkle']

const notes = ref([])

watch(() => playerStore.isPlaying, (val) => {
  isPlaying.value = val
})

onMounted(() => {
  // 生成 20 个浮动音符，确保持续有动画
  const generated = []
  for (let i = 0; i < 20; i++) {
    generated.push({
      id: i,
      x: Math.random() * 100,
      duration: 4 + Math.random() * 3, // 4-7秒
      delay: (i * 0.3) % 5, // 分散启动，确保持续有音符
      size: 12 + Math.random() * 16,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      type: types[Math.floor(Math.random() * types.length)]
    })
  }
  notes.value = generated
})
</script>

<style scoped>
.floating-notes {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.note {
  position: absolute;
  bottom: -20px;
  animation: none;
  will-change: transform, opacity;
}

.floating-notes.active .note {
  animation: floatUp var(--dur, 4s) ease-out infinite;
}

.note.note {
  color: rgba(102, 126, 234, 0.7);
  text-shadow: 0 0 8px rgba(102, 126, 234, 0.5);
}

.note.lightning {
  color: rgba(240, 147, 251, 0.8);
  text-shadow: 0 0 12px rgba(240, 147, 251, 0.6), 0 0 24px rgba(240, 147, 251, 0.3);
}

.note.sparkle {
  color: rgba(255, 215, 0, 0.7);
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

@keyframes floatUp {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg) scale(0.5);
    opacity: 0;
  }
  10% {
    opacity: 0.9;
    transform: translateY(-20px) translateX(5px) rotate(15deg) scale(1);
  }
  30% {
    opacity: 0.8;
    transform: translateY(-60px) translateX(-10px) rotate(-10deg) scale(1.1);
  }
  50% {
    opacity: 0.6;
    transform: translateY(-100px) translateX(15px) rotate(20deg) scale(0.9);
  }
  70% {
    opacity: 0.4;
    transform: translateY(-140px) translateX(-5px) rotate(-15deg) scale(0.8);
  }
  100% {
    transform: translateY(-200px) translateX(10px) rotate(30deg) scale(0.3);
    opacity: 0;
  }
}

/* 闪电效果 */
.note.lightning {
  animation-name: lightningFloat;
}

@keyframes lightningFloat {
  0% {
    transform: translateY(0) scale(0);
    opacity: 0;
  }
  5% {
    opacity: 1;
    transform: translateY(-10px) scale(1.2);
  }
  10% {
    opacity: 0.3;
    transform: translateY(-20px) scale(0.8);
  }
  15% {
    opacity: 1;
    transform: translateY(-30px) scale(1.1);
  }
  20% {
    opacity: 0.5;
    transform: translateY(-40px) scale(0.9);
  }
  30% {
    opacity: 0.8;
    transform: translateY(-60px) scale(1);
  }
  100% {
    transform: translateY(-180px) scale(0.2);
    opacity: 0;
  }
}

/* 星光效果 */
.note.sparkle {
  animation-name: sparkleFloat;
}

@keyframes sparkleFloat {
  0% {
    transform: translateY(0) rotate(0deg) scale(0);
    opacity: 0;
  }
  15% {
    opacity: 1;
    transform: translateY(-30px) rotate(90deg) scale(1.2);
  }
  30% {
    opacity: 0.4;
    transform: translateY(-50px) rotate(180deg) scale(0.6);
  }
  45% {
    opacity: 0.9;
    transform: translateY(-70px) rotate(270deg) scale(1);
  }
  60% {
    opacity: 0.5;
    transform: translateY(-90px) rotate(360deg) scale(0.8);
  }
  100% {
    transform: translateY(-160px) rotate(450deg) scale(0.1);
    opacity: 0;
  }
}
</style>
