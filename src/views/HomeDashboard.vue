<template>
  <SkeletonLoader v-if="loading" />
  <div class="dashboard" v-else>
    <!-- 页面标题 -->
    <header class="db-header">
      <div class="db-header-left">
        <h1 class="db-title">音乐控制台</h1>
        <p class="db-subtitle">{{ greeting }} · {{ todayDate }}</p>
      </div>
      <div class="db-header-right">
        <div class="db-live-indicator" :class="{ playing: playerStore.isPlaying }">
          <span class="db-live-dot"></span>
          {{ playerStore.isPlaying ? 'LIVE' : 'IDLE' }}
        </div>
      </div>
    </header>

    <!-- Bento Grid -->
    <div class="bento-grid">

      <!-- 正在播放 - 大卡片（左上） -->
      <div class="bento-card bento-now-playing" @click="openFullscreen" v-if="playerStore.currentSong">
        <div class="bento-card-label">
          <span class="label-dot now-playing-dot"></span>
          NOW PLAYING
        </div>
        <div class="np-content">
          <div class="np-cover">
            <img :src="playerStore.currentSong.cover" :alt="playerStore.currentSong.title" />
            <div class="np-cover-ring" :class="{ spinning: playerStore.isPlaying }"></div>
          </div>
          <div class="np-meta">
            <h2 class="np-song-title">{{ playerStore.currentSong.title }}</h2>
            <p class="np-song-artist">{{ playerStore.currentSong.artist }}</p>
            <div class="np-progress">
              <div class="np-progress-bar">
                <div class="np-progress-fill" :style="{ width: progressPercent + '%' }"></div>
              </div>
              <div class="np-time">
                <span>{{ formatTime(playerStore.currentTime) }}</span>
                <span>{{ formatTime(playerStore.currentSong.duration || 0) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 无播放时占位 -->
      <div class="bento-card bento-now-playing bento-empty" v-else @click="playRandom">
        <div class="bento-card-label">READY</div>
        <div class="empty-content">
          <svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
          <span>点击开始播放</span>
        </div>
      </div>

      <!-- 今日统计 - 右上 -->
      <div class="bento-card bento-stats-today">
        <div class="bento-card-label">TODAY</div>
        <div class="stat-value">{{ stats.todayPlays }}</div>
        <div class="stat-label">次播放</div>
        <div class="stat-mini-chart">
          <div
            v-for="(val, i) in miniChart"
            :key="i"
            class="mini-bar"
            :style="{ height: val + '%' }"
            :class="{ active: i === miniChart.length - 1 }"
          ></div>
        </div>
      </div>

      <!-- 本周统计 -->
      <div class="bento-card bento-stats-week">
        <div class="bento-card-label">THIS WEEK</div>
        <div class="stat-value">{{ stats.weekPlays }}</div>
        <div class="stat-label">次播放</div>
      </div>

      <!-- 总播放 -->
      <div class="bento-card bento-stats-total">
        <div class="bento-card-label">ALL TIME</div>
        <div class="stat-value">{{ stats.totalPlays }}</div>
        <div class="stat-label">总播放</div>
      </div>

      <!-- 我喜欢 -->
      <div class="bento-card bento-liked" @click="router.push('/liked')">
        <div class="bento-card-label">LIKED</div>
        <div class="stat-value">{{ stats.likedCount }}</div>
        <div class="stat-label">首歌曲</div>
        <div class="bento-icon liked-icon">
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
      </div>

      <!-- 快捷操作 - 宽卡片 -->
      <div class="bento-card bento-quick-actions">
        <div class="bento-card-label">QUICK</div>
        <div class="quick-row">
          <button class="quick-btn" @click="playDailySongs">
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            <span>每日推荐</span>
          </button>
          <button class="quick-btn" @click="router.push('/summer')">
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1z"/></svg>
            <span>夏日精选</span>
          </button>
          <button class="quick-btn" @click="router.push('/stats')">
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
            <span>详细统计</span>
          </button>
        </div>
      </div>

      <!-- 推荐歌单 - 大宽卡片（底部） -->
      <div class="bento-card bento-playlists">
        <div class="bento-card-label">
          RECOMMENDED
          <router-link to="/playlists" class="see-all-link">全部 →</router-link>
        </div>
        <div class="playlist-row">
          <div
            v-for="playlist in playerStore.recommendPlaylists?.slice(0, 5)"
            :key="playlist.id"
            class="playlist-item"
            @click="router.push(`/playlist/${playlist.id}`)"
          >
            <div class="playlist-cover">
              <img :src="playlist.cover" :alt="playlist.name" loading="lazy" />
            </div>
            <span class="playlist-name">{{ playlist.name }}</span>
            <span class="playlist-count">{{ playlist.songs?.length || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- 最近播放 - 右侧长卡片 -->
      <div class="bento-card bento-recent">
        <div class="bento-card-label">
          RECENT
          <router-link to="/songs" class="see-all-link">全部 →</router-link>
        </div>
        <div class="recent-list">
          <div
            v-for="(songId, i) in recentPlayed.slice(0, 5)"
            :key="songId"
            class="recent-row"
            @click="playSongById(songId)"
          >
            <span class="recent-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <div class="recent-cover">
              <img :src="getSongById(songId)?.cover" :alt="getSongById(songId)?.title" loading="lazy" v-if="getSongById(songId)" />
            </div>
            <div class="recent-meta" v-if="getSongById(songId)">
              <span class="recent-title">{{ getSongById(songId).title }}</span>
              <span class="recent-artist">{{ getSongById(songId).artist }}</span>
            </div>
          </div>
          <div class="recent-empty" v-if="recentPlayed.length === 0">
            暂无播放记录
          </div>
        </div>
      </div>

    </div>

    <div class="bottom-space"></div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import SkeletonLoader from '../components/SkeletonLoader.vue'

const router = useRouter()
const playerStore = usePlayerStore()

const loading = ref(true)
onMounted(() => { setTimeout(() => { loading.value = false }, 500) })

// 问候语
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '深夜'
  if (h < 12) return '早安'
  if (h < 18) return '午后'
  return '夜晚'
})

const todayDate = computed(() => {
  const d = new Date()
  const months = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
  return `${d.getFullYear()} · ${months[d.getMonth()]} ${d.getDate()}日`
})

// 统计数据
const stats = computed(() => {
  const s = playerStore.getStatsSummary()
  return {
    todayPlays: s.todayPlays || 0,
    weekPlays: s.weekPlays || 0,
    totalPlays: s.totalPlays || 0,
    likedCount: s.likedCount || 0,
  }
})

// 迷你图表（近7天）
const miniChart = computed(() => {
  const s = playerStore.getStatsSummary()
  const data = s.last7Days || []
  if (data.length === 0) return [0, 0, 0, 0, 0, 0, 0]
  const max = Math.max(...data, 1)
  return data.map(v => Math.round((v / max) * 100))
})

// 进度
const progressPercent = computed(() => {
  if (!playerStore.currentSong?.duration) return 0
  return (playerStore.currentTime / playerStore.currentSong.duration) * 100
})

// 最近播放
const recentPlayed = computed(() => playerStore.recentSongs || [])

// 辅助
const getSongById = (id) => playerStore.songs.find(s => s.id === id)

const playSongById = (id) => {
  const song = getSongById(id)
  if (song) playerStore.playSong(song)
}

const openFullscreen = () => { playerStore.isFullscreen = true }

const playRandom = () => {
  if (playerStore.songs.length > 0) {
    const song = playerStore.songs[Math.floor(Math.random() * playerStore.songs.length)]
    playerStore.playSong(song)
  }
}

const playDailySongs = () => {
  const shuffled = [...playerStore.songs].sort(() => Math.random() - 0.5)
  playerStore.playPlaylist({ id: 'daily', name: '每日推荐', songs: shuffled.slice(0, 10).map(s => s.id) })
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #0d0d0f;
  color: rgba(255, 255, 255, 0.85);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Mono', 'Cascadia Code', 'Segoe UI', 'PingFang SC', monospace;
  padding: 32px 24px 100px;
  font-feature-settings: 'tnum';
}

/* ===== 页头 ===== */
.db-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto 28px;
}

.db-title {
  margin: 0 0 4px;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.db-subtitle {
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 1px;
}

.db-live-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 100px;
}

.db-live-indicator.playing {
  color: #00d4aa;
  border-color: rgba(0, 212, 170, 0.2);
  background: rgba(0, 212, 170, 0.06);
}

.db-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.db-live-indicator.playing .db-live-dot {
  background: #00d4aa;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ===== Bento Grid ===== */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: 120px;
  gap: 12px;
  max-width: 1200px;
  margin: 0 auto;
}

.bento-card {
  background: #161618;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: 18px;
  position: relative;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.bento-card:hover {
  background: #1c1c1f;
  border-color: rgba(0, 212, 170, 0.15);
  transform: translateY(-2px);
}

.bento-card-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  margin-bottom: 12px;
}

.label-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  margin-right: 6px;
}

