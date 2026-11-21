<template>
  <SkeletonLoader v-if="loading" />
  <div class="immersive-home" v-else :style="dynamicStyle">
    <!-- 动态氛围背景 -->
    <div class="atmosphere">
      <div class="atmo-bg-img" :style="{ backgroundImage: `url(${bgCover})` }"></div>
      <div class="atmo-gradient"></div>
      <div class="atmo-lamp"></div>
      <div class="atmo-grain"></div>
      <div class="atmo-scan"></div>
    </div>

    <!-- 主内容 -->
    <div class="content-layer">

      <!-- 唱片台：正在播放 -->
      <section class="deck">
        <div class="deck-disc">
          <div
            class="vinyl"
            :class="{ spinning: playerStore.isPlaying && playerStore.currentSong }"
            @click="openFullscreen"
          >
            <div class="vinyl-sheen"></div>
            <div class="vinyl-label">
              <img :src="currentCover" alt="" @error="onCoverError" />
            </div>
            <div class="vinyl-spindle"></div>
          </div>
          <div ref="tonearmRef" class="tonearm" :class="{ engaged: playerStore.isPlaying && playerStore.currentSong }"></div>
        </div>

        <div class="deck-info">
          <!-- 有歌曲 -->
          <template v-if="playerStore.currentSong">
            <div class="eyebrow"><span class="dot"></span>Now Playing · Track {{ trackNo }}</div>
            <h1 class="deck-title">{{ playerStore.currentSong.title }}</h1>
            <div class="deck-meta">
              <span>{{ playerStore.currentSong.artist }}</span>
              <template v-if="playerStore.currentSong.album">
                <i>/</i>
                <span>{{ playerStore.currentSong.album }}</span>
              </template>
            </div>

            <div class="wave" :class="{ playing: playerStore.isPlaying }">
              <i
                v-for="(bar, i) in waveBars"
                :key="i"
                :style="{ height: bar.h + '%', animationDelay: bar.d + 's', animationDuration: bar.dur + 's' }"
              ></i>
            </div>

            <div class="deck-actions">
              <button class="btn-play" @click="togglePlay">
                <span class="tri" v-if="!playerStore.isPlaying"></span>
                <span class="pause" v-else></span>
                {{ playerStore.isPlaying ? 'PAUSE' : 'PLAY' }}
              </button>
              <button class="btn-ghost" @click="openFullscreen">全屏播放</button>
              <button class="btn-ghost" @click="router.push(`/song/${playerStore.currentSong.id}`)">歌曲详情</button>
            </div>
          </template>

          <!-- 无歌曲 -->
          <template v-else>
            <div class="eyebrow"><span class="dot"></span>{{ greeting }}</div>
            <h1 class="deck-title">发现好音乐</h1>
            <div class="deck-meta"><span>放一张唱片，听见时光</span></div>

            <div class="wave idle">
              <i
                v-for="(bar, i) in waveBars"
                :key="i"
                :style="{ height: bar.h + '%' }"
              ></i>
            </div>

            <div class="deck-actions">
              <button class="btn-play" @click="playDailySongs">
                <span class="tri"></span>
                PLAY
              </button>
              <button class="btn-ghost" @click="router.push('/songs')">全部歌曲</button>
            </div>
          </template>
        </div>
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
        <div class="qk-chip" @click="router.push('/season')">
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
          <span>季节限定</span>
        </div>
        <div class="qk-chip" @click="router.push('/story')">
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
          <span>黄金年代</span>
        </div>
        <div class="qk-chip" @click="router.push('/ringtones')">
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
          <span>怀旧经典</span>
        </div>
        <div class="qk-chip" @click="router.push('/cloud')">
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          <span>歌曲云图</span>
        </div>
        <div class="qk-chip" @click="router.push('/stats')">
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
          <span>听歌统计</span>
        </div>
      </section>

      <!-- 推荐歌单 -->
      <section class="content-section">
        <div class="section-header">
          <div class="section-title-wrap">
            <span class="section-idx">01</span>
            <h3 class="section-title">为你推荐</h3>
          </div>
          <router-link to="/playlists" class="see-all">全部 →</router-link>
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

      <!-- 新专辑 -->
      <section class="content-section">
        <div class="section-header">
          <div class="section-title-wrap">
            <span class="section-idx">02</span>
            <h3 class="section-title">新专辑</h3>
          </div>
          <router-link to="/albums" class="see-all">全部 →</router-link>
        </div>
        <div class="horizontal-scroll">
          <div
            v-for="album in latestAlbums"
            :key="album.id"
            class="glass-card"
            @click="router.push(`/album/${album.id}`)"
          >
            <div class="glass-card-cover">
              <img :src="album.cover" :alt="album.name" loading="lazy" />
            </div>
            <div class="glass-card-info">
              <span class="glass-card-name">{{ album.name }}</span>
              <span class="glass-card-count">{{ album.songs?.length || 0 }} 首</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 新歌 + 热门 双栏 -->
      <div class="dual-column">
        <!-- 新歌速递 -->
        <section class="content-section">
          <div class="section-header">
            <div class="section-title-wrap">
              <span class="section-idx">03</span>
              <h3 class="section-title">新歌速递</h3>
            </div>
            <router-link to="/songs" class="see-all">全部 →</router-link>
          </div>
          <div class="track-head">
            <span class="th-no">No.</span>
            <span class="th-title">曲目</span>
            <span class="th-leader"></span>
            <span class="th-dur">时长</span>
          </div>
          <div class="recent-list">
            <div
              v-for="(song, i) in recentSongs"
              :key="song.id"
              class="recent-item"
              @click="playerStore.playSong(song)"
            >
              <span class="row-no">{{ pad3(i + 1) }}</span>
              <div class="recent-cover" @click.stop="playerStore.playSong(song)">
                <img :src="song.cover" :alt="song.title" loading="lazy" />
                <div class="recent-play-btn" @click.stop="playerStore.playSong(song)">
                  <svg viewBox="0 0 24 24" width="14" height="14"><path fill="#fff" d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <div class="recent-meta">
                <span class="recent-title">{{ song.title }}</span>
                <span class="recent-artist">{{ song.artist }}</span>
              </div>
              <span class="row-leader"></span>
              <div class="recent-actions" @click.stop>
                <span class="tag-badge lyrics" v-if="hasLyrics(song.id)">词</span>
                <span class="tag-badge mv" v-if="song.mvUrl">MV</span>
                <span class="tag-badge ai" v-if="song.isAI">AI</span>
                <button
                  class="like-btn" v-like-burst
                  :class="{ liked: playerStore.isLiked(song.id) }"
                  @click.stop="playerStore.toggleLikeSong(song.id)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </button>
                <span class="recent-duration" v-if="song.duration">{{ formatTime(song.duration) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 热门歌曲 -->
        <section class="content-section">
          <div class="section-header">
            <div class="section-title-wrap">
              <span class="section-idx">04</span>
              <h3 class="section-title">热门歌曲</h3>
            </div>
            <router-link to="/hot" class="see-all">全部 →</router-link>
          </div>
          <div class="track-head">
            <span class="th-no">No.</span>
            <span class="th-title">曲目</span>
            <span class="th-leader"></span>
            <span class="th-dur">时长</span>
          </div>
          <div class="hot-list">
            <div
              v-for="(song, i) in hotSongs"
              :key="song.id"
              class="hot-item"
              @click="playerStore.playSong(song)"
            >
              <span class="row-no" :class="{ top3: i < 3 }">{{ pad3(i + 1) }}</span>
              <div class="recent-cover" @click.stop="playerStore.playSong(song)">
                <img :src="song.cover" :alt="song.title" loading="lazy" />
                <div class="recent-play-btn" @click.stop="playerStore.playSong(song)">
                  <svg viewBox="0 0 24 24" width="14" height="14"><path fill="#fff" d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <div class="recent-meta">
                <span class="recent-title">{{ song.title }}</span>
                <span class="recent-artist">{{ song.artist }}</span>
              </div>
              <span class="row-leader"></span>
              <div class="recent-actions" @click.stop>
                <span class="tag-badge lyrics" v-if="hasLyrics(song.id)">词</span>
                <span class="tag-badge mv" v-if="song.mvUrl">MV</span>
                <span class="tag-badge ai" v-if="song.isAI">AI</span>
                <button
                  class="like-btn" v-like-burst
                  :class="{ liked: playerStore.isLiked(song.id) }"
                  @click.stop="playerStore.toggleLikeSong(song.id)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </button>
                <span class="recent-duration" v-if="song.duration">{{ formatTime(song.duration) }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 底部空间 -->
      <div class="bottom-space"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { resolveUrl } from '../utils/baseUrl'
import SkeletonLoader from '../components/SkeletonLoader.vue'

const router = useRouter()
const playerStore = usePlayerStore()

// 骨架屏基于真实数据加载状态：数据就绪或加载失败时都隐藏
const loading = computed(() => !playerStore.dataLoaded && !playerStore.dataLoadError)

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

// 唱片中心标签封面
const currentCover = computed(() => playerStore.currentSong?.cover || bgCover.value)

const onCoverError = (e) => {
  e.target.style.visibility = 'hidden'
}

// 曲目编号（在曲库中的序号）
const trackNo = computed(() => {
  const song = playerStore.currentSong
  if (!song) return '000'
  const idx = playerStore.songs.findIndex(s => s.id === song.id)
  return pad3(idx >= 0 ? idx + 1 : 1)
})

// 动态主题色
const dynamicStyle = computed(() => {
  const color = playerStore.themeColor || '#c99a5b'
  return {
    '--dynamic-color': color,
    '--dynamic-r': parseInt(color.slice(1, 3), 16),
    '--dynamic-g': parseInt(color.slice(3, 5), 16),
    '--dynamic-b': parseInt(color.slice(5, 7), 16),
  }
})

// 唱臂角度：停止/暂停时停在唱片外，播放时落在最外圈并随进度向内（模拟真实拾音）
// 用 watchEffect 直接写 CSS 变量，避免每秒多次触发整页重渲染
const tonearmRef = ref(null)
watchEffect(() => {
  const el = tonearmRef.value
  if (!el) return
  if (!playerStore.currentSong || !playerStore.isPlaying) {
    el.style.setProperty('--arm', '-92deg')
    return
  }
  const p = Math.min(1, Math.max(0, (playerStore.progress || 0) / 100))
  el.style.setProperty('--arm', `${(-64 + p * 18).toFixed(2)}deg`)
})

// 波形条：随机高度与节奏，一次性生成避免重复渲染抖动
const waveBars = Array.from({ length: 54 }, () => ({
  h: Math.round(16 + Math.random() * 84),
  d: (Math.random() * 1.6).toFixed(2),
  dur: (0.9 + Math.random() * 1.0).toFixed(2),
}))

// 最近歌曲（新歌速递）
const recentSongs = computed(() => {
  return [...playerStore.songs].sort((a, b) => b.id - a.id).slice(0, 8)
})

// 热门歌曲
const hotSongs = computed(() => playerStore.songs.slice(0, 8))

// 新专辑
const latestAlbums = computed(() => {
  return [...playerStore.albums].sort((a, b) => b.id - a.id).slice(0, 6)
})

const hasLyrics = (songId) => playerStore.hasLyrics(songId)

// 操作
const openFullscreen = () => {
  window.dispatchEvent(new CustomEvent('open-fullscreen'))
}

const togglePlay = () => {
  playerStore.togglePlay()
}

const playDailySongs = () => {
  const shuffled = [...playerStore.songs].sort(() => Math.random() - 0.5)
  playerStore.playPlaylist({ id: 'daily', name: '每日10首', songs: shuffled.slice(0, 10).map(s => s.id) })
}

const pad3 = (n) => String(n).padStart(3, '0')

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
/* ============================================================
   黑胶电台 · 材质与光
   ============================================================ */
.immersive-home {
  --brass: 201, 154, 91;
  --cream: 240, 231, 216;
  --mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  --serif: Georgia, 'Times New Roman', 'Songti SC', 'Source Han Serif SC', serif;

  position: relative;
  min-height: 100vh;
  background: #07070a;
  color: rgba(var(--cream), 0.88);
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
  overflow-x: clip;
  padding-bottom: 100px;
}

/* ===== 氛围背景 ===== */
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
  filter: blur(64px) saturate(1.25) brightness(0.26);
  transform: scale(1.2);
  transition: background-image 2s ease;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.atmo-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 18% 12%, rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.2) 0%, transparent 58%),
    radial-gradient(ellipse at 82% 78%, rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.11) 0%, transparent 52%),
    linear-gradient(180deg, rgba(7, 7, 10, 0.35) 0%, rgba(7, 7, 10, 0.78) 58%, #07070a 94%);
}

