<template>
  <button
    v-if="showToggle"
    class="dl-toggle"
    :class="{ active: isOpen }"
    :style="toggleStyle"
    @click="toggle"
    title="桌面歌词"
  >
    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1-.01-.83.67-1.5 1.49-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
  </button>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, h, render } from 'vue'
import { usePlayerStore } from '../stores/player'

const playerStore = usePlayerStore()
const isOpen = ref(false)
const showToggle = ref(false)
let pipWindow = null
let updateRaf = null
let container = null
let storeUnsubscribe = null

const toggleStyle = computed(() => {
  const color = playerStore.themeColor || '#667eea'
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  return {
    '--dl-color': color,
    '--dl-r': r,
    '--dl-g': g,
    '--dl-b': b,
  }
})

// 检测浏览器支持
const isSupported = computed(() => {
  return !!window.documentPictureInPicture
})

// 解析歌词
const lyricsLines = computed(() => {
  if (!playerStore.currentSong) return []
  const raw = playerStore.lyricsData[playerStore.currentSong.id]?.lyrics || ''
  return raw.split('\n').filter(l => l.trim()).map(line => {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)/)
    if (match) {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      const ms = parseInt(match[3])
      const time = minutes * 60 + seconds + ms / (match[3].length === 3 ? 1000 : 100)
      const text = match[4]
      if (!text) return null
      return { time, text }
    }
    return null
  }).filter(Boolean)
})

// 当前歌词索引
const activeLineIndex = computed(() => {
  const lines = lyricsLines.value
  if (!playerStore.isPlaying || lines.length === 0) return -1
  const t = playerStore.currentTime
  for (let i = lines.length - 1; i >= 0; i--) {
    if (t >= lines[i].time) return i
  }
  return -1
})

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

