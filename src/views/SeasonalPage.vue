<template>
  <div class="seasonal-page" v-if="theme">
    <!-- Dynamic background layer -->
    <div class="bg-layer">
      <div class="bg-gradient" :style="bgGradientStyle"></div>
      <!-- Particles (config-driven type: float/sparkle/hearts/snowflakes/sakura/lanterns) -->
      <div class="particles" :class="theme.particles.type">
        <span v-for="i in theme.particles.count" :key="i" class="particle" :style="particleStyle(i)">{{ theme.particles.emoji }}</span>
      </div>
    </div>

    <!-- Content layer -->
    <div class="content-wrapper">
      <!-- Sticky header -->
      <header class="page-header" :style="headerStyle">
        <button class="btn-back" @click="router.back()">
          <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div class="header-title">
          <span class="header-icon">{{ theme.heroEmoji }}</span>
          <span>{{ theme.name }}</span>
        </div>
        <div class="header-placeholder"></div>
      </header>

      <!-- Hero section -->
      <section class="hero-section">
        <div class="vinyl-record">
          <div class="vinyl-disc" :style="vinylStyle">
            <div class="vinyl-label" :style="{ background: theme.vinylLabelGradient }">
              <span class="vinyl-emoji">{{ theme.heroEmoji }}</span>
            </div>
          </div>
          <div class="vinyl-shadow"></div>
        </div>
        <div class="hero-info">
          <div class="season-badge">
            <span>{{ theme.badge }}</span>
          </div>
          <h1 class="hero-title">
            <span class="title-main" :style="titleStyle">{{ theme.name }}</span>
          </h1>
          <p class="hero-subtitle">{{ theme.subtitle }}</p>
          <div class="hero-stats">
            <div class="stat-pill" v-for="stat in theme.stats" :key="stat.text">
              <span>{{ stat.icon }}</span>
              <span>{{ stat.text }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Quote card -->
      <section class="quote-section">
        <div class="quote-card" :style="quoteCardStyle">
          <div class="quote-mark">"</div>
          <p class="quote-text" v-for="(q, i) in theme.quotes" :key="i">{{ q }}</p>
          <div class="quote-highlight">
            <span class="highlight-line"></span>
            <p :style="highlightStyle">{{ theme.highlight }}</p>
            <span class="highlight-line"></span>
          </div>
        </div>
      </section>

      <!-- Action buttons -->
      <section class="action-section">
        <button class="play-btn-primary" :style="primaryBtnStyle" @click="playAll">
          <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <span>播放全部</span>
        </button>
        <button class="play-btn-secondary" @click="shufflePlay">
          <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
          <span>随机播放</span>
        </button>
      </section>

      <!-- Song list -->
      <section class="songs-section">
        <div class="section-header">
          <div class="section-line"></div>
          <h3 class="section-title">完整歌单</h3>
          <div class="section-line"></div>
        </div>
        <div class="songs-list">
          <div v-for="(song, index) in songs" :key="song.id" class="song-item"
            :class="{ active: playerStore.currentSong?.id === song.id }"
            :style="songItemActiveStyle(song)"
            @click="playSongAt(index)">
            <div class="song-number" :class="{ playing: playerStore.currentSong?.id === song.id && playerStore.isPlaying }">
              <span v-if="playerStore.currentSong?.id === song.id && playerStore.isPlaying">♪</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="song-info">
              <div class="song-name">{{ song.title }}</div>
              <div class="song-artist">{{ song.artist }}</div>
            </div>
            <button class="like-btn" v-like-burst :class="{ liked: playerStore.isLiked(song.id) }" @click.stop="playerStore.toggleLikeSong(song.id)">
              <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="seasonal-footer">
        <div class="footer-emoji">{{ theme.footerEmoji }}</div>
        <p class="footer-text" :style="footerTextStyle">{{ theme.footerText }}</p>
        <p class="footer-sub" v-for="sub in theme.footerSubs" :key="sub">{{ sub }}</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { getActiveTheme } from '../config/seasonalThemes'

const router = useRouter()
const playerStore = usePlayerStore()
const theme = computed(() => getActiveTheme())

// Songs: merge theme.songIds (from store) + theme.songs (curated fake)
const songs = computed(() => {
  if (!theme.value) return []
  const storeSongs = (theme.value.songIds || [])
    .map(id => playerStore.songs.find(s => s.id === id))
    .filter(Boolean)
  const curatedSongs = theme.value.songs || []
  return [...curatedSongs, ...storeSongs]
})

// Dynamic styles computed from theme.colors
const bgGradientStyle = computed(() => {
  if (!theme.value) return {}
  return { background: `linear-gradient(180deg, ${theme.value.colors.gradientStops.join(', ')})` }
})

const headerStyle = computed(() => {
  if (!theme.value) return {}
  return { background: theme.value.colors.headerBg }
})

const titleStyle = computed(() => {
  if (!theme.value) return {}
  return {
    background: theme.value.colors.textGradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  }
})

const primaryBtnStyle = computed(() => {
  if (!theme.value) return {}
  return {
    background: theme.value.colors.btnGradient,
    boxShadow: `0 8px 32px ${theme.value.colors.primary}66`
  }
})

const highlightStyle = computed(() => {
  if (!theme.value) return {}
  return { color: theme.value.colors.secondary }
})

const quoteCardStyle = computed(() => {
  if (!theme.value) return {}
  return { borderColor: `${theme.value.colors.primary}22` }
})

const vinylStyle = computed(() => {
  if (!theme.value) return {}
  return {
    boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 8px ${theme.value.colors.primary}33, 0 0 0 16px ${theme.value.colors.secondary}1a`
  }
})

const songItemActiveStyle = (song) => {
  if (playerStore.currentSong?.id !== song.id || !theme.value) return {}
  return {
    background: theme.value.colors.songActiveBg,
    borderColor: `${theme.value.colors.primary}44`
  }
}

const particleStyle = (i) => {
  if (!theme.value) return {}
  const type = theme.value.particles.type || 'float'
  const top = Math.random() * 100
  const left = Math.random() * 100
  const delay = Math.random() * 5
  const size = 12 + Math.random() * 20
  const duration = 8 + Math.random() * 8

  const base = {
    top: `${top}%`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    fontSize: `${size}px`
  }

  if (type === 'hearts' || type === 'float') {
    return { ...base, animationDuration: `${duration}s` }
  }
  if (type === 'sparkle') {
    return { ...base, animationDuration: `${2 + Math.random() * 3}s` }
  }
  if (type === 'snowflakes') {
    return { ...base, animationDuration: `${10 + Math.random() * 10}s` }
  }
  if (type === 'sakura') {
    return { ...base, animationDuration: `${8 + Math.random() * 6}s` }
  }
  if (type === 'lanterns') {
    return { ...base, animationDuration: `${12 + Math.random() * 8}s` }
  }
  return base
}

const footerTextStyle = computed(() => {
  if (!theme.value) return {}
  return {
    background: `linear-gradient(135deg, ${theme.value.colors.secondary}, ${theme.value.colors.primary})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  }
})

const playAll = () => {
  if (songs.value.length === 0) return
  const playlist = { id: `seasonal-${theme.value.id}`, name: theme.value.name, songs: songs.value.map(s => s.id) }
  playerStore.playPlaylist(playlist)
}

const shufflePlay = () => {
  if (songs.value.length === 0) return
  const shuffled = [...songs.value].sort(() => Math.random() - 0.5)
  const playlist = { id: `seasonal-${theme.value.id}-shuffle`, name: theme.value.name, songs: shuffled.map(s => s.id) }
  playerStore.playPlaylist(playlist)
  playerStore.playSong(shuffled[0])
}

const playSongAt = (index) => { playerStore.playSong(songs.value[index]) }
</script>

<style scoped>
/* ===== Base Page ===== */
.seasonal-page {
  min-height: 100vh;
  position: relative;
  overflow-x: clip;
}

/* ===== Background Layer ===== */
.bg-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* ===== Particles ===== */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

/* Default float animation (also used by lanterns type) */
.particle {
  position: absolute;
  bottom: -50px;
  opacity: 0.6;
  animation: floatUp 12s ease-in-out infinite;
}

/* Sparkle type: scale + rotate */
.particles.sparkle .particle {
  opacity: 0;
  bottom: auto;
  animation: sparkleAnim 3s ease-in-out infinite;
}

/* Hearts type: classic love520 heart float */
.particles.hearts .particle {
  opacity: 0.4;
  filter: blur(1px);
  animation: heartFloat linear infinite;
}

/* Snowflakes type: gentle sway + fall */
.particles.snowflakes .particle {
  opacity: 0.7;
  filter: blur(0.5px);
  animation: snowfall ease-in-out infinite;
}

/* Sakura type: slow float with rotation */
.particles.sakura .particle {
  opacity: 0.6;
  animation: sakuraFloat ease-in-out infinite;
}

/* Lanterns type: gentle upward float */
.particles.lanterns .particle {
  opacity: 0.7;
  filter: drop-shadow(0 4px 12px rgba(255, 160, 50, 0.4));
  animation: lanternFloat ease-in-out infinite;
}

/* --- Particle Keyframes --- */

/* Float: upward drift with rotation */
@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-120vh) rotate(360deg);
    opacity: 0;
  }
}

