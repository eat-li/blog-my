import request from 'supertest'
import bcrypt from 'bcryptjs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const models = require('../models')

export async function createAdminToken(app) {
  const password = await bcrypt.hash('test123', 10)
  await models.User.upsert({
    id: 1,
    username: 'testadmin',
    password,
    nickname: '测试管理员'
  })

  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'testadmin', password: 'test123' })

  // 优先从 httpOnly cookie 获取，兼容旧版响应体中的 token
  const cookies = res.headers['set-cookie']
  if (cookies && cookies.length > 0) {
    const tokenMatch = cookies[0].match(/token=([^;]+)/)
    if (tokenMatch) return tokenMatch[1]
  }
  return res.body.token
}

export async function createTestCategory(name = '测试分类') {
  return await models.Category.upsert({ id: 1, name, description: '分类描述' })
}

export async function createTestTag(name = '测试标签') {
  return await models.Tag.upsert({ id: 1, name })
}

export async function cleanDatabase() {
  try {
    const msgService = require('../services/messageService')
    if (msgService.clearLimiter) msgService.clearLimiter()
  } catch (e) { /* ignore */ }

  await models.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
  await models.Post.destroy({ where: {}, truncate: false })
  await models.Category.destroy({ where: {}, truncate: false })
  await models.Tag.destroy({ where: {}, truncate: false })
  await models.Message.destroy({ where: {}, truncate: false })
  await models.User.destroy({ where: { username: 'testadmin' } })
  await models.Config.destroy({ where: {} })
  await models.sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
}
