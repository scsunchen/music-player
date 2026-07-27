<template>
  <div class="skeleton-immersive">
    <!-- 氛围背景骨架 -->
    <div class="sk-atmosphere"></div>

    <!-- 内容骨架 -->
    <div class="sk-content">
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
  </div>
</template>

<script setup>
const chipWidths = ['90px', '72px', '84px', '84px']
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

/* 闪光动画 */
.sk-np-label, .sk-np-cover, .sk-np-title, .sk-np-artist, .sk-np-btn,
.sk-chip, .sk-section-title, .sk-see-all,
.sk-scroll-cover, .sk-scroll-name, .sk-scroll-count,
.sk-list-cover, .sk-list-title, .sk-list-artist, .sk-list-dur {
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 正在播放 */
.sk-np {
  margin-bottom: 40px;
}

.sk-np-label {
  width: 90px;
  height: 10px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.sk-np-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 20px;
}

.sk-np-cover {
  width: 72px;
  height: 72px;
  border-radius: 14px;
  flex-shrink: 0;
}

.sk-np-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sk-np-title {
  width: 60%;
  height: 20px;
  border-radius: 6px;
}

.sk-np-artist {
  width: 40%;
  height: 14px;
  border-radius: 4px;
}

.sk-np-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 快捷操作 */
.sk-chips {
  display: flex;
  gap: 10px;
  margin-bottom: 48px;
  overflow: hidden;
}

.sk-chip {
  height: 40px;
  border-radius: 100px;
  flex-shrink: 0;
}

/* 区块 */
.sk-section {
  margin-bottom: 48px;
}

.sk-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
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

/* 横向滚动 */
.sk-scroll {
  display: flex;
  gap: 16px;
  overflow: hidden;
}

.sk-scroll-card {
  flex-shrink: 0;
  width: 150px;
}

.sk-scroll-cover {
  width: 150px;
  height: 150px;
  border-radius: 16px;
  margin-bottom: 12px;
}

.sk-scroll-name {
  width: 80%;
  height: 14px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.sk-scroll-count {
  width: 40%;
  height: 11px;
  border-radius: 3px;
}

/* 列表 */
.sk-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sk-list-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
}

.sk-list-cover {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  flex-shrink: 0;
}

.sk-list-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sk-list-title {
  width: 70%;
  height: 14px;
  border-radius: 4px;
}

.sk-list-artist {
  width: 40%;
  height: 12px;
  border-radius: 3px;
}

.sk-list-dur {
  width: 30px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

/* 桌面端 */
@media (min-width: 768px) {
  .sk-content {
    padding: 60px 48px;
    max-width: 1400px;
  }

  .sk-np-cover {
    width: 88px;
    height: 88px;
  }

  .sk-scroll {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
    overflow: visible;
  }

  .sk-scroll-card {
    width: 100%;
  }

  .sk-scroll-cover {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
  }
}

@media (min-width: 1200px) {
  .sk-content {
    max-width: 1600px;
  }

  .sk-np-cover {
    width: 96px;
    height: 96px;
  }
}
</style>
