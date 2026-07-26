import { createRouter, createWebHashHistory } from 'vue-router'

// View Transitions API 支持检测
const supportsViewTransitions = () => {
  return 'startViewTransition' in document
}

// 页面切换方向（用于不同方向的动画）
const getTransitionDirection = (to, from) => {
  const routes = ['/', '/search', '/my', '/stats', '/season', '/story', '/ringtones']
  const toIndex = routes.indexOf(to.path)
  const fromIndex = routes.indexOf(from.path)
  
  if (toIndex === -1 || fromIndex === -1) {
    // 详情页（带动态参数）使用缩放动画
    const isDetailRoute = to.matched.some(record => record.path.includes('/:'))
    return isDetailRoute ? 'in' : 'out'
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
    path: '/season',
    name: 'Seasonal',
    component: () => import('../views/SeasonalPage.vue')
  },
  {
    path: '/songs',
    name: 'AllSongs',
    component: () => import('../views/AllSongs.vue')
  },
  {
    path: '/hot',
    name: 'HotSongs',
    component: () => import('../views/HotSongs.vue')
  },
  {
    path: '/playlists',
    name: 'AllPlaylists',
    component: () => import('../views/AllPlaylists.vue')
  },
  {
    path: '/albums',
    name: 'AllAlbums',
    component: () => import('../views/AllAlbums.vue')
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('../views/Stats.vue')
  },
  {
    path: '/story',
    name: 'StoryTimeline',
    component: () => import('../views/StoryTimeline.vue')
  },
  {
    path: '/ringtones',
    name: 'RingtonesTimeline',
    component: () => import('../views/RingtonesTimeline.vue')
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
  
  try {
    // 设置过渡方向类名
    const direction = getTransitionDirection(to, from)
    document.documentElement.setAttribute('data-transition', direction)
    
    // 使用 View Transitions API
    const transition = document.startViewTransition(() => {
      next()
    })
    
    transition.finished.then(() => {
      document.documentElement.removeAttribute('data-transition')
      // 过渡动画完成后，重置滚动位置到顶部
      if (from.name) {
        window.scrollTo(0, 0)
      }
    }).catch(() => {
      document.documentElement.removeAttribute('data-transition')
    })
  } catch (e) {
    // View Transitions 失败，直接跳转
    next()
    // 降级：直接重置滚动
    if (from.name) {
      window.scrollTo(0, 0)
    }
  }
})

// 全局滚动重置（非 View Transitions 场景的兜底）
router.afterEach((to, from) => {
  if (!from.name) return
  // 不支持 View Transitions 时直接滚动（支持时由 beforeEach 内的 transition.finished 处理）
  if (!supportsViewTransitions()) {
    window.scrollTo(0, 0)
  }
})

export default router
