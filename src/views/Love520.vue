<template>
  <div class="love-520">
    <!-- 动态背景 -->
    <div class="bg-hearts">
      <div v-for="i in 20" :key="i" class="floating-heart" :style="getHeartStyle(i)">❤️</div>
    </div>
    <div class="bg-gradient"></div>
    
    <!-- 阳光光晕 -->
    <div class="sunshine">
      <div class="sun-rays"></div>
      <div class="sun-glow"></div>
    </div>

    <!-- 返回按钮 -->
    <button class="btn-back" @click="goBack">
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
      </svg>
    </button>

    <!-- 主内容 -->
    <div class="content">
      <!-- 标题区域 -->
      <div class="hero">
        <div class="date-badge">5.20</div>
        <h1 class="title">
          <span class="love-text">爱你</span>
          <span class="heart-beat">💕</span>
        </h1>
        <p class="subtitle">愿所有美好如期而至</p>
        <div class="decoration">
          <span class="sparkle">✨</span>
          <span class="flower">🌸</span>
          <span class="sparkle">✨</span>
        </div>
      </div>

      <!-- 播放全部 -->
      <button class="btn-play-all" @click="playAll">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M8 5v14l11-7z"/>
        </svg>
        播放全部
      </button>

      <!-- 歌曲列表 -->
      <div class="songs-section">
        <h2 class="section-title">
          <span class="title-icon">🎵</span>
          甜蜜歌单
          <span class="title-icon">🎵</span>
        </h2>
        <div class="song-list">
          <div 
            v-for="(song, index) in loveSongs" 
            :key="song.id"
            class="song-item"
            @click="playSong(song)"
          >
            <div class="song-number">{{ index + 1 }}</div>
            <img :src="song.cover" :alt="song.title" class="song-cover" />
            <div class="song-info">
              <h3 class="song-title">{{ song.title }}</h3>
              <p class="song-artist">{{ song.artist }}</p>
            </div>
            <button class="btn-like" :class="{ liked: isLiked(song.id) }" @click.stop="toggleLike(song.id)">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
            <button class="btn-play" @click.stop="playSong(song)">
              <svg v-if="playerStore.currentSong?.id === song.id && playerStore.isPlaying" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 祝福语 -->
      <div class="blessing">
        <p class="blessing-text">
          "愿你的生活充满阳光与爱意"
        </p>
        <div class="blessing-icons">
          <span>☀️</span>
          <span>💝</span>
          <span>🌈</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'

const router = useRouter()
const playerStore = usePlayerStore()

// 520爱情主题歌曲（从现有歌曲中筛选）
const loveSongs = computed(() => {
  const loveSongIds = [2, 3, 5, 6, 13, 14] // 晴天、七里香、告白气球、光年之外、你像风来了又走、梦底
  return loveSongIds
    .map(id => playerStore.songs.find(s => s.id === id))
    .filter(Boolean)
})

