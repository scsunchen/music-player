<template>
  <SkeletonLoader v-if="loading" />
  <div class="editorial" v-else>
    <!-- 顶部装饰线 -->
    <div class="top-rule"></div>

    <div class="ed-container">

      <!-- 首屏：不对称双栏 -->
      <section class="hero-editorial">
        <div class="hero-text">
          <div class="ed-greeting">{{ greeting }}</div>
          <h1 class="ed-headline">今日推荐</h1>
          <p class="ed-lead">
            每天为你精选不同风格的音乐，让耳朵发现新的可能。
          </p>
          <div class="ed-play-all" @click="playDailySongs">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <span>播放每日推荐</span>
          </div>
        </div>
        <div class="hero-visual">
          <div class="ed-featured-cover" @click="router.push('/summer')">
            <img :src="featuredCover" :alt="featuredTitle" />
            <div class="ed-cover-overlay">
              <span class="ed-cover-label">FEATURED</span>
            </div>
          </div>
          <p class="ed-caption">{{ featuredTitle }} · {{ featuredArtist }}</p>
        </div>
      </section>

      <!-- 分隔装饰 -->
      <div class="ed-divider">
        <span class="ed-divider-diamond"></span>
      </div>

      <!-- 推荐歌单 -->
      <section class="ed-section">
        <div class="ed-section-header">
          <h2 class="ed-section-title">歌单精选</h2>
          <router-link to="/playlists" class="ed-section-link">浏览全部</router-link>
        </div>
        <div class="ed-playlist-grid">
          <div
            v-for="playlist in playerStore.recommendPlaylists"
            :key="playlist.id"
            class="ed-playlist"
            @click="router.push(`/playlist/${playlist.id}`)"
          >
            <div class="ed-playlist-cover">
              <img :src="playlist.cover" :alt="playlist.name" loading="lazy" />
            </div>
            <div class="ed-playlist-info">
              <h4 class="ed-playlist-name">{{ playlist.name }}</h4>
              <span class="ed-playlist-count">{{ playlist.songs?.length || 0 }} 首</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 最近歌曲 - 杂志列表风格 -->
      <section class="ed-section">
        <div class="ed-section-header">
          <h2 class="ed-section-title">最近歌曲</h2>
          <router-link to="/songs" class="ed-section-link">全部歌曲</router-link>
        </div>
        <div class="ed-song-list">
          <div
            v-for="(song, i) in recentSongs"
            :key="song.id"
            class="ed-song-row"
            @click="playerStore.playSong(song)"
          >
            <span class="ed-song-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <div class="ed-song-cover">
              <img :src="song.cover" :alt="song.title" loading="lazy" />
            </div>
            <div class="ed-song-meta">
              <span class="ed-song-title">{{ song.title }}</span>
              <span class="ed-song-artist">{{ song.artist }}</span>
            </div>
            <span class="ed-song-album" v-if="song.album">{{ song.album }}</span>
          </div>
        </div>
      </section>

      <!-- 快捷入口 -->
      <section class="ed-section">
        <div class="ed-shortcuts">
          <div class="ed-shortcut" @click="router.push('/liked')">
            <span class="ed-shortcut-title">我喜欢</span>
            <span class="ed-shortcut-desc">{{ likedCount }} 首收藏</span>
          </div>
          <div class="ed-shortcut-divider"></div>
          <div class="ed-shortcut" @click="router.push('/stats')">
            <span class="ed-shortcut-title">听歌统计</span>
            <span class="ed-shortcut-desc">了解你的音乐品味</span>
          </div>
          <div class="ed-shortcut-divider"></div>
          <div class="ed-shortcut" @click="router.push('/summer')">
            <span class="ed-shortcut-title">橘子味的夏天</span>
            <span class="ed-shortcut-desc">15 首精选</span>
          </div>
        </div>
      </section>

      <!-- 底部留白 -->
      <div class="ed-footer-space"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { resolveUrl } from '../utils/baseUrl'
import SkeletonLoader from '../components/SkeletonLoader.vue'

const router = useRouter()
const playerStore = usePlayerStore()

const loading = ref(true)
onMounted(() => { setTimeout(() => { loading.value = false }, 500) })

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '深夜好'
  if (h < 12) return '早安'
  if (h < 18) return '午安'
  return '晚安'
})

const featuredCover = resolveUrl('images/covers/summer_orange_cover.jpg')
const featuredTitle = '橘子味的夏天'
const featuredArtist = '清甜 · 日落氛围感'

const recentSongs = computed(() => {
  return [...playerStore.songs].sort((a, b) => b.id - a.id).slice(0, 6)
})

const likedCount = computed(() => playerStore.getStatsSummary()?.likedCount || 0)

const playDailySongs = () => {
  const shuffled = [...playerStore.songs].sort(() => Math.random() - 0.5)
  playerStore.playPlaylist({ id: 'daily', name: '每日推荐', songs: shuffled.slice(0, 10).map(s => s.id) })
}
</script>

