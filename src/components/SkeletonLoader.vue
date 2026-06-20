<template>
  <div class="skeleton">
    <!-- Hero 大图骨架 -->
    <div class="skeleton-hero">
      <div class="skeleton-hero-content">
        <div class="skeleton-hero-label"></div>
        <div class="skeleton-hero-title"></div>
        <div class="skeleton-hero-title" style="width: 60%"></div>
        <div class="skeleton-hero-desc"></div>
        <div class="skeleton-hero-actions">
          <div class="skeleton-btn-lg"></div>
          <div class="skeleton-btn-sm"></div>
        </div>
      </div>
      <div class="skeleton-hero-dots">
        <div class="skeleton-dot active"></div>
        <div class="skeleton-dot"></div>
        <div class="skeleton-dot"></div>
      </div>
    </div>

    <!-- 快捷入口骨架 -->
    <div class="skeleton-quick">
      <div class="skeleton-quick-card" v-for="i in 4" :key="i">
        <div class="skeleton-quick-icon"></div>
        <div class="skeleton-quick-name"></div>
      </div>
    </div>

    <!-- 推荐歌单骨架 -->
    <div class="skeleton-section">
      <div class="skeleton-section-header">
        <div class="skeleton-section-title"></div>
        <div class="skeleton-see-all"></div>
      </div>
      <div class="skeleton-scroll">
        <div class="skeleton-playlist-card" v-for="i in 5" :key="i">
          <div class="skeleton-playlist-cover"></div>
          <div class="skeleton-playlist-name"></div>
          <div class="skeleton-playlist-meta"></div>
        </div>
      </div>
    </div>

    <!-- 新专辑骨架 -->
    <div class="skeleton-section">
      <div class="skeleton-section-header">
        <div class="skeleton-section-title"></div>
        <div class="skeleton-see-all"></div>
      </div>
      <div class="skeleton-scroll">
        <div class="skeleton-playlist-card" v-for="i in 5" :key="i">
          <div class="skeleton-playlist-cover"></div>
          <div class="skeleton-playlist-name"></div>
          <div class="skeleton-playlist-meta"></div>
        </div>
      </div>
    </div>

    <!-- 最新歌曲骨架 -->
    <div class="skeleton-section">
      <div class="skeleton-section-header">
        <div class="skeleton-section-title"></div>
        <div class="skeleton-see-all"></div>
      </div>
      <div class="skeleton-song-grid">
        <div class="skeleton-song-card" v-for="i in 4" :key="i">
          <div class="skeleton-song-cover"></div>
          <div class="skeleton-song-title"></div>
          <div class="skeleton-song-artist"></div>
        </div>
      </div>
    </div>

    <!-- 热门歌曲骨架 -->
    <div class="skeleton-section">
      <div class="skeleton-section-header">
        <div class="skeleton-section-title"></div>
        <div class="skeleton-see-all"></div>
      </div>
      <div class="skeleton-song-list">
        <div class="skeleton-song-row" v-for="i in 5" :key="i"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 骨架屏基础样式 */
.skeleton {
  background: #07070f;
  min-height: 100vh;
}

/* 闪光动画 */
.skeleton-hero-label,
.skeleton-hero-title,
.skeleton-hero-desc,
.skeleton-btn-lg,
.skeleton-btn-sm,
.skeleton-dot,
.skeleton-quick-icon,
.skeleton-quick-name,
.skeleton-section-title,
.skeleton-see-all,
.skeleton-playlist-cover,
.skeleton-playlist-name,
.skeleton-playlist-meta,
.skeleton-song-cover,
.skeleton-song-title,
.skeleton-song-artist,
.skeleton-song-row {
  background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===== Hero 大图骨架 ===== */
.skeleton-hero {
  position: relative;
  height: 55vh;
  min-height: 380px;
  max-height: 520px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 24px 32px;
  background: linear-gradient(180deg, rgba(7,7,15,0.3) 0%, rgba(7,7,15,0.85) 75%, #07070f 100%);
}

.skeleton-hero-label {
  width: 100px;
  height: 24px;
  border-radius: 12px;
  margin-bottom: 12px;
}

.skeleton-hero-title {
  width: 80%;
  height: 36px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.skeleton-hero-desc {
  width: 60%;
  height: 18px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.skeleton-hero-actions {
  display: flex;
  gap: 12px;
}

.skeleton-btn-lg {
  width: 120px;
  height: 44px;
  border-radius: 22px;
}

.skeleton-btn-sm {
  width: 90px;
  height: 44px;
  border-radius: 22px;
}

.skeleton-hero-dots {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.skeleton-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.skeleton-dot.active {
  width: 24px;
  border-radius: 4px;
}

/* ===== 快捷入口骨架 ===== */
.skeleton-quick {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  overflow-x: auto;
}

.skeleton-quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  min-width: 80px;
}

.skeleton-quick-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
}

.skeleton-quick-name {
  width: 60px;
  height: 12px;
  border-radius: 4px;
}

/* ===== 内容区块骨架 ===== */
.skeleton-section {
  padding: 16px 24px;
}

.skeleton-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.skeleton-section-title {
  width: 100px;
  height: 22px;
  border-radius: 6px;
}

.skeleton-see-all {
  width: 60px;
  height: 14px;
  border-radius: 4px;
}

/* 横向滚动卡片 */
.skeleton-scroll {
  display: flex;
  gap: 16px;
  overflow-x: hidden;
}

.skeleton-playlist-card {
  min-width: 160px;
  flex-shrink: 0;
}

.skeleton-playlist-cover {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  margin-bottom: 10px;
}

.skeleton-playlist-name {
  width: 80%;
  height: 14px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.skeleton-playlist-meta {
  width: 50%;
  height: 11px;
  border-radius: 3px;
}

/* 歌曲网格 */
.skeleton-song-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.skeleton-song-cover {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  margin-bottom: 8px;
}

.skeleton-song-title {
  width: 80%;
  height: 14px;
  border-radius: 4px;
  margin-bottom: 2px;
}

.skeleton-song-artist {
  width: 50%;
  height: 12px;
  border-radius: 3px;
}

/* 歌曲列表 */
.skeleton-song-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-song-row {
  height: 56px;
  border-radius: 8px;
}

/* ===== 桌面端 ===== */
@media (min-width: 768px) {
  .skeleton-hero {
    height: 50vh;
    max-height: 480px;
    padding: 0 48px 40px;
  }

  .skeleton-hero-title {
    height: 44px;
  }

  .skeleton-quick {
    padding: 24px 48px;
    justify-content: center;
    gap: 16px;
  }

  .skeleton-quick-card {
    min-width: 100px;
    padding: 20px 16px;
  }

  .skeleton-section {
    padding: 20px 48px;
  }

  .skeleton-playlist-card {
    min-width: 180px;
  }

  .skeleton-song-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}

@media (min-width: 1024px) {
  .skeleton-hero {
    max-height: 520px;
  }

  .skeleton-song-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
