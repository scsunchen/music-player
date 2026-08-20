<template>
  <SkeletonLoader type="stats" v-if="loading" />
  <div class="immersive-stats" :style="dynamicStyle" v-else>
    <!-- 轻量氛围背景 -->
    <div class="atmosphere">
      <div class="atmo-gradient"></div>
      <div class="atmo-orb atmo-orb-1"></div>
      <div class="atmo-orb atmo-orb-2"></div>
    </div>

    <div class="content-layer">
      <!-- 页面标题 -->
      <header class="page-header">
        <span class="header-label">STATISTICS</span>
        <h1 class="header-title">听歌报告</h1>
        <p class="header-sub">你的音乐足迹</p>
      </header>

      <!-- 空状态 -->
      <div v-if="stats.totalPlays === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" width="48" height="48"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
        </div>
        <p class="empty-title">还没有播放记录</p>
        <p class="empty-hint">去听几首歌，你的听歌报告就会出现在这里</p>
      </div>

      <template v-else>
        <!-- 概览卡片 -->
        <section class="overview-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
            <div class="stat-value">{{ stats.todayPlays }}</div>
            <div class="stat-label">今日播放</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
            </div>
            <div class="stat-value">{{ stats.weekPlays }}</div>
            <div class="stat-label">本周播放</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
            <div class="stat-value">{{ stats.totalPlays }}</div>
            <div class="stat-label">累计播放</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
            </div>
            <div class="stat-value small">{{ stats.totalDuration }}</div>
            <div class="stat-label">累计时长</div>
          </div>
        </section>

        <!-- 中间行：7天趋势 + 本周概览 -->
        <div class="stats-row">
          <section class="section section-grow">
            <div class="section-header">
              <h3 class="section-title">最近 7 天</h3>
            </div>
            <div class="chart-card">
              <div class="bar-chart">
                <div
                  v-for="day in stats.last7Days"
                  :key="day.date"
                  class="bar-item"
                >
                  <div class="bar-wrapper">
                    <div class="bar" :style="{ height: getBarHeight(day.count) + '%' }">
                      <span v-if="day.count > 0" class="bar-count">{{ day.count }}</span>
                    </div>
                  </div>
                  <span class="bar-label">{{ day.label }}</span>
                </div>
              </div>
            </div>
          </section>

          <section class="section">
            <div class="section-header">
              <h3 class="section-title">本周概览</h3>
            </div>
            <div class="week-grid">
              <div class="week-card">
                <span class="week-label">播放次数</span>
                <span class="week-value">{{ stats.weekPlays }} 次</span>
              </div>
              <div class="week-card">
                <span class="week-label">播放时长</span>
                <span class="week-value">{{ stats.weekDuration }}</span>
              </div>
              <div class="week-card">
                <span class="week-label">收藏歌曲</span>
                <span class="week-value">{{ stats.likedCount }} 首</span>
              </div>
            </div>
          </section>
        </div>

        <!-- 下面行：最爱歌手 + 单曲循环榜 -->
        <div class="stats-row">
          <section class="section" v-if="stats.topArtists.length > 0">
            <div class="section-header">
              <h3 class="section-title">最爱歌手</h3>
            </div>
            <div class="artist-list">
              <div
                v-for="(artist, index) in stats.topArtists"
                :key="artist.name"
                class="artist-item"
              >
                <span class="artist-rank" :class="{ top3: index < 3 }">{{ index + 1 }}</span>
                <div class="artist-info">
                  <span class="artist-name">{{ artist.name }}</span>
                  <div class="artist-bar-bg">
                    <div
                      class="artist-bar"
                      :style="{ width: (artist.count / stats.topArtists[0].count * 100) + '%' }"
                    ></div>
                  </div>
                </div>
                <span class="artist-count">{{ artist.count }} 次</span>
              </div>
            </div>
          </section>

          <section class="section" v-if="stats.topSongs.length > 0">
            <div class="section-header">
              <h3 class="section-title">单曲循环榜</h3>
            </div>
            <div class="song-list">
              <div
                v-for="(song, index) in stats.topSongs"
                :key="song.id"
                class="song-item"
              >
                <span class="song-rank" :class="{ top3: index < 3 }">{{ index + 1 }}</span>
                <div class="song-cover" @click="playerStore.playSong(song)">
                  <img :src="song.cover" :alt="song.title" loading="lazy" />
                  <div class="song-cover-play">
                    <svg viewBox="0 0 24 24" width="14" height="14"><path fill="#fff" d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <div class="song-meta" @click="router.push(`/song/${song.id}`)">
                  <span class="song-title">{{ song.title }}</span>
                  <span class="song-artist">{{ song.artist }}</span>
                </div>
                <span class="song-play-count">{{ song.playCount }} 次</span>
              </div>
            </div>
          </section>
        </div>
      </template>

      <div class="bottom-space"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import SkeletonLoader from '../components/SkeletonLoader.vue'

const router = useRouter()
const playerStore = usePlayerStore()

