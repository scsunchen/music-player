<template>
  <SkeletonLoader v-if="loading" />
  <div class="immersive-home" v-else :style="dynamicStyle">
    <!-- 动态氛围背景 -->
    <div class="atmosphere">
      <div class="atmo-bg-img" :style="{ backgroundImage: `url(${bgCover})` }"></div>
      <div class="atmo-gradient"></div>
      <div class="atmo-grain"></div>
      <div class="atmo-orb atmo-orb-1"></div>
      <div class="atmo-orb atmo-orb-2"></div>
    </div>

    <!-- 主内容 -->
    <div class="content-layer">

      <!-- 正在播放 - 页面中心焦点 -->
      <section class="now-playing" v-if="playerStore.currentSong">
        <div class="np-label">NOW PLAYING</div>
        <div class="np-card" @click="openFullscreen">
          <div class="np-cover">
            <img :src="playerStore.currentSong.cover" :alt="playerStore.currentSong.title" />
            <div class="np-cover-glow"></div>
          </div>
          <div class="np-info">
            <h2 class="np-title">{{ playerStore.currentSong.title }}</h2>
            <p class="np-artist">{{ playerStore.currentSong.artist }}</p>
            <p class="np-album">{{ playerStore.currentSong.album }}</p>
          </div>
          <div class="np-play-icon">
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </section>

      <!-- 欢迎语 - 无播放时显示 -->
      <section class="welcome" v-else>
        <div class="welcome-time">{{ greeting }}</div>
        <h1 class="welcome-text">发现好音乐</h1>
        <p class="welcome-sub">开始你的聆听之旅</p>
      </section>

      <!-- 快捷操作 -->
      <section class="quick-grid">
        <div class="qk-chip" @click="playDailySongs">
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          <span>每日推荐</span>
        </div>
        <div class="qk-chip" @click="router.push('/liked')">
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span>我喜欢</span>
        </div>
        <div class="qk-chip" @click="router.push('/summer')">
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>
          <span>夏日精选</span>
        </div>
        <div class="qk-chip" @click="router.push('/stats')">
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
          <span>听歌统计</span>
        </div>
      </section>

      <!-- 推荐歌单 -->
      <section class="content-section">
        <div class="section-header">
          <h3 class="section-title">为你推荐</h3>
          <router-link to="/playlists" class="see-all">全部</router-link>
        </div>
        <div class="horizontal-scroll">
          <div
            v-for="playlist in playerStore.recommendPlaylists"
            :key="playlist.id"
            class="glass-card"
            @click="router.push(`/playlist/${playlist.id}`)"
          >
            <div class="glass-card-cover">
              <img :src="playlist.cover" :alt="playlist.name" loading="lazy" />
            </div>
            <div class="glass-card-info">
              <span class="glass-card-name">{{ playlist.name }}</span>
              <span class="glass-card-count">{{ playlist.songs?.length || 0 }} 首</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 最近歌曲 -->
      <section class="content-section">
        <div class="section-header">
          <h3 class="section-title">最近歌曲</h3>
          <router-link to="/songs" class="see-all">全部</router-link>
        </div>
        <div class="recent-list">
          <div
            v-for="song in recentSongs"
            :key="song.id"
            class="recent-item"
            @click="playerStore.playSong(song)"
          >
            <div class="recent-cover">
              <img :src="song.cover" :alt="song.title" loading="lazy" />
            </div>
            <div class="recent-meta">
              <span class="recent-title">{{ song.title }}</span>
              <span class="recent-artist">{{ song.artist }}</span>
            </div>
            <span class="recent-duration" v-if="song.duration">{{ formatTime(song.duration) }}</span>
          </div>
        </div>
      </section>

      <!-- 底部空间 -->
      <div class="bottom-space"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { resolveUrl } from '../utils/baseUrl'
import SkeletonLoader from '../components/SkeletonLoader.vue'

const router = useRouter()
const playerStore = usePlayerStore()

const loading = ref(true)
onMounted(() => { setTimeout(() => { loading.value = false }, 600) })

// 问候语
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 18) return '下午好'
  return '晚上好'
})

// 动态背景封面
const bgCover = computed(() => {
  if (playerStore.currentSong?.cover) return playerStore.currentSong.cover
  return resolveUrl('images/covers/fenghuang_chuanqi_hero.jpg')
})

// 动态主题色
const dynamicStyle = computed(() => {
  const color = playerStore.themeColor || '#667eea'
  return {
    '--dynamic-color': color,
    '--dynamic-r': parseInt(color.slice(1, 3), 16),
    '--dynamic-g': parseInt(color.slice(3, 5), 16),
    '--dynamic-b': parseInt(color.slice(5, 7), 16),
  }
})

// 最近歌曲
const recentSongs = computed(() => {
  return [...playerStore.songs].sort((a, b) => b.id - a.id).slice(0, 6)
})

// 操作
const openFullscreen = () => {
  playerStore.isFullscreen = true
}

const playDailySongs = () => {
  const shuffled = [...playerStore.songs].sort(() => Math.random() - 0.5)
  playerStore.playPlaylist({ id: 'daily', name: '每日10首', songs: shuffled.slice(0, 10).map(s => s.id) })
}

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.immersive-home {
  position: relative;
  min-height: 100vh;
  background: #0a0a0a;
  color: rgba(255, 255, 255, 0.85);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  overflow-x: hidden;
  padding-bottom: 100px;
}

