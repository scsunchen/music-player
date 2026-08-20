<template>
  <div class="story-page">
    <!-- Noise texture overlay -->
    <div class="noise-overlay"></div>

    <!-- Gold ambient light -->
    <div class="gold-ambient"></div>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <span class="hero-era">2000 — 2010</span>
        <h1 class="hero-title">{{ data.hero.title }}</h1>
        <p class="hero-subtitle">{{ data.hero.subtitle }}</p>
        <p class="hero-intro">{{ data.hero.intro }}</p>
        <div class="hero-cta">
          <span class="cta-arrow">&#9660;</span>
          <span class="cta-text">{{ data.hero.ctaText }}</span>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="timeline">
      <!-- Central line -->
      <div class="timeline-line"></div>

      <div
        v-for="(entry, index) in data.entries"
        :key="entry.year"
        class="timeline-entry"
        :class="{
          'entry-left': index % 2 === 0,
          'entry-right': index % 2 === 1,
          'is-visible': visibleEntries.has(index),
          'is-playing': currentPlayingIndex === index
        }"
        :data-index="index"
        :ref="(el) => { if (el) entryRefs[index] = el }"
      >
        <!-- Year dot on the line -->
        <div class="timeline-dot">
          <span class="dot-year">{{ entry.year }}</span>
        </div>

        <!-- Content card -->
        <div class="entry-card">
          <div class="entry-cover" @click="playEntry(index)">
            <img :src="entry.cover" :alt="entry.songTitle" loading="lazy" />
            <div class="cover-play" v-if="currentPlayingIndex !== index">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#fff" d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div class="cover-vinyl" v-if="currentPlayingIndex === index">
              <div class="vinyl-disc"></div>
            </div>
          </div>
          <div class="entry-info">
            <h3 class="entry-song">{{ entry.songTitle }}</h3>
            <span class="entry-artist">{{ entry.artist }}</span>
            <p class="entry-narration">{{ entry.narration }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Ending Section -->
    <section class="ending">
      <div class="ending-content">
        <div class="ending-line"></div>
        <p class="ending-text">{{ data.ending.text }}</p>
        <p class="ending-tagline">{{ data.ending.tagline }}</p>
        <button class="ending-cta" @click="router.push('/')">
          <span>{{ data.ending.ctaText }}</span>
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path
              fill="currentColor"
              d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
            />
          </svg>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { storyData } from '../config/storyPlaylist'

const router = useRouter()
const playerStore = usePlayerStore()
const data = storyData

const visibleEntries = reactive(new Set())
const entryRefs = ref([])
const currentPlayingIndex = ref(-1)
let observer = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const index = Number(entry.target.dataset.index)
        if (entry.isIntersecting) {
          visibleEntries.add(index)
        }
      })
    },
    { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
  )

  // Observe after next tick
  setTimeout(() => {
    document.querySelectorAll('.timeline-entry').forEach((el) => {
      observer.observe(el)
    })
  }, 100)
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})

const playEntry = (index) => {
  currentPlayingIndex.value = index
  const entry = data.entries[index]
  if (entry.songId) {
    const song = playerStore.songs.find(s => s.id === entry.songId)
    if (song) {
      playerStore.playSong(song)
    }
  }
}
</script>

<style scoped>
:root {
  --story-gold: #d4a853;
  --story-gold-dim: #c8956c;
  --story-gold-glow: rgba(212, 168, 83, 0.3);
  --story-dark: #0a0908;
  --story-card: rgba(212, 168, 83, 0.04);
  --story-border: rgba(212, 168, 83, 0.1);
  --story-text: rgba(255, 255, 255, 0.85);
  --story-text-dim: rgba(255, 255, 255, 0.4);
}

.story-page {
  min-height: 100vh;
  background: var(--story-dark);
  overflow-x: clip;
  position: relative;
  color: var(--story-text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ===== Noise Overlay ===== */
.noise-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 256px;
}

/* ===== Gold Ambient ===== */
.gold-ambient {
  position: fixed;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(212, 168, 83, 0.12) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
}

/* ===== Hero Section ===== */
.hero {
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 32px 80px;
  position: relative;
  z-index: 1;
}

.hero-content {
  max-width: 720px;
}

.hero-era {
  display: inline-block;
  font-size: 12px;
  letter-spacing: 8px;
  color: var(--story-gold-dim);
  text-transform: uppercase;
  margin-bottom: 24px;
}

.hero-title {
  font-size: clamp(48px, 10vw, 88px);
  font-weight: 900;
  color: var(--story-gold);
  font-family: 'Noto Serif SC', 'Source Han Serif SC', serif;
  letter-spacing: -2px;
  line-height: 1.1;
  margin: 0 0 16px;
  text-shadow: 0 0 80px rgba(212, 168, 83, 0.3);
}

.hero-subtitle {
  font-size: 14px;
  letter-spacing: 6px;
  color: var(--story-text-dim);
  margin: 0 0 40px;
}

.hero-intro {
  max-width: 640px;
  margin: 0 auto 60px;
  font-size: 15px;
  line-height: 2;
  color: var(--story-text-dim);
  text-align: justify;
}

.hero-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.cta-arrow {
  font-size: 14px;
  color: var(--story-gold);
  animation: bounceArrow 2s ease-in-out infinite;
  line-height: 1;
}

.cta-text {
  font-size: 12px;
  letter-spacing: 4px;
  color: var(--story-gold-dim);
}

/* ===== Timeline Section ===== */
.timeline {
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 32px 100px;
  position: relative;
  z-index: 1;
}

.timeline-line {
  position: absolute;
  left: 24px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--story-gold-glow),
    var(--story-border),
    transparent
  );
}

