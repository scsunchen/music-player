<template>
  <div class="guofeng-page" :style="dynamicStyle">
    <!-- 沉浸式氛围背景 -->
    <div class="atmosphere">
      <div class="atmo-gradient"></div>
      <div class="atmo-orb atmo-orb-1"></div>
      <div class="atmo-orb atmo-orb-2"></div>
      <div class="atmo-orb atmo-orb-3"></div>
    </div>

    <!-- 水墨晕染层 -->
    <div class="ink-wash ink-wash-1"></div>
    <div class="ink-wash ink-wash-2"></div>

    <!-- 远山剪影 -->
    <div class="mountain-silhouette"></div>

    <!-- 顶部导航 -->
    <header class="gf-header">
      <button class="gf-back" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>
      <div class="header-center">
        <span class="gf-seal">劍三同人</span>
        <span class="header-divider">·</span>
        <span class="header-label">PLAYLIST</span>
      </div>
      <button class="gf-play-all" @click="playAll">
        <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
        <span>抚琴一曲</span>
      </button>
    </header>

    <!-- Hero 区域：宽屏左右布局 -->
    <section class="gf-hero" :class="{ 'scroll-opened': heroVisible }">
      <!-- 左侧：大封面 + 卷轴 -->
      <div class="hero-left">
        <div class="hero-cover-wrap">
          <div class="scroll-rod scroll-rod-top"></div>
          <div class="hero-cover">
            <img :src="playlist.cover" :alt="playlist.name" />
            <div class="cover-ink-overlay"></div>
            <div class="cover-seal">
              <span class="seal-char">琴</span>
              <span class="seal-char">剑</span>
            </div>
          </div>
          <div class="scroll-rod scroll-rod-bottom"></div>
        </div>
      </div>

      <!-- 右侧：诗词 + 信息 -->
      <div class="hero-right">
        <div class="hero-poem">
          <p class="poem-line" v-for="(line, i) in poemLines" :key="i" :style="{ animationDelay: i * 0.3 + 's' }">
            {{ line }}
          </p>
        </div>

        <div class="hero-title-wrap">
          <h1 class="gf-title">{{ playlist.name }}</h1>
          <div class="title-brush"></div>
        </div>

        <p class="gf-desc">{{ playlist.description }}</p>

        <div class="hero-meta">
          <span class="meta-chip">
            <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            {{ songs.length }} 曲
          </span>
          <span class="meta-chip" v-if="playlist.playCount">
            <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
            {{ formatCount(playlist.playCount) }}
          </span>
          <span class="meta-chip meta-accent">
            <span class="ink-dot"></span>
            水墨江湖
          </span>
        </div>
      </div>
    </section>

    <!-- 歌曲列表 -->
    <section class="gf-songs">
      <div class="section-label">
        <span class="label-line"></span>
        <span class="label-text">琴瑟和鸣</span>
        <span class="label-line"></span>
      </div>

      <div class="song-list">
        <div
          v-for="(song, i) in songs"
          :key="song.id"
          class="song-item"
          :class="{
            'is-playing': playerStore.currentSong?.id === song.id
          }"
        >
          <!-- 序号：天干地支 -->
          <span class="song-number">
            <span v-if="playerStore.currentSong?.id !== song.id">{{ heavenlyStems[i % 10] }}</span>
            <span class="song-bars" v-else><span class="bar"></span><span class="bar"></span><span class="bar"></span></span>
          </span>

          <!-- 封面 -->
          <div class="song-cover" @click="playSongAt(i)">
            <img :src="song.cover" :alt="song.title" loading="lazy" />
            <div class="cover-ink-overlay"></div>
            <div class="cover-play-icon" v-if="playerStore.currentSong?.id !== song.id">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="#fff" d="M8 5v14l11-7z"/></svg>
            </div>
            <div class="cover-vinyl-spin" v-else>
              <div class="vinyl-disc"></div>
            </div>
          </div>

          <!-- 信息 -->
          <div class="song-info" @click="router.push(`/song/${song.id}`)">
            <span class="song-title">{{ song.title }}</span>
            <span class="song-artist">{{ song.artist }}</span>
          </div>

          <!-- 操作 -->
          <div class="song-actions" @click.stop>
            <span class="tag-lyrics" v-if="hasLyrics(song.id)">詞</span>
            <span class="tag-mv" v-if="song.mvUrl">影</span>
            <button
              class="song-like"
              :class="{ liked: playerStore.isLiked(song.id) }"
              @click.stop="playerStore.toggleLikeSong(song.id)"
            >
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
            <button class="add-btn" @click.stop="playerStore.insertNext(song)" title="下一首播放">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6z"/></svg>
            </button>
            <button class="add-btn" @click.stop="playerStore.addToQueue(song)" title="加入队列">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 10h10v2H3v-2zm0-4h10v2H3V6zm0 8h6v2H3v-2zm11-3v3h-3v2h3v3h2v-3h3v-2h-3v-3z"/></svg>
            </button>
            <span class="song-duration" v-if="song.duration">{{ formatTime(song.duration) }}</span>
          </div>
        </div>
      </div>

    </section>

    <!-- 页脚印章 -->
    <footer class="gf-footer">
      <div class="footer-seal">
        <span class="seal-char">琴</span>
        <span class="seal-char">剑</span>
      </div>
      <p class="footer-text">一曲一故事 · 听尽世间情缘两难</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'

