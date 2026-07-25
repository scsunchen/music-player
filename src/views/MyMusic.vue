<template>
  <div class="immersive-my" :style="dynamicStyle">
    <!-- 轻量氛围背景 -->
    <div class="atmosphere">
      <div class="atmo-gradient"></div>
      <div class="atmo-orb atmo-orb-1"></div>
    </div>

    <div class="content-layer">
      <!-- 页面标题 -->
      <header class="page-header">
        <span class="header-label">MY MUSIC</span>
        <h1 class="header-title">我的音乐</h1>
      </header>

      <!-- 快捷入口 -->
      <section class="quick-cards">
        <div class="qk-card liked" @click="goToLiked">
          <div class="qk-icon">
            <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <div class="qk-info">
            <h3>我喜欢</h3>
            <p>{{ likedSongs.length }} 首歌曲</p>
          </div>
          <svg class="qk-arrow" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
        </div>
        <div class="qk-card recent" @click="showRecent = true">
          <div class="qk-icon">
            <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M13 3a9 9 0 00-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21a9 9 0 000-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
          </div>
          <div class="qk-info">
            <h3>最近播放</h3>
            <p>{{ recentSongs.length }} 首歌曲</p>
          </div>
          <svg class="qk-arrow" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
        </div>
      </section>

      <!-- 创建/导入歌单 -->
      <div class="create-row">
        <input
          v-model="newPlaylistName"
          type="text"
          placeholder="输入歌单名称..."
          class="create-input"
          @keyup.enter="createPlaylist"
        />
        <button class="create-btn" @click="createPlaylist" :disabled="!newPlaylistName.trim()">
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          <span>创建</span>
        </button>
        <button class="import-btn" @click="triggerImport">
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>
          <span>导入歌单</span>
        </button>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          style="display: none"
          @change="handleImport"
        />
      </div>

      <!-- 我的歌单 -->
      <section class="section" v-if="playerStore.customPlaylists.length > 0">
        <div class="section-header">
          <h3 class="section-title">我的歌单</h3>
          <span class="section-count">{{ playerStore.customPlaylists.length }} 个</span>
        </div>
        <div class="playlist-grid">
          <div
            v-for="playlist in playerStore.customPlaylists"
            :key="playlist.id"
            class="playlist-card"
          >
            <div class="card-cover" @click="goToPlaylist(playlist.id)">
              <img :src="playlist.cover" :alt="playlist.name" loading="lazy" />
              <div class="card-cover-play" @click.stop="playPlaylist(playlist)">
                <svg viewBox="0 0 24 24" width="14" height="14"><path fill="#fff" d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <div class="card-info">
              <span class="card-name">{{ playlist.name }}</span>
              <span class="card-count">{{ playlist.songs.length }} 首</span>
            </div>
            <button class="card-delete" v-if="playlist.id !== 1" @click.stop="deletePlaylist(playlist.id)" title="删除歌单">
              <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </div>
      </section>

      <!-- 空歌单提示 -->
      <section class="section" v-else>
        <div class="section-header">
          <h3 class="section-title">我的歌单</h3>
        </div>
        <div class="empty-state">
          <p>还没有创建歌单</p>
          <p class="empty-hint">创建一个歌单开始收藏你喜欢的歌曲吧</p>
        </div>
      </section>

      <!-- 所有歌曲 -->
      <section class="section">
        <div class="section-header">
          <h3 class="section-title">所有歌曲</h3>
          <span class="section-count">{{ playerStore.songs.length }} 首</span>
        </div>
        <div class="song-list">
          <div
            v-for="song in playerStore.songs"
            :key="song.id"
            class="song-item"
          >
            <div class="song-cover" @click="playSong(song)">
              <img :src="song.cover" :alt="song.title" loading="lazy" />
              <div class="song-cover-play" @click.stop="playSong(song)">
                <svg viewBox="0 0 24 24" width="14" height="14"><path fill="#fff" d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <div class="song-meta" @click="router.push(`/song/${song.id}`)">
              <span class="song-title">{{ song.title }}</span>
              <span class="song-artist">{{ song.artist }}</span>
            </div>
            <div class="song-actions">
              <span class="tag-badge lyrics" v-if="hasLyrics(song.id)">词</span>
              <span class="tag-badge mv" v-if="song.mvUrl">MV</span>
              <button
                class="like-btn" v-like-burst
                :class="{ liked: playerStore.isLiked(song.id) }"
                @click.stop="playerStore.toggleLikeSong(song.id)"
              >
                <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </button>
              <button class="add-btn" @click.stop="showAddModal(song)" title="添加到歌单">
                <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              </button>
              <span class="song-duration" v-if="song.duration">{{ formatTime(song.duration) }}</span>
            </div>
          </div>
        </div>
      </section>

      <div class="bottom-space"></div>
    </div>

    <!-- 添加到歌单弹窗 -->
    <div class="modal-overlay" v-if="showModal" @click="closeModal">
      <div class="modal" @click.stop>
        <h3 class="modal-title">添加到歌单</h3>
        <div class="modal-list">
          <button
            v-for="playlist in playerStore.customPlaylists"
            :key="playlist.id"
            class="modal-item"
            @click="addToPlaylist(playlist.id)"
          >
            <img :src="playlist.cover" class="modal-item-cover" />
            <span>{{ playlist.name }}</span>
          </button>
          <p v-if="playerStore.customPlaylists.length === 0" class="modal-empty">
            请先创建一个歌单
          </p>
        </div>
        <button class="modal-close" @click="closeModal">取消</button>
      </div>
    </div>

    <!-- 最近播放弹窗 -->
    <div class="modal-overlay" v-if="showRecent" @click="showRecent = false">
      <div class="modal modal-large" @click.stop>
        <h3 class="modal-title">最近播放</h3>
        <div class="modal-song-list">
          <div
            v-for="song in recentSongs"
            :key="song.id"
            class="modal-song-item"
            @click="playSong(song); showRecent = false"
          >
            <img :src="song.cover" class="modal-song-cover" />
            <div class="modal-song-info">
              <h4 class="modal-song-title">{{ song.title }}</h4>
              <p class="modal-song-artist">{{ song.artist }}</p>
            </div>
            <div class="modal-song-play">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <p v-if="recentSongs.length === 0" class="modal-empty">还没有播放记录</p>
        </div>
        <button class="modal-close" @click="showRecent = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'

