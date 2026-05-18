require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const { syncDatabase, sequelize } = require('./models')

const app = express()
const PORT = process.env.PORT || 3000

// 安全头：CSP 策略
// script-src 移除 unsafe-inline/unsafe-eval（Vue 生产构建为打包文件，不需要内联脚本或 eval）
// style-src 保留 unsafe-inline（Vue scoped 样式依赖内联 style 属性）
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://blog-saki.oss-cn-chengdu.aliyuncs.com"],
      mediaSrc: ["'self'", "https://blog-saki.oss-cn-chengdu.aliyuncs.com"],
      connectSrc: ["'self'"],
      frameSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}))

const isProduction = process.env.NODE_ENV === 'production'
app.use(cors({
  origin: isProduction && process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:5173'],
  credentials: true
}))
app.use(cookieParser())
// JSON body 限制为 10mb（base64 上传约膨胀 33%，10mb 可传 ~7.5MB 原始文件）；multipart 由 multer 单独控制
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 静态文件（上传目录）
app.use('/uploads', express.static('uploads'))

// 路由
app.use('/api/auth', require('./routes/auth'))
app.use('/api/posts', require('./routes/posts'))
app.use('/api/categories', require('./routes/categories'))
app.use('/api/tags', require('./routes/tags'))
app.use('/api/messages', require('./routes/messages'))
app.use('/api/config', require('./routes/config'))
app.use('/api/upload', require('./routes/upload'))
app.use('/api/friendlinks', require('./routes/friendlinks'))
app.use('/api/stats', require('./routes/stats'))
app.use('/api/quotes', require('./routes/quotes'))
app.use('/api/announcements', require('./routes/announcements'))
app.use('/api/diaries', require('./routes/diaries'))
app.use('/api/gallery', require('./routes/gallery'))
app.use('/api/ai', require('./routes/ai'))

// 生产环境：serve 前端静态文件 + SPA 路由回退（使用 Nginx 时可省略此段）
if (isProduction) {
  const path = require('path')
  const distPath = path.join(__dirname, '..', 'client', 'dist')
  app.use(express.static(distPath, { maxAge: '7d' }))
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// 全局错误处理中间件
const errorHandler = require('./middleware/errorHandler')
app.use(errorHandler)

// 启动
async function start() {
  await syncDatabase()
  const server = app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`)
  })

  // 优雅关闭：收到终止信号时先关闭 HTTP 连接，再断开数据库
  const shutdown = async (signal) => {
    console.log(`收到 ${signal}，正在优雅关闭...`)
    server.close(async () => {
      await sequelize.close()
      console.log('数据库连接已关闭，进程退出')
      process.exit(0)
    })
  }
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

if (process.env.NODE_ENV !== 'test') {
  start()
}

module.exports = app