const router = useRouter()
const playerStore = usePlayerStore()

const props = defineProps({
  playlist: { type: Object, required: true },
  songs: { type: Array, required: true }
})

// 动态主题色（与全局系统一致）
const dynamicStyle = computed(() => {
  const color = playerStore.themeColor || '#c0392b'
  return {
    '--dynamic-r': parseInt(color.slice(1, 3), 16),
    '--dynamic-g': parseInt(color.slice(3, 5), 16),
    '--dynamic-b': parseInt(color.slice(5, 7), 16),
  }
})

// 诗句
const poemLines = [
  '一曲一悲欢，一剑一江湖',
  '咫尺错过，生死相隔，听尽世间情缘两难'
]

// 天干地支序号
const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

const hasLyrics = (id) => playerStore.hasLyrics(id)

// 格式化播放量
const formatCount = (count) => {
  if (count >= 10000) return (count / 10000).toFixed(1) + '万'
  return count
}

// Hero 卷轴展开动画
const heroVisible = ref(false)

onMounted(() => {
  nextTick(() => {
    setTimeout(() => { heroVisible.value = true }, 100)
  })
})

// 播放
const playAll = () => playerStore.playPlaylist(props.playlist)
const playSongAt = (index) => playerStore.playPlaylist(props.playlist, index)

const formatTime = (s) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}
</script>

<style scoped>
/* 本地子集化字体：仅包含国风页实际用到的字符（149KB） */
@font-face {
  font-family: 'Ma Shan Zheng';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/music-player/fonts/MaShanZheng-subset.woff2') format('woff2');
}

.guofeng-page {
  position: relative;
  min-height: calc(100vh - 130px);
  background: #0a0807;
  color: rgba(255, 255, 255, 0.85);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  padding-bottom: 140px;
  overflow-x: hidden;
}

/* ===== 沉浸式氛围背景 ===== */
.atmosphere {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.atmo-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 20%, rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.12) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 80%, rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.08) 0%, transparent 50%),
    linear-gradient(180deg, rgba(10,8,7,0.4) 0%, rgba(10,8,7,0.7) 60%, #0a0807 100%);
}

.atmo-orb {
  position: absolute;
  border-radius: 50%;
  box-shadow: 0 0 120px 40px rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.12);
  animation: orbFloat 14s ease-in-out infinite alternate;
}

.atmo-orb-1 {
  width: 400px;
  height: 400px;
  top: -120px;
  left: -100px;
}

.atmo-orb-2 {
  width: 300px;
  height: 300px;
  bottom: 15%;
  right: -80px;
  animation-delay: -7s;
}

.atmo-orb-3 {
  width: 250px;
  height: 250px;
  top: 40%;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: -4s;
  opacity: 0.6;
}

@keyframes orbFloat {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, -40px) scale(1.1); }
}

/* ===== 水墨晕染 ===== */
.ink-wash {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.ink-wash-1 {
  width: 600px;
  height: 600px;
  top: -200px;
  right: -150px;
  background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%);
}

.ink-wash-2 {
  width: 500px;
  height: 500px;
  bottom: 5%;
  left: -100px;
  background: radial-gradient(circle, rgba(139,44,44,0.04) 0%, transparent 70%);
}

