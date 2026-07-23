<template>
  <div class="summer-page">
    <!-- 动态背景层 -->
    <div class="sky-background">
      <div class="sunset-gradient"></div>
      <div class="cloud cloud-1">☁️</div>
      <div class="cloud cloud-2">☁️</div>
      <div class="cloud cloud-3">☁️</div>
      <div class="floating-oranges">
        <span class="float-orange" style="--delay:0s;--x:10%;--size:40px">🍊</span>
        <span class="float-orange" style="--delay:2s;--x:80%;--size:30px">🍊</span>
        <span class="float-orange" style="--delay:4s;--x:50%;--size:35px">🍊</span>
        <span class="float-orange" style="--delay:1s;--x:25%;--size:25px">🍊</span>
        <span class="float-orange" style="--delay:3s;--x:70%;--size:28px">🍊</span>
      </div>
      <div class="sparkles">
        <span v-for="i in 20" :key="i" class="sparkle" :style="sparkleStyle(i)">✦</span>
      </div>
    </div>

    <!-- 内容层 -->
    <div class="content-wrapper">
      <!-- 头部 -->
      <header class="summer-header">
        <button class="back-btn" @click="router.back()">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <div class="header-title">
          <span class="header-icon">🍊</span>
          <span>橘子味的夏天</span>
        </div>
        <div class="header-placeholder"></div>
      </header>

      <!-- 主视觉区域 -->
      <section class="hero-section">
        <div class="vinyl-record">
          <div class="vinyl-disc">
            <div class="vinyl-grooves"></div>
            <div class="vinyl-label">
              <span class="vinyl-emoji">🍊</span>
            </div>
          </div>
          <div class="vinyl-shadow"></div>
        </div>

        <div class="hero-info">
          <div class="season-badge">
            <span class="badge-icon">☀️</span>
            <span>夏日限定</span>
          </div>
          <h1 class="hero-title">
            <span class="title-main">橘子味的夏天</span>
            <span class="title-wave">〰️</span>
          </h1>
          <p class="hero-subtitle">清甜 · 温柔 · 日落氛围感</p>
          <div class="hero-stats">
            <div class="stat-pill">
              <span class="pill-icon">🎵</span>
              <span>{{ songs.length }} 首</span>
            </div>
            <div class="stat-pill">
              <span class="pill-icon">⏱️</span>
              <span>约 60 分钟</span>
            </div>
            <div class="stat-pill">
              <span class="pill-icon">🌅</span>
              <span>傍晚最佳</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 简介卡片 -->
      <section class="quote-section">
        <div class="quote-card">
          <div class="quote-decoration">
            <span class="quote-mark">"</span>
          </div>
          <p class="quote-text">
            夏天是橘子汽水冒起的气泡，是黄昏染遍天空的橘粉，是晚风里轻轻晃动的旋律。
          </p>
          <p class="quote-text">
            这张歌单装满了暖橙色调的温柔与甜，适合傍晚散步、窗边发呆、和喜欢的人共享耳机。
          </p>
          <div class="quote-highlight">
            <span class="highlight-line"></span>
            <p>愿每一段旋律，都能陪你度过一整个温柔又明亮的夏天。</p>
            <span class="highlight-line"></span>
          </div>
        </div>
      </section>

      <!-- 操作按钮 -->
      <section class="action-section">
        <button class="play-btn-primary" @click="playAll">
          <span class="btn-icon">▶</span>
          <span>播放全部</span>
        </button>
        <button class="play-btn-secondary" @click="shufflePlay">
          <span class="btn-icon">🔀</span>
          <span>随机播放</span>
        </button>
      </section>

      <!-- 歌曲列表 -->
      <section class="songs-section">
        <div class="section-header">
          <div class="section-line"></div>
          <h3 class="section-title">完整歌单</h3>
          <div class="section-line"></div>
        </div>
        <div class="songs-list">
          <div
            v-for="(song, index) in songs"
            :key="song.id"
            class="song-item"
            :class="{ active: playerStore.currentSong?.id === song.id }"
            @click="playSong(song)"
          >
            <div class="song-number" :class="{ playing: playerStore.currentSong?.id === song.id && playerStore.isPlaying }">
              <span v-if="playerStore.currentSong?.id === song.id && playerStore.isPlaying" class="playing-icon">♪</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="song-info">
              <div class="song-name">{{ song.title }}</div>
              <div class="song-artist">{{ song.artist }}</div>
            </div>
            <div class="song-action">
              <button
                class="like-btn" v-like-burst
                :class="{ liked: playerStore.likedSongs.includes(song.id) }"
                @click.stop="toggleLike(song.id)"
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 底部 -->
      <footer class="summer-footer">
        <div class="footer-sun">🌅</div>
        <p class="footer-text">橘子味的夏天歌单已就位</p>
        <p class="footer-sub">橘粉晚霞 + 暖橙旋律</p>
        <p class="footer-sub">耳机分你一半，一起过夏天</p>
        <div class="footer-wave">〰️ 〰️ 〰️</div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'

