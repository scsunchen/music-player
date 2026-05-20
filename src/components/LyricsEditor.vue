<template>
  <div class="lyrics-editor">
    <div class="editor-header">
      <h3>歌词编辑器</h3>
      <div class="editor-actions">
        <button class="btn-action" @click="addLyricLine">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          添加行
        </button>
        <button class="btn-action primary" @click="saveLyrics">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zM6 6h9v4H6z"/>
          </svg>
          保存
        </button>
        <button class="btn-close" @click="$emit('close')">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="editor-content">
      <div class="time-controls">
        <button class="btn-time" @click="setCurrentTime" title="设置当前行为当前播放时间">
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
          </svg>
          设置时间
        </button>
        <span class="current-time">当前: {{ formatTime(currentPlayTime) }}</span>
      </div>

      <div class="lyrics-list">
        <div 
          v-for="(line, index) in lyricsLines" 
          :key="index"
          class="lyric-line"
          :class="{ active: activeLine === index }"
          @click="activeLine = index"
        >
          <div class="line-time">
            <input 
              type="text" 
              v-model="line.time" 
              placeholder="mm:ss.xx"
              @focus="activeLine = index"
            />
          </div>
          <div class="line-text">
            <input 
              type="text" 
              v-model="line.text" 
              placeholder="歌词内容"
              @focus="activeLine = index"
            />
          </div>
          <div class="line-actions">
            <button class="btn-icon" @click.stop="adjustTime(index, -0.5)" title="-0.5秒">
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path fill="currentColor" d="M19 13H5v-2h14v2z"/>
              </svg>
            </button>
            <button class="btn-icon" @click.stop="adjustTime(index, 0.5)" title="+0.5秒">
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
            <button class="btn-icon danger" @click.stop="removeLine(index)" title="删除">
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="editor-footer">
      <p class="tips">提示：点击"设置时间"按钮将当前播放进度设为选中行的时间戳</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '../stores/player'
import lyricsData from '../data/lyrics.json'

const props = defineProps({
  songId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const playerStore = usePlayerStore()
const lyricsLines = ref([])
const activeLine = ref(0)
const currentPlayTime = ref(0)

// 解析歌词
const parseLyrics = (lyricsStr) => {
  if (!lyricsStr) return []
  
  const lines = lyricsStr.split('\n')
  const result = []
  
  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
    if (match) {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      const ms = parseInt(match[3].padEnd(3, '0'))
      const time = minutes * 60 + seconds + ms / 1000
      result.push({
        time: `${match[1]}:${match[2]}.${match[3]}`,
        seconds: time,
        text: match[4].trim()
      })
    }
  }
  
  return result.sort((a, b) => a.seconds - b.seconds)
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

// 加载歌词
onMounted(() => {
  const songLyrics = lyricsData[props.songId]
  if (songLyrics?.lyrics) {
    lyricsLines.value = parseLyrics(songLyrics.lyrics)
  }
  
  // 监听播放时间
  const audio = document.querySelector('audio')
  if (audio) {
    audio.addEventListener('timeupdate', updateTime)
  }
})

onUnmounted(() => {
  const audio = document.querySelector('audio')
  if (audio) {
    audio.removeEventListener('timeupdate', updateTime)
  }
})

const updateTime = () => {
  const audio = document.querySelector('audio')
  if (audio) {
    currentPlayTime.value = audio.currentTime
  }
}

// 添加歌词行
const addLyricLine = () => {
  const newTime = formatTime(currentPlayTime.value)
  lyricsLines.value.push({
    time: newTime,
    seconds: currentPlayTime.value,
    text: ''
  })
  activeLine.value = lyricsLines.value.length - 1
}

// 删除歌词行
const removeLine = (index) => {
  lyricsLines.value.splice(index, 1)
}

// 调整时间
const adjustTime = (index, delta) => {
  const line = lyricsLines.value[index]
  line.seconds = Math.max(0, line.seconds + delta)
  line.time = formatTime(line.seconds)
}

// 设置当前时间为选中行的时间
const setCurrentTime = () => {
  if (activeLine.value >= 0 && activeLine.value < lyricsLines.value.length) {
    const line = lyricsLines.value[activeLine.value]
    line.seconds = currentPlayTime.value
    line.time = formatTime(currentPlayTime.value)
  }
}

// 保存歌词
const saveLyrics = () => {
  // 生成 LRC 格式
  const lrcLines = lyricsLines.value
    .sort((a, b) => a.seconds - b.seconds)
    .map(line => `[${line.time}]${line.text}`)
    .join('\n')
  
  // 更新 lyrics.json（实际项目中需要后端支持）
  // 这里只是演示，保存到 localStorage
  const savedLyrics = JSON.parse(localStorage.getItem('customLyrics') || '{}')
  savedLyrics[props.songId] = lrcLines
  localStorage.setItem('customLyrics', JSON.stringify(savedLyrics))
  
  emit('save', lrcLines)
  alert('歌词已保存到本地存储')
}
</script>

<style scoped>
.lyrics-editor {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  z-index: 2000;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.editor-header h3 {
  margin: 0;
  font-size: 18px;
  color: #fff;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background: rgba(255, 255, 255, 0.12);
}

.btn-action.primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
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
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.time-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
}

.btn-time {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  background: #667eea;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.current-time {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.lyrics-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lyric-line {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  transition: all 0.2s;
}

.lyric-line.active {
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.4);
}

.line-time input,
.line-text input {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 6px 8px;
  color: #fff;
  font-size: 13px;
}

.line-time input {
  width: 80px;
  text-align: center;
  font-family: monospace;
}

.line-text {
  flex: 1;
}

.line-text input {
  width: 100%;
}

.line-actions {
  display: flex;
  gap: 4px;
}

.btn-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.btn-icon.danger:hover {
  background: rgba(245, 87, 108, 0.2);
  color: #f5576c;
}

.editor-footer {
  padding: 12px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.tips {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}
</style>
