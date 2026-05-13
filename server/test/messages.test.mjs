import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import request from 'supertest'
import { getApp } from './setup.mjs'
import { createAdminToken } from './helpers.mjs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

let app

beforeAll(() => {
  app = getApp()
})

describe('Messages API', () => {
  let token

  beforeAll(async () => {
    token = await createAdminToken(app)
  })

  // 每条测试前清理 IP 冷却
  beforeEach(() => {
    try {
      const msgService = require('../services/messageService')
      if (msgService.clearLimiter) msgService.clearLimiter()
    } catch (e) { /* ignore */ }
  })

  it('POST /api/messages - 游客提交留言', async () => {
    const res = await request(app)
      .post('/api/messages').send({ nickname: '测试游客', content: '这是一条测试留言！' })
    expect(res.status).toBe(201)
    expect(res.body.message.nickname).toBe('测试游客')
    expect(res.body.message.status).toBe('pending')
  })

  it('POST /api/messages - 昵称太短', async () => {
    const res = await request(app)
      .post('/api/messages').send({ nickname: 'x', content: '测试内容' })
    expect(res.status).toBe(400)
  })

  it('POST /api/messages - 内容太长', async () => {
    const res = await request(app)
      .post('/api/messages').send({ nickname: '测试', content: 'x'.repeat(501) })
    expect(res.status).toBe(400)
  })

  it('GET /api/messages - pending 状态的留言不可见', async () => {
    const res = await request(app).get('/api/messages')
    expect(res.status).toBe(200)
    expect(res.body.messages.length).toBe(0)
  })

  it('PUT /api/messages/:id/review - 审核通过留言', async () => {
    const createRes = await request(app)
      .post('/api/messages').send({ nickname: '测试2', content: '第二条留言' })
    const res = await request(app)
      .put(`/api/messages/${createRes.body.message.id}/review`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'approved' })
    expect(res.status).toBe(200)
    expect(res.body.message.status).toBe('approved')
  })

  it('GET /api/messages - 审核后可见', async () => {
    const res = await request(app).get('/api/messages')
    expect(res.status).toBe(200)
    expect(res.body.messages.length).toBeGreaterThanOrEqual(1)
  })

  it('DELETE /api/messages/:id - 删除留言', async () => {
    const createRes = await request(app)
      .post('/api/messages').send({ nickname: '待删除', content: '这条将被删除' })
    const msgId = createRes.body.message.id
    await request(app)
      .put(`/api/messages/${msgId}/review`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'approved' })
    const res = await request(app)
      .delete(`/api/messages/${msgId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
  })
})
