<template>
  <div class="skeleton-immersive">
    <!-- 氛围背景骨架 -->
    <div class="sk-atmosphere"></div>

    <!-- ========== 首页骨架 ========== -->
    <div class="sk-content" v-if="type === 'home'">
      <!-- 正在播放骨架 -->
      <div class="sk-np">
        <div class="sk-np-label"></div>
        <div class="sk-np-card">
          <div class="sk-np-cover"></div>
          <div class="sk-np-info">
            <div class="sk-np-title"></div>
            <div class="sk-np-artist"></div>
          </div>
          <div class="sk-np-btn"></div>
        </div>
      </div>

      <!-- 快捷操作骨架 -->
      <div class="sk-chips">
        <div class="sk-chip" v-for="i in 4" :key="i" :style="{ width: chipWidths[i-1] }"></div>
      </div>

      <!-- 推荐歌单骨架 -->
      <div class="sk-section">
        <div class="sk-section-header">
          <div class="sk-section-title"></div>
          <div class="sk-see-all"></div>
        </div>
        <div class="sk-scroll">
          <div class="sk-scroll-card" v-for="i in 6" :key="i">
            <div class="sk-scroll-cover"></div>
            <div class="sk-scroll-name"></div>
            <div class="sk-scroll-count"></div>
          </div>
        </div>
      </div>

      <!-- 最近歌曲骨架 -->
      <div class="sk-section">
        <div class="sk-section-header">
          <div class="sk-section-title"></div>
          <div class="sk-see-all"></div>
        </div>
        <div class="sk-list">
          <div class="sk-list-item" v-for="i in 5" :key="i">
            <div class="sk-list-cover"></div>
            <div class="sk-list-meta">
              <div class="sk-list-title"></div>
              <div class="sk-list-artist"></div>
            </div>
            <div class="sk-list-dur"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 我的音乐骨架 ========== -->
    <div class="sk-content sk-content-wide" v-else-if="type === 'my'">
      <!-- 页面标题 -->
      <div class="sk-page-header">
        <div class="sk-header-label"></div>
        <div class="sk-header-title" style="width:120px"></div>
      </div>

      <!-- 快捷入口 -->
      <div class="sk-quick-cards">
        <div class="sk-qk-card" v-for="i in 2" :key="i">
          <div class="sk-qk-icon"></div>
          <div class="sk-qk-info">
            <div class="sk-qk-title"></div>
            <div class="sk-qk-desc"></div>
          </div>
          <div class="sk-qk-arrow"></div>
        </div>
      </div>

      <!-- 创建歌单行 -->
      <div class="sk-create-row">
        <div class="sk-create-input"></div>
        <div class="sk-create-btn" style="width:80px"></div>
        <div class="sk-create-btn" style="width:100px"></div>
      </div>

      <!-- 我的歌单 -->
      <div class="sk-section">
        <div class="sk-section-header">
          <div class="sk-section-title" style="width:80px"></div>
          <div class="sk-see-all" style="width:40px"></div>
        </div>
        <div class="sk-playlist-grid">
          <div class="sk-pl-card" v-for="i in 4" :key="i">
            <div class="sk-pl-cover"></div>
            <div class="sk-pl-name"></div>
            <div class="sk-pl-count"></div>
          </div>
        </div>
      </div>

      <!-- 所有歌曲 -->
      <div class="sk-section">
        <div class="sk-section-header">
          <div class="sk-section-title" style="width:80px"></div>
          <div class="sk-see-all" style="width:40px"></div>
        </div>
        <div class="sk-song-list">
          <div class="sk-song-item" v-for="i in 6" :key="i">
            <div class="sk-song-cover"></div>
            <div class="sk-song-meta">
              <div class="sk-song-title"></div>
              <div class="sk-song-artist"></div>
            </div>
            <div class="sk-song-dur"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 统计页骨架 ========== -->
    <div class="sk-content sk-content-wide" v-else-if="type === 'stats'">
      <!-- 页面标题 -->
      <div class="sk-page-header">
        <div class="sk-header-label"></div>
        <div class="sk-header-title" style="width:120px"></div>
        <div class="sk-header-sub"></div>
      </div>

      <!-- 概览卡片 4个 -->
      <div class="sk-overview-grid">
        <div class="sk-stat-card" v-for="i in 4" :key="i">
          <div class="sk-stat-icon"></div>
          <div class="sk-stat-value"></div>
          <div class="sk-stat-label"></div>
        </div>
      </div>

      <!-- 中间行：柱状图 + 本周概览 -->
      <div class="sk-stats-row">
        <div class="sk-stats-col sk-col-grow">
          <div class="sk-section-header">
            <div class="sk-section-title" style="width:80px"></div>
          </div>
          <div class="sk-chart-card">
            <div class="sk-bar-chart">
              <div class="sk-bar-item" v-for="i in 7" :key="i">
                <div class="sk-bar" :style="{ height: barHeights[i-1] }"></div>
                <div class="sk-bar-label"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="sk-stats-col">
          <div class="sk-section-header">
            <div class="sk-section-title" style="width:80px"></div>
          </div>
          <div class="sk-week-grid">
            <div class="sk-week-card" v-for="i in 3" :key="i">
              <div class="sk-week-label"></div>
              <div class="sk-week-value"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 下面行：最爱歌手 + 单曲循环榜 -->
      <div class="sk-stats-row">
        <div class="sk-stats-col">
          <div class="sk-section-header">
            <div class="sk-section-title" style="width:80px"></div>
          </div>
          <div class="sk-artist-list">
            <div class="sk-artist-item" v-for="i in 5" :key="i">
              <div class="sk-artist-rank"></div>
              <div class="sk-artist-info">
                <div class="sk-artist-name"></div>
                <div class="sk-artist-bar-bg">
                  <div class="sk-artist-bar" :style="{ width: artistWidths[i-1] }"></div>
                </div>
              </div>
              <div class="sk-artist-count"></div>
            </div>
          </div>
        </div>
        <div class="sk-stats-col">
          <div class="sk-section-header">
            <div class="sk-section-title" style="width:90px"></div>
          </div>
          <div class="sk-song-list">
            <div class="sk-song-item" v-for="i in 5" :key="i">
              <div class="sk-song-rank"></div>
              <div class="sk-song-cover"></div>
              <div class="sk-song-meta">
                <div class="sk-song-title"></div>
                <div class="sk-song-artist"></div>
              </div>
              <div class="sk-song-count"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'home',
    validator: (val) => ['home', 'my', 'stats'].includes(val)
  }
})

