import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },

  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 500,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        // 移除未使用的代码（tree shaking 增强）
        dead_code: true,
        // 优化条件表达式
        conditionals: true,
        // 合并连续语句
        join_vars: true,
      },
      format: {
        comments: false
      }
    },
    reportCompressedSize: false,
    // CSS 最小化目标
    cssTarget: 'es2020',
    rollupOptions: {
      output: {
        // 大依赖拆分为独立 chunk，利于浏览器缓存
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          // Vue 核心框架（变化最少，缓存价值最高）
          if (/node_modules[\\/](vue|vue-router|pinia)[\\/]/.test(id))
            return 'vue-vendor'

          // Tiptap 富文本编辑器（仅后台编辑页需要）
          if (/node_modules[\\/]@tiptap[\\/]/.test(id))
            return 'tiptap'

          // Markdown 相关
          if (/node_modules[\\/](marked|dompurify)[\\/]/.test(id))
            return 'markdown'

          // highlight.js（体积大 ~95KB，仅文章详情页需要）
          if (/node_modules[\\/](highlight\.js|lowlight)[\\/]/.test(id))
            return 'highlight'

          // 其他 node_modules 归入 vendor
          return 'vendor'
        },
        // 为资源文件名添加哈希，启用长期缓存
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      }
    }
  }
})
