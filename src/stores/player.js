import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import songData from '../data/songs.json'

export const usePlayerStore = defineStore('player', () => {
  // 数据
  const songs = ref(songData.songs)
  const albums = ref(songData.albums)
  const recommendPlaylists = ref(songData.recommendPlaylists)
  
  // 自定义播放列表
  const customPlaylists = ref([])
  
  // 当前播放状态
  const currentSong = ref(null)
  const currentPlaylist = ref([])
  const currentIndex = ref(-1)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.8)
  const playMode = ref('list') // list, shuffle, repeat
  
  // 主题色
  const themeColor = ref('#667eea')
  
  // 播放队列（独立的待播放列表）
  const playQueue = ref([])
  const showQueue = ref(false)

  const extractColorFromCover = (coverUrl) => {
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
      themeColor.value = `rgb(${r}, ${g}, ${b})`
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
      audioElement.volume = volume.value
      audioElement.addEventListener('timeupdate', () => {
        currentTime.value = audioElement.currentTime
        updateMediaSessionPosition()
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
        nextSong()
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
    
    currentSong.value = song
    audio.src = song.audioUrl
    audio.volume = volume.value
    extractColorFromCover(song.cover)
    addToRecent(song.id) // 添加到最近播放
    updateMediaSession(song) // 更新锁屏控制
    recordPlay(song) // 记录播放统计
    
    // 流式加载：等待可以播放时立即开始
    const onCanPlay = () => {
      audio.removeEventListener('canplay', onCanPlay)
      if (requestId === playRequestIndex) {
        audio.play().then(() => {
          if (requestId === playRequestIndex) {
            isPlaying.value = true
            // 预加载下一首
            preloadNextSong()
          }
        }).catch(err => {
          if (requestId === playRequestIndex) {
            console.error('播放失败:', err)
            isPlaying.value = false
          }
        })
      }
    }
    
    audio.addEventListener('canplay', onCanPlay)
    
    // 超时处理：如果3秒内无法播放，尝试直接播放
    setTimeout(() => {
      audio.removeEventListener('canplay', onCanPlay)
      if (requestId === playRequestIndex && audio.paused) {
        audio.play().catch(() => {})
      }
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
  
  const nextSong = () => {
    // 优先播放队列中的歌曲
    if (playQueue.value.length > 0) {
      const queueSong = playQueue.value.shift()
      savePlayQueue()
      playSong(queueSong)
      return
    }

    if (playMode.value === 'repeat') {
      // 单曲循环：重新播放当前歌曲
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
      isPlaying.value = false
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
    volume.value = val
    audio.volume = val
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
    localStorage.setItem('playQueue', JSON.stringify(ids))
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
      cover: '/music-player/images/covers/guofeng.jpg',
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
    localStorage.setItem('customPlaylists', JSON.stringify(customPlaylists.value))
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
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs.value))
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
    localStorage.setItem('recentSongs', JSON.stringify(recentSongs.value.slice(0, 50)))
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
    localStorage.setItem('playStats', JSON.stringify(playStats.value))
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
      savedAt: Date.now()
    }
    localStorage.setItem('playerSession', JSON.stringify(data))
  }

  const loadSession = () => {
    const saved = localStorage.getItem('playerSession')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        sessionData.value = data
        
        // 恢复音量和播放模式
        if (data.volume !== undefined) {
          volume.value = data.volume
        }
        if (data.playMode) {
          playMode.value = data.playMode
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
      // 恢复 AudioContext（如果被暂停）
      if (audioElement && audioElement.paused && isPlaying.value) {
        audioElement.play().catch(() => {})
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
    getSongsByGenre
  }
})