/* 钨丝灯：暖色顶部光晕 */
.atmo-lamp {
  position: absolute;
  top: -46vw;
  left: -6vw;
  width: 92vw;
  height: 92vw;
  border-radius: 50%;
  background: radial-gradient(circle,
    rgba(var(--brass), 0.14) 0%,
    rgba(var(--brass), 0.05) 34%,
    transparent 62%);
  filter: blur(24px);
}

.atmo-grain {
  position: absolute;
  inset: 0;
  opacity: 0.045;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 256px;
}

/* 扫描线 */
.atmo-scan {
  position: absolute;
  inset: 0;
  opacity: 0.5;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.016) 0px,
    rgba(255, 255, 255, 0.016) 1px,
    transparent 1px,
    transparent 3px
  );
}

/* ===== 内容层 ===== */
.content-layer {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 20px 0;
}

/* ===== 唱片台 ===== */
.deck {
  display: grid;
  grid-template-columns: 1fr;
  gap: 36px;
  align-items: center;
  padding: 12px 0 40px;
  margin-bottom: 12px;
  animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.deck-disc {
  position: relative;
  width: min(74vw, 340px);
  aspect-ratio: 1;
  margin: 0 auto;
}

/* 黑胶 */
.vinyl {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  cursor: pointer;
  background:
    repeating-radial-gradient(circle at 50% 50%,
      rgba(255, 255, 255, 0.03) 0px,
      rgba(255, 255, 255, 0.03) 1px,
      transparent 1px,
      transparent 4px),
    radial-gradient(circle at 50% 50%, #1a1a21 0%, #0d0d12 46%, #050507 78%, #000 100%);
  box-shadow:
    0 40px 90px rgba(0, 0, 0, 0.85),
    0 0 0 1px rgba(255, 255, 255, 0.06),
    inset 0 0 70px rgba(0, 0, 0, 0.8);
  animation: spin 34s linear infinite;
  animation-play-state: paused;
  transition: box-shadow 0.5s ease;
}

.vinyl.spinning {
  animation-play-state: running;
}

.vinyl:hover {
  box-shadow:
    0 40px 90px rgba(0, 0, 0, 0.85),
    0 0 0 1px rgba(var(--brass), 0.45),
    0 0 60px rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.18),
    inset 0 0 70px rgba(0, 0, 0, 0.8);
}

/* 反光扫掠 */
.vinyl-sheen {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(from 200deg,
    transparent 0deg 24deg,
    rgba(255, 245, 225, 0.11) 44deg,
    rgba(255, 245, 225, 0.015) 62deg,
    transparent 74deg 200deg,
    rgba(255, 245, 225, 0.08) 230deg,
    transparent 250deg 360deg);
  mix-blend-mode: screen;
  animation: sheen 9s ease-in-out infinite alternate;
  pointer-events: none;
}

/* 中心标签：专辑封面 */
.vinyl-label {
  position: absolute;
  inset: 34%;
  border-radius: 50%;
  overflow: hidden;
  background: radial-gradient(circle at 38% 30%, #b98a52, #6b3a12 58%, #23140a 100%);
  box-shadow:
    0 0 0 1px rgba(var(--brass), 0.32),
    inset 0 0 26px rgba(0, 0, 0, 0.55);
}

.vinyl-label img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.92;
}

.vinyl-spindle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  margin: -4px 0 0 -4px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #efe6d8, #6a5b45 60%, #241d14);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.9);
  z-index: 2;
}