const router = useRouter()
const playerStore = usePlayerStore()

// 夏日歌单歌曲数据
const songs = [
  { id: 200, title: '橘子味的夏天', artist: '新地', duration: 0, cover: '', audioUrl: '' },
  { id: 201, title: '橘子汽水', artist: '南拳妈妈', duration: 0, cover: '', audioUrl: '' },
  { id: 202, title: '橙', artist: '筠野', duration: 0, cover: '', audioUrl: '' },
  { id: 203, title: '波子汽水', artist: 'Bomb 比尔 / LBI 利比', duration: 0, cover: '', audioUrl: '' },
  { id: 204, title: '青柠', artist: '徐秉龙 / 桃十五', duration: 0, cover: '', audioUrl: '' },
  { id: 205, title: '夏日漱石', artist: '橘子海', duration: 0, cover: '', audioUrl: '' },
  { id: 206, title: '落日橘子糖', artist: '达布希勒图', duration: 0, cover: '', audioUrl: '' },
  { id: 207, title: '贩卖日落', artist: '蓝心羽', duration: 0, cover: '', audioUrl: '' },
  { id: 208, title: '橘海', artist: '巴邓顿珠 / 你的大表哥曲甲', duration: 0, cover: '', audioUrl: '' },
  { id: 209, title: '夏天的风', artist: '温岚', duration: 0, cover: '', audioUrl: '' },
  { id: 210, title: '园游会', artist: '周杰伦', duration: 0, cover: '', audioUrl: '' },
  { id: 211, title: '他夏了夏天', artist: '苏打绿', duration: 0, cover: '', audioUrl: '' },
  { id: 212, title: '日落大道', artist: '梁博', duration: 0, cover: '', audioUrl: '' },
  { id: 213, title: '夏日的颜色', artist: 'Fine 乐团', duration: 0, cover: '', audioUrl: '' },
  { id: 214, title: '星空剪影', artist: '蓝心羽', duration: 0, cover: '', audioUrl: '' },
]

const sparkleStyle = (i) => {
  const top = Math.random() * 100
  const left = Math.random() * 100
  const delay = Math.random() * 5
  const size = 10 + Math.random() * 20
  return {
    top: `${top}%`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    fontSize: `${size}px`,
  }
}

const playAll = () => {
  const validSongs = songs.filter(s => s.audioUrl)
  if (validSongs.length === 0) {
    alert('歌曲链接暂未配置，请先添加音频文件')
    return
  }
  playerStore.currentPlaylist = [...validSongs]
  playerStore.currentIndex = 0
  playerStore.playSong(validSongs[0])
}

const shufflePlay = () => {
  const validSongs = songs.filter(s => s.audioUrl)
  if (validSongs.length === 0) {
    alert('歌曲链接暂未配置，请先添加音频文件')
    return
  }
  const shuffled = [...validSongs].sort(() => Math.random() - 0.5)
  playerStore.currentPlaylist = shuffled
  playerStore.currentIndex = 0
  playerStore.playSong(shuffled[0])
}

const playSong = (song) => {
  if (!song.audioUrl) {
    alert('该歌曲链接暂未配置')
    return
  }
  const validSongs = songs.filter(s => s.audioUrl)
  const index = validSongs.findIndex(s => s.id === song.id)
  if (index !== -1) {
    playerStore.currentPlaylist = validSongs
    playerStore.currentIndex = index
    playerStore.playSong(song)
  }
}

const toggleLike = (id) => {
  playerStore.toggleLikeSong(id)
}
</script>

<style scoped>
.summer-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: #1a1a2e;
}

/* ===== 动态背景层 ===== */
.sky-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
}

.sunset-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%, #ff6b6b 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 30% 20%, #feca57 0%, transparent 40%),
    radial-gradient(ellipse 70% 60% at 70% 30%, #ff9ff3 0%, transparent 45%),
    linear-gradient(180deg,
      #2d1b4e 0%,
      #5d2e5e 15%,
      #b33939 30%,
      #e17055 45%,
      #fdcb6e 60%,
      #e17055 75%,
      #b33939 85%,
      #2d1b4e 100%
    );
}

