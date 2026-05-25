import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 部署基础路径，修改此处即可切换部署目录
// 例如：'/' 根目录部署，'/music-player/' 子目录部署，'/app/player/' 任意路径
const BASE_URL = process.env.BASE_URL || '/music-player/'

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
        console.log(`📁 部署路径: ${BASE_URL}`)
      },
      buildEnd() {
        console.log('✅ 编译完成！\n')
      }
    }
  ],
  base: BASE_URL,
  server: {
    hmr: {
      overlay: false
    }
  },
  build: {
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000
  }
})