const chipWidths = ['90px', '72px', '84px', '84px']
const barHeights = ['40%', '65%', '30%', '80%', '55%', '25%', '45%']
const artistWidths = ['100%', '75%', '55%', '40%', '25%']
</script>

<style scoped>
.skeleton-immersive {
  position: relative;
  min-height: 100vh;
  background: #0a0a0a;
}

/* 氛围背景 */
.sk-atmosphere {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at 30% 20%, rgba(102, 126, 234, 0.06) 0%, transparent 60%),
              radial-gradient(ellipse at 70% 70%, rgba(102, 126, 234, 0.04) 0%, transparent 50%),
              linear-gradient(180deg, rgba(10,10,10,0.5) 0%, #0a0a0a 100%);
  pointer-events: none;
}

.sk-content {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px;
}

.sk-content-wide {
  max-width: 1400px;
  padding: 32px 32px 0;
}

/* 闪光动画 */
.sk-np-label, .sk-np-cover, .sk-np-title, .sk-np-artist, .sk-np-btn,
.sk-chip, .sk-section-title, .sk-see-all,
.sk-scroll-cover, .sk-scroll-name, .sk-scroll-count,
.sk-list-cover, .sk-list-title, .sk-list-artist, .sk-list-dur,
.sk-header-label, .sk-header-title, .sk-header-sub,
.sk-qk-icon, .sk-qk-title, .sk-qk-desc, .sk-qk-arrow,
.sk-create-input, .sk-create-btn,
.sk-pl-cover, .sk-pl-name, .sk-pl-count,
.sk-song-cover, .sk-song-title, .sk-song-artist, .sk-song-dur, .sk-song-rank, .sk-song-count,
.sk-stat-icon, .sk-stat-value, .sk-stat-label,
.sk-bar, .sk-bar-label,
.sk-week-label, .sk-week-value,
.sk-artist-rank, .sk-artist-name, .sk-artist-bar, .sk-artist-count {
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ==================== 通用元素 ==================== */
.sk-page-header {
  margin-bottom: 28px;
}

.sk-header-label {
  width: 90px;
  height: 10px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.sk-header-title {
  width: 140px;
  height: 28px;
  border-radius: 6px;
  margin-bottom: 6px;
}

.sk-header-sub {
  width: 100px;
  height: 14px;
  border-radius: 4px;
}

.sk-section {
  margin-bottom: 40px;
}

.sk-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.sk-section-title {
  width: 100px;
  height: 22px;
  border-radius: 6px;
}

.sk-see-all {
  width: 40px;
  height: 12px;
  border-radius: 4px;
}

/* ==================== 首页 ==================== */
.sk-np { margin-bottom: 40px; }
.sk-np-label { width: 90px; height: 10px; border-radius: 4px; margin-bottom: 16px; }
.sk-np-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 20px;
}
.sk-np-cover { width: 72px; height: 72px; border-radius: 14px; flex-shrink: 0; }
.sk-np-info { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.sk-np-title { width: 60%; height: 20px; border-radius: 6px; }
.sk-np-artist { width: 40%; height: 14px; border-radius: 4px; }
.sk-np-btn { width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; }

.sk-chips { display: flex; gap: 10px; margin-bottom: 48px; overflow: hidden; }
.sk-chip { height: 40px; border-radius: 100px; flex-shrink: 0; }

.sk-scroll { display: flex; gap: 16px; overflow: hidden; }
.sk-scroll-card { flex-shrink: 0; width: 150px; }
.sk-scroll-cover { width: 150px; height: 150px; border-radius: 16px; margin-bottom: 12px; }
.sk-scroll-name { width: 80%; height: 14px; border-radius: 4px; margin-bottom: 4px; }
.sk-scroll-count { width: 40%; height: 11px; border-radius: 3px; }

.sk-list { display: flex; flex-direction: column; gap: 2px; }
.sk-list-item { display: flex; align-items: center; gap: 14px; padding: 10px 14px; }
.sk-list-cover { width: 48px; height: 48px; border-radius: 10px; flex-shrink: 0; }
.sk-list-meta { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.sk-list-title { width: 70%; height: 14px; border-radius: 4px; }
.sk-list-artist { width: 40%; height: 12px; border-radius: 3px; }
.sk-list-dur { width: 30px; height: 12px; border-radius: 3px; flex-shrink: 0; }

/* ==================== 我的音乐 ==================== */
.sk-quick-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 32px;
}

.sk-qk-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.04);
}

