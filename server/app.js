require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const { syncDatabase } = require('./models')

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://blog-saki.oss-cn-chengdu.aliyuncs.com"],
      mediaSrc: ["'self'", "https://blog-saki.oss-cn-chengdu.aliyuncs.com"],
      connectSrc: ["'self'", "https://api.github.com"],
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
app.use(express.json({ limit: '50mb' }))
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

// 生产环境：serve 前端静态文件 + SPA 路由回退（使用 Nginx 时可省略此段）
if (isProduction) {
  const path = require('path')
  const distPath = path.join(__dirname, '..', 'client', 'dist')
  app.use(express.static(distPath, { maxAge: '7d' }))
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// 错误处理
app.use((err, req, res, next) => {
  const status = err.status || 500
  if (status >= 500) {
    console.error(`[${status}] ${err.message}\n${err.stack}`)
  } else {
    console.warn(`[${status}] ${err.message}`)
  }
  res.status(status).json({
    message: err.message || '服务器内部错误'
  })
})

// 启动
async function start() {
  await syncDatabase()
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`)
  })
}

if (process.env.NODE_ENV !== 'test') {
  start()
}

module.exports = app