// 页面本地 loading：挂载后显示骨架屏，短暂延时后渲染真实内容
const loading = ref(true)
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 600)
})

const dynamicStyle = computed(() => {
  const color = playerStore.themeColor || '#667eea'
  return {
    '--dynamic-r': parseInt(color.slice(1, 3), 16),
    '--dynamic-g': parseInt(color.slice(3, 5), 16),
    '--dynamic-b': parseInt(color.slice(5, 7), 16),
  }
})

const stats = computed(() => playerStore.getStatsSummary())

const maxCount = computed(() => {
  return Math.max(...stats.value.last7Days.map(d => d.count), 1)
})

const getBarHeight = (count) => {
  if (count === 0) return 4
  return Math.max((count / maxCount.value) * 100, 8)
}
</script>

<style scoped>
.immersive-stats {
  position: relative;
  min-height: 100vh;
  background: #0a0a0a;
  color: rgba(255, 255, 255, 0.85);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  padding-bottom: 100px;
  overflow-x: clip;
}

/* 轻量氛围背景 */
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
    radial-gradient(ellipse at 20% 20%, rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 80%, rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.1) 0%, transparent 50%),
    linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.7) 60%, #0a0a0a 100%);
}

.atmo-orb {
  position: absolute;
  border-radius: 50%;
  box-shadow: 0 0 120px 40px rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15);
  opacity: 1;
  animation: orbFloat 12s ease-in-out infinite alternate;
}

.atmo-orb-1 {
  width: 300px;
  height: 300px;
  top: -80px;
  left: -50px;
}

.atmo-orb-2 {
  width: 220px;
  height: 220px;
  bottom: 15%;
  right: -40px;
  animation-delay: -5s;
}

@keyframes orbFloat {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(20px, -28px) scale(1.06); }
}

/* 内容层 */
.content-layer {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 32px 0;
}

@media (min-width: 768px) {
  .content-layer { padding: 48px 48px 0; }
}
@media (min-width: 1024px) {
  .content-layer { max-width: 1400px; padding: 48px 64px 0; }
}

/* 宽屏并排行 */
.stats-row {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 1024px) {
  .stats-row {
    flex-direction: row;
    gap: 24px;
  }
  .stats-row .section {
    flex: 1;
    margin-bottom: 0;
  }
  .stats-row .section-grow {
    flex: 1.6;
  }
}

/* 页头 */
.page-header {
  margin-bottom: 32px;
}

.header-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.7);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.header-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.header-sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 300;
}

/* 概览卡片 */
.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 40px;
}

@media (min-width: 768px) {
  .overview-grid { grid-template-columns: repeat(4, 1fr); }
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  padding: 20px 16px;
  text-align: center;
  transition: all 0.3s;
}

.stat-card:hover {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.05);
  border-color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.7);
  margin-bottom: 12px;
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.stat-value.small {
  font-size: 18px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 6px;
}

/* 区块 */
.section {
  margin-bottom: 40px;
}

.section-header {
  margin-bottom: 18px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

/* 柱状图 */
.chart-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 24px 20px 16px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 140px;
  gap: 8px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 100%;
  max-width: 36px;
  min-height: 4px;
  background: linear-gradient(180deg, rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8) 0%, rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.3) 100%);
  border-radius: 6px 6px 2px 2px;
  position: relative;
  transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.bar-count {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 600;
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8);
  white-space: nowrap;
}

.bar-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 10px;
  font-weight: 500;
}

/* 本周概览 */
.week-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

@media (max-width: 480px) {
  .week-grid { grid-template-columns: 1fr; }
}

.week-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  padding: 18px 16px;
  text-align: center;
  transition: all 0.3s;
}

.week-card:hover {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.04);
  border-color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.08);
}

.week-label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 8px;
}

.week-value {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

/* 最爱歌手 */
.artist-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.artist-item {
  display: flex;
  align-items: center;
  gap: 14px;
}

.artist-rank {
  width: 24px;
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.12);
  text-align: center;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.artist-rank.top3 {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.9);
}

.artist-info {
  flex: 1;
  min-width: 0;
}

.artist-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 8px;
}

.artist-bar-bg {
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.artist-bar {
  height: 100%;
  background: linear-gradient(90deg, rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.7), rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.3));
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.artist-count {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.3);
  min-width: 48px;
  text-align: right;
  flex-shrink: 0;
}

/* 单曲循环榜 */
.song-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  transition: all 0.3s;
  cursor: pointer;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.song-item:hover .song-cover-play {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.song-rank {
  width: 24px;
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.12);
  text-align: center;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.song-rank.top3 {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.9);
}

.song-cover {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.03);
  position: relative;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-cover-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.song-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
}

.song-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 12px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.35);
}

.song-play-count {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.25);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 24px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.08);
  margin-bottom: 20px;
}

.empty-title {
  margin: 0 0 8px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.4);
}

.empty-hint {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.2);
}

.bottom-space {
  height: 40px;
}
</style>