/* ===== 动态氛围背景 ===== */
.atmosphere {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.atmo-bg-img {
  position: absolute;
  inset: -40px;
  background-size: cover;
  background-position: center;
  filter: blur(60px) saturate(1.4) brightness(0.35);
  transform: scale(1.2);
  transition: background-image 2s ease;
}

.atmo-gradient {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 20% 20%, rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 80%, rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.1) 0%, transparent 50%),
    linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.7) 60%, #0a0a0a 100%);
}

.atmo-grain {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 256px;
}

.atmo-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.12;
  animation: orbFloat 12s ease-in-out infinite alternate;
}

.atmo-orb-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.5);
}

.atmo-orb-2 {
  width: 300px;
  height: 300px;
  bottom: 20%;
  left: -80px;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.3);
  animation-delay: -6s;
}

@keyframes orbFloat {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, -40px) scale(1.15); }
}

/* ===== 内容层 ===== */
.content-layer {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px;
}

/* ===== 正在播放 ===== */
.now-playing {
  margin-bottom: 40px;
  animation: fadeUp 0.8s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.np-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 3px;
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8);
  text-transform: uppercase;
  margin-bottom: 16px;
}

.np-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(24px) saturate(1.2);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.np-card:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.2);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.08);
}

.np-cover {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 14px;
  overflow: hidden;
  flex-shrink: 0;
}

.np-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.np-cover-glow {
  position: absolute;
  inset: -4px;
  border-radius: 18px;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.2);
  filter: blur(12px);
  z-index: -1;
}

.np-info {
  flex: 1;
  min-width: 0;
}

.np-title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.np-artist {
  margin: 0 0 2px;
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.55);
}

.np-album {
  margin: 0;
  font-size: 12px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.3);
}

.np-play-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15);
  border: 1px solid rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.9);
  flex-shrink: 0;
  transition: all 0.3s;
}

.np-card:hover .np-play-icon {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.25);
  transform: scale(1.05);
}

/* ===== 欢迎语（无播放时） ===== */
.welcome {
  margin-bottom: 40px;
  animation: fadeUp 0.8s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.welcome-time {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 3px;
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.6);
  text-transform: uppercase;
  margin-bottom: 12px;
}

.welcome-text {
  margin: 0 0 8px;
  font-size: 42px;
  font-weight: 800;
  color: #fff;
  line-height: 1.1;
  letter-spacing: -1px;
}

.welcome-sub {
  margin: 0;
  font-size: 16px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.35);
}

/* ===== 快捷操作 ===== */
.quick-grid {
  display: flex;
  gap: 10px;
  margin-bottom: 48px;
  animation: fadeUp 0.8s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
  overflow-x: auto;
  scrollbar-width: none;
}

.quick-grid::-webkit-scrollbar { display: none; }

.qk-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 100px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
  transition: all 0.3s;
  flex-shrink: 0;
}

.qk-chip:hover {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.1);
  border-color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.2);
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.9);
}

.qk-chip svg {
  opacity: 0.6;
}

.qk-chip:hover svg {
  opacity: 1;
}

/* ===== 内容区块 ===== */
.content-section {
  margin-bottom: 48px;
  animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.content-section:nth-child(3) { animation-delay: 0.3s; }
.content-section:nth-child(4) { animation-delay: 0.4s; }

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.see-all {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.3);
  text-decoration: none;
  text-transform: uppercase;
  transition: color 0.3s;
}

.see-all:hover {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8);
}

/* ===== 横向滚动卡片 ===== */
.horizontal-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 8px;
  scroll-snap-type: x mandatory;
}

.horizontal-scroll::-webkit-scrollbar { display: none; }

.glass-card {
  flex-shrink: 0;
  width: 150px;
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  scroll-snap-align: start;
}

.glass-card:hover {
  transform: translateY(-6px);
}

.glass-card-cover {
  width: 150px;
  height: 150px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.glass-card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-card:hover .glass-card-cover img {
  transform: scale(1.06);
}

.glass-card-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.glass-card-name {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.glass-card-count {
  font-size: 12px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.3);
}

/* ===== 最近歌曲列表 ===== */
.recent-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.recent-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.recent-cover {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.03);
}

.recent-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recent-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recent-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-artist {
  font-size: 12px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.35);
}

.recent-duration {
  font-size: 12px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.25);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.bottom-space {
  height: 60px;
}

/* ===== 动画 ===== */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 桌面端 ===== */
@media (min-width: 768px) {
  .content-layer {
    padding: 60px 40px;
    max-width: 960px;
  }

  .np-card {
    padding: 20px 28px;
    gap: 24px;
  }

  .np-cover {
    width: 88px;
    height: 88px;
    border-radius: 16px;
  }

  .np-title {
    font-size: 24px;
  }

  .welcome-text {
    font-size: 56px;
  }

  .quick-grid {
    gap: 12px;
  }

  .qk-chip {
    padding: 12px 22px;
    font-size: 14px;
  }

  .glass-card {
    width: 170px;
  }

  .glass-card-cover {
    width: 170px;
    height: 170px;
  }

  .section-title {
    font-size: 26px;
  }
}

@media (min-width: 1024px) {
  .content-layer {
    max-width: 1040px;
  }

  .np-cover {
    width: 96px;
    height: 96px;
  }

  .glass-card {
    width: 180px;
  }

  .glass-card-cover {
    width: 180px;
    height: 180px;
  }
}
</style>
