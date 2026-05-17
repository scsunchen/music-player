<template>
  <div class="my-music">
    <h1 class="page-title">我的音乐</h1>

    <!-- 快捷入口 -->
    <section class="quick-access">
      <div class="quick-card liked" @click="goToLiked">
        <div class="quick-icon">❤️</div>
        <div class="quick-info">
          <h3>我喜欢</h3>
          <p>{{ likedSongs.length }} 首歌曲</p>
        </div>
        <svg class="quick-arrow" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
      </div>
      <div class="quick-card recent" @click="showRecent = true">
        <div class="quick-icon">🕐</div>
        <div class="quick-info">
          <h3>最近播放</h3>
          <p>{{ recentSongs.length }} 首歌曲</p>
        </div>
        <svg class="quick-arrow" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
      </div>
    </section>

    <!-- 创建新歌单 -->
    <div class="create-section">
      <div class="create-input-wrapper">
        <input 
          v-model="newPlaylistName"
          type="text"
          placeholder="输入歌单名称"
          class="create-input"
          @keyup.enter="createPlaylist"
        />
        <button class="create-btn" @click="createPlaylist" :disabled="!newPlaylistName.trim()">
          创建歌单
        </button>
      </div>
    </div>

    <!-- 我的歌单 -->
    <section class="section">
      <h2 class="section-title">我的歌单</h2>
      <div v-if="playerStore.customPlaylists.length > 0" class="playlist-grid">
        <div 
          v-for="playlist in playerStore.customPlaylists" 
          :key="playlist.id" 
          class="custom-playlist-card"
        >
          <div class="cover-wrapper" @click="goToPlaylist(playlist.id)">
            <img :src="playlist.cover" :alt="playlist.name" class="cover" />
            <div class="play-overlay">
              <button class="play-btn" @click.stop="playPlaylist(playlist)">
                <svg viewBox="0 0 24 24" width="32" height="32">
                  <path fill="currentColor" d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="card-info">
            <h4 class="name">{{ playlist.name }}</h4>
            <p class="meta">{{ playlist.songs.length }} 首歌曲</p>
          </div>
          <button class="delete-btn" @click="deletePlaylist(playlist.id)">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>还没有创建歌单</p>
        <p class="hint">创建一个歌单开始收藏你喜欢的歌曲吧</p>
      </div>
    </section>

    <!-- 所有歌曲 -->
    <section class="section">
      <h2 class="section-title">所有歌曲</h2>
      <div class="song-list">
        <div 
          v-for="song in playerStore.songs" 
          :key="song.id" 
          class="song-item-with-action"
        >
          <SongItem
            :song="song"
            @play="playerStore.playSong(song)"
          />
          <button class="add-btn" @click="showAddModal(song)">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

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
            {{ playlist.name }}
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
            <img :src="song.cover" :alt="song.title" class="modal-song-cover" />
            <div class="modal-song-info">
              <h4 class="modal-song-title">{{ song.title }}</h4>
              <p class="modal-song-artist">{{ song.artist }}</p>
            </div>
            <button class="modal-song-play">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
          <p v-if="recentSongs.length === 0" class="modal-empty">
            还没有播放记录
          </p>
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
import SongItem from '../components/SongItem.vue'

const router = useRouter()
const playerStore = usePlayerStore()

const newPlaylistName = ref('')
const showModal = ref(false)
const showRecent = ref(false)
const selectedSong = ref(null)

// 我喜欢的歌曲
const likedSongs = computed(() => {
  return playerStore.getLikedSongsList()
})

// 最近播放的歌曲
const recentSongs = computed(() => {
  return playerStore.getRecentSongsList()
})

// 跳转到我喜欢
const goToLiked = () => {
  router.push('/liked')
}

// 播放歌曲
const playSong = (song) => {
  playerStore.playSong(song)
}

const createPlaylist = () => {
  if (newPlaylistName.value.trim()) {
    playerStore.createPlaylist(newPlaylistName.value.trim())
    newPlaylistName.value = ''
  }
}

const goToPlaylist = (id) => {
  router.push(`/playlist/${id}`)
}

const playPlaylist = (playlist) => {
  playerStore.playPlaylist(playlist)
}

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
</script>

<style scoped>
.my-music {
  padding: 24px;
  padding-bottom: 100px;
}

.page-title {
  margin: 0 0 24px;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

/* 快捷入口 */
.quick-access {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.quick-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-card:hover {
  transform: translateY(-2px);
}

.quick-card.liked {
  background: linear-gradient(135deg, rgba(245, 87, 108, 0.2) 0%, rgba(240, 147, 251, 0.2) 100%);
  border: 1px solid rgba(245, 87, 108, 0.3);
}

.quick-card.liked:hover {
  background: linear-gradient(135deg, rgba(245, 87, 108, 0.3) 0%, rgba(240, 147, 251, 0.3) 100%);
  box-shadow: 0 8px 24px rgba(245, 87, 108, 0.2);
}

.quick-card.recent {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.quick-card.recent:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.quick-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.quick-info {
  flex: 1;
}

.quick-info h3 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.quick-info p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.quick-arrow {
  color: rgba(255, 255, 255, 0.4);
}

.create-section {
  margin-bottom: 32px;
}

.create-input-wrapper {
  display: flex;
  gap: 12px;
}

.create-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 14px;
  color: #fff;
  outline: none;
}

.create-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.create-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.create-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.create-btn:not(:disabled):hover {
  transform: scale(1.02);
}

.section {
  margin-bottom: 32px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.custom-playlist-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px;
  position: relative;
}

.cover-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  cursor: pointer;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.cover-wrapper:hover .play-overlay {
  opacity: 1;
}

.play-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.9);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.card-info {
  margin-top: 12px;
}

.name {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.meta {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.custom-playlist-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: rgba(255, 82, 82, 0.8);
  color: #fff;
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: rgba(255, 255, 255, 0.4);
}

.hint {
  font-size: 12px;
  margin-top: 8px;
}

.song-list {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
}

.song-item-with-action {
  display: flex;
  align-items: center;
}

.song-item-with-action :deep(.song-item) {
  flex: 1;
}

.add-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  margin-right: 12px;
}

.song-item-with-action:hover .add-btn {
  opacity: 1;
}

.add-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  width: 90%;
  max-width: 400px;
  background: #1a1a2e;
  border-radius: 16px;
  padding: 24px;
}

.modal-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.modal-list {
  max-height: 300px;
  overflow-y: auto;
}

.modal-item {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  margin-bottom: 8px;
  transition: background 0.2s;
}

.modal-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-empty {
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  padding: 16px;
}

.modal-close {
  width: 100%;
  padding: 12px;
  margin-top: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* 大弹窗 */
.modal-large {
  max-width: 500px;
}

.modal-song-list {
  max-height: 400px;
  overflow-y: auto;
}

.modal-song-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-song-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-song-cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.modal-song-info {
  flex: 1;
  min-width: 0;
}

.modal-song-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-song-artist {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.modal-song-play {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.8);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.modal-song-item:hover .modal-song-play {
  opacity: 1;
}

.modal-song-play:hover {
  background: rgba(102, 126, 234, 1);
}
</style>
