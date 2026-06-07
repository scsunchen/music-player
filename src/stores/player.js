import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { resolveUrl } from '../utils/baseUrl'

// 异步保存工具函数（不阻塞主线程）
const pendingSaves = new Map()
const saveAsync = (key, data, delay = 100) => {
  // 合并同一 key 的多次保存请求
  pendingSaves.set(key, { data, delay })
  
  // 使用 requestIdleCallback 或 setTimeout fallback
  const doSave = () => {
    const pending = pendingSaves.get(key)
    if (pending) {
      try {
        localStorage.setItem(key, JSON.stringify(pending.data))
        pendingSaves.delete(key)
      } catch (e) {
        console.warn('localStorage 保存失败:', e)
      }
    }
  }
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(doSave, { timeout: 2000 })
  } else {
    setTimeout(doSave, delay)
  }
}

export const usePlayerStore = defineStore('player', () => {
  // 数据（运行时从 JSON 文件加载）
  const songs = ref([])
  const albums = ref([])
  const recommendPlaylists = ref([])

  // 歌词数据
  const lyricsData = ref({})

  // 数据加载状态
  const dataLoaded = ref(false)
  const dataLoadError = ref(null)

  // 运行时加载歌曲和歌词数据（从 public/data/ 目录）
  const loadSongData = async () => {
    try {
      const baseUrl = import.meta.env.BASE_URL || '/'
      const resolvePaths = (data) => {
        if (Array.isArray(data)) {
          return data.map(item => resolvePaths(item))
        }
        if (data && typeof data === 'object') {
          const result = {}
          for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string' && value.startsWith('/music-player/')) {
              result[key] = resolveUrl(value.replace('/music-player/', ''))
            } else {
              result[key] = resolvePaths(value)
            }
          }
          return result
        }
        return data
      }

      // 并行加载歌曲数据和歌词数据
      const [songsRes, lyricsRes] = await Promise.all([
        fetch(resolveUrl('data/songs.json')),
        fetch(resolveUrl('data/lyrics.json')).catch(() => null)
      ])

      if (!songsRes.ok) throw new Error(`加载歌曲数据失败: ${songsRes.status}`)
      const songData = await songsRes.json()

      songs.value = resolvePaths(songData.songs)
      albums.value = resolvePaths(songData.albums)
      recommendPlaylists.value = resolvePaths(songData.recommendPlaylists)

      // 加载歌词（允许失败）
      if (lyricsRes && lyricsRes.ok) {
        lyricsData.value = await lyricsRes.json()
      }

      dataLoaded.value = true
    } catch (e) {
      console.error('加载歌曲数据失败:', e)
      dataLoadError.value = e.message
    }
  }
  
  // 自定义播放列表
  const customPlaylists = ref([])
  
  // 当前播放状态
  const currentSong = ref(null)
  const currentPlaylist = ref([])
  const currentIndex = ref(-1)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.5)
  const playMode = ref('list') // list, shuffle, repeat
  
  // 无缝播放
  const seamlessPlay = ref(false) // 开关
  const crossfadeDuration = 5 // 交叉淡入淡出时长（秒）
  let nextAudioElement = null // 下一首音频元素
  let crossfadeTimer = null // 淡入淡出定时器
  let seamlessCheckTimer = null // 检查定时器
  
  // 主题色
  const themeColor = ref('#667eea')
  
  // 播放队列（独立的待播放列表）
  const playQueue = ref([])
  const showQueue = ref(false)

  // 封面颜色缓存
  const coverColorCache = new Map()

  const extractColorFromCover = (coverUrl) => {
    // 检查缓存
    if (coverColorCache.has(coverUrl)) {
      themeColor.value = coverColorCache.get(coverUrl)
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 50
      canvas.height = 50
      ctx.drawImage(img, 0, 0, 50, 50)
      const data = ctx.getImageData(0, 0, 50, 50).data
      let r = 0, g = 0, b = 0, count = 0
      for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
        count++
      }
      r = Math.round(r / count)
      g = Math.round(g / count)
      b = Math.round(b / count)
      // Make color more saturated and darker for background
      const max = Math.max(r, g, b)
      const boost = 1.3
      if (max > 0) {
        r = Math.min(255, Math.round((r / max) * 180 * boost))
        g = Math.min(255, Math.round((g / max) * 140 * boost))
        b = Math.min(255, Math.round((b / max) * 200 * boost))
      }
      const color = `rgb(${r}, ${g}, ${b})`
      themeColor.value = color
      // 缓存结果
      coverColorCache.set(coverUrl, color)
    }
    img.onerror = () => {
      themeColor.value = '#667eea'
    }
    img.src = coverUrl
  }

  // Audio 元素
  let audioElement = null
  
  // 流式加载缓冲进度
  const bufferedProgress = ref(0)
  
  // 初始化 Audio 元素
  const initAudio = () => {
    if (!audioElement) {
      audioElement = new Audio()
      audioElement.preload = 'metadata' // 流式加载：只预加载元数据
      audioElement.crossOrigin = 'anonymous' // 允许 Web Audio API 跨域分析频谱
      // 确保音量在有效范围 0-1
      audioElement.volume = Math.max(0, Math.min(1, volume.value))
      audioElement.addEventListener('timeupdate', () => {
        currentTime.value = audioElement.currentTime
        updateMediaSessionPosition()
        // 无缝播放：接近结束时开始交叉淡入淡出
        if (seamlessPlay.value && audioElement.duration > 0) {
          const remaining = audioElement.duration - audioElement.currentTime
          if (remaining <= crossfadeDuration && remaining > 0 && !nextAudioElement) {
            startCrossfade()
          }
        }
      })
      audioElement.addEventListener('loadedmetadata', () => {
        duration.value = audioElement.duration
      })
      // 缓冲进度更新
      audioElement.addEventListener('progress', () => {
        if (audioElement.buffered.length > 0) {
          const bufferedEnd = audioElement.buffered.end(audioElement.buffered.length - 1)
          bufferedProgress.value = (bufferedEnd / audioElement.duration) * 100
        }
      })
      audioElement.addEventListener('ended', () => {
        // 防抖：避免 Chrome 页签激活时恢复播放导致误触发 ended
        // 如果音频实际播放时间不足 1 秒就 ended，说明不是正常播放完毕，跳过
        const playedDuration = audioElement.currentTime || 0
        if (playedDuration < 1 && audioElement.duration > 10) {
          console.log('ended 事件被忽略（播放时间过短，可能是页签恢复触发）')
          return
        }
        nextSong(true)
      })
      audioElement.addEventListener('pause', () => {
        // 当音频暂停时（非用户主动暂停），更新状态
        if (isPlaying.value && audioElement.ended === false) {
          // 用户可能通过其他方式暂停了音频
        }
      })
      audioElement.addEventListener('play', () => {
        isPlaying.value = true
      })
      audioElement.addEventListener('error', (e) => {
        // CORS 导致加载失败时，移除 crossOrigin 重试
        if (audioElement.crossOrigin && !audioElement.src.startsWith('blob:')) {
          console.warn('CORS 加载失败，移除 crossOrigin 重试:', currentSong.value?.audioUrl)
          audioElement.crossOrigin = null
          audioElement.load()
          return
        }
        console.error('音频加载失败:', currentSong.value?.audioUrl, e)
        isPlaying.value = false
      })
    }
    return audioElement
  }
  
  // 获取 Audio 元素的方法
  const getAudioElement = () => {
    return initAudio()
  }

  // 计算属性
  const currentSongInfo = computed(() => currentSong.value)
  
  const progress = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })
  
  // 方法
  let playRequestIndex = 0

  const playSong = (song) => {
    // 参数校验
    if (!song || !song.audioUrl) {
      console.error('无效的歌曲对象:', song)
      return
    }

    const requestId = ++playRequestIndex
    const audio = initAudio()
    
    // 重置缓冲进度
    bufferedProgress.value = 0
    
    // 先暂停当前播放，避免 play() 冲突
    if (!audio.paused) {
      audio.pause()
    }
    
    currentSong.value = song
    
    // 更新当前播放索引
    const idx = currentPlaylist.value.findIndex(s => s.id === song.id)
    if (idx !== -1) {
      currentIndex.value = idx
    }
    // 确保 currentIndex 在有效范围内
    if (currentIndex.value >= currentPlaylist.value.length) {
      currentIndex.value = 0
    }
    
    audio.src = song.audioUrl
    audio.volume = volume.value
    extractColorFromCover(song.cover)
    addToRecent(song.id) // 添加到最近播放
    updateMediaSession(song) // 更新锁屏控制
    recordPlay(song) // 记录播放统计
    
    let played = false
    
    const doPlay = () => {
      if (played || requestId !== playRequestIndex) return
      played = true
      audio.play().then(() => {
        if (requestId === playRequestIndex) {
          isPlaying.value = true
          preloadNextSong()
        }
      }).catch(err => {
        if (requestId === playRequestIndex) {
          console.error('播放失败:', err)
          isPlaying.value = false
        }
      })
    }
    
    const onCanPlay = () => {
      audio.removeEventListener('canplay', onCanPlay)
      doPlay()
    }
    
    audio.addEventListener('canplay', onCanPlay)
    
    // 超时处理：如果3秒内无法播放，尝试直接播放
    setTimeout(() => {
      audio.removeEventListener('canplay', onCanPlay)
      doPlay()
    }, 3000)
  }

  // 预加载下一首歌曲
  let preloadAudio = null

  const preloadNextSong = () => {
    if (currentPlaylist.value.length === 0) return
    
    // 销毁旧的预加载元素
    if (preloadAudio) {
      preloadAudio.src = ''
      preloadAudio.load()
      preloadAudio = null
    }
    
    // 优先预加载队列中的歌曲
    let targetSong = null
    if (playQueue.value.length > 0) {
      targetSong = playQueue.value[0]
    } else {
      const nextIndex = (currentIndex.value + 1) % currentPlaylist.value.length
      targetSong = currentPlaylist.value[nextIndex]
    }
    
    if (targetSong && targetSong.audioUrl) {
      preloadAudio = new Audio()
      preloadAudio.preload = 'metadata'
      preloadAudio.src = targetSong.audioUrl
      // 只加载元数据（时长等），不下载全部音频数据
      console.log('预加载:', targetSong.title)
    }
  }

  // 无缝播放：获取下一首歌曲
  const getNextSong = () => {
    if (currentPlaylist.value.length === 0) return null
    
    let nextIndex
    if (playQueue.value.length > 0) {
      return playQueue.value[0]
    } else if (playMode.value === 'shuffle') {
      nextIndex = Math.floor(Math.random() * currentPlaylist.value.length)
    } else {
      nextIndex = (currentIndex.value + 1) % currentPlaylist.value.length
    }
    
    return currentPlaylist.value[nextIndex]
  }

  // 无缝播放：开始交叉淡入淡出
  const startCrossfade = () => {
    const nextSong = getNextSong()
    if (!nextSong || !nextSong.audioUrl) return
    
    console.log('无缝播放：开始交叉淡入淡出', nextSong.title)
    
    // 创建新的音频元素
    nextAudioElement = new Audio()
    nextAudioElement.crossOrigin = 'anonymous'
    nextAudioElement.volume = 0
    nextAudioElement.src = nextSong.audioUrl
    
    // 等待加载完成
    nextAudioElement.addEventListener('canplay', () => {
      if (!nextAudioElement) return
      
      nextAudioElement.play().then(() => {
        // 开始交叉淡入淡出
        performCrossfade(nextSong)
      }).catch(err => {
        console.error('无缝播放：下一首播放失败', err)
        cleanupCrossfade()
      })
    }, { once: true })
    
    // 加载音频
    nextAudioElement.load()
  }

  // 无缝播放：执行交叉淡入淡出
  const performCrossfade = (nextSong) => {
    const steps = 20 // 淡出步数
    const stepDuration = (crossfadeDuration * 1000) / steps
    let currentStep = 0
    
    crossfadeTimer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      
      // 当前歌曲音量逐渐降低
      if (audioElement) {
        audioElement.volume = Math.max(0, volume.value * (1 - progress))
      }
      
      // 下一首音量逐渐升高
      if (nextAudioElement) {
        nextAudioElement.volume = Math.min(volume.value, volume.value * progress)
      }
      
      // 淡入淡出完成
      if (currentStep >= steps) {
        clearInterval(crossfadeTimer)
        crossfadeTimer = null
        
        // 切换到下一首
        completeCrossfade(nextSong)
      }
    }, stepDuration)
  }

  // 无缝播放：完成切换
  const completeCrossfade = (nextSong) => {
    // 停止旧音频
    if (audioElement) {
      audioElement.pause()
      audioElement.src = ''
      audioElement.load()
    }
    
    // 新音频成为当前音频
    audioElement = nextAudioElement
    nextAudioElement = null
    
    // 恢复音量
    audioElement.volume = volume.value
    
    // 更新状态
    currentSong.value = nextSong
    currentIndex.value = currentPlaylist.value.findIndex(s => s.id === nextSong.id)
    isPlaying.value = true
    
    // 重新绑定事件
    bindAudioEvents()
    
    // 更新其他状态
    extractColorFromCover(nextSong.cover)
    addToRecent(nextSong.id)
    updateMediaSession(nextSong)
    recordPlay(nextSong)
    
    console.log('无缝播放：已切换到', nextSong.title)
  }

  // 无缝播放：重新绑定音频事件
  const bindAudioEvents = () => {
    if (!audioElement) return
    
    audioElement.addEventListener('timeupdate', () => {
      currentTime.value = audioElement.currentTime
      updateMediaSessionPosition()
      if (seamlessPlay.value && audioElement.duration > 0) {
        const remaining = audioElement.duration - audioElement.currentTime
        if (remaining <= crossfadeDuration && remaining > 0 && !nextAudioElement) {
          startCrossfade()
        }
      }
    })
    
    audioElement.addEventListener('loadedmetadata', () => {
      duration.value = audioElement.duration
    })
    
    audioElement.addEventListener('progress', () => {
      if (audioElement.buffered.length > 0) {
        const bufferedEnd = audioElement.buffered.end(audioElement.buffered.length - 1)
        bufferedProgress.value = (bufferedEnd / audioElement.duration) * 100
      }
    })
    
    audioElement.addEventListener('ended', () => {
      const playedDuration = audioElement.currentTime || 0
      if (playedDuration < 1 && audioElement.duration > 10) {
        console.log('ended 事件被忽略（播放时间过短）')
        return
      }
      // 无缝播放模式下，不触发 nextSong，因为已经通过交叉淡入淡出切换了
      if (!seamlessPlay.value) {
        nextSong(true)
      }
    })
    
    audioElement.addEventListener('play', () => {
      isPlaying.value = true
    })
    
    audioElement.addEventListener('pause', () => {
      // 仅更新状态，不处理
    })
    
    audioElement.addEventListener('error', (e) => {
      if (audioElement.crossOrigin && !audioElement.src.startsWith('blob:')) {
        audioElement.crossOrigin = null
        audioElement.load()
        return
      }
      console.error('音频加载失败:', currentSong.value?.audioUrl, e)
      isPlaying.value = false
    })
  }

  // 无缝播放：清理
  const cleanupCrossfade = () => {
    if (crossfadeTimer) {
      clearInterval(crossfadeTimer)
      crossfadeTimer = null
    }
    if (nextAudioElement) {
      nextAudioElement.pause()
      nextAudioElement.src = ''
      nextAudioElement.load()
      nextAudioElement = null
    }
  }

  // 切换无缝播放开关
  const toggleSeamless = () => {
    seamlessPlay.value = !seamlessPlay.value
    // 保存到 localStorage
    try {
      localStorage.setItem('seamlessPlay', JSON.stringify(seamlessPlay.value))
    } catch (e) {
      console.warn('保存无缝播放设置失败:', e)
    }
  }

  // Media Session API - 锁屏控制
  const updateMediaSession = (song) => {
    if (!('mediaSession' in navigator)) return

    try {
      // 确保封面 URL 是绝对路径
      const coverUrl = song.cover.startsWith('http') 
        ? song.cover 
        : window.location.origin + song.cover

      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album,
        artwork: [
          { src: coverUrl, sizes: '512x512', type: 'image/jpeg' },
          { src: coverUrl, sizes: '192x192', type: 'image/jpeg' }
        ]
      })

      navigator.mediaSession.setActionHandler('play', () => {
        const audio = initAudio()
        audio.play()
        isPlaying.value = true
        navigator.mediaSession.playbackState = 'playing'
      })

      navigator.mediaSession.setActionHandler('pause', () => {
        const audio = initAudio()
        audio.pause()
        isPlaying.value = false
        navigator.mediaSession.playbackState = 'paused'
      })

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        prevSong()
      })

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextSong()
      })

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        const audio = initAudio()
        const time = details.seekTime || 0
        audio.currentTime = time
        currentTime.value = time
        if (details.fastSeek && 'fastSeek' in audio) {
          audio.fastSeek(time)
        }
      })

      // 初始状态
      navigator.mediaSession.playbackState = 'playing'
    } catch (e) {
      console.log('Media Session 初始化失败:', e)
    }
  }

  // 更新 Media Session 播放状态
  const updateMediaSessionState = () => {
    if (!('mediaSession' in navigator)) return
    try {
      navigator.mediaSession.playbackState = isPlaying.value ? 'playing' : 'paused'
    } catch (e) {}
  }

  // 更新 Media Session 进度位置
  const updateMediaSessionPosition = () => {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return
    try {
      if (duration.value && isFinite(duration.value)) {
        navigator.mediaSession.setPositionState({
          duration: duration.value,
          playbackRate: 1.0,
          position: currentTime.value
        })
      }
    } catch (e) {}
  }
  
  const playPlaylist = (playlist, startIndex = 0) => {
    currentPlaylist.value = playlist.songs.map(id => 
      songs.value.find(s => s.id === id)
    ).filter(Boolean)
    currentIndex.value = startIndex
    if (currentPlaylist.value.length > 0) {
      playSong(currentPlaylist.value[startIndex])
    }
  }
  
  const playAlbum = (album) => {
    currentPlaylist.value = album.songs.map(id => 
      songs.value.find(s => s.id === id)
    ).filter(Boolean)
    currentIndex.value = 0
    if (currentPlaylist.value.length > 0) {
      playSong(currentPlaylist.value[0])
    }
  }
  
  const togglePlay = () => {
    const audio = initAudio()
    if (isPlaying.value) {
      audio.pause()
      isPlaying.value = false
    } else {
      if (currentSong.value) {
        audio.play().then(() => {
          isPlaying.value = true
        }).catch(err => {
          console.error('恢复播放失败:', err)
        })
      }
    }
    updateMediaSessionState()
  }
  
  // ===== 淡入淡出效果 =====
  const crossfadeDuration = 800 // 淡入淡出时长（毫秒）
  
  const fadeOut = (audio) => {
    return new Promise((resolve) => {
      const startVolume = audio.volume
      const startTime = Date.now()
      
      const fade = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / crossfadeDuration, 1)
        audio.volume = startVolume * (1 - progress)
        
        if (progress < 1) {
          requestAnimationFrame(fade)
        } else {
          audio.pause()
          audio.volume = startVolume // 恢复音量
          resolve()
        }
      }
      
      requestAnimationFrame(fade)
    })
  }
  
  const fadeIn = (audio, targetVolume) => {
    const startTime = Date.now()
    audio.volume = 0
    audio.play().catch(() => {})
    
    const fade = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / crossfadeDuration, 1)
      audio.volume = targetVolume * progress
      
      if (progress < 1) {
        requestAnimationFrame(fade)
      }
    }
    
    requestAnimationFrame(fade)
  }
  
  const nextSong = (isAutoPlay = false) => {
    // 调试日志
    console.log('nextSong 被调用', {
      isAutoPlay,
      queueLength: playQueue.value.length,
      playlistLength: currentPlaylist.value.length,
      currentIndex: currentIndex.value,
      playMode: playMode.value,
      currentSong: currentSong.value?.title
    })
    
    // 优先播放队列中的歌曲
    if (playQueue.value.length > 0) {
      const queueSong = playQueue.value.shift()
      savePlayQueue()
      playSong(queueSong)
      return
    }

    // 单曲循环：仅自动播放时循环，手动点击"下一首"正常切歌
    if (playMode.value === 'repeat' && isAutoPlay) {
      const audio = initAudio()
      audio.currentTime = 0
      audio.play().then(() => {
        isPlaying.value = true
      }).catch(err => {
        console.error('单曲循环播放失败:', err)
        isPlaying.value = false
      })
      return
    }

    if (currentPlaylist.value.length === 0) {
      // 没有播放列表，停止播放
      console.log('播放列表为空，停止播放')
      isPlaying.value = false
      return
    }

    // 只有一首歌时，直接重新开始播放（不切换）
    if (currentPlaylist.value.length === 1) {
      console.log('只有一首歌，重新开始播放')
      const audio = initAudio()
      audio.currentTime = 0
      audio.play().then(() => {
        isPlaying.value = true
      }).catch(err => {
        console.error('播放失败:', err)
        isPlaying.value = false
      })
      return
    }

    // 淡出当前歌曲
    const currentAudio = initAudio()
    fadeOut(currentAudio).then(() => {
      // 播放下一首
      if (playMode.value === 'shuffle') {
        const randomIndex = Math.floor(Math.random() * currentPlaylist.value.length)
        currentIndex.value = randomIndex
      } else {
        currentIndex.value = (currentIndex.value + 1) % currentPlaylist.value.length
      }
      
      const nextSongData = currentPlaylist.value[currentIndex.value]
      if (nextSongData) {
        currentSong.value = nextSongData
        const newAudio = initAudio()
        newAudio.src = nextSongData.audioUrl
        extractColorFromCover(nextSongData.cover)
        addToRecent(nextSongData.id)
        updateMediaSession(nextSongData)
        recordPlay(nextSongData)
        newAudio.load()
        fadeIn(newAudio, volume.value)
        isPlaying.value = true
        preloadNextSong()
      }
    })
  }
  
  const prevSong = () => {
    if (currentPlaylist.value.length === 0) return

    // 只有一首歌时，直接重新开始播放（不切换）
    if (currentPlaylist.value.length === 1) {
      const audio = initAudio()
      audio.currentTime = 0
      audio.play().then(() => {
        isPlaying.value = true
      }).catch(err => {
        console.error('播放失败:', err)
        isPlaying.value = false
      })
      return
    }
    
    if (playMode.value === 'shuffle') {
      const randomIndex = Math.floor(Math.random() * currentPlaylist.value.length)
      currentIndex.value = randomIndex
      playSong(currentPlaylist.value[randomIndex])
    } else {
      currentIndex.value = currentIndex.value - 1 < 0 
        ? currentPlaylist.value.length - 1 
        : currentIndex.value - 1
      playSong(currentPlaylist.value[currentIndex.value])
    }
  }
  
  const seekTo = (time) => {
    const audio = initAudio()
    audio.currentTime = time
    currentTime.value = time
  }
  
  const setVolume = (val) => {
    const audio = initAudio()
    // 限制音量范围 0-1
    const clampedVal = Math.max(0, Math.min(1, val))
    volume.value = clampedVal
    audio.volume = clampedVal
  }
  
  const togglePlayMode = () => {
    const modes = ['list', 'shuffle', 'repeat']
    const currentModeIndex = modes.indexOf(playMode.value)
    playMode.value = modes[(currentModeIndex + 1) % modes.length]
  }
  
  // 播放队列管理
  const addToQueue = (song) => {
    if (!playQueue.value.find(s => s.id === song.id)) {
      playQueue.value.push(song)
      savePlayQueue()
    }
  }
  
  const removeFromQueue = (index) => {
    playQueue.value.splice(index, 1)
    savePlayQueue()
  }
  
  const clearQueue = () => {
    playQueue.value = []
    savePlayQueue()
  }
  
  const playFromQueue = (index) => {
    if (playQueue.value[index]) {
      playSong(playQueue.value[index])
      playQueue.value.splice(index, 1)
      savePlayQueue()
    }
  }
  
  const moveInQueue = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return
    const [item] = playQueue.value.splice(fromIndex, 1)
    playQueue.value.splice(toIndex, 0, item)
    savePlayQueue()
  }
  
  const toggleQueue = () => {
    showQueue.value = !showQueue.value
  }
  
  // 队列持久化
  const savePlayQueue = () => {
    // 只存ID数组，避免数据冗余和格式不一致
    const ids = playQueue.value.map(s => s.id)
    saveAsync('playQueue', ids)
  }
  
  const loadPlayQueue = () => {
    const saved = localStorage.getItem('playQueue')
    if (saved) {
      try {
        const ids = JSON.parse(saved)
        playQueue.value = ids.map(id => songs.value.find(s => s.id === id)).filter(Boolean)
      } catch (e) {}
    }
  }
  
  // 自定义播放列表管理
  const createPlaylist = (name) => {
    const newPlaylist = {
      id: Date.now(),
      name,
      description: '',
      cover: resolveUrl('images/covers/guofeng.jpg'),
      songs: [],
      playCount: 0
    }
    customPlaylists.value.push(newPlaylist)
    saveCustomPlaylists()
    return newPlaylist
  }
  
  const addToPlaylist = (playlistId, songId) => {
    const playlist = customPlaylists.value.find(p => p.id === playlistId)
    if (playlist && !playlist.songs.includes(songId)) {
      playlist.songs.push(songId)
      saveCustomPlaylists()
    }
  }
  
  const removeFromPlaylist = (playlistId, songId) => {
    const playlist = customPlaylists.value.find(p => p.id === playlistId)
    if (playlist) {
      playlist.songs = playlist.songs.filter(id => id !== songId)
      saveCustomPlaylists()
    }
  }
  
  const deletePlaylist = (playlistId) => {
    customPlaylists.value = customPlaylists.value.filter(p => p.id !== playlistId)
    saveCustomPlaylists()
  }
  
  const saveCustomPlaylists = () => {
    saveAsync('customPlaylists', customPlaylists.value)
  }
  
  const loadCustomPlaylists = () => {
    const saved = localStorage.getItem('customPlaylists')
    if (saved) {
      customPlaylists.value = JSON.parse(saved)
    }
  }

  // 我喜欢功能
  const likedSongs = ref([])

  const loadLikedSongs = () => {
    const saved = localStorage.getItem('likedSongs')
    if (saved) {
      likedSongs.value = JSON.parse(saved)
    }
  }

  const saveLikedSongs = () => {
    saveAsync('likedSongs', likedSongs.value)
  }

  const toggleLikeSong = (songId) => {
    const index = likedSongs.value.indexOf(songId)
    if (index > -1) {
      likedSongs.value.splice(index, 1)
    } else {
      likedSongs.value.push(songId)
    }
    saveLikedSongs()
  }

  const isLiked = (songId) => {
    return likedSongs.value.includes(songId)
  }

  const getLikedSongsList = () => {
    return likedSongs.value.map(id => songs.value.find(s => s.id === id)).filter(Boolean)
  }

  // 最近播放功能
  const recentSongs = ref([])

  const loadRecentSongs = () => {
    const saved = localStorage.getItem('recentSongs')
    if (saved) {
      recentSongs.value = JSON.parse(saved)
    }
  }

  const saveRecentSongs = () => {
    saveAsync('recentSongs', recentSongs.value.slice(0, 50))
  }

  const addToRecent = (songId) => {
    const index = recentSongs.value.indexOf(songId)
    if (index > -1) {
      recentSongs.value.splice(index, 1)
    }
    recentSongs.value.unshift(songId)
    if (recentSongs.value.length > 50) {
      recentSongs.value.pop()
    }
    saveRecentSongs()
  }

  const getRecentSongsList = () => {
    return recentSongs.value
      .map(id => songs.value.find(s => s.id === id))
      .filter(Boolean)
  }

  // ===== 播放统计 =====
  const playStats = ref({
    totalPlays: 0,         // 总播放次数
    totalDuration: 0,      // 总播放时长（秒）
    dailyPlays: {},        // 每日播放次数 { "2026-05-20": 5 }
    songPlays: {},         // 每首歌播放次数 { "152": 10 }
    artistPlays: {},       // 每个歌手播放次数
    weekStart: '',         // 本周开始日期
    weekPlays: 0,          // 本周播放次数
    weekDuration: 0,       // 本周播放时长
  })

  const loadPlayStats = () => {
    const saved = localStorage.getItem('playStats')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        playStats.value = { ...playStats.value, ...parsed }
      } catch (e) {}
    }
    // 检查是否需要重置周统计
    const today = new Date()
    const weekStart = getWeekStart(today)
    if (playStats.value.weekStart !== weekStart) {
      playStats.value.weekStart = weekStart
      playStats.value.weekPlays = 0
      playStats.value.weekDuration = 0
      savePlayStats()
    }
  }

  const savePlayStats = () => {
    saveAsync('playStats', playStats.value)
  }

  const getWeekStart = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // 周一开始
    const monday = new Date(d.setDate(diff))
    return monday.toISOString().split('T')[0]
  }

  const getToday = () => {
    return new Date().toISOString().split('T')[0]
  }

  // 记录一次播放
  const recordPlay = (song) => {
    const today = getToday()
    const stats = playStats.value

    stats.totalPlays++
    stats.totalDuration += song.duration || 0

    // 每日统计
    stats.dailyPlays[today] = (stats.dailyPlays[today] || 0) + 1

    // 歌曲统计
    stats.songPlays[song.id] = (stats.songPlays[song.id] || 0) + 1

    // 歌手统计
    if (song.artist) {
      stats.artistPlays[song.artist] = (stats.artistPlays[song.artist] || 0) + 1
    }

    // 本周统计
    stats.weekPlays++
    stats.weekDuration += song.duration || 0

    // 只保留最近30天的每日数据
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const cutoff = thirtyDaysAgo.toISOString().split('T')[0]
    Object.keys(stats.dailyPlays).forEach(date => {
      if (date < cutoff) delete stats.dailyPlays[date]
    })

    savePlayStats()
  }

  // 获取统计摘要
  const getStatsSummary = () => {
    const stats = playStats.value
    const today = getToday()

    // 今日播放
    const todayPlays = stats.dailyPlays[today] || 0

    // 最爱歌手（按播放次数排序）
    const topArtists = Object.entries(stats.artistPlays || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    // 最爱歌曲（按播放次数排序）
    const topSongs = Object.entries(stats.songPlays || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => {
        const song = songs.value.find(s => s.id === Number(id))
        return song ? { ...song, playCount: count } : null
      })
      .filter(Boolean)

    // 最近7天每日播放
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      last7Days.push({
        date: dateStr,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        count: stats.dailyPlays[dateStr] || 0
      })
    }

    // 格式化时长
    const formatSeconds = (secs) => {
      if (secs < 60) return `${secs}秒`
      if (secs < 3600) return `${Math.floor(secs / 60)}分钟`
      const hours = Math.floor(secs / 3600)
      const mins = Math.floor((secs % 3600) / 60)
      return `${hours}小时${mins}分钟`
    }

    return {
      totalPlays: stats.totalPlays,
      totalDuration: formatSeconds(stats.totalDuration),
      todayPlays,
      weekPlays: stats.weekPlays,
      weekDuration: formatSeconds(stats.weekDuration),
      topArtists,
      topSongs,
      last7Days,
      likedCount: likedSongs.value.length,
    }
  }

  // 歌曲标签分类
  const genres = computed(() => {
    const genreSet = new Set()
    songs.value.forEach(song => {
      if (song.genre) genreSet.add(song.genre)
    })
    return Array.from(genreSet)
  })

  const getSongsByGenre = (genre) => {
    return songs.value.filter(s => s.genre === genre)
  }

  // ===== 会话恢复 =====
  const sessionData = ref({
    songId: null,
    currentTime: 0,
    volume: 0.8,
    playMode: 'list',
  })

  const saveSession = () => {
    const data = {
      songId: currentSong.value?.id || null,
      currentTime: currentTime.value,
      volume: volume.value,
      playMode: playMode.value,
      seamlessPlay: seamlessPlay.value,
      savedAt: Date.now()
    }
    saveAsync('playerSession', data)
  }

  const loadSession = () => {
    const saved = localStorage.getItem('playerSession')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        sessionData.value = data
        
        // 恢复音量和播放模式（限制音量范围 0-1）
        if (data.volume !== undefined) {
          volume.value = Math.max(0, Math.min(1, data.volume))
        }
        if (data.playMode) {
          playMode.value = data.playMode
        }
        // 恢复无缝播放设置
        if (data.seamlessPlay !== undefined) {
          seamlessPlay.value = data.seamlessPlay
        }
        
        // 恢复歌曲（但不自动播放）
        if (data.songId) {
          const song = songs.value.find(s => s.id === data.songId)
          if (song) {
            currentSong.value = song
            // 延迟恢复进度（等待 audio 元素初始化）
            setTimeout(() => {
              if (data.currentTime > 0) {
                const audio = initAudio()
                audio.src = song.audioUrl
                audio.load()
                audio.currentTime = data.currentTime
                currentTime.value = data.currentTime
              }
            }, 100)
          }
        }
      } catch (e) {
        console.error('恢复会话失败:', e)
      }
    }
  }

  // 定期保存会话
  let saveSessionTimer = null
  const startSessionSave = () => {
    if (saveSessionTimer) clearInterval(saveSessionTimer)
    saveSessionTimer = setInterval(() => {
      if (currentSong.value) {
        saveSession()
      }
    }, 5000) // 每5秒保存一次
  }

  // 页面关闭前保存
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      if (currentSong.value) {
        saveSession()
      }
    })
  }

  // ==================== 后台播放支持 ====================
  
  // Wake Lock 防止屏幕关闭
  let wakeLock = null
  
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator && isPlaying.value) {
      try {
        wakeLock = await navigator.wakeLock.request('screen')
        console.log('Wake Lock 已获取')
        wakeLock.addEventListener('release', () => {
          console.log('Wake Lock 已释放')
        })
      } catch (err) {
        console.error('获取 Wake Lock 失败:', err)
      }
    }
  }
  
  const releaseWakeLock = () => {
    if (wakeLock) {
      wakeLock.release()
      wakeLock = null
    }
  }
  
  // 页面可见性变化处理
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // 页面进入后台，获取 Wake Lock 保持播放
      if (isPlaying.value) {
        requestWakeLock()
      }
    } else {
      // 页面回到前台，释放 Wake Lock
      releaseWakeLock()
      // 恢复播放：仅当音频存在、未结束、非用户主动暂停、且当前时间未到末尾时
      if (audioElement && audioElement.paused && isPlaying.value && audioElement.src) {
        // 检查音频是否真的需要恢复（排除已结束、已切换歌曲等情况）
        const duration = audioElement.duration || 0
        const currentTime = audioElement.currentTime || 0
        const isNearEnd = duration > 0 && currentTime >= duration - 0.5
        if (!audioElement.ended && !isNearEnd && currentTime < duration) {
          audioElement.play().catch(() => {})
        }
      }
    }
  }
  
  // 监听播放状态变化，自动管理 Wake Lock
  watch(isPlaying, (playing) => {
    if (playing && !document.hidden) {
      requestWakeLock()
    } else if (!playing) {
      releaseWakeLock()
    }
  })
  
  // 注册页面可见性监听
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  // 音频焦点变化处理（安卓后台播放恢复）
  const handleAudioFocus = () => {
    const audio = initAudio()
    // 当音频被其他应用暂停后，尝试恢复播放
    audio.addEventListener('pause', () => {
      // 如果 isPlaying 为 true 但音频被暂停，可能是被其他应用抢占
      if (isPlaying.value && audio.paused && audio.src) {
        // 延迟尝试恢复，避免频繁请求
        setTimeout(() => {
          if (isPlaying.value && audio.paused && audio.src) {
            audio.play().catch(() => {})
          }
        }, 500)
      }
    })
  }
  handleAudioFocus()

  // 初始化加载
  loadCustomPlaylists()
  loadLikedSongs()
  loadRecentSongs()
  loadPlayStats()
  loadSession()
  loadPlayQueue()
  startSessionSave()

  return {
    // 数据
    songs,
    albums,
    recommendPlaylists,
    customPlaylists,
    likedSongs,
    recentSongs,
    currentSong,
    currentPlaylist,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    playMode,
    themeColor,
    playQueue,
    showQueue,
    bufferedProgress,

    // 计算属性
    currentSongInfo,
    progress,
    genres,

    // 方法
    playSong,
    playPlaylist,
    playAlbum,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    setVolume,
    togglePlayMode,
    getAudioElement,
    // 播放队列
    addToQueue,
    removeFromQueue,
    clearQueue,
    playFromQueue,
    moveInQueue,
    toggleQueue,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    deletePlaylist,
    toggleLikeSong,
    isLiked,
    getLikedSongsList,
    addToRecent,
    getRecentSongsList,
    recordPlay,
    getStatsSummary,
    getSongsByGenre,

    // 数据加载
    loadSongData,
    dataLoaded,
    dataLoadError,
    lyricsData,

    // 无缝播放
    seamlessPlay,
    toggleSeamless
  }
})