.now-playing-dot {
  background: #00d4aa;
  box-shadow: 0 0 6px rgba(0, 212, 170, 0.5);
}

/* ===== 正在播放卡片 ===== */
.bento-now-playing {
  grid-column: span 4;
  grid-row: span 2;
  cursor: pointer;
}

.np-content {
  display: flex;
  gap: 20px;
  height: calc(100% - 28px);
  align-items: center;
}

.np-cover {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.np-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.np-cover-ring {
  position: absolute;
  inset: -3px;
  border-radius: 15px;
  border: 2px solid rgba(0, 212, 170, 0.3);
}

.np-cover-ring.spinning {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.np-meta {
  flex: 1;
  min-width: 0;
}

.np-song-title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.np-song-artist {
  margin: 0 0 14px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.np-progress {
  max-width: 320px;
}

.np-progress-bar {
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
}

.np-progress-fill {
  height: 100%;
  background: #00d4aa;
  border-radius: 2px;
  transition: width 0.3s linear;
}

.np-time {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.25);
  font-variant-numeric: tabular-nums;
}

/* 空状态 */
.bento-empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.2);
  transition: color 0.3s;
}

.bento-empty:hover .empty-content {
  color: #00d4aa;
}

/* ===== 统计卡片 ===== */
.bento-stats-today,
.bento-stats-week,
.bento-stats-total,
.bento-liked {
  grid-column: span 2;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 1px;
}

