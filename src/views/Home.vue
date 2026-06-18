<template>
  <SkeletonLoader v-if="loading" />
  <div class="home-new" v-else>
    <!-- Hero 大图区域 -->
    <section class="hero-section">
      <div class="hero-bg">
        <img :src="heroCover" class="hero-img" />
        <div class="hero-overlay"></div>
        <div class="hero-vignette"></div>
      </div>
      <div class="hero-content">
        <div class="hero-label">
          <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          {{ heroLabel }}
        </div>
        <h1 class="hero-title">{{ heroTitle }}</h1>
        <p class="hero-desc">{{ heroDesc }}</p>
        <div class="hero-actions">
          <button class="hero-play-btn" @click="playHero">
            <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <span>立即播放</span>
          </button>
          <button class="hero-more-btn" @click="goToHero">
            <span>查看详情</span>
          </button>
        </div>
      </div>
      <!-- Hero 切换指示器 -->
      <div class="hero-indicators">
        <span v-for="(item, i) in heroItems" :key="i" class="hero-dot" :class="{ active: heroIndex === i }" @click="heroIndex = i"></span>
      </div>
    </section>

    <!-- 快捷入口 -->
    <section class="quick-access">
      <div class="quick-card" @click="playDailySongs">
        <div class="quick-icon daily">
          <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        </div>
        <span class="quick-name">每日10首</span>
      </div>
      <div class="quick-card" @click="goToLikedSongs">
        <div class="quick-icon liked">
          <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
        <span class="quick-name">我喜欢</span>
      </div>
      <div class="quick-card" @click="goToSummer">
        <div class="quick-icon summer">
          <span style="font-size: 22px;">🍊</span>
        </div>
        <span class="quick-name">橘子味的夏天</span>
      </div>
      <div class="quick-card" @click="router.push('/stats')">
        <div class="quick-icon stats">
          <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
        </div>
        <span class="quick-name">听歌统计</span>
      </div>
    </section>

    <!-- 推荐歌单 -->
    <section class="content-section">
      <div class="section-header">
        <h2 class="section-title">推荐歌单</h2>
        <router-link to="/playlists" class="see-all">查看全部 ›</router-link>
      </div>
      <div class="playlist-scroll">
        <PlaylistCard
          v-for="playlist in playerStore.recommendPlaylists"
          :key="playlist.id"
          :playlist="playlist"
          @click="goToPlaylist(playlist.id)"
          @play="playPlaylist(playlist)"
        />
      </div>
    </section>

    <!-- 新专辑 -->
    <section class="content-section">
      <div class="section-header">
        <h2 class="section-title">新专辑</h2>
        <router-link to="/albums" class="see-all">查看全部 ›</router-link>
      </div>
      <div class="playlist-scroll">
        <PlaylistCard
          v-for="album in latestAlbums"
          :key="album.id"
          :playlist="album"
          @click="goToAlbum(album.id)"
          @play="playAlbum(album)"
        />
      </div>
    </section>

    <!-- 最新歌曲 -->
    <section class="content-section">
      <div class="section-header">
        <h2 class="section-title">最新歌曲</h2>
        <router-link to="/songs" class="see-all">查看全部 ›</router-link>
      </div>
      <div class="song-grid">
        <div
          v-for="song in latestSongs"
          :key="song.id"
          class="song-card"
          @click="playerStore.playSong(song)"
        >
          <div class="song-card-cover">
            <img :src="song.cover" :alt="song.title" />
            <div class="song-card-play">
              <svg viewBox="0 0 24 24" width="28" height="28"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <p class="song-card-title">{{ song.title }}</p>
          <p class="song-card-artist">{{ song.artist }}</p>
        </div>
      </div>
    </section>

    <!-- 热门歌曲 -->
    <section class="content-section">
      <div class="section-header">
        <h2 class="section-title">热门歌曲</h2>
        <router-link to="/hot" class="see-all">查看全部 ›</router-link>
      </div>
      <div class="song-list-wrap">
        <SongItem
          v-for="(song, index) in hotSongs"
          :key="song.id"
          :song="song"
          :index="index"
          :show-index="true"
          @play="playerStore.playSong(song)"
        />
      </div>
    </section>

    <!-- 底部留白 -->
    <div class="footer-space"></div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import PlaylistCard from '../components/PlaylistCard.vue'