const router = useRouter()
const playerStore = usePlayerStore()

const newPlaylistName = ref('')
const showModal = ref(false)
const showRecent = ref(false)
const selectedSong = ref(null)
const fileInput = ref(null)

const dynamicStyle = computed(() => {
  const color = playerStore.themeColor || '#667eea'
  return {
    '--dynamic-r': parseInt(color.slice(1, 3), 16),
    '--dynamic-g': parseInt(color.slice(3, 5), 16),
    '--dynamic-b': parseInt(color.slice(5, 7), 16),
  }
})

const hasLyrics = (id) => playerStore.hasLyrics(id)

const likedSongs = computed(() => playerStore.getLikedSongsList())
const recentSongs = computed(() => playerStore.getRecentSongsList())

const goToLiked = () => router.push('/liked')
const playSong = (song) => playerStore.playSong(song)

const createPlaylist = () => {
  if (newPlaylistName.value.trim()) {
    playerStore.createPlaylist(newPlaylistName.value.trim())
    newPlaylistName.value = ''
  }
}

const goToPlaylist = (id) => router.push(`/playlist/${id}`)
const playPlaylist = (playlist) => playerStore.playPlaylist(playlist)

const deletePlaylist = (id) => {
  if (confirm('确定要删除这个歌单吗？')) {
    playerStore.deletePlaylist(id)
  }
}

const showAddModal = (song) => {
  selectedSong.value = song
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedSong.value = null
}

const addToPlaylist = (playlistId) => {
  if (selectedSong.value) {
    playerStore.addToPlaylist(playlistId, selectedSong.value.id)
    closeModal()
  }
}

const formatTime = (s) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

// 导入歌单
const triggerImport = () => {
  fileInput.value?.click()
}

const handleImport = (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result)
      if (!data.name || !Array.isArray(data.songs)) {
        alert('JSON 格式不正确，需要包含 name 和 songs 字段')
        return
      }
      if (data.songs.length === 0) {
        alert('歌单中没有歌曲')
        return
      }
      playerStore.importPlaylist(data)
      // 重置 file input
      if (fileInput.value) fileInput.value.value = ''
    } catch (err) {
      alert('JSON 解析失败，请检查文件格式')
    }
  }
  reader.readAsText(file)
}
</script>

<style scoped>
.immersive-my {
  position: relative;
  min-height: 100vh;
  background: #0a0a0a;
  color: rgba(255, 255, 255, 0.85);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  padding-bottom: 100px;
  overflow-x: hidden;
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
  top: -60px;
  right: -40px;
}

@keyframes orbFloat {
  0% { transform: translate(0, 0); }
  100% { transform: translate(20px, -25px); }
}

/* 内容层 */
.content-layer {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 32px 0;
}

@media (min-width: 768px) {
  .content-layer { padding: 48px 48px 0; max-width: 1400px; }
}
@media (min-width: 1200px) {
  .content-layer { padding: 48px 64px 0; max-width: 1600px; }
}

/* 页头 */
.page-header {
  margin-bottom: 28px;
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

/* 快捷入口 */
.quick-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 32px;
}

.qk-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.qk-card:hover {
  transform: translateY(-2px);
}

.qk-card.liked {
  background: rgba(245, 87, 108, 0.08);
  border: 1px solid rgba(245, 87, 108, 0.12);
}

.qk-card.liked:hover {
  background: rgba(245, 87, 108, 0.14);
}

.qk-card.recent {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.08);
  border: 1px solid rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.12);
}

.qk-card.recent:hover {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.14);
}

.qk-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qk-card.liked .qk-icon { color: #f5576c; }
.qk-card.recent .qk-icon { color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8); }

