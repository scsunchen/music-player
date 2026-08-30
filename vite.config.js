import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'

// 部署基础路径，修改此处即可切换部署目录
// 例如：'/' 根目录部署，'/music-player/' 子目录部署，'/app/player/' 任意路径
// Tauri 桌面端使用相对路径
const BASE_URL = process.env.TAURI_ENV_PLATFORM ? './' : (process.env.BASE_URL || '/music-player/')

/**
 * JSON 压缩插件
 * - 开发模式：不处理，JSON 保持格式化便于调试
 * - 生产构建：自动压缩 dist/ 下所有 .json 文件（去除空白、换行、缩进）
 */
function jsonMinifier() {
  return {
    name: 'json-minifier',
    apply: 'build',
    writeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist')
      if (!fs.existsSync(distDir)) return

      let count = 0
      let savedBytes = 0

      const minifyDir = (dirPath) => {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name)
          if (entry.isDirectory()) {
            minifyDir(fullPath)
          } else if (entry.name.endsWith('.json')) {
            try {
              const original = fs.readFileSync(fullPath, 'utf-8')
              const minified = JSON.stringify(JSON.parse(original))
              const originalSize = Buffer.byteLength(original, 'utf-8')
              const minifiedSize = Buffer.byteLength(minified, 'utf-8')
              if (minifiedSize < originalSize) {
                fs.writeFileSync(fullPath, minified, 'utf-8')
                count++
                savedBytes += originalSize - minifiedSize
              }
            } catch (e) {
              console.warn(`⚠️  JSON 压缩失败: ${entry.name} - ${e.message}`)
            }
          }
        }
      }

      minifyDir(distDir)

      if (count > 0) {
        const savedKB = (savedBytes / 1024).toFixed(1)
        console.log(`📦 JSON 压缩: ${count} 个文件, 节省 ${savedKB} KB`)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'build-notifier',
      buildStart() {
        console.log('\n🚀 开始编译...')
        console.log(`📁 部署路径: ${BASE_URL}`)
      },
      buildEnd() {
        console.log('✅ 编译完成！\n')
      }
    },
    jsonMinifier()
  ],
  base: BASE_URL,
  server: {
    hmr: {
      overlay: false
    }
  },
  build: {
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
        },
      },
    },
  }
})
