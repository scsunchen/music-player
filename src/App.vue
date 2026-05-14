<template>
  <div class="app">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="logo">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        <span>Music Player</span>
      </div>
      <nav class="nav">
        <router-link to="/" class="nav-link" active-class="active">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span>首页</span>
        </router-link>
        <router-link to="/search" class="nav-link" active-class="active">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <span>搜索</span>
        </router-link>
        <router-link to="/my" class="nav-link" active-class="active">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <span>我的</span>
        </router-link>
      </nav>
    </header>

    <!-- 主内容区 -->
    <main class="main">
      <router-view />
    </main>

    <!-- 底部播放器 -->
    <MusicPlayer />
  </div>
</template>

<script setup>
import MusicPlayer from './components/MusicPlayer.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  min-height: 100vh;
  color: #fff;
}

#app {
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(15, 15, 26, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.logo svg {
  color: #667eea;
}

.nav {
  display: flex;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  color: #fff;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
}

.main {
  flex: 1;
  padding-bottom: 80px;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
