import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import LikeBurstDirective from './directives/likeBurst'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.directive('like-burst', LikeBurstDirective)

app.mount('#app')

// 初始化：mount 之后再使用 store
import { usePlayerStore } from './stores/player'
const playerStore = usePlayerStore()
playerStore.loadSongData()