<style scoped>
.editorial {
  min-height: 100vh;
  background: #f7f5f0;
  color: #1a1a1a;
  font-family: Georgia, 'Noto Serif SC', 'Songti SC', 'STSong', serif;
  padding-bottom: 100px;
}

/* ===== 顶部装饰线 ===== */
.top-rule {
  width: 100%;
  height: 3px;
  background: #c8b99a;
}

/* ===== 容器 ===== */
.ed-container {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 32px;
}

/* ===== 首屏双栏 ===== */
.hero-editorial {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  padding: 56px 0 48px;
  align-items: start;
  animation: editorialFadeIn 1s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.ed-greeting {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 3px;
  color: #c8b99a;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.ed-headline {
  margin: 0 0 20px;
  font-size: 48px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.1;
  letter-spacing: -1px;
}

.ed-lead {
  margin: 0 0 28px;
  font-size: 16px;
  font-weight: 400;
  color: #666;
  line-height: 1.7;
  max-width: 340px;
}

.ed-play-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #1a1a1a;
  border: none;
  border-radius: 6px;
  color: #f7f5f0;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 0.5px;
}

.ed-play-all:hover {
  background: #333;
  transform: translateY(-1px);
}

.ed-play-all svg {
  opacity: 0.8;
}

/* 封面 */
.hero-visual {
  animation: editorialFadeIn 1s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.ed-featured-cover {
  position: relative;
  aspect-ratio: 1;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.ed-featured-cover:hover {
  transform: scale(1.02);
}

.ed-featured-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ed-cover-overlay {
  position: absolute;
  bottom: 12px;
  left: 12px;
}

.ed-cover-label {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #f7f5f0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  padding: 4px 10px;
  border-radius: 3px;
}

.ed-caption {
  margin: 12px 0 0;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  font-size: 12px;
  color: #999;
  text-align: center;
  letter-spacing: 0.5px;
}

/* ===== 分隔线 ===== */
.ed-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0 40px;
}

.ed-divider-diamond {
  width: 6px;
  height: 6px;
  background: #c8b99a;
  transform: rotate(45deg);
}

/* ===== 区块 ===== */
.ed-section {
  margin-bottom: 56px;
  animation: editorialFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.ed-section:nth-child(4) { animation-delay: 0.4s; }
.ed-section:nth-child(5) { animation-delay: 0.5s; }
.ed-section:nth-child(6) { animation-delay: 0.6s; }

.ed-section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.ed-section-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.ed-section-link {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #999;
  text-decoration: none;
  letter-spacing: 0.5px;
  transition: color 0.3s;
}

.ed-section-link:hover {
  color: #1a1a1a;
}

/* ===== 歌单网格 ===== */
.ed-playlist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.ed-playlist {
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.ed-playlist:hover {
  transform: translateY(-4px);
}

.ed-playlist-cover {
  aspect-ratio: 1;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.ed-playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.ed-playlist:hover .ed-playlist-cover img {
  transform: scale(1.04);
}

.ed-playlist-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ed-playlist-name {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ed-playlist-count {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 11px;
  color: #aaa;
}

/* ===== 歌曲列表 ===== */
.ed-song-list {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.ed-song-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: background 0.2s;
}

.ed-song-row:hover {
  background: rgba(0, 0, 0, 0.02);
}

.ed-song-num {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: #bbb;
  width: 20px;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.ed-song-cover {
  width: 44px;
  height: 44px;
  border-radius: 3px;
  overflow: hidden;
  flex-shrink: 0;
}

.ed-song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ed-song-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ed-song-title {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ed-song-artist {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  color: #999;
}

.ed-song-album {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  font-size: 12px;
  color: #ccc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

/* ===== 快捷入口 ===== */
.ed-shortcuts {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 28px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.ed-shortcut {
  flex: 1;
  text-align: center;
  padding: 12px 8px;
  cursor: pointer;
  transition: background 0.3s;
  border-radius: 4px;
}

.ed-shortcut:hover {
  background: rgba(0, 0, 0, 0.03);
}

.ed-shortcut-title {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.ed-shortcut-desc {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 11px;
  color: #aaa;
}

.ed-shortcut-divider {
  width: 1px;
  height: 32px;
  background: rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.ed-footer-space {
  height: 60px;
}

/* ===== 动画 ===== */
@keyframes editorialFadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 桌面端 ===== */
@media (max-width: 768px) {
  .editorial {
    padding-bottom: 100px;
  }

  .ed-container {
    padding: 0 20px;
  }

  .hero-editorial {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 40px 0 32px;
  }

  .ed-headline {
    font-size: 36px;
  }

  .ed-playlist-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .ed-song-album {
    display: none;
  }

  .ed-shortcuts {
    flex-direction: column;
    gap: 0;
  }

  .ed-shortcut-divider {
    width: 40px;
    height: 1px;
    margin: 0 auto;
  }
}
</style>