/* ===== 远山剪影 ===== */
.mountain-silhouette {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 180px;
  z-index: 0;
  pointer-events: none;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 180' preserveAspectRatio='none'%3E%3Cpath d='M0,180 L0,120 L80,80 L160,110 L240,60 L320,95 L400,45 L480,90 L560,70 L640,100 L720,55 L800,85 L880,75 L960,95 L1040,65 L1120,90 L1200,75 L1200,180 Z' fill='%23ffffff' opacity='0.02'/%3E%3C/svg%3E") no-repeat bottom center / 100% 100%;
}

/* ===== 顶部导航 ===== */
.gf-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  max-width: 1600px;
  margin: 0 auto;
}

.gf-back {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.gf-back:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gf-seal {
  font-family: 'Ma Shan Zheng', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 15px;
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8);
  letter-spacing: 4px;
  padding: 4px 12px;
  border: 1.5px solid rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.3);
  border-radius: 3px;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.05);
}

.header-divider {
  color: rgba(255, 255, 255, 0.15);
}

.header-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
}

.gf-play-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15);
  border: 1px solid rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.25);
  border-radius: 100px;
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.9);
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.gf-play-all:hover {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.25);
  transform: translateY(-1px);
}

/* ===== Hero 区域：宽屏左右布局 ===== */
.gf-hero {
  position: relative;
  z-index: 5;
  max-width: 1600px;
  margin: 32px auto 48px;
  padding: 0 32px;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 48px;
  align-items: center;
}

@media (max-width: 768px) {
  .gf-hero {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 0 20px;
  }
}

/* 左侧封面 */
.hero-left {
  position: relative;
}

.hero-cover-wrap {
  position: relative;
  opacity: 0;
  transform: translateY(20px);
  transition: all 1s cubic-bezier(0.22, 1, 0.36, 1);
}

.scroll-opened .hero-left .hero-cover-wrap {
  opacity: 1;
  transform: translateY(0);
}

.scroll-rod {
  height: 14px;
  background: linear-gradient(180deg, #3a2f25 0%, #1a1410 50%, #3a2f25 100%);
  border-radius: 7px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.4);
  position: relative;
}

.scroll-rod::before,
.scroll-rod::after {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5a4530 0%, #2a1f15 100%);
  box-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

.scroll-rod::before { left: -7px; }
.scroll-rod::after { right: -7px; }

.hero-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
}

.hero-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.2s ease;
}

.scroll-opened .hero-cover img {
  transform: scale(1.02);
}

.cover-ink-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.3) 100%),
    radial-gradient(ellipse at 70% 30%, transparent 40%, rgba(0,0,0,0.2) 100%);
  pointer-events: none;
}

.cover-seal {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  gap: 6px;
}

.cover-seal .seal-char {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  font-family: 'Ma Shan Zheng', serif;
  font-size: 14px;
  color: #f5f0e6;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.85);
  border-radius: 3px;
  transform: rotate(-3deg);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.cover-seal .seal-char:last-child {
  transform: rotate(3deg);
}

/* 右侧信息 */
.hero-right {
  opacity: 0;
  transform: translateX(30px);
  transition: all 1s cubic-bezier(0.22, 1, 0.36, 1) 0.3s;
}

.scroll-opened .hero-right {
  opacity: 1;
  transform: translateX(0);
}

.hero-poem {
  margin-bottom: 28px;
}

.poem-line {
  font-family: 'Ma Shan Zheng', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 6px;
  margin: 0 0 8px;
  opacity: 0;
  animation: poemFadeIn 1s ease forwards;
}

@keyframes poemFadeIn {
  to { opacity: 1; }
}

.hero-title-wrap {
  margin-bottom: 20px;
  position: relative;
}

.gf-title {
  font-family: 'Ma Shan Zheng', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 56px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 10px;
  margin: 0;
  display: inline-block;
  position: relative;
  line-height: 1.2;
}

.title-brush {
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8) 0%, transparent 100%);
  border-radius: 2px;
  transition: width 1s ease 0.8s;
}

.scroll-opened .title-brush {
  width: 60%;
}

.gf-desc {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.9;
  max-width: 580px;
  margin: 0 0 28px;
  letter-spacing: 1.5px;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  padding: 6px 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.02);
}

.meta-chip svg {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.6);
}

.meta-accent {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.7);
  border-color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.2);
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.05);
}

.ink-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8);
}

/* ===== 歌曲列表 ===== */
.gf-songs {
  position: relative;
  z-index: 5;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 32px;
}

