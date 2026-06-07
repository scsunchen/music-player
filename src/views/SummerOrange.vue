<template>
  <div class="summer-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="sun-glow"></div>
      <div class="orange-bubble bubble-1"></div>
      <div class="orange-bubble bubble-2"></div>
      <div class="orange-bubble bubble-3"></div>
      <div class="orange-bubble bubble-4"></div>
    </div>

    <!-- 头部 -->
    <header class="summer-header">
      <button class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
      <h1 class="page-title">橘子味的夏天</h1>
      <div class="orange-icon">🍊</div>
    </header>

    <!-- 封面区域 -->
    <section class="cover-section">
      <div class="cover-container">
        <div class="cover-glow"></div>
        <div class="cover-image">
          <div class="cover-placeholder">
            <span class="cover-emoji">🍊</span>
            <div class="cover-wave"></div>
          </div>
        </div>
      </div>
      <div class="cover-info">
        <h2 class="playlist-name">橘子味的夏天</h2>
        <p class="playlist-desc">清甜 · 温柔 · 日落氛围感</p>
        <div class="playlist-stats">
          <span class="stat-item">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            {{ songs.length }} 首歌曲
          </span>
          <span class="stat-item">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            夏日限定
          </span>
        </div>
      </div>
    </section>

    <!-- 简介 -->
    <section class="intro-section">
      <div class="intro-card">
        <p class="intro-text">
          夏天是橘子汽水冒起的气泡，是黄昏染遍天空的橘粉，是晚风里轻轻晃动的旋律。
        </p>
        <p class="intro-text">
          这张歌单装满了暖橙色调的温柔与甜，适合傍晚散步、窗边发呆、和喜欢的人共享耳机。
        </p>
        <p class="intro-text highlight">
          愿每一段旋律，都能陪你度过一整个温柔又明亮的夏天。
        </p>
      </div>
    </section>

    <!-- 操作按钮 -->
    <section class="action-section">
      <button class="play-all-btn" @click="playAll">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M8 5v14l11-7z"/>
        </svg>
        播放全部
      </button>
      <button class="shuffle-btn" @click="shufflePlay">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
        </svg>
        随机播放
      </button>
    </section>

    <!-- 歌曲列表 -->
    <section class="songs-section">
      <h3 class="section-title">完整歌单</h3>
      <div class="songs-list">
        <div
          v-for="(song, index) in songs"
          :key="song.id"
          class="song-item"
          :class="{ active: playerStore.currentSong?.id === song.id }"
          @click="playSong(song)"
        >
          <div class="song-number">{{ index + 1 }}</div>
          <div class="song-info">
            <div class="song-name">{{ song.title }}</div>
            <div class="song-artist">{{ song.artist }}</div>
          </div>
          <div class="song-action">
            <button
              class="like-btn"
              :class="{ liked: playerStore.likedSongs.includes(song.id) }"
              @click.stop="toggleLike(song.id)"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
            <div class="playing-indicator" v-if="playerStore.currentSong?.id === song.id && playerStore.isPlaying">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部标语 -->
    <footer class="summer-footer">
      <p class="footer-text">橘子味的夏天歌单已就位 🍊</p>
      <p class="footer-sub">橘粉晚霞 + 暖橙旋律</p>
      <p class="footer-sub">耳机分你一半，一起过夏天</p>
    </footer>
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

// 播放全部
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

// 随机播放
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

// 播放单首
const playSong = (song) => {
  if (!song.audioUrl) {
    alert('该歌曲链接暂未配置')
    return
  }
  // 将当前歌单设为播放列表
  const validSongs = songs.filter(s => s.audioUrl)
  const index = validSongs.findIndex(s => s.id === song.id)
  if (index !== -1) {
    playerStore.currentPlaylist = validSongs
    playerStore.currentIndex = index
    playerStore.playSong(song)
  }
}

// 收藏
const toggleLike = (id) => {
  playerStore.toggleLike(id)
}
</script>

<style scoped>
.summer-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff5f0 0%, #ffe8d6 30%, #ffd4a3 70%, #ffb347 100%);
  position: relative;
  overflow-x: hidden;
  padding-bottom: 120px;
}

/* 背景装饰 */
.bg-decoration {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.sun-glow {
  position: absolute;
  top: -100px;
  right: -100px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 183, 77, 0.4) 0%, rgba(255, 138, 101, 0.2) 50%, transparent 70%);
  border-radius: 50%;
  animation: sunPulse 6s ease-in-out infinite;
}

@keyframes sunPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.orange-bubble {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 200, 150, 0.6), rgba(255, 160, 100, 0.3));
  animation: float 8s ease-in-out infinite;
}

.bubble-1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.bubble-2 {
  width: 60px;
  height: 60px;
  top: 50%;
  right: 15%;
  animation-delay: 2s;
}

.bubble-3 {
  width: 100px;
  height: 100px;
  bottom: 30%;
  left: 5%;
  animation-delay: 4s;
}

.bubble-4 {
  width: 50px;
  height: 50px;
  top: 70%;
  right: 10%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(5deg); }
  66% { transform: translateY(10px) rotate(-3deg); }
}

/* 头部 */
.summer-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  padding: 16px 20px;
  gap: 12px;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #e65100;
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.05);
}

