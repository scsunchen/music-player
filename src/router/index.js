import { createRouter, createWebHashHistory } from 'vue-router'

// View Transitions API 支持检测
const supportsViewTransitions = () => {
  return 'startViewTransition' in document
}

// 页面切换方向（用于不同方向的动画）
const getTransitionDirection = (to, from) => {
  const routes = ['/', '/search', '/my', '/stats', '/liked', '/520']
  const toIndex = routes.indexOf(to.path)
  const fromIndex = routes.indexOf(from.path)
  
  if (toIndex === -1 || fromIndex === -1) {
    // 详情页使用缩放动画
    return to.path.includes('/:') ? 'in' : 'out'
  }
  
  return toIndex > fromIndex ? 'right' : 'left'
}

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search.vue')
  },
  {
    path: '/playlist/:id',
    name: 'Playlist',
    component: () => import('../views/PlaylistDetail.vue')
  },
  {
    path: '/album/:id',
    name: 'Album',
    component: () => import('../views/AlbumDetail.vue')
  },
  {
    path: '/song/:id',
    name: 'SongDetail',
    component: () => import('../views/SongDetail.vue')
  },
  {
    path: '/my',
    name: 'MyMusic',
    component: () => import('../views/MyMusic.vue')
  },
  {
    path: '/liked',
    name: 'LikedSongs',
    component: () => import('../views/LikedSongs.vue')
  },
  {
    path: '/520',
    name: 'Love520',
    component: () => import('../views/Love520.vue')
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('../views/Stats.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// View Transitions 导航守卫
router.beforeEach((to, from, next) => {
  if (!supportsViewTransitions() || !from.name) {
    // 不支持或首次加载，直接跳转
    next()
    return
  }
  
  // 设置过渡方向类名
  const direction = getTransitionDirection(to, from)
  document.documentElement.setAttribute('data-transition', direction)
  
  // 使用 View Transitions API
  const transition = document.startViewTransition(() => {
    next()
  })
  
  transition.finished.then(() => {
    document.documentElement.removeAttribute('data-transition')
  })
})

export default router
