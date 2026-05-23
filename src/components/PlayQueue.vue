<template>
  <Teleport to="body">
    <Transition name="slide">
      <div v-if="playerStore.showQueue" class="queue-overlay" @click.self="playerStore.toggleQueue()">
        <div class="queue-panel">
          <div class="queue-header">
            <h3>播放队列</h3>
            <div class="queue-actions">
              <button class="btn-close" @click="playerStore.toggleQueue()">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="queue-content">
            <!-- 当前播放列表 -->
            <div v-if="playerStore.currentPlaylist.length > 0" class="queue-section">
              <div class="section-label">
                <span>当前播放列表</span>
                <span class="section-count">{{ playerStore.currentPlaylist.length }} 首</span>
              </div>
              <div class="queue-list">
                <div 
                  v-for="(song, index) in playerStore.currentPlaylist" 
                  :key="'pl-' + song.id"
                  class="queue-item"
                  :class="{ 
                    active: index === playerStore.currentIndex,
                    playing: index === playerStore.currentIndex && playerStore.isPlaying
                  }"
                  @click="playerStore.playSong(song)"
                >
                  <div class="item-index">
                    <span v-if="index !== playerStore.currentIndex">{{ index + 1 }}</span>
                    <svg v-else viewBox="0 0 24 24" width="16" height="16" class="playing-icon">
                      <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                  <img :src="song.cover" :alt="song.title" class="queue-cover" loading="lazy" />
                  <div class="queue-info">
                    <h4>{{ song.title }}</h4>
                    <p>{{ song.artist }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分隔线 -->
            <div v-if="playerStore.currentPlaylist.length > 0 && playerStore.playQueue.length > 0" class="queue-divider">
              <span>插队队列 ({{ playerStore.playQueue.length }})</span>
            </div>

            <!-- 手动添加的队列 -->
            <div v-if="playerStore.playQueue.length > 0" class="queue-section">
              <div class="section-label">
                <span>待播放</span>
                <button class="btn-clear-small" @click="playerStore.clearQueue()">清空</button>
              </div>
              <TransitionGroup name="list" tag="div" class="queue-list">
                <div 
                  v-for="(song, index) in playerStore.playQueue" 
                  :key="'q-' + song.id"
                  class="queue-item"
                  draggable="true"
                  @dragstart="onDragStart(index, $event)"
                  @dragover.prevent="onDragOver(index, $event)"
                  @drop="onDrop(index, $event)"
                  @dragend="onDragEnd"
                >
                  <div class="drag-handle">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </div>
                  <img :src="song.cover" :alt="song.title" class="queue-cover" loading="lazy" />
                  <div class="queue-info" @click="playerStore.playFromQueue(index)">
                    <h4>{{ song.title }}</h4>
                    <p>{{ song.artist }}</p>
                  </div>
                  <button class="btn-remove" @click="playerStore.removeFromQueue(index)">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
              </TransitionGroup>
            </div>

            <!-- 完全空 -->
            <div v-if="playerStore.currentPlaylist.length === 0 && playerStore.playQueue.length === 0" class="queue-empty">
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path fill="currentColor" d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
              </svg>
              <p>播放队列为空</p>
              <span>播放专辑或歌单后，歌曲会显示在这里</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { usePlayerStore } from '../stores/player'

const playerStore = usePlayerStore()

// 拖拽排序
const dragIndex = ref(-1)

const onDragStart = (index, e) => {
  dragIndex.value = index
  e.dataTransfer.effectAllowed = 'move'
}

const onDragOver = (index, e) => {
  e.dataTransfer.dropEffect = 'move'
}

const onDrop = (index, e) => {
  if (dragIndex.value !== -1 && dragIndex.value !== index) {
    playerStore.moveInQueue(dragIndex.value, index)
  }
}

const onDragEnd = () => {
  dragIndex.value = -1
}
</script>

<style scoped>
.queue-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.queue-panel {
  width: 380px;
  max-width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
}

.queue-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.queue-header h3 {
  margin: 0;
  font-size: 18px;
  color: #fff;
}

.queue-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.queue-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.queue-section {
  margin-bottom: 8px;
}

.section-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.section-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}

.btn-clear-small {
  padding: 4px 10px;
  border-radius: 12px;
  border: none;
  background: rgba(245, 87, 108, 0.15);
  color: #f5576c;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear-small:hover {
  background: rgba(245, 87, 108, 0.3);
}

.queue-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 4px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
}

.queue-divider::before,
.queue-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}

.queue-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  padding: 40px;
}

.queue-empty svg {
  margin-bottom: 16px;
}

.queue-empty p {
  margin: 0 0 8px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
}

.queue-empty span {
  font-size: 13px;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.queue-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.queue-item.active {
  background: rgba(102, 126, 234, 0.15);
}

.queue-item.active .queue-info h4 {
  color: #667eea;
}

.queue-item.playing .playing-icon {
  color: #667eea;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.item-index {
  width: 24px;
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.drag-handle {
  color: rgba(255, 255, 255, 0.3);
  cursor: grab;
  flex-shrink: 0;
}

.queue-cover {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.queue-info {
  flex: 1;
  min-width: 0;
}

.queue-info h4 {
  margin: 0 0 3px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queue-info p {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.btn-remove {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
  flex-shrink: 0;
}

.queue-item:hover .btn-remove {
  opacity: 1;
}

.btn-remove:hover {
  color: #f5576c;
  background: rgba(245, 87, 108, 0.2);
}

/* 动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-active .queue-panel,
.slide-leave-active .queue-panel {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  background: rgba(0, 0, 0, 0);
}

.slide-enter-from .queue-panel,
.slide-leave-to .queue-panel {
  transform: translateX(100%);
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}

/* 手机端适配 */
@media (max-width: 480px) {
  .queue-panel {
    width: 100%;
  }
}
</style>
