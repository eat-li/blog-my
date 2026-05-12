import { beforeAll } from 'vitest'
import dotenv from 'dotenv'

// 必须在加载任何模块前设置环境
process.env.NODE_ENV = 'test'
process.env.DB_NAME = 'blog_test'
dotenv.config()

let _app = null

beforeAll(async () => {
  if (!_app) {
    // 清除 Express 模块缓存，确保每次拿到干净的 app 实例
    for (const key of Object.keys(require.cache)) {
      if (key.includes('\\app.js') || key.includes('\\models\\') || key.includes('\\routes\\') || key.includes('\\controllers\\') || key.includes('\\services\\')) {
        delete require.cache[key]
      }
    }

    const { syncDatabase } = require('../models')
    await syncDatabase()
    _app = require('../app')
  }
})

export function getApp() {
  return _app
}