/* 迷你图表 */
.stat-mini-chart {
  position: absolute;
  bottom: 18px;
  right: 18px;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 28px;
}

.mini-bar {
  width: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  min-height: 4px;
  transition: all 0.3s;
}

.mini-bar.active {
  background: #00d4aa;
}

/* 喜欢图标 */
.bento-icon {
  position: absolute;
  bottom: 18px;
  right: 18px;
  color: rgba(245, 87, 108, 0.4);
}

.bento-liked:hover {
  border-color: rgba(245, 87, 108, 0.15);
}

/* ===== 快捷操作 ===== */
.bento-quick-actions {
  grid-column: span 6;
  display: flex;
  flex-direction: column;
}

.quick-row {
  display: flex;
  gap: 10px;
  flex: 1;
  align-items: center;
}

.quick-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  transition: all 0.3s;
}

.quick-btn:hover {
  background: rgba(0, 212, 170, 0.08);
  border-color: rgba(0, 212, 170, 0.2);
  color: #00d4aa;
}

/* ===== 推荐歌单 ===== */
.bento-playlists {
  grid-column: span 4;
  grid-row: span 2;
}

.see-all-link {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.2);
  text-decoration: none;
  transition: color 0.3s;
}

.see-all-link:hover {
  color: #00d4aa;
}

.playlist-row {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  scrollbar-width: none;
  height: calc(100% - 28px);
  align-items: center;
}

.playlist-row::-webkit-scrollbar { display: none; }

.playlist-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.3s;
}

.playlist-item:hover {
  transform: translateY(-4px);
}

.playlist-cover {
  width: 90px;
  height: 90px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-name {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  max-width: 90px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.playlist-count {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.25);
  font-variant-numeric: tabular-nums;
}

/* ===== 最近播放 ===== */
.bento-recent {
  grid-column: span 2;
  grid-row: span 2;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  height: calc(100% - 28px);
  overflow: hidden;
}

.recent-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.recent-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.recent-num {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.15);
  width: 18px;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.recent-cover {
  width: 32px;
  height: 32px;
  border-radius: 6px;
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
  gap: 1px;
}

.recent-title {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}

.recent-artist {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.25);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.2);
}

.bottom-space {
  height: 40px;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .dashboard {
    padding: 20px 16px 100px;
  }

  .db-title {
    font-size: 22px;
  }

  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 100px;
    gap: 10px;
  }

  .bento-now-playing {
    grid-column: span 2;
    grid-row: span 2;
  }

  .np-cover {
    width: 72px;
    height: 72px;
  }

  .np-song-title {
    font-size: 16px;
  }

  .bento-stats-today,
  .bento-stats-week,
  .bento-stats-total,
  .bento-liked {
    grid-column: span 1;
  }

  .stat-value {
    font-size: 26px;
  }

  .stat-mini-chart {
    display: none;
  }

  .bento-quick-actions {
    grid-column: span 2;
  }

  .quick-row {
    flex-wrap: wrap;
    gap: 8px;
  }

  .quick-btn {
    padding: 8px 14px;
    font-size: 12px;
  }

  .bento-playlists {
    grid-column: span 2;
    grid-row: span 2;
  }

  .bento-recent {
    grid-column: span 2;
    grid-row: span 2;
  }

  .recent-num {
    display: none;
  }
}
</style>