const getHeartStyle = (i) => {
  const size = 15 + Math.random() * 25
  const left = Math.random() * 100
  const delay = Math.random() * 10
  const duration = 8 + Math.random() * 8
  return {
    fontSize: `${size}px`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

const goBack = () => {
  router.back()
}

const playSong = (song) => {
  playerStore.playSong(song)
}

const playAll = () => {
  if (loveSongs.value.length > 0) {
    const playlist = {
      id: 'love520',
      name: '520 爱你',
      songs: loveSongs.value.map(s => s.id)
    }
    playerStore.playPlaylist(playlist)
  }
}

const isLiked = (id) => {
  return playerStore.isLiked(id)
}

const toggleLike = (id) => {
  playerStore.toggleLikeSong(id)
}
</script>

<style scoped>
.love-520 {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #ffeaa7 0%, #fab1a0 30%, #fd79a8 70%, #e17055 100%);
}

/* 动态爱心背景 */
.bg-hearts {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.floating-heart {
  position: absolute;
  bottom: -50px;
  opacity: 0.4;
  animation: floatUp linear infinite;
  filter: blur(1px);
}

@keyframes floatUp {
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

/* 渐变遮罩 */
.bg-gradient {
  position: fixed;
  inset: 0;
  background: 
    radial-gradient(ellipse at 20% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(255, 200, 200, 0.3) 0%, transparent 50%);
  pointer-events: none;
  z-index: 1;
}

/* 阳光效果 */
.sunshine {
  position: fixed;
  top: -100px;
  right: -100px;
  width: 400px;
  height: 400px;
  pointer-events: none;
  z-index: 2;
}

.sun-rays {
  position: absolute;
  inset: 0;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(255, 255, 200, 0.1) 10deg,
    transparent 20deg,
    rgba(255, 255, 200, 0.1) 30deg,
    transparent 40deg,
    rgba(255, 255, 200, 0.1) 50deg,
    transparent 60deg,
    rgba(255, 255, 200, 0.1) 70deg,
    transparent 80deg,
    rgba(255, 255, 200, 0.1) 90deg,
    transparent 100deg,
    rgba(255, 255, 200, 0.1) 110deg,
    transparent 120deg,
    rgba(255, 255, 200, 0.1) 130deg,
    transparent 140deg,
    rgba(255, 255, 200, 0.1) 150deg,
    transparent 160deg,
    rgba(255, 255, 200, 0.1) 170deg,
    transparent 180deg,
    rgba(255, 255, 200, 0.1) 190deg,
    transparent 200deg,
    rgba(255, 255, 200, 0.1) 210deg,
    transparent 220deg,
    rgba(255, 255, 200, 0.1) 230deg,
    transparent 240deg,
    rgba(255, 255, 200, 0.1) 250deg,
    transparent 260deg,
    rgba(255, 255, 200, 0.1) 270deg,
    transparent 280deg,
    rgba(255, 255, 200, 0.1) 290deg,
    transparent 300deg,
    rgba(255, 255, 200, 0.1) 310deg,
    transparent 320deg,
    rgba(255, 255, 200, 0.1) 330deg,
    transparent 340deg,
    rgba(255, 255, 200, 0.1) 350deg,
    transparent 360deg
  );
  animation: rotate 30s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.sun-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(255, 255, 200, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
}

/* 返回按钮 */
.btn-back {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 100;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

/* 主内容 */
.content {
  position: relative;
  z-index: 10;
  padding: 60px 20px 100px;
  max-width: 600px;
  margin: 0 auto;
}

/* 标题区域 */
.hero {
  text-align: center;
  margin-bottom: 32px;
}

.date-badge {
  display: inline-block;
  padding: 8px 24px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(255, 100, 100, 0.3);
}

.title {
  margin: 0 0 8px;
  font-size: 48px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 4px 20px rgba(255, 100, 100, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.love-text {
  background: linear-gradient(135deg, #fff 0%, #ffeaa7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.heart-beat {
  font-size: 40px;
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.1); }
  50% { transform: scale(1); }
  75% { transform: scale(1.1); }
}

.subtitle {
  margin: 0 0 16px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 2px;
}

.decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 20px;
}

.sparkle {
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.flower {
  animation: sway 3s ease-in-out infinite;
}

@keyframes sway {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

/* 播放全部按钮 */
.btn-play-all {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 280px;
  margin: 0 auto 40px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border: none;
  border-radius: 30px;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 30px rgba(255, 100, 100, 0.4);
  transition: all 0.3s;
}

.btn-play-all:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 12px 40px rgba(255, 100, 100, 0.5);
}

/* 歌曲列表区域 */
.songs-section {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 18px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* 歌曲列表 */
.song-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateX(4px);
}

.song-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.song-cover {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.btn-like {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-like:hover {
  color: rgba(255, 255, 255, 0.9);
}

.btn-like.liked {
  color: #ff6b6b;
}

.btn-play {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-play:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

/* 祝福语 */
.blessing {
  text-align: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
}

.blessing-text {
  margin: 0 0 16px;
  font-size: 16px;
  color: #fff;
  font-style: italic;
  line-height: 1.6;
}

.blessing-icons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 28px;
}

.blessing-icons span {
  animation: float 3s ease-in-out infinite;
}

.blessing-icons span:nth-child(2) {
  animation-delay: 0.5s;
}

.blessing-icons span:nth-child(3) {
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 响应式 */
@media (min-width: 768px) {
  .content {
    padding: 80px 40px 100px;
  }
  
  .title {
    font-size: 64px;
  }
  
  .heart-beat {
    font-size: 56px;
  }
  
  .songs-section {
    padding: 32px;
  }
}
</style>