/* 唱臂 */
.tonearm {
  position: absolute;
  top: 1%;
  right: -12%;
  width: 46%;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(270deg, rgba(216, 216, 228, 0.9), rgba(140, 140, 152, 0.6));
  box-shadow: 0 2px 7px rgba(0, 0, 0, 0.8);
  transform-origin: 100% 50%;
  transform: rotate(var(--arm, -92deg));
  transition: transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 5;
  pointer-events: none;
}

/* 播放中：唱臂缓慢向盘心内移，用线性过渡避免每秒重设时回弹 */
.tonearm.engaged {
  transition: transform 0.9s linear;
}

.tonearm::before {
  content: '';
  position: absolute;
  right: -10px;
  top: -9px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(circle at 34% 30%, #ececf4, #6e6e7a 58%, #26262e);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.9);
}

.tonearm::after {
  content: '';
  position: absolute;
  left: -6px;
  top: -5px;
  width: 15px;
  height: 11px;
  border-radius: 2px;
  background: linear-gradient(180deg, #c8c8d2, #4e4e58);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes sheen {
  0% { transform: rotate(0deg); opacity: 0.65; }
  100% { transform: rotate(24deg); opacity: 1; }
}

/* ===== 唱片信息 ===== */
.deck-info {
  min-width: 0;
  text-align: left;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: rgba(var(--brass), 0.9);
  margin-bottom: 18px;
}

.eyebrow .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(var(--brass), 1);
  box-shadow: 0 0 10px rgba(var(--brass), 0.9);
  animation: pulse 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 0.35; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.15); }
}