/* ===== Timeline Entry ===== */
.timeline-entry {
  display: flex;
  align-items: flex-start;
  position: relative;
  margin-bottom: 80px;
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateY(20px);
}

.timeline-entry:last-child {
  margin-bottom: 0;
}

.timeline-entry.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ===== Timeline Dot ===== */
.timeline-dot {
  position: absolute;
  left: 24px;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--story-gold-dim);
  background: var(--story-dark);
  z-index: 2;
  transition: all 0.4s;
  top: 24px;
}

.is-playing .timeline-dot {
  background: var(--story-gold);
  box-shadow: 0 0 16px var(--story-gold-glow);
  border-color: var(--story-gold);
}

.dot-year {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 13px;
  font-weight: 700;
  color: var(--story-gold);
  font-family: 'Noto Serif SC', 'Source Han Serif SC', serif;
  white-space: nowrap;
}

/* ===== Entry Card ===== */
.entry-card {
  margin-left: 56px;
  background: var(--story-card);
  border: 1px solid var(--story-border);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.4s;
}

.entry-card::after {
  content: '';
  display: table;
  clear: both;
}

.is-playing .entry-card {
  border-color: var(--story-gold-glow);
  box-shadow: 0 0 40px rgba(212, 168, 83, 0.08);
}

.entry-card:hover {
  border-color: rgba(212, 168, 83, 0.2);
}

/* ===== Entry Cover (float for text wrap) ===== */
.entry-cover {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  background: rgba(212, 168, 83, 0.06);
  float: right;
  margin-left: 16px;
  margin-bottom: 8px;
}

.entry-right .entry-cover {
  float: left;
  margin-left: 0;
  margin-right: 16px;
}

.entry-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.3s;
}

.entry-cover:hover .cover-play {
  opacity: 1;
}

.cover-vinyl {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.vinyl-disc {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #1a1a1a, #333, #1a1a1a, #333, #1a1a1a);
  animation: vinylSpin 3s linear infinite;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}

/* ===== Entry Info ===== */
.entry-info {
  flex: 1;
  min-width: 0;
}

.entry-song {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  font-family: 'Noto Serif SC', 'Source Han Serif SC', serif;
  margin-bottom: 4px;
  line-height: 1.3;
}

.entry-artist {
  font-size: 13px;
  color: var(--story-gold-dim);
  margin-bottom: 16px;
  display: block;
}

.entry-narration {
  font-size: 14px;
  line-height: 1.9;
  color: var(--story-text-dim);
  margin: 0;
}

/* ===== Ending Section ===== */
.ending {
  padding: 100px 32px 120px;
  text-align: center;
  max-width: 640px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.ending-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ending-line {
  width: 60px;
  height: 1px;
  background: var(--story-gold-dim);
  margin: 0 auto 48px;
}

.ending-text {
  font-size: 16px;
  line-height: 2.2;
  color: var(--story-text);
  margin: 0 0 32px;
  font-style: italic;
}

.ending-tagline {
  font-size: 18px;
  font-weight: 700;
  color: var(--story-gold);
  font-family: 'Noto Serif SC', 'Source Han Serif SC', serif;
  margin: 0 0 48px;
}

.ending-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 32px;
  border: 1px solid var(--story-gold-dim);
  border-radius: 40px;
  background: transparent;
  color: var(--story-gold);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.ending-cta:hover {
  background: rgba(212, 168, 83, 0.1);
  border-color: var(--story-gold);
}

/* ===== Animations ===== */
@keyframes bounceArrow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(8px);
  }
}

@keyframes vinylSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ===== Desktop (>= 768px) ===== */
@media (min-width: 768px) {
  .timeline-line {
    left: 50%;
  }

  .timeline-entry {
    transform: translateY(0) translateX(-30px);
  }

  .timeline-entry.entry-right {
    transform: translateY(0) translateX(30px);
  }

  .timeline-entry.entry-left.is-visible {
    opacity: 1;
    transform: translateY(0) translateX(0);
  }

  .timeline-entry.entry-right.is-visible {
    opacity: 1;
    transform: translateY(0) translateX(0);
  }

  .timeline-dot {
    left: 50%;
    transform: translateX(-50%);
  }

  .entry-left .timeline-dot {
    left: 50%;
  }

  .entry-right .timeline-dot {
    left: 50%;
  }

  .entry-left .dot-year {
    left: 50%;
  }

  .entry-right .dot-year {
    left: 50%;
    top: auto;
    bottom: -28px;
  }

  .entry-card {
    margin-left: 0;
  }

  .entry-left .entry-card {
    margin-left: calc(50% + 40px);
  }

  .entry-right .entry-card {
    margin-right: calc(50% + 40px);
    margin-left: 0;
  }

  .entry-cover {
    width: 100px;
    height: 100px;
    border-radius: 12px;
  }
}

/* ===== Mobile fine-tuning (< 768px) ===== */
@media (max-width: 767px) {
  .hero {
    min-height: 100vh;
    min-height: 100svh;
    padding: 32px 20px 60px;
  }

  .hero-title {
    letter-spacing: -1px;
  }

  .hero-subtitle {
    letter-spacing: 4px;
  }

  .hero-intro {
    font-size: 14px;
  }

  .entry-song {
    font-size: 18px;
  }

  .entry-narration {
    font-size: 13px;
  }

  .ending {
    padding: 80px 20px 100px;
  }

  .ending-text {
    font-size: 15px;
  }

  .ending-tagline {
    font-size: 16px;
  }
}
</style>