import SongItem from '../components/SongItem.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'

const router = useRouter()
const playerStore = usePlayerStore()

const loading = ref(true)
onMounted(() => { setTimeout(() => { loading.value = false }, 800) })

// Hero 轮播数据
const heroItems = [
  {
    label: '热门推荐',
    title: '凤凰传奇',
    desc: '国民组合 · 经典传唱 · 激情澎湃',
    cover: '/music-player/images/covers/fenghuang_chuanqi_hero.jpg',
    action: () => router.push('/search?q=凤凰传奇'),
    link: '/search?q=凤凰传奇'
  },
  {
    label: '每日推荐',
    title: '每日10首',
    desc: '为你精心挑选，发现好音乐',
    cover: '/music-player/images/covers/daily_hero.jpg',
    action: () => playDailySongs(),
    link: '/songs'
  },
  {
    label: '专题歌单',
    title: '橘子味的夏天',
    desc: '清甜 · 日落氛围感 · 15首精选',
    cover: '/music-player/images/covers/summer_orange_cover.jpg',
    action: () => goToSummer(),
    link: '/summer'
  },
  {
    label: '精选专辑',
    title: '风来的方向',
    desc: '温暖治愈，听见风的声音',
    cover: '/music-player/images/covers/32d37eb29697_cover.jpg',
    action: () => goToAlbum(18),
    link: '/album/18'
  }
]

const heroIndex = ref(0)
const heroItem = computed(() => heroItems[heroIndex.value])
const heroCover = computed(() => heroItem.value.cover)
const heroLabel = computed(() => heroItem.value.label)
const heroTitle = computed(() => heroItem.value.title)
const heroDesc = computed(() => heroItem.value.desc)

// 自动轮播
let heroTimer = null
const startHeroTimer = () => {
  heroTimer = setInterval(() => {
    heroIndex.value = (heroIndex.value + 1) % heroItems.length
  }, 6000)
}
onMounted(startHeroTimer)

const playHero = () => { heroItem.value.action() }
const goToHero = () => { router.push(heroItem.value.link) }

// 快捷入口
const playDailySongs = () => {
  const shuffled = [...playerStore.songs].sort(() => Math.random() - 0.5)
  playerStore.playPlaylist({ id: 'daily', name: '每日10首', songs: shuffled.slice(0, 10).map(s => s.id) })
}
const goToLikedSongs = () => router.push('/liked')
const goToSummer = () => router.push('/summer')

// 数据
const latestSongs = computed(() => [...playerStore.songs].sort((a, b) => b.id - a.id).slice(0, 8))
const hotSongs = computed(() => playerStore.songs.slice(0, 6))
const latestAlbums = computed(() => [...playerStore.albums].sort((a, b) => b.id - a.id).slice(0, 5))

const goToPlaylist = (id) => router.push(`/playlist/${id}`)
const goToAlbum = (id) => router.push(`/album/${id}`)
const playPlaylist = (playlist) => playerStore.playPlaylist(playlist)
const playAlbum = (album) => playerStore.playAlbum(album)
</script>

<style scoped>
.home-new {
  padding-bottom: 100px;
  background: #07070f;
  min-height: 100vh;
}

/* ===== Hero 大图区域 ===== */
.hero-section {
  position: relative;
  height: 55vh;
  min-height: 380px;
  max-height: 520px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 8s ease;
  animation: heroZoom 8s ease-in-out infinite alternate;
}

@keyframes heroZoom {
  from { transform: scale(1); }
  to { transform: scale(1.08); }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(7, 7, 15, 0.1) 0%,
    rgba(7, 7, 15, 0.3) 40%,
    rgba(7, 7, 15, 0.85) 75%,
    #07070f 100%
  );
}

