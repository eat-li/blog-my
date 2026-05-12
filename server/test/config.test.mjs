import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { getApp } from './setup.mjs'
import { createAdminToken } from './helpers.mjs'

let app

beforeAll(() => app = getApp())

describe('Config API', () => {
  let token
  beforeAll(async () => {
    token = await createAdminToken(app)
  })

  it('GET /api/config/public - 获取公开配置', async () => {
    const res = await request(app).get('/api/config/public')
    expect(res.status).toBe(200)
  })

  it('PUT /api/config/:key - 更新配置', async () => {
    const res = await request(app)
      .put('/api/config/site_info').set('Authorization', `Bearer ${token}`)
      .send({ value: { title: '测试博客', signature: '测试签名', launch_date: new Date().toISOString() } })
    expect(res.status).toBe(200)
    expect(res.body.site_info.title).toBe('测试博客')
  })

  it('GET /api/config/:key - 获取单个配置', async () => {
    const res = await request(app).get('/api/config/site_info')
    expect(res.status).toBe(200)
    expect(res.body.site_info).toBeDefined()
  })

  it('PUT /api/config/:key - 未登录不能更新', async () => {
    const res = await request(app).put('/api/config/site_info').send({ value: { title: 'hack' } })
    expect(res.status).toBe(401)
  })
})