/* Sparkle: scale + rotate in place */
@keyframes sparkleAnim {
  0%, 100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
}

/* Hearts: classic upward float (love520 style) */
@keyframes heartFloat {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.4;
  }
  90% {
    opacity: 0.4;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

/* Snowflakes: side-to-side sway + fall */
@keyframes snowfall {
  0% {
    transform: translateY(-10vh) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.7;
  }
  25% {
    transform: translateY(22vh) translateX(30px) rotate(90deg);
  }
  50% {
    transform: translateY(50vh) translateX(-20px) rotate(180deg);
  }
  75% {
    transform: translateY(75vh) translateX(25px) rotate(270deg);
  }
  90% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(105vh) translateX(-10px) rotate(360deg);
    opacity: 0;
  }
}

/* Sakura: slow float with rotation */
@keyframes sakuraFloat {
  0% {
    transform: translateY(-10vh) translateX(0) rotate(0deg) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  25% {
    transform: translateY(22vh) translateX(40px) rotate(90deg) scale(0.9);
  }
  50% {
    transform: translateY(50vh) translateX(-30px) rotate(180deg) scale(1.1);
  }
  75% {
    transform: translateY(75vh) translateX(20px) rotate(270deg) scale(0.95);
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(105vh) translateX(-15px) rotate(360deg) scale(1);
    opacity: 0;
  }
}

/* Lanterns: gentle upward float with subtle sway */
@keyframes lanternFloat {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.7;
  }
  25% {
    transform: translateY(-25vh) translateX(15px) scale(1.05);
  }
  50% {
    transform: translateY(-50vh) translateX(-10px) scale(1);
  }
  75% {
    transform: translateY(-75vh) translateX(20px) scale(1.05);
  }
  90% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(-110vh) translateX(5px) scale(1);
    opacity: 0;
  }
}

