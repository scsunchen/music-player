import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'

// 部署基础路径，修改此处即可切换部署目录
// 例如：'/' 根目录部署，'/music-player/' 子目录部署，'/app/player/' 任意路径
const BASE_URL = process.env.BASE_URL || '/music-player/'

// 检查是否启用 HTTPS
const useHttps = process.env.HTTPS === 'true'

// 读取本地证书（如果不存在会自动生成）
const getHttpsConfig = () => {
  if (!useHttps) return false

  const certDir = path.resolve(__dirname, '.certs')
  const keyPath = path.join(certDir, 'dev.key')
  const certPath = path.join(certDir, 'dev.crt')

  // 如果证书存在则使用
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    }
  }

  // 否则使用 Vite 内置的自动生成证书
  return true
}

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
        if (useHttps) {
          console.log(`🔒 HTTPS 模式已启用`)
        }
      },
      buildEnd() {
        console.log('✅ 编译完成！\n')
      }
    }
  ],
  base: BASE_URL,
  server: {
    https: getHttpsConfig(),
    hmr: {
      overlay: false
    }
  },
  build: {
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000
  }
})