.qk-info { flex: 1; min-width: 0; }
.qk-info h3 { margin: 0 0 2px; font-size: 15px; font-weight: 600; color: #fff; }
.qk-info p { margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.35); }

.qk-arrow { color: rgba(255, 255, 255, 0.2); flex-shrink: 0; }

/* 创建歌单 */
.create-row {
  display: flex;
  gap: 10px;
  margin-bottom: 36px;
}

.create-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  font-size: 14px;
  color: #fff;
  outline: none;
  transition: border-color 0.3s;
}

.create-input:focus {
  border-color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.3);
}

.create-input::placeholder { color: rgba(255, 255, 255, 0.25); }

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15);
  border: 1px solid rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.2);
  border-radius: 10px;
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.9);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.create-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.create-btn:not(:disabled):hover { background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.25); }

.import-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.import-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
}

/* 区块 */
.section { margin-bottom: 40px; }

.section-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 18px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.section-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.25);
}

/* 歌单网格 */
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

@media (min-width: 768px) {
  .playlist-grid { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); }
}

.playlist-card {
  position: relative;
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.playlist-card:hover { transform: translateY(-4px); }

.card-cover {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.playlist-card:hover .card-cover img { transform: scale(1.04); }

.card-cover-play {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s;
  pointer-events: none;
}

.card-cover:hover ~ .card-cover-play { opacity: 1; }

.card-cover-play::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 12px;
}

.card-cover-play svg, .card-cover-play::before {
  position: relative;
}

.card-info { display: flex; flex-direction: column; gap: 2px; }
.card-name { font-size: 14px; font-weight: 600; color: rgba(255, 255, 255, 0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-count { font-size: 12px; color: rgba(255, 255, 255, 0.25); }

.card-delete {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.playlist-card:hover .card-delete { opacity: 1; }
.card-delete:hover { background: rgba(255, 82, 82, 0.8); color: #fff; }

/* 空状态 */
.empty-state { text-align: center; padding: 32px; }
.empty-state p { margin: 0; color: rgba(255, 255, 255, 0.3); }
.empty-hint { font-size: 12px; margin-top: 6px !important; }

/* 歌曲列表 */
.song-list { display: flex; flex-direction: column; gap: 2px; }

.song-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  transition: all 0.3s;
}

.song-item:hover { background: rgba(255, 255, 255, 0.04); }
.song-item:hover .song-cover-play { opacity: 1; transform: translate(-50%, -50%) scale(1); }

.song-cover {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.03);
  position: relative;
  cursor: pointer;
}

.song-cover img { width: 100%; height: 100%; object-fit: cover; }

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

.song-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; cursor: pointer; }
.song-title { font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.song-artist { font-size: 12px; font-weight: 300; color: rgba(255, 255, 255, 0.35); }

.song-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.tag-badge { display: inline-flex; align-items: center; justify-content: center; padding: 0 5px; height: 16px; font-size: 10px; font-weight: 600; line-height: 1; border-radius: 3px; flex-shrink: 0; }
.tag-badge.lyrics { color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8); background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.1); border: 1px solid rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15); }
.tag-badge.mv { color: rgba(255, 138, 101, 0.8); background: rgba(255, 138, 101, 0.1); border: 1px solid rgba(255, 138, 101, 0.15); }

.like-btn { background: none; border: none; padding: 4px; cursor: pointer; color: rgba(255, 255, 255, 0.2); transition: all 0.2s; display: flex; align-items: center; }
.like-btn:hover { color: rgba(245, 87, 108, 0.7); transform: scale(1.15); }
.like-btn.liked { color: #f5576c; }

.add-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.song-item:hover .add-btn { opacity: 1; }
.add-btn:hover { background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15); color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8); }

.song-duration { font-size: 12px; font-weight: 300; color: rgba(255, 255, 255, 0.25); font-variant-numeric: tabular-nums; flex-shrink: 0; }

.bottom-space { height: 40px; }

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  width: 90%;
  max-width: 400px;
  background: #141416;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  padding: 24px;
}

.modal-large { max-width: 500px; }

.modal-title { margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #fff; }

.modal-list { max-height: 300px; overflow-y: auto; }

.modal-item {
  width: 100%;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.modal-item:hover { background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.1); border-color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.15); }

.modal-item-cover { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }

.modal-empty { text-align: center; color: rgba(255, 255, 255, 0.3); padding: 16px; margin: 0; }

.modal-close {
  width: 100%;
  padding: 12px;
  margin-top: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover { background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.7); }

.modal-song-list { max-height: 400px; overflow-y: auto; }

.modal-song-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-song-item:hover { background: rgba(255, 255, 255, 0.06); }

.modal-song-cover { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }

.modal-song-info { flex: 1; min-width: 0; }
.modal-song-title { margin: 0 0 2px; font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.modal-song-artist { margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.35); }

.modal-song-play {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.7);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  flex-shrink: 0;
}

.modal-song-item:hover .modal-song-play { opacity: 1; }
</style>