.page-title {
  flex: 1;
  font-size: 20px;
  font-weight: 700;
  color: #e65100;
  text-align: center;
}

.orange-icon {
  font-size: 28px;
  animation: orangeBounce 2s ease-in-out infinite;
}

@keyframes orangeBounce {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-8px) rotate(5deg); }
}

/* 封面区域 */
.cover-section {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 20px;
}

.cover-container {
  position: relative;
  width: 200px;
  height: 200px;
}

.cover-glow {
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: radial-gradient(circle, rgba(255, 171, 64, 0.5) 0%, rgba(255, 138, 101, 0.3) 40%, transparent 70%);
  border-radius: 50%;
  animation: glowRotate 10s linear infinite;
}

@keyframes glowRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.cover-image {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(230, 81, 0, 0.3), 0 0 0 4px rgba(255, 255, 255, 0.5);
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ffb74d 0%, #ff8a65 50%, #ff7043 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.cover-emoji {
  font-size: 80px;
  z-index: 2;
  animation: emojiFloat 3s ease-in-out infinite;
}

@keyframes emojiFloat {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.05); }
}

.cover-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.3) 100%);
  animation: waveMove 4s ease-in-out infinite;
}

@keyframes waveMove {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.cover-info {
  text-align: center;
}

.playlist-name {
  font-size: 28px;
  font-weight: 800;
  color: #bf360c;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(230, 81, 0, 0.2);
}

.playlist-desc {
  font-size: 15px;
  color: #e65100;
  opacity: 0.8;
  margin-bottom: 12px;
}

.playlist-stats {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #f57c00;
  background: rgba(255, 255, 255, 0.5);
  padding: 4px 12px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

/* 简介 */
.intro-section {
  position: relative;
  z-index: 1;
  padding: 0 20px;
  margin-bottom: 24px;
}

.intro-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 183, 77, 0.3);
  box-shadow: 0 8px 32px rgba(230, 81, 0, 0.1);
}

.intro-text {
  font-size: 14px;
  line-height: 1.8;
  color: #5d4037;
  margin-bottom: 12px;
}

.intro-text:last-child {
  margin-bottom: 0;
}

.intro-text.highlight {
  color: #e65100;
  font-weight: 600;
  text-align: center;
  font-size: 15px;
}

/* 操作按钮 */
.action-section {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 16px;
  padding: 0 20px;
  margin-bottom: 32px;
}

.play-all-btn,
.shuffle-btn {
  flex: 1;
  height: 48px;
  border-radius: 24px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.play-all-btn {
  background: linear-gradient(135deg, #ff8a65 0%, #ff7043 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(255, 112, 67, 0.4);
}

.play-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(255, 112, 67, 0.5);
}

.shuffle-btn {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  color: #e65100;
  border: 2px solid rgba(255, 138, 101, 0.3);
}

.shuffle-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 138, 101, 0.5);
}

/* 歌曲列表 */
.songs-section {
  position: relative;
  z-index: 1;
  padding: 0 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #bf360c;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(180deg, #ff8a65, #ff7043);
  border-radius: 2px;
}

.songs-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(230, 81, 0, 0.1);
}

.song-item.active {
  background: linear-gradient(135deg, rgba(255, 138, 101, 0.15), rgba(255, 112, 67, 0.1));
  border-color: rgba(255, 138, 101, 0.3);
}

.song-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffb74d, #ff8a65);
  color: white;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 15px;
  font-weight: 600;
  color: #3e2723;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 13px;
  color: #8d6e63;
}

.song-action {
  display: flex;
  align-items: center;
  gap: 8px;
}

.like-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #bcaaa4;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.like-btn:hover {
  background: rgba(255, 138, 101, 0.1);
  color: #ff8a65;
}

.like-btn.liked {
  color: #ff5252;
}

.playing-indicator {
  display: flex;
  gap: 2px;
  align-items: flex-end;
  height: 16px;
}

.playing-indicator span {
  width: 3px;
  background: linear-gradient(180deg, #ff8a65, #ff7043);
  border-radius: 2px;
  animation: soundBar 1s ease-in-out infinite;
}

.playing-indicator span:nth-child(1) { height: 8px; animation-delay: 0s; }
.playing-indicator span:nth-child(2) { height: 14px; animation-delay: 0.2s; }
.playing-indicator span:nth-child(3) { height: 10px; animation-delay: 0.4s; }

@keyframes soundBar {
  0%, 100% { transform: scaleY(0.6); }
  50% { transform: scaleY(1); }
}

/* 底部 */
.summer-footer {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40px 20px;
  margin-top: 20px;
}

.footer-text {
  font-size: 16px;
  font-weight: 700;
  color: #e65100;
  margin-bottom: 8px;
}

.footer-sub {
  font-size: 13px;
  color: #f57c00;
  opacity: 0.8;
  margin-bottom: 4px;
}

/* 响应式 */
@media (min-width: 768px) {
  .cover-section {
    flex-direction: row;
    justify-content: center;
    gap: 40px;
    padding: 40px;
  }

  .cover-container {
    width: 240px;
    height: 240px;
  }

  .cover-info {
    text-align: left;
  }

  .playlist-stats {
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