import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'build-notifier',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          next()
        })
      },
      buildStart() {
        console.log('\n🚀 开始编译...')
      },
      buildEnd() {
        console.log('✅ 编译完成！\n')
      }
    }
  ],
  base: '/music-player/',
  server: {
    hmr: {
      overlay: false
    }
  },
  build: {
    // 显示构建进度
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000
  }
})