/* ===== Content Layer ===== */
.content-wrapper {
  position: relative;
  z-index: 1;
  padding-bottom: 100px;
}

/* ===== Sticky Header ===== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header-icon {
  font-size: 20px;
}

.header-placeholder {
  width: 40px;
}

/* ===== Hero Section ===== */
.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 20px 32px;
  gap: 24px;
}

/* ===== Vinyl Record ===== */
.vinyl-record {
  position: relative;
  width: 220px;
  height: 220px;
}

.vinyl-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 30%, #333 0%, #111 40%, #000 70%),
    repeating-radial-gradient(circle at center, transparent 0, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px);
  position: relative;
  animation: vinylSpin 8s linear infinite;
}

@keyframes vinylSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.vinyl-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.2);
}

.vinyl-emoji {
  font-size: 40px;
}

.vinyl-shadow {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 20px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.3) 0%, transparent 70%);
  border-radius: 50%;
}

/* ===== Hero Info ===== */
.hero-info {
  text-align: center;
  color: white;
}

.season-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.title-main {
  font-size: 32px;
  font-weight: 800;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 15px;
  opacity: 0.9;
  margin-bottom: 20px;
  letter-spacing: 2px;
}

.hero-stats {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* ===== Quote Card ===== */
.quote-section {
  padding: 0 20px;
  margin-bottom: 24px;
}

.quote-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
}

.quote-mark {
  font-size: 48px;
  color: rgba(255, 200, 100, 0.5);
  line-height: 1;
  font-family: Georgia, serif;
  margin-bottom: 12px;
}

.quote-text {
  font-size: 14px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.quote-highlight {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.highlight-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 200, 100, 0.5), transparent);
}

.quote-highlight p {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  text-shadow: 0 2px 8px rgba(255, 200, 100, 0.3);
}

/* ===== Action Buttons ===== */
.action-section {
  display: flex;
  gap: 16px;
  padding: 0 20px;
  margin-bottom: 32px;
}

.play-btn-primary,
.play-btn-secondary {
  flex: 1;
  height: 52px;
  border-radius: 26px;
  border: none;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  color: white;
}

.play-btn-primary:hover {
  transform: translateY(-3px);
  filter: brightness(1.1);
}

.play-btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.play-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

/* ===== Song List ===== */
.songs-section {
  padding: 0 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.section-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  letter-spacing: 2px;
}

.songs-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(6px);
  border-color: rgba(255, 255, 255, 0.2);
}

.song-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 183, 77, 0.8), rgba(255, 138, 101, 0.8));
  color: white;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;
}

.song-number.playing {
  animation: playingPulse 1.5s ease-in-out infinite;
}

@keyframes playingPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4); }
  50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255, 107, 107, 0); }
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 15px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.like-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.like-btn:hover {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
}

.like-btn.liked {
  color: #ff6b6b;
}

/* ===== Footer ===== */
.seasonal-footer {
  text-align: center;
  padding: 48px 20px 32px;
  color: white;
}

.footer-emoji {
  font-size: 48px;
  margin-bottom: 16px;
  animation: footerBounce 4s ease-in-out infinite;
}

@keyframes footerBounce {
  0%, 100% { transform: translateY(0); filter: brightness(1); }
  50% { transform: translateY(-10px); filter: brightness(1.2); }
}

.footer-text {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.footer-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 4px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

/* ===== Responsive ===== */
@media (min-width: 768px) {
  .hero-section {
    flex-direction: row;
    justify-content: center;
    gap: 48px;
    padding: 40px;
  }

  .vinyl-record {
    width: 280px;
    height: 280px;
  }

  .vinyl-label {
    width: 100px;
    height: 100px;
  }

  .vinyl-emoji {
    font-size: 50px;
  }

  .hero-info {
    text-align: left;
  }

  .hero-title {
    justify-content: flex-start;
  }

  .title-main {
    font-size: 40px;
  }

  .hero-stats {
    justify-content: flex-start;
  }

  .action-section {
    max-width: 400px;
    margin: 0 auto 32px;
  }

  .songs-section {
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>