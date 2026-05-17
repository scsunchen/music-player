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
  
  // 初始化 Audio 元素
  const initAudio = () => {
    if (!audioElement) {
      audioElement = new Audio()
      audioElement.addEventListener('timeupdate', () => {
        currentTime.value = audioElement.currentTime
      })
      audioElement.addEventListener('loadedmetadata', () => {
        duration.value = audioElement.duration
      })
      audioElement.addEventListener('ended', () => {
        nextSong()
      })
      audioElement.addEventListener('error', (e) => {
        console.error('音频加载失败:', currentSong.value?.audioUrl, e)
        isPlaying.value = false
      })
      audioElement.addEventListener('canplay', () => {
        if (isPlaying.value) {
          audioElement.play().catch(err => {
            console.error('播放失败:', err)
            isPlaying.value = false
          })
        }
      })
    }
    return audioElement
  }
  
  // 计算属性
  const currentSongInfo = computed(() => currentSong.value)
  
  const progress = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })
  
  // 方法
  const playSong = (song) => {
    const audio = initAudio()
    currentSong.value = song
    audio.src = song.audioUrl
    audio.volume = volume.value
    extractColorFromCover(song.cover)
    addToRecent(song.id) // 添加到最近播放
    audio.load() // 先加载
    audio.play().then(() => {
      isPlaying.value = true
    }).catch(err => {
      console.error('播放失败:', err)
      isPlaying.value = false
    })
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
  }
  
  const nextSong = () => {
    if (playMode.value === 'repeat') {
      // 单曲循环：重新播放当前歌曲
      const audio = initAudio()
      audio.currentTime = 0
      audio.play()
      return
    }

    if (currentPlaylist.value.length === 0) return
    
    if (playMode.value === 'shuffle') {
      const randomIndex = Math.floor(Math.random() * currentPlaylist.value.length)
      currentIndex.value = randomIndex
      playSong(currentPlaylist.value[randomIndex])
    } else {
      currentIndex.value = (currentIndex.value + 1) % currentPlaylist.value.length
      playSong(currentPlaylist.value[currentIndex.value])
    }
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
  
  // 自定义播放列表管理
  const createPlaylist = (name) => {
    const newPlaylist = {
      id: Date.now(),
      name,
      description: '',
      cover: 'https://picsum.photos/seed/custom/300/300',
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

  // 初始化加载
  loadCustomPlaylists()
  loadLikedSongs()
  loadRecentSongs()

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
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    deletePlaylist,
    toggleLikeSong,
    isLiked,
    getLikedSongsList,
    addToRecent,
    getRecentSongsList,
    getSongsByGenre
  }
})