.deck-title {
  font-family: var(--serif);
  font-size: clamp(38px, 10.5vw, 58px);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: 0.01em;
  margin: 0 0 16px;
  background: linear-gradient(176deg, #fdf8ef 0%, #ece2d0 54%, #b8a382 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  word-break: break-word;
}

.deck-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  color: rgba(var(--cream), 0.42);
  text-transform: uppercase;
  margin-bottom: 26px;
}

.deck-meta i {
  font-style: normal;
  opacity: 0.3;
}

/* 波形 */
.wave {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 46px;
  margin-bottom: 30px;
  max-width: 420px;
}

.wave i {
  display: block;
  flex: 1;
  min-width: 2px;
  border-radius: 1px;
  background: linear-gradient(180deg, rgba(var(--brass), 0.95), rgba(var(--brass), 0.12));
  transform: scaleY(0.4);
  opacity: 0.45;
  transform-origin: center;
}

.wave.playing i {
  animation-name: waveBar;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

.wave.idle i {
  opacity: 0.38;
  transform: scaleY(0.62);
}

@keyframes waveBar {
  0%, 100% { transform: scaleY(0.25); opacity: 0.45; }
  50% { transform: scaleY(1); opacity: 1; }
}

/* 按钮 */
.deck-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.btn-play {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  padding: 13px 26px;
  border: 1px solid rgba(var(--brass), 0.5);
  border-radius: 2px;
  background: linear-gradient(180deg, rgba(var(--brass), 0.13), rgba(var(--brass), 0.02));
  color: rgba(var(--brass), 1);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-play:hover {
  background: rgba(var(--brass), 0.16);
  border-color: rgba(var(--brass), 0.9);
  box-shadow: 0 0 36px rgba(var(--brass), 0.16);
}

.btn-play:active {
  transform: scale(0.97);
}

.btn-play .tri {
  width: 0;
  height: 0;
  border-left: 7px solid rgba(var(--brass), 1);
  border-top: 4.5px solid transparent;
  border-bottom: 4.5px solid transparent;
}

.btn-play .pause {
  width: 7px;
  height: 9px;
  border-left: 2px solid rgba(var(--brass), 1);
  border-right: 2px solid rgba(var(--brass), 1);
}

.btn-ghost {
  background: none;
  border: none;
  padding: 6px 2px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  color: rgba(var(--cream), 0.32);
  cursor: pointer;
  transition: color 0.3s;
}

.btn-ghost:hover {
  color: rgba(var(--cream), 0.8);
}

/* ===== 快捷操作 ===== */
.quick-grid {
  display: flex;
  gap: 8px;
  margin-bottom: 44px;
  overflow-x: auto;
  scrollbar-width: none;
  animation: fadeUp 0.9s 0.12s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.quick-grid::-webkit-scrollbar { display: none; }

.qk-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 15px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 2px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 400;
  color: rgba(var(--cream), 0.55);
  transition: all 0.32s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.qk-chip:hover {
  background: rgba(var(--brass), 0.07);
  border-color: rgba(var(--brass), 0.42);
  color: rgba(var(--cream), 0.92);
}

.qk-chip svg {
  opacity: 0.5;
  transition: opacity 0.3s;
}

.qk-chip:hover svg {
  opacity: 0.95;
}

/* ===== 内容区块 ===== */
.content-section {
  margin-bottom: 46px;
  animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.dual-column {
  display: flex;
  flex-direction: column;
  gap: 46px;
  margin-bottom: 46px;
  animation: fadeUp 0.9s 0.18s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.dual-column .content-section {
  margin-bottom: 0;
  animation: none;
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(var(--cream), 0.09);
}

.section-title-wrap {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
}

.section-idx {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  color: rgba(var(--brass), 0.75);
  flex-shrink: 0;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: rgba(var(--cream), 0.95);
  letter-spacing: 0.04em;
}

.see-all {
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.16em;
  color: rgba(var(--cream), 0.28);
  text-decoration: none;
  text-transform: uppercase;
  transition: color 0.3s;
  flex-shrink: 0;
}

.see-all:hover {
  color: rgba(var(--brass), 0.9);
}

/* ===== 唱片封套卡片 ===== */
.horizontal-scroll {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 6px;
  scroll-snap-type: x mandatory;
}

.horizontal-scroll::-webkit-scrollbar { display: none; }

.glass-card {
  flex-shrink: 0;
  width: 138px;
  cursor: pointer;
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  scroll-snap-align: start;
}

.glass-card:hover {
  transform: translateY(-5px);
}

.glass-card-cover {
  width: 138px;
  height: 138px;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 11px;
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.5),
    inset 0 0 0 1px rgba(255, 255, 255, 0.07);
  transition: box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-card:hover .glass-card-cover {
  box-shadow:
    0 20px 46px rgba(0, 0, 0, 0.62),
    inset 0 0 0 1px rgba(var(--brass), 0.45),
    0 0 44px rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.16);
}

.glass-card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-card:hover .glass-card-cover img {
  transform: scale(1.05);
}

.glass-card-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.glass-card-name {
  font-size: 13px;
  font-weight: 500;
  color: rgba(var(--cream), 0.82);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.glass-card-count {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: rgba(var(--cream), 0.28);
}

/* ===== 曲目表 ===== */
.track-head {
  display: none;
  align-items: baseline;
  gap: 14px;
  padding: 0 10px 8px;
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(var(--cream), 0.22);
  border-bottom: 1px solid rgba(var(--cream), 0.06);
}

.th-no { width: 34px; flex-shrink: 0; }
.th-title { flex-shrink: 0; }
.th-leader { flex: 1; }
.th-dur { flex-shrink: 0; }

.recent-list,
.hot-list {
  display: flex;
  flex-direction: column;
}

.recent-item,
.hot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 10px;
  border-bottom: 1px solid rgba(var(--cream), 0.05);
  cursor: pointer;
  transition: background 0.3s, padding-left 0.3s;
}

.recent-item:hover,
.hot-item:hover {
  background: rgba(var(--brass), 0.04);
  padding-left: 16px;
}

.recent-item:hover .recent-play-btn,
.hot-item:hover .recent-play-btn {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

/* 曲目编号 */
.row-no {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: rgba(var(--cream), 0.22);
  width: 34px;
  flex-shrink: 0;
  transition: color 0.3s;
}

.row-no.top3 {
  color: rgba(var(--brass), 0.85);
}

.recent-item:hover .row-no,
.hot-item:hover .row-no {
  color: rgba(var(--brass), 1);
}

/* 虚线引导 */
.row-leader {
  display: none;
  flex: 1;
  height: 1px;
  margin: 0 4px 4px;
  border-bottom: 1px dotted rgba(var(--cream), 0.14);
}

.recent-cover {
  width: 42px;
  height: 42px;
  border-radius: 2px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.03);
  position: relative;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.recent-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recent-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.recent-meta {
  flex: 0 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
}

.recent-title {
  font-size: 13.5px;
  font-weight: 500;
  color: rgba(var(--cream), 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-artist {
  font-size: 11px;
  font-weight: 300;
  color: rgba(var(--cream), 0.32);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-actions {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  margin-left: auto;
}

/* 标签徽章 */
.tag-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  height: 16px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  border-radius: 2px;
  flex-shrink: 0;
}

.tag-badge.lyrics {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.85);
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.1);
  border: 1px solid rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.16);
}

.tag-badge.mv {
  color: rgba(255, 138, 101, 0.8);
  background: rgba(255, 138, 101, 0.1);
  border: 1px solid rgba(255, 138, 101, 0.15);
}

.tag-badge.ai {
  background: rgba(168, 85, 247, 0.15);
  color: rgba(168, 85, 247, 0.9);
}

.like-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: rgba(var(--cream), 0.18);
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.like-btn:hover {
  color: rgba(245, 87, 108, 0.7);
  transform: scale(1.15);
}

.like-btn.liked {
  color: #f5576c;
}

.recent-duration {
  font-family: var(--mono);
  font-size: 10.5px;
  color: rgba(var(--cream), 0.25);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  width: 38px;
  text-align: right;
}

.bottom-space {
  height: 60px;
}

/* ===== 动画 ===== */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(22px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 平板 / 桌面 ===== */
@media (min-width: 768px) {
  .content-layer {
    padding: 44px 48px 0;
  }

  .deck {
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1fr);
    gap: 52px;
    padding: 20px 0 56px;
  }

  .deck-disc {
    width: min(38vw, 400px);
  }

  .deck-title {
    font-size: clamp(46px, 5.4vw, 74px);
    letter-spacing: 0.015em;
  }

  .deck-meta {
    font-size: 12px;
    margin-bottom: 30px;
  }

  .wave {
    height: 54px;
    margin-bottom: 34px;
  }

  .track-head {
    display: flex;
  }

  .row-leader {
    display: block;
  }

  .section-title {
    font-size: 24px;
  }

  .horizontal-scroll {
    overflow-x: visible;
    flex-wrap: wrap;
    scroll-snap-type: none;
  }

  .glass-card {
    width: calc((100% - 70px) / 6);
    min-width: 120px;
    scroll-snap-align: none;
  }

  .glass-card-cover {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
  }

  .quick-grid {
    gap: 10px;
  }

  .qk-chip {
    padding: 10px 18px;
    font-size: 13.5px;
  }
}

@media (min-width: 1200px) {
  .content-layer {
    padding: 52px 64px 0;
    max-width: 1600px;
  }

  .deck {
    gap: 84px;
    padding: 24px 0 64px;
  }

  .deck-disc {
    width: min(34vw, 440px);
  }

  .glass-card {
    width: calc((100% - 70px) / 6);
    min-width: 140px;
  }

  /* 宽屏双栏并排 */
  .dual-column {
    flex-direction: row;
    gap: 56px;
  }

  .dual-column .content-section {
    flex: 1;
    min-width: 0;
  }
}

/* 窄屏隐藏唱臂，避免溢出 */
@media (max-width: 767px) {
  .tonearm {
    display: none;
  }

  .deck-info {
    text-align: center;
  }

  .eyebrow,
  .deck-meta {
    justify-content: center;
  }

  .wave {
    margin-left: auto;
    margin-right: auto;
  }

  .deck-actions {
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vinyl,
  .vinyl-sheen,
  .wave i,
  .eyebrow .dot {
    animation: none !important;
  }
}
</style>