// 构建 PiP 窗口内容
const buildPipContent = () => {
  const color = playerStore.themeColor || '#667eea'
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)

  container.innerHTML = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 380px;
        height: 200px;
        background: rgba(12, 12, 16, 0.88);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        color: rgba(255,255,255,0.85);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        padding: 16px 20px 12px;
        user-select: none;
        border-radius: 0;
      }

      .dl-head {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
        flex-shrink: 0;
      }
      .dl-cover {
        width: 36px; height: 36px;
        border-radius: 8px;
        background: rgba(${r},${g},${b},0.2);
        overflow: hidden;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .dl-cover img {
        width: 100%; height: 100%;
        object-fit: cover;
        display: block;
      }
      .dl-info { flex: 1; min-width: 0; }
      .dl-title {
        font-size: 13px; font-weight: 600;
        color: rgba(255,255,255,0.92);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.3;
      }
      .dl-artist {
        font-size: 11px;
        color: rgba(255,255,255,0.4);
        line-height: 1.3;
      }
      .dl-btns {
        display: flex; align-items: center; gap: 5px;
      }
      .dl-btn {
        width: 26px; height: 26px;
        border-radius: 50%;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.5);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 12px;
      }
      .dl-btn:hover {
        background: rgba(${r},${g},${b},0.15);
        color: rgba(${r},${g},${b},0.9);
      }
      .dl-btn svg { width: 12px; height: 12px; }

      .dl-lyrics {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 5px;
        min-height: 0;
      }
      .dl-line {
        font-size: 12px;
        color: rgba(255,255,255,0.2);
        line-height: 1.5;
        transition: all 0.35s ease;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 340px;
      }
      .dl-line.active {
        font-size: 15px;
        font-weight: 600;
        color: rgba(${r},${g},${b},0.95);
        text-shadow: 0 0 18px rgba(${r},${g},${b},0.3);
        letter-spacing: 0.5px;
      }
      .dl-line.next {
        color: rgba(255,255,255,0.4);
      }

      .dl-bar-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        margin-top: 8px;
      }
      .dl-time {
        font-size: 10px;
        color: rgba(255,255,255,0.2);
        font-variant-numeric: tabular-nums;
        flex-shrink: 0;
      }
      .dl-bar {
        flex: 1; height: 3px;
        background: rgba(255,255,255,0.06);
        border-radius: 999px;
        overflow: hidden;
      }
      .dl-fill {
        height: 100%;
        background: rgba(${r},${g},${b},0.85);
        border-radius: 999px;
        box-shadow: 0 0 6px rgba(${r},${g},${b},0.4);
        transition: width 0.3s linear;
      }
    </style>

    <div class="dl-head">
      <div class="dl-cover">
        <img src="${playerStore.currentSong?.cover || ''}" />
      </div>
      <div class="dl-info">
        <div class="dl-title">${playerStore.currentSong?.title || ''}</div>
        <div class="dl-artist">${playerStore.currentSong?.artist || ''}</div>
      </div>
      <div class="dl-btns">
        <div class="dl-btn" id="dl-prev">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
        </div>
        <div class="dl-btn" id="dl-play">
          <svg viewBox="0 0 24 24" fill="currentColor" class="dl-play-icon"></svg>
        </div>
        <div class="dl-btn" id="dl-next">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </div>
      </div>
    </div>

    <div class="dl-lyrics" id="dl-lyrics"></div>

    <div class="dl-bar-wrap">
      <span class="dl-time" id="dl-cur">${formatTime(playerStore.currentTime)}</span>
      <div class="dl-bar"><div class="dl-fill" id="dl-fill" style="width:${playerStore.progress || 0}%"></div></div>
      <span class="dl-time" id="dl-dur">${formatTime(playerStore.duration)}</span>
    </div>
  `

  // 绑定按钮事件
  const prevBtn = container.querySelector('#dl-prev')
  const playBtn = container.querySelector('#dl-play')
  const nextBtn = container.querySelector('#dl-next')
  if (prevBtn) prevBtn.onclick = () => playerStore.prevSong()
  if (playBtn) playBtn.onclick = () => playerStore.togglePlay()
  if (nextBtn) nextBtn.onclick = () => playerStore.nextSong()
}

// 更新 PiP 窗口（轻量更新，不重建 DOM）
const updatePip = () => {
  if (!pipWindow || pipWindow.closed) {
    closePip()
    return
  }

  const lyricsEl = container.querySelector('#dl-lyrics')
  const fillEl = container.querySelector('#dl-fill')
  const curEl = container.querySelector('#dl-cur')
  const playIcon = container.querySelector('.dl-play-icon')
  const titleEl = container.querySelector('.dl-title')
  const artistEl = container.querySelector('.dl-artist')
  const coverImg = container.querySelector('.dl-cover img')

  if (playIcon) {
    if (playerStore.isPlaying) {
      playIcon.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z')
    } else {
      playIcon.setAttribute('d', 'M8 5v14l11-7z')
    }
  }

  if (playerStore.currentSong) {
    if (titleEl) titleEl.textContent = playerStore.currentSong.title
    if (artistEl) artistEl.textContent = playerStore.currentSong.artist
    if (coverImg) coverImg.src = playerStore.currentSong.cover
  }

  if (fillEl) fillEl.style.width = `${playerStore.progress || 0}%`
  if (curEl) curEl.textContent = formatTime(playerStore.currentTime)

  // 歌词渲染
  if (lyricsEl) {
    const lines = lyricsLines.value
    const activeIdx = activeLineIndex.value

    let html = ''
    for (let i = 0; i < lines.length; i++) {
      let cls = 'dl-line'
      if (i === activeIdx) cls += ' active'
      else if (i === activeIdx + 1) cls += ' next'
      else if (i === activeIdx - 1) cls += '' // 紧邻上一行保留
      else continue // 只显示3行

      html += `<div class="${cls}">${lines[i].text}</div>`
    }

    // 如果没有任何 active，显示前两行
    if (activeIdx < 0 && lines.length > 0) {
      html = ''
      for (let i = 0; i < Math.min(2, lines.length); i++) {
        html += `<div class="dl-line">${lines[i].text}</div>`
      }
    }

    lyricsEl.innerHTML = html
  }
}

// 定时更新（跟随播放进度）
const startUpdateLoop = () => {
  const loop = () => {
    updatePip()
    updateRaf = requestAnimationFrame(loop)
  }
  updateRaf = requestAnimationFrame(loop)
}

const stopUpdateLoop = () => {
  if (updateRaf) {
    cancelAnimationFrame(updateRaf)
    updateRaf = null
  }
}

const openPip = async () => {
  if (!isSupported.value) {
    alert('您的浏览器不支持桌面歌词功能，请使用 Chrome 116+ 或 Edge 116+')
    return
  }

  try {
    pipWindow = await window.documentPictureInPicture.requestWindow({
      width: 380,
      height: 200,
    })

    // 创建样式和内容容器
    const style = pipWindow.document.createElement('style')
    container = pipWindow.document.createElement('div')
    pipWindow.document.body.appendChild(style)
    pipWindow.document.body.appendChild(container)

    buildPipContent()
    startUpdateLoop()

    pipWindow.addEventListener('pagehide', () => {
      closePip()
    })

    isOpen.value = true
  } catch (err) {
    console.error('桌面歌词打开失败:', err)
    isOpen.value = false
  }
}

const closePip = () => {
  stopUpdateLoop()
  if (pipWindow && !pipWindow.closed) {
    pipWindow.close()
  }
  pipWindow = null
  container = null
  isOpen.value = false
}

const toggle = () => {
  if (isOpen.value) {
    closePip()
  } else {
    openPip()
  }
}

// 监听 store 变化以更新主题色
watch(() => playerStore.themeColor, () => {
  if (isOpen.value && container) {
    buildPipContent()
  }
})

// 监听歌曲切换
watch(() => playerStore.currentSong?.id, () => {
  if (isOpen.value && container) {
    buildPipContent()
  }
})

// 初始化时检测支持
onBeforeUnmount(() => {
  closePip()
})

// 延迟显示按钮（避免无播放时的干扰）
watch(() => playerStore.currentSong, (song) => {
  showToggle.value = !!song && isSupported.value
}, { immediate: true })

watch(isSupported, (val) => {
  showToggle.value = val && !!playerStore.currentSong
})
</script>

<style scoped>
.dl-toggle {
  position: fixed;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  z-index: 1000;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.dl-toggle:hover {
  background: rgba(var(--dl-r, 139), var(--dl-g, 92), var(--dl-b, 246), 0.15);
  color: rgba(var(--dl-r, 139), var(--dl-g, 92), var(--dl-b, 246), 0.9);
  border-color: rgba(var(--dl-r, 139), var(--dl-g, 92), var(--dl-b, 246), 0.25);
  transform: translateY(-50%) scale(1.08);
}

.dl-toggle.active {
  background: rgba(var(--dl-r, 139), var(--dl-g, 92), var(--dl-b, 246), 0.2);
  color: rgba(var(--dl-r, 139), var(--dl-g, 92), var(--dl-b, 246), 0.95);
  border-color: rgba(var(--dl-r, 139), var(--dl-g, 92), var(--dl-b, 246), 0.3);
  box-shadow: 0 0 16px rgba(var(--dl-r, 139), var(--dl-g, 92), var(--dl-b, 246), 0.2);
}
</style>
