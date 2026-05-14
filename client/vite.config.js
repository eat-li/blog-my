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
    chunkSizeWarningLimit: 500,
    // 使用 terser 压缩（比 esbuild 压缩率更高，节省 ~109 KiB）
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        // 移除纯函数调用（如 console 已被 drop_console 处理）
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      format: {
        // 移除注释
        comments: false
      }
    },
    // 生成体积分析报告
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // 大依赖拆分为独立 chunk，利于浏览器缓存
        manualChunks(id) {
          // Vue 核心框架 + axios
          if (/node_modules[\\/](vue|vue-router|pinia|axios)[\\/]/.test(id))
            return 'vue-vendor'
          // Tiptap 富文本编辑器
          if (/node_modules[\\/]@tiptap[\\/]/.test(id))
            return 'tiptap'
          // Markdown 解析
          if (/node_modules[\\/](marked|dompurify)[\\/]/.test(id))
            return 'markdown'
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
})