/* 云朵 */
.cloud {
  position: absolute;
  font-size: 60px;
  opacity: 0.3;
  filter: blur(1px);
  animation: cloudFloat 20s ease-in-out infinite;
}

.cloud-1 { top: 10%; left: -10%; animation-delay: 0s; }
.cloud-2 { top: 25%; right: -5%; animation-delay: -7s; font-size: 80px; }
.cloud-3 { top: 45%; left: 60%; animation-delay: -14s; font-size: 50px; opacity: 0.2; }

@keyframes cloudFloat {
  0%, 100% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(30px) translateY(-10px); }
  50% { transform: translateX(-20px) translateY(5px); }
  75% { transform: translateX(20px) translateY(-5px); }
}

/* 浮动橘子 */
.floating-oranges {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.float-orange {
  position: absolute;
  bottom: -50px;
  left: var(--x);
  font-size: var(--size);
  animation: floatUp 12s ease-in-out infinite;
  animation-delay: var(--delay);
  opacity: 0.6;
  filter: drop-shadow(0 4px 8px rgba(255, 140, 0, 0.3));
}

@keyframes floatUp {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.6; }
  90% { opacity: 0.6; }
  100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
}

/* 闪烁星星 */
.sparkles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  color: rgba(255, 255, 255, 0.6);
  animation: sparkle 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
}

/* ===== 内容层 ===== */
.content-wrapper {
  position: relative;
  z-index: 1;
  padding-bottom: 100px;
}

/* 头部 */
.summer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(180deg, rgba(26, 26, 46, 0.9) 0%, transparent 100%);
  backdrop-filter: blur(10px);
}

.back-btn {
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

.back-btn:hover {
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

/* 主视觉区域 */
.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 20px 32px;
  gap: 24px;
}

/* 黑胶唱片 */
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
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 8px rgba(255, 140, 0, 0.2),
    0 0 0 16px rgba(255, 100, 100, 0.1);
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
  background: linear-gradient(135deg, #ff8a65, #ff6b6b);
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

/* 主视觉信息 */
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

.badge-icon {
  font-size: 16px;
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
  background: linear-gradient(135deg, #fff, #ffeaa7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-wave {
  font-size: 24px;
  animation: waveBounce 2s ease-in-out infinite;
}

@keyframes waveBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
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

.pill-icon {
  font-size: 14px;
}

/* 简介卡片 */
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

.quote-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 140, 0, 0.2) 0%, transparent 70%);
  border-radius: 50%;
}

.quote-decoration {
  margin-bottom: 12px;
}

.quote-mark {
  font-size: 48px;
  color: rgba(255, 200, 100, 0.5);
  line-height: 1;
  font-family: Georgia, serif;
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
  color: #ffeaa7;
  font-weight: 600;
  white-space: nowrap;
  text-shadow: 0 2px 8px rgba(255, 200, 100, 0.3);
}

/* 操作按钮 */
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
}

.play-btn-primary {
  background: linear-gradient(135deg, #ff8a65 0%, #ff6b6b 100%);
  color: white;
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.4);
}

.play-btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(255, 107, 107, 0.5);
}

.play-btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.play-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

.btn-icon {
  font-size: 16px;
}

/* 歌曲列表 */
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

.song-item.active {
  background: linear-gradient(135deg, rgba(255, 138, 101, 0.2), rgba(255, 107, 107, 0.15));
  border-color: rgba(255, 138, 101, 0.3);
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
  background: linear-gradient(135deg, #ff6b6b, #ff8a65);
  animation: playingPulse 1.5s ease-in-out infinite;
}

@keyframes playingPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4); }
  50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255, 107, 107, 0); }
}

.playing-icon {
  font-size: 16px;
  animation: noteBounce 0.8s ease-in-out infinite;
}

@keyframes noteBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
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

/* 底部 */
.summer-footer {
  text-align: center;
  padding: 48px 20px 32px;
  color: white;
}

.footer-sun {
  font-size: 48px;
  margin-bottom: 16px;
  animation: sunSet 4s ease-in-out infinite;
}

@keyframes sunSet {
  0%, 100% { transform: translateY(0); filter: brightness(1); }
  50% { transform: translateY(-10px); filter: brightness(1.2); }
}

.footer-text {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #ffeaa7, #fab1a0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 4px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.footer-wave {
  margin-top: 16px;
  font-size: 20px;
  opacity: 0.5;
  letter-spacing: 8px;
}

/* 响应式 */
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