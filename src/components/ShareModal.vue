<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="share-overlay" @click.self="close">
        <div class="share-modal">
          <div class="share-header">
            <h3>分享给好友</h3>
            <button class="btn-close" @click="close">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          
          <div class="share-content">
            <!-- 分享卡片预览 -->
            <div class="share-card">
              <img :src="shareData.image" :alt="shareData.title" class="card-image" />
              <div class="card-info">
                <h4>{{ shareData.title }}</h4>
                <p>{{ shareData.subtitle }}</p>
              </div>
            </div>
            
            <!-- 分享链接 -->
            <div class="share-link">
              <input ref="linkInput" :value="shareUrl" readonly />
              <button class="btn-copy" @click="copyLink">
                {{ copied ? '已复制' : '复制链接' }}
              </button>
            </div>
            
            <!-- 分享方式 -->
            <div class="share-methods">
              <button class="method-btn" @click="shareNative" v-if="canNativeShare">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
                <span>系统分享</span>
              </button>
              <button class="method-btn" @click="shareWeixin">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.56 2.78 4.66L4 17l2.5-1.5c.89.31 1.87.5 2.91.5.44 0 .87-.04 1.28-.11-..54-.85-1.06-1.22-1.63-.21.02-.43.04-.66.04-2.76 0-5-1.79-5-4s2.24-4 5-4 5 1.79 5 4c0 .34-.04.67-.13.98.74.37 1.42.82 2.02 1.34.35-.77.54-1.61.54-2.5 0-3.31-3.36-6-7.5-6zm11.5 8c-2.49 0-4.5 1.79-4.5 4s2.01 4 4.5 4c.59 0 1.16-.1 1.69-.28L21 21l-.78-2.34C21.92 17.56 23 15.89 23 14c0-2.21-2.24-4-5-4z"/>
                </svg>
                <span>微信</span>
              </button>
              <button class="method-btn" @click="shareQQ">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 14.5h-7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5h7c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
                </svg>
                <span>QQ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { resolveUrl } from '../utils/baseUrl'

const props = defineProps({
  visible: Boolean,
  type: {
    type: String,
    default: 'song' // 'song' | 'playlist'
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const linkInput = ref(null)
const copied = ref(false)

// 是否支持原生分享
const canNativeShare = computed(() => {
  return 'share' in navigator
})

// 分享数据
const shareData = computed(() => {
  if (props.type === 'song') {
    return {
      title: props.data.title || '未知歌曲',
      subtitle: props.data.artist || '未知歌手',
      image: props.data.cover || resolveUrl('images/default-cover.jpg')
    }
  } else {
    return {
      title: props.data.name || '未知歌单',
      subtitle: `${props.data.songs?.length || 0} 首歌曲`,
      image: props.data.cover || resolveUrl('images/default-cover.jpg')
    }
  }
})

// 生成分享链接
const shareUrl = computed(() => {
  const base = window.location.origin + (import.meta.env.BASE_URL || '/')
  if (props.type === 'song') {
    return `${base}?share=song&id=${props.data.id}`
  } else {
    return `${base}?share=playlist&id=${props.data.id}`
  }
})

// 复制链接
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (err) {
    // 降级方案
    linkInput.value.select()
    document.execCommand('copy')
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  }
}

// 原生分享
const shareNative = async () => {
  if (canNativeShare.value) {
    try {
      await navigator.share({
        title: shareData.value.title,
        text: `快来听 ${shareData.value.title} - ${shareData.value.subtitle}`,
        url: shareUrl.value
      })
    } catch (err) {
      console.log('分享取消')
    }
  }
}

// 微信分享（提示复制链接）
const shareWeixin = () => {
  copyLink()
  alert('链接已复制，请打开微信粘贴分享给好友')
}

// QQ分享
const shareQQ = () => {
  const url = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl.value)}&title=${encodeURIComponent(shareData.value.title)}&desc=${encodeURIComponent(shareData.value.subtitle)}`
  window.open(url, '_blank')
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.share-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.share-modal {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
}

.share-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.share-header h3 {
  margin: 0;
  font-size: 16px;
  color: #fff;
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

.share-content {
  padding: 20px;
}

.share-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 20px;
}

.card-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-info h4 {
  margin: 0 0 4px;
  font-size: 15px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-info p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.share-link {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.share-link input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  outline: none;
}

.btn-copy {
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-copy:hover {
  opacity: 0.9;
}

.share-methods {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.method-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.method-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.method-btn span {
  font-size: 12px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
