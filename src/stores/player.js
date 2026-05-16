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
  
  // 初始化加载自定义播放列表
  loadCustomPlaylists()
  
  return {
    // 数据
    songs,
    albums,
    recommendPlaylists,
    customPlaylists,
    currentSong,
    currentPlaylist,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    playMode,
    
    // 计算属性
    currentSongInfo,
    progress,
    
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
    deletePlaylist
  }
})
