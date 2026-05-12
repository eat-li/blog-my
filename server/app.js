require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { syncDatabase } = require('./models')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
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
app.use('/api/github', require('./routes/github'))
app.use('/api/config', require('./routes/config'))
app.use('/api/upload', require('./routes/upload'))
app.use('/api/friendlinks', require('./routes/friendlinks'))
app.use('/api/stats', require('./routes/stats'))

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