.hero-vignette {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 150px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 0 24px 32px;
  animation: heroContentIn 0.8s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes heroContentIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  margin-bottom: 12px;
}

.hero-title {
  margin: 0 0 8px;
  font-size: 36px;
  font-weight: 800;
  color: #fff;
  line-height: 1.15;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

.hero-desc {
  margin: 0 0 20px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 300;
}

.hero-actions {
  display: flex;
  gap: 12px;
}

.hero-play-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: #fff;
  border: none;
  border-radius: 28px;
  color: #07070f;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 30px rgba(255, 255, 255, 0.2);
}

.hero-more-btn {
  padding: 14px 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 28px;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.hero-more-btn:hover {
  background: rgba(255, 255, 255, 0.18);
}

/* Hero 指示器 */
.hero-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2;
}

.hero-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s;
}

.hero-dot.active {
  background: #fff;
  width: 24px;
  border-radius: 4px;
}

/* ===== 快捷入口 ===== */
.quick-access {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.quick-access::-webkit-scrollbar { display: none; }

.quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  min-width: 80px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.quick-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.quick-icon.daily { background: linear-gradient(135deg, #667eea, #764ba2); }
.quick-icon.liked { background: linear-gradient(135deg, #f093fb, #f5576c); }
.quick-icon.summer { background: linear-gradient(135deg, #ffd8a6, #ff8a65); }
.quick-icon.stats { background: linear-gradient(135deg, #4facfe, #00f2fe); }

.quick-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
}

/* ===== 内容区块 ===== */
.content-section {
  padding: 16px 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.see-all {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  text-decoration: none;
  transition: color 0.2s;
}

.see-all:hover {
  color: rgba(255, 255, 255, 0.8);
}

/* 横向滚动歌单 */
.playlist-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 8px;
}

.playlist-scroll::-webkit-scrollbar { display: none; }

.playlist-scroll :deep(.playlist-card) {
  width: 180px;
  flex-shrink: 0;
}

/* 移动端封面固定 150x150 */
.playlist-scroll :deep(.cover-wrapper) {
  width: 156px;
  height: 156px;
  aspect-ratio: auto;
}

/* 歌曲网格 */
.song-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.song-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.song-card:hover {
  transform: translateY(-4px);
}

.song-card-cover {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
}

.song-card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.song-card:hover .song-card-cover img {
  transform: scale(1.05);
}

.song-card-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s;
}

.song-card:hover .song-card-play {
  opacity: 1;
}

.song-card-play svg {
  width: 40px;
  height: 40px;
  color: #fff;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.song-card-title {
  margin: 0 0 2px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-card-artist {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 歌曲列表 */
.song-list-wrap {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
}

.footer-space {
  height: 40px;
}

/* ===== 桌面端 ===== */
@media (min-width: 768px) {
  .hero-section {
    height: 50vh;
    max-height: 480px;
  }

  .hero-title {
    font-size: 44px;
  }

  .hero-content {
    padding: 0 48px 40px;
    max-width: 900px;
  }

  .quick-access {
    padding: 24px 48px;
    justify-content: center;
    gap: 16px;
  }

  .quick-card {
    min-width: 100px;
    padding: 20px 16px;
  }

  .content-section {
    padding: 20px 48px;
  }

  .song-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .playlist-scroll :deep(.playlist-card) {
    width: 220px;
  }

  .playlist-scroll :deep(.cover-wrapper) {
    width: 196px;
    height: 196px;
  }
}

@media (min-width: 1024px) {
  .hero-section {
    max-height: 520px;
  }

  .playlist-scroll :deep(.playlist-card) {
    width: 260px;
  }

  .playlist-scroll :deep(.cover-wrapper) {
    width: 236px;
    height: 236px;
  }

  .hero-title {
    font-size: 52px;
  }

  .song-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
