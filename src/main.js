import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化：运行时加载歌曲数据
import { usePlayerStore } from './stores/player'
const playerStore = usePlayerStore()
playerStore.loadSongData()

app.mount('#app')
