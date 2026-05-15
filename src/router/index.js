import { createRouter, createWebHashHistory } from 'vue-router'

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
    path: '/my',
    name: 'MyMusic',
    component: () => import('../views/MyMusic.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