@media (max-width: 768px) {
  .gf-songs { padding: 0 20px; }
}

.section-label {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.label-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
}

.label-text {
  font-family: 'Ma Shan Zheng', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 22px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 6px;
}

/* 歌曲项 */
.song-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  border: 1px solid transparent;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.04);
}

.song-item.is-playing {
  background: linear-gradient(135deg, rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.08) 0%, rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.02) 100%);
  border-color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15);
}

/* 天干序号 / 播放动画 */
.song-number {
  width: 32px;
  text-align: center;
  font-family: 'Ma Shan Zheng', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
  transition: color 0.3s;
}

.song-item.is-playing .song-number {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.9);
}

.song-bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
}

.song-bars .bar {
  width: 2px;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.9);
  border-radius: 1px;
  animation: barDance 0.9s ease-in-out infinite;
}

.song-bars .bar:nth-child(1) { height: 60%; animation-delay: 0s; }
.song-bars .bar:nth-child(2) { height: 100%; animation-delay: 0.2s; }
.song-bars .bar:nth-child(3) { height: 70%; animation-delay: 0.4s; }

@keyframes barDance {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}

/* 封面 */
.song-cover {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.song-item:hover .song-cover img {
  transform: scale(1.08);
}

.cover-ink-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.3) 100%);
  pointer-events: none;
}

.cover-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.25s;
}

.song-item:hover .cover-play-icon {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.cover-vinyl-spin {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.vinyl-disc {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.7);
  border-top-color: transparent;
  animation: vinylSpin 1.5s linear infinite;
}

@keyframes vinylSpin {
  to { transform: rotate(360deg); }
}

/* 信息 */
.song-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  cursor: pointer;
}

.song-title {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 1px;
  transition: color 0.3s;
}

.song-item.is-playing .song-title {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.95);
}

.song-artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 0.5px;
  transition: color 0.3s;
}

.song-item.is-playing .song-artist {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.5);
}

/* 操作 */
.song-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.tag-lyrics, .tag-mv {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 11px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 600;
  border-radius: 4px;
}

.tag-lyrics {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8);
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.1);
  border: 1px solid rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.2);
}

.tag-mv {
  color: #e8a838;
  background: rgba(232, 168, 56, 0.1);
  border: 1px solid rgba(232, 168, 56, 0.2);
}

.song-like {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.15);
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.song-like:hover {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.7);
  transform: scale(1.15);
}

.song-like.liked {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.9);
}

.add-btn {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.15);
  transition: all 0.2s;
  display: flex;
  align-items: center;
}
.add-btn:hover {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.7);
  transform: scale(1.15);
}
.add-btn:active {
  transform: scale(0.9);
}

.song-duration {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.25);
  font-variant-numeric: tabular-nums;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  min-width: 36px;
  text-align: right;
}

/* ===== 页脚 ===== */
.gf-footer {
  position: relative;
  z-index: 5;
  text-align: center;
  padding: 56px 32px 40px;
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
}

.footer-seal {
  display: inline-flex;
  gap: 8px;
  margin-bottom: 16px;
}

.footer-seal .seal-char {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-family: 'Ma Shan Zheng', serif;
  font-size: 18px;
  color: #f5f0e6;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.6);
  border-radius: 4px;
  transform: rotate(-3deg);
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}

.footer-seal .seal-char:last-child {
  transform: rotate(3deg);
}

.footer-text {
  font-family: 'Ma Shan Zheng', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.25);
  letter-spacing: 6px;
  margin: 0;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .gf-header { padding: 20px 20px; }
  .header-center { display: none; }
  .gf-title { font-size: 38px; letter-spacing: 6px; }
  .poem-line { font-size: 15px; letter-spacing: 4px; }
  .gf-desc { font-size: 14px; }
  .song-cover { width: 46px; height: 46px; }
  .song-title { font-size: 14px; }
  .label-text { font-size: 18px; letter-spacing: 4px; }
  .hero-left { max-width: 260px; margin: 0 auto; }
}

@media (min-width: 1200px) {
  .gf-header { padding: 28px 48px; }
  .gf-hero { padding: 0 48px; gap: 56px; grid-template-columns: 360px 1fr; }
  .gf-songs { padding: 0 48px; }
  .gf-title { font-size: 64px; letter-spacing: 12px; }
}
</style>
