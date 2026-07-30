<template>
  <Teleport to="body">
    <Transition name="slide">
      <div v-if="playerStore.showQueue" class="queue-overlay" @click.self="playerStore.toggleQueue()">
        <div class="queue-panel" :style="dynamicStyle">
          <div class="queue-header">
            <div class="header-left">
              <span class="header-label">PLAY QUEUE</span>
              <h3>播放队列</h3>
            </div>
            <button class="btn-close" @click="playerStore.toggleQueue()">
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>

          <div class="queue-content">
            <!-- 手动添加的插队队列（置顶显示） -->
            <div v-if="playerStore.playQueue.length > 0" class="queue-section queue-section-priority">
              <div class="section-label section-label-priority">
                <span>
                  <svg viewBox="0 0 24 24" width="14" height="14" class="priority-icon"><path fill="currentColor" d="M3 10h10v2H3v-2zm0-4h10v2H3V6zm0 8h6v2H3v-2zm11-3v3h-3v2h3v3h2v-3h3v-2h-3v-3z"/></svg>
                  待播放（插队）
                </span>
                <button class="btn-clear-small" @click="playerStore.clearQueue()">清空</button>
              </div>
              <TransitionGroup name="list" tag="div" class="queue-list">
                <div
                  v-for="(song, index) in playerStore.playQueue"
                  :key="'q-' + song.id"
                  class="queue-item queue-item-drag queue-item-priority"
                  draggable="true"
                  @dragstart="onDragStart(index, $event)"
                  @dragover.prevent="onDragOver(index, $event)"
                  @drop="onDrop(index, $event)"
                  @dragend="onDragEnd"
                >
                  <div class="drag-handle">
                    <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                  </div>
                  <div class="queue-cover" @click="playerStore.playFromQueue(index)">
                    <img :src="song.cover" :alt="song.title" loading="lazy" />
                    <div class="queue-cover-play">
                      <svg viewBox="0 0 24 24" width="12" height="12"><path fill="#fff" d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                  <div class="queue-info" @click="playerStore.playFromQueue(index)">
                    <h4>{{ song.title }}</h4>
                    <p>{{ song.artist }}</p>
                  </div>
                  <button class="btn-remove" @click="playerStore.removeFromQueue(index)">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                  </button>
                </div>
              </TransitionGroup>
            </div>

            <!-- 分隔线 -->
            <div v-if="playerStore.currentPlaylist.length > 0 && playerStore.playQueue.length > 0" class="queue-divider">
              <span>播放列表</span>
            </div>

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
                >
                  <div class="item-index">
                    <span v-if="index !== playerStore.currentIndex">{{ index + 1 }}</span>
                    <svg v-else viewBox="0 0 24 24" width="16" height="16" class="playing-icon">
                      <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                  <div class="queue-cover" @click="playerStore.playSong(song)">
                    <img :src="song.cover" :alt="song.title" loading="lazy" />
                    <div class="queue-cover-play">
                      <svg viewBox="0 0 24 24" width="12" height="12"><path fill="#fff" d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                  <div class="queue-info" @click="playerStore.playSong(song)">
                    <h4>{{ song.title }}</h4>
                    <p>{{ song.artist }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 完全空 -->
            <div v-if="playerStore.currentPlaylist.length === 0 && playerStore.playQueue.length === 0" class="queue-empty">
              <div class="empty-icon">
                <svg viewBox="0 0 24 24" width="40" height="40"><path fill="currentColor" d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>
              </div>
              <p class="empty-title">播放队列为空</p>
              <span class="empty-hint">播放专辑或歌单后，歌曲会显示在这里</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '../stores/player'

const playerStore = usePlayerStore()

const dynamicStyle = computed(() => {
  const color = playerStore.themeColor || '#667eea'
  return {
    '--dynamic-r': parseInt(color.slice(1, 3), 16),
    '--dynamic-g': parseInt(color.slice(3, 5), 16),
    '--dynamic-b': parseInt(color.slice(5, 7), 16),
  }
})

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
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.queue-panel {
  width: 380px;
  max-width: 100%;
  height: 100%;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.5);
  border-left: 1px solid rgba(255, 255, 255, 0.04);
}

.queue-header {
  padding: 24px 20px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {}

.header-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.6);
  text-transform: uppercase;
  margin-bottom: 2px;
}

.header-left h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.queue-content {
  flex: 1;
  overflow-y: auto;
  padding: 4px 12px 20px;
}

.queue-section {
  margin-bottom: 8px;
}

.section-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 8px 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 500;
}

.section-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.2);
}

.btn-clear-small {
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 82, 82, 0.15);
  background: rgba(255, 82, 82, 0.06);
  color: rgba(255, 82, 82, 0.7);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear-small:hover {
  background: rgba(255, 82, 82, 0.15);
}

.queue-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  color: rgba(255, 255, 255, 0.25);
  font-size: 12px;
}

.queue-divider::before,
.queue-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
}

/* 插队队列高亮样式 */
.queue-section-priority {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.03);
  border-radius: 12px;
  padding: 2px 0;
  margin-bottom: 4px;
}

.section-label-priority {
  padding-top: 12px;
}

.section-label-priority span {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.7);
  font-weight: 600;
}

.priority-icon {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.6);
}

.queue-item-priority {
  position: relative;
}

.queue-item-priority::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  border-radius: 0 3px 3px 0;
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.5);
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s;
}

.queue-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.queue-item:hover .queue-cover-play {
  opacity: 1;
}

.queue-item.active {
  background: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.08);
  border: 1px solid rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.06);
}

.queue-item.active .queue-info h4 {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.9);
}

.queue-item.playing .playing-icon {
  color: rgba(var(--dynamic-r), var(--dynamic-g), var(--dynamic-b), 0.8);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.item-index {
  width: 24px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.15);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.drag-handle {
  color: rgba(255, 255, 255, 0.15);
  cursor: grab;
  flex-shrink: 0;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
}

.drag-handle:hover {
  color: rgba(255, 255, 255, 0.4);
}

.queue-cover {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.03);
}

.queue-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.queue-cover-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.queue-cover-play::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
}

.queue-cover-play svg {
  position: relative;
}

.queue-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.queue-info h4 {
  margin: 0 0 2px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
}

.queue-info p {
  margin: 0;
  font-size: 12px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.3);
}

.btn-remove {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.2);
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
  color: rgba(255, 82, 82, 0.8);
  background: rgba(255, 82, 82, 0.1);
}

/* 空状态 */
.queue-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 40px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.06);
  margin-bottom: 16px;
}

.empty-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
}

.empty-hint {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.2);
}

/* 动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-active .queue-panel,
.slide-leave-active .queue-panel {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