.sk-qk-icon { width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; }
.sk-qk-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.sk-qk-title { width: 70%; height: 16px; border-radius: 4px; }
.sk-qk-desc { width: 50%; height: 12px; border-radius: 3px; }
.sk-qk-arrow { width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0; }

.sk-create-row {
  display: flex;
  gap: 10px;
  margin-bottom: 36px;
}

.sk-create-input {
  flex: 1;
  height: 44px;
  border-radius: 10px;
}

.sk-create-btn {
  height: 44px;
  border-radius: 10px;
  flex-shrink: 0;
}

.sk-playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.sk-pl-cover {
  aspect-ratio: 1;
  border-radius: 12px;
  margin-bottom: 10px;
}

.sk-pl-name { width: 80%; height: 14px; border-radius: 4px; margin-bottom: 4px; }
.sk-pl-count { width: 40%; height: 11px; border-radius: 3px; }

.sk-song-list { display: flex; flex-direction: column; gap: 2px; }
.sk-song-item { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: 14px; }
.sk-song-cover { width: 48px; height: 48px; border-radius: 10px; flex-shrink: 0; }
.sk-song-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.sk-song-title { width: 70%; height: 14px; border-radius: 4px; }
.sk-song-artist { width: 40%; height: 12px; border-radius: 3px; }
.sk-song-dur { width: 30px; height: 12px; border-radius: 3px; flex-shrink: 0; }
.sk-song-rank { width: 24px; height: 16px; border-radius: 3px; flex-shrink: 0; }
.sk-song-count { width: 40px; height: 12px; border-radius: 3px; flex-shrink: 0; }

