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
    if (msgService.clearCooldown) msgService.clearCooldown()
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
