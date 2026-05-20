<template>
  <div class="stats-page">
    <div class="stats-header">
      <h2>听歌报告</h2>
      <p class="stats-subtitle">你的音乐足迹</p>
    </div>

    <!-- 概览卡片 -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon today">🎵</div>
        <div class="stat-value">{{ stats.todayPlays }}</div>
        <div class="stat-label">今日播放</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon week">📊</div>
        <div class="stat-value">{{ stats.weekPlays }}</div>
        <div class="stat-label">本周播放</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon total">🎧</div>
        <div class="stat-value">{{ stats.totalPlays }}</div>
        <div class="stat-label">累计播放</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon duration">⏱️</div>
        <div class="stat-value small">{{ stats.totalDuration }}</div>
        <div class="stat-label">累计时长</div>
      </div>
    </div>

    <!-- 最近7天播放趋势 -->
    <div class="stats-section">
      <h3 class="section-title">最近 7 天</h3>
      <div class="chart-container">
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
    </div>

    <!-- 本周概览 -->
    <div class="stats-section">
      <h3 class="section-title">本周概览</h3>
      <div class="week-summary">
        <div class="week-item">
          <span class="week-label">播放次数</span>
          <span class="week-value">{{ stats.weekPlays }} 次</span>
        </div>
        <div class="week-item">
          <span class="week-label">播放时长</span>
          <span class="week-value">{{ stats.weekDuration }}</span>
        </div>
        <div class="week-item">
          <span class="week-label">收藏歌曲</span>
          <span class="week-value">{{ stats.likedCount }} 首</span>
        </div>
      </div>
    </div>

    <!-- 最爱歌手 -->
    <div class="stats-section" v-if="stats.topArtists.length > 0">
      <h3 class="section-title">最爱歌手</h3>
      <div class="artist-list">
        <div 
          v-for="(artist, index) in stats.topArtists" 
          :key="artist.name" 
          class="artist-item"
        >
          <span class="artist-rank">{{ index + 1 }}</span>
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
    </div>

    <!-- 最爱歌曲 -->
    <div class="stats-section" v-if="stats.topSongs.length > 0">
      <h3 class="section-title">单曲循环榜</h3>
      <div class="song-list">
        <div 
          v-for="(song, index) in stats.topSongs" 
          :key="song.id" 
          class="top-song-item"
          @click="playerStore.playSong(song)"
        >
          <span class="song-rank" :class="{ top3: index < 3 }">{{ index + 1 }}</span>
          <img :src="song.cover" :alt="song.title" class="song-cover" loading="lazy" />
          <div class="song-info">
            <h4>{{ song.title }}</h4>
            <p>{{ song.artist }}</p>
          </div>
          <span class="song-count">{{ song.playCount }} 次</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="stats.totalPlays === 0" class="empty-state">
      <svg viewBox="0 0 24 24" width="64" height="64">
        <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
      </svg>
      <p>还没有播放记录</p>
      <span>去听几首歌，你的听歌报告就会出现在这里</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '../stores/player'

const playerStore = usePlayerStore()

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
.stats-page {
  padding: 20px;
  padding-bottom: 100px;
}

.stats-header {
  margin-bottom: 24px;
}

.stats-header h2 {
  margin: 0;
  font-size: 24px;
  color: #fff;
}

.stats-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

/* 概览卡片 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.stat-value.small {
  font-size: 18px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

/* 区块 */
.stats-section {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 18px;
  color: #fff;
}

/* 柱状图 */
.chart-container {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 20px 16px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 120px;
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
  max-width: 32px;
  min-height: 4px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: height 0.5s ease;
}

.bar-count {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
}

.bar-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 8px;
}

/* 本周概览 */
.week-summary {
  display: flex;
  gap: 12px;
}

.week-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.week-label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
}

.week-value {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

/* 最爱歌手 */
.artist-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.artist-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.artist-rank {
  width: 24px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
}

.artist-info {
  flex: 1;
  min-width: 0;
}

.artist-name {
  display: block;
  font-size: 14px;
  color: #fff;
  margin-bottom: 6px;
}

.artist-bar-bg {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.artist-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.artist-count {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  min-width: 48px;
  text-align: right;
}

/* 单曲循环榜 */
.song-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.top-song-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.top-song-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.song-rank {
  width: 24px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
}

.song-rank.top3 {
  color: #667eea;
}

.song-cover {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  object-fit: cover;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-info h4 {
  margin: 0 0 4px;
  font-size: 14px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-info p {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.song-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  min-width: 40px;
  text-align: right;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
}

.empty-state svg {
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0 0 8px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-state span {
  font-size: 13px;
}

/* 电脑端适配 */
@media (min-width: 768px) {
  .stats-overview {
    grid-template-columns: repeat(4, 1fr);
  }

  .stats-page {
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>
