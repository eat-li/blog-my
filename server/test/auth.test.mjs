import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { getApp } from './setup.mjs'
import { createAdminToken, cleanDatabase } from './helpers.mjs'

let app

beforeAll(() => {
  app = getApp()
})

describe('Auth API', () => {
  let testToken

  beforeAll(async () => {
    await cleanDatabase()
    testToken = await createAdminToken(app)
  })

  it('POST /api/auth/login - 登录失败（错误密码）', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nonexist', password: 'xxx' })
    expect(res.status).toBe(401)
    expect(res.body.message).toBeDefined()
  })

  it('POST /api/auth/login - 登录成功', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testadmin', password: 'test123' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.username).toBe('testadmin')
  })

  it('GET /api/auth/me - 未登录返回 401', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('GET /api/auth/me - 登录后获取用户', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testadmin', password: 'test123' })

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`)

    expect(res.status).toBe(200)
    expect(res.body.user.username).toBe('testadmin')
  })
})