/* ==================== 统计页 ==================== */
.sk-overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 40px;
}

.sk-stat-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 14px;
  padding: 20px 16px;
  text-align: center;
}

.sk-stat-icon { width: 40px; height: 40px; border-radius: 10px; margin: 0 auto 12px; }
.sk-stat-value { width: 60%; height: 30px; border-radius: 6px; margin: 0 auto 8px; }
.sk-stat-label { width: 50%; height: 12px; border-radius: 3px; margin: 0 auto; }

.sk-stats-row {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 40px;
}

.sk-stats-col { flex: 1; }
.sk-col-grow { flex: 1.6; }

.sk-chart-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 16px;
  padding: 24px 20px 16px;
}

.sk-bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 140px;
  gap: 8px;
}

.sk-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.sk-bar {
  width: 100%;
  max-width: 36px;
  min-height: 4px;
  border-radius: 6px 6px 2px 2px;
  margin-top: auto;
}

.sk-bar-label {
  width: 24px;
  height: 11px;
  border-radius: 3px;
  margin-top: 10px;
}

.sk-week-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.sk-week-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 14px;
  padding: 18px 16px;
  text-align: center;
}

.sk-week-label { width: 60%; height: 12px; border-radius: 3px; margin: 0 auto 10px; }
.sk-week-value { width: 70%; height: 22px; border-radius: 5px; margin: 0 auto; }

.sk-artist-list { display: flex; flex-direction: column; gap: 14px; }
.sk-artist-item { display: flex; align-items: center; gap: 14px; }
.sk-artist-rank { width: 24px; height: 16px; border-radius: 3px; flex-shrink: 0; }
.sk-artist-info { flex: 1; min-width: 0; }
.sk-artist-name { width: 50%; height: 14px; border-radius: 4px; margin-bottom: 8px; }
.sk-artist-bar-bg { height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
.sk-artist-bar { height: 100%; border-radius: 2px; }
.sk-artist-count { width: 40px; height: 12px; border-radius: 3px; flex-shrink: 0; }

/* ==================== 桌面端适配 ==================== */
@media (min-width: 768px) {
  .sk-content { padding: 60px 48px; max-width: 1400px; }
  .sk-content-wide { padding: 48px 48px 0; }

  .sk-np-cover { width: 88px; height: 88px; }

  .sk-scroll {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
    overflow: visible;
  }
  .sk-scroll-card { width: 100%; }
  .sk-scroll-cover { width: 100%; height: auto; aspect-ratio: 1; }

  .sk-overview-grid { grid-template-columns: repeat(4, 1fr); }
  .sk-playlist-grid { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); }
}

@media (min-width: 1024px) {
  .sk-stats-row { flex-direction: row; }
}

@media (min-width: 1200px) {
  .sk-content { max-width: 1600px; }
  .sk-np-cover { width: 96px; height: 96px; }
}
</style>
