<template>
  <Teleport to="body">
    <Transition name="changelog">
      <div v-if="visible" class="changelog-overlay" @click.self="close">
        <div class="changelog-modal" :style="dynamicStyle">
          <!-- 头部 -->
          <div class="modal-header">
            <div class="header-left">
              <svg viewBox="0 0 24 24" width="22" height="22" class="header-icon">
                <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              <div>
                <h3>更新日志</h3>
                <span class="header-sub">VERSION HISTORY</span>
              </div>
            </div>
            <button class="btn-close" @click="close">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <!-- 内容区 -->
          <div class="modal-body">
            <div
              v-for="(ver, idx) in changelog"
              :key="ver.version"
              class="version-block"
              :class="{ 'is-latest': ver.isLatest }"
            >
              <!-- 版本号行 -->
              <div class="version-header">
                <div class="version-badge" :class="{ 'badge-latest': ver.isLatest }">
                  v{{ ver.version }}
                </div>
                <span class="version-date">{{ ver.date }}</span>
                <span v-if="ver.isLatest" class="latest-tag">
                  <svg viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4L2 9.4h7.6z"/></svg>
                  最新
                </span>
              </div>

              <!-- 变更列表，按类型分组 -->
              <div class="changes-container">
                <template v-for="group in getGroupedChanges(ver.changes)" :key="group.type">
                  <div v-if="group.items.length > 0" class="change-group">
                    <div class="group-label">
                      <svg viewBox="0 0 24 24" width="14" height="14" :class="'icon-' + group.type">
                        <path fill="currentColor" :d="icons[group.type]" />
                      </svg>
                      <span :class="'label-' + group.type">{{ group.label }}</span>
                    </div>
                    <ul class="change-list">
                      <li v-for="(item, i) in group.items" :key="i">
                        <span class="change-dot" :class="'dot-' + group.type"></span>
                        <span>{{ item }}</span>
                      </li>
                    </ul>
                  </div>
                </template>
              </div>

              <!-- 分隔线（非最后一项） -->
              <div v-if="idx < changelog.length - 1" class="version-divider"></div>
            </div>
          </div>

          <!-- 底部 -->
          <div class="modal-footer">
            <span>当前版本 v{{ currentVersion }}</span>
            <button class="btn-got-it" @click="close">知道了</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '../stores/player'
import { changelog, currentVersion } from '../config/changelog'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['close'])

const playerStore = usePlayerStore()

// 动态主题色
const dynamicStyle = computed(() => {
  const color = playerStore.themeColor || '#667eea'
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  return {
    '--cl-r': r,
    '--cl-g': g,
    '--cl-b': b,
  }
})

// 图标路径
const icons = {
  added: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  fixed: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  improved: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z'
}

// 类型标签
const labels = {
  added: '新增功能',
  fixed: '问题修复',
  improved: '优化改进'
}

// 按类型分组
const getGroupedChanges = (changes) => {
  const groups = ['added', 'improved', 'fixed'].map(type => ({
    type,
    label: labels[type],
    items: changes.filter(c => c.type === type).map(c => c.text)
  }))
  return groups
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.changelog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 2500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.changelog-modal {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* ==================== 头部 ==================== */
.modal-header {
  padding: 20px 24px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  color: rgba(var(--cl-r), var(--cl-g), var(--cl-b), 0.9);
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.header-left h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}

.header-sub {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

/* ==================== 内容区 ==================== */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  scrollbar-width: thin;
}

.modal-body::-webkit-scrollbar {
  width: 4px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

/* 版本块 */
.version-block {
  margin-bottom: 4px;
}

.version-block.is-latest .version-badge {
  background: rgba(var(--cl-r), var(--cl-g), var(--cl-b), 0.2);
  border-color: rgba(var(--cl-r), var(--cl-g), var(--cl-b), 0.4);
  color: rgba(var(--cl-r), var(--cl-g), var(--cl-b), 1);
}

/* 版本号行 */
.version-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.version-badge {
  padding: 4px 12px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.3px;
}

.badge-latest {
  box-shadow: 0 0 16px rgba(var(--cl-r), var(--cl-g), var(--cl-b), 0.2);
}

.version-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  font-weight: 400;
}

.latest-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 100px;
  background: rgba(var(--cl-r), var(--cl-g), var(--cl-b), 0.15);
  border: 1px solid rgba(var(--cl-r), var(--cl-g), var(--cl-b), 0.25);
  font-size: 10px;
  font-weight: 600;
  color: rgba(var(--cl-r), var(--cl-g), var(--cl-b), 1);
  letter-spacing: 0.5px;
}

.latest-tag svg {
  color: rgba(var(--cl-r), var(--cl-g), var(--cl-b), 1);
}

/* 变更分组 */
.change-group {
  margin-bottom: 12px;
}

.change-group:last-child {
  margin-bottom: 0;
}

.group-label {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 6px;
}

.group-label svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.icon-added { color: #4ade80; }
.icon-fixed { color: #fbbf24; }
.icon-improved { color: #60a5fa; }

.label-added { color: #4ade80; font-size: 12px; font-weight: 600; }
.label-fixed { color: #fbbf24; font-size: 12px; font-weight: 600; }
.label-improved { color: #60a5fa; font-size: 12px; font-weight: 600; }

/* 变更列表 */
.change-list {
  list-style: none;
  padding: 0;
  margin: 0;
  padding-left: 19px;
}

.change-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 0;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
}

.change-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 7px;
}

.dot-added { background: #4ade80; }
.dot-fixed { background: #fbbf24; }
.dot-improved { background: #60a5fa; }

/* 版本分隔线 */
.version-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 20px 0;
}

/* ==================== 底部 ==================== */
.modal-footer {
  padding: 14px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.modal-footer span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}

.btn-got-it {
  padding: 7px 20px;
  border-radius: 100px;
  border: 1px solid rgba(var(--cl-r), var(--cl-g), var(--cl-b), 0.3);
  background: rgba(var(--cl-r), var(--cl-g), var(--cl-b), 0.15);
  color: rgba(var(--cl-r), var(--cl-g), var(--cl-b), 1);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-got-it:hover {
  background: rgba(var(--cl-r), var(--cl-g), var(--cl-b), 0.25);
  transform: translateY(-1px);
}

.btn-got-it:active {
  transform: scale(0.96);
}

/* ==================== 过渡动画 ==================== */
.changelog-enter-active {
  transition: opacity 0.25s ease;
}
.changelog-enter-active .changelog-modal {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}
.changelog-leave-active {
  transition: opacity 0.2s ease;
}
.changelog-leave-active .changelog-modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.changelog-enter-from {
  opacity: 0;
}
.changelog-enter-from .changelog-modal {
  transform: scale(0.92) translateY(20px);
  opacity: 0;
}

.changelog-leave-to {
  opacity: 0;
}
.changelog-leave-to .changelog-modal {
  transform: scale(0.96) translateY(10px);
  opacity: 0;
}

/* ==================== 响应式 ==================== */
@media (max-width: 480px) {
  .changelog-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .changelog-modal {
    max-width: 100%;
    max-height: 85vh;
    border-radius: 20px 20px 0 0;
    border-bottom: none;
  }

  .changelog-enter-from .changelog-modal {
    transform: translateY(100%);
    opacity: 1;
  }

  .changelog-leave-to .changelog-modal {
    transform: translateY(100%);
    opacity: 1;
  }

  .modal-header {
    padding: 16px 20px 12px;
  }

  .modal-body {
    padding: 16px 20px;
  }

  .modal-footer {
    padding: 12px 20px;
  }
}
</style>
