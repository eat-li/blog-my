import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { getApp } from './setup.mjs'
import { createAdminToken } from './helpers.mjs'

let app
beforeAll(() => app = getApp())

describe('Stats API', () => {
  let token
  beforeAll(async () => {
    token = await createAdminToken(app)

    // 插入测试数据
    const posts = [
      { type: 'article', title: '文章1', content: '<p>内容</p>', status: 'published' },
      { type: 'article', title: '文章2', content: '<p>' + 'x'.repeat(100) + '</p>', status: 'published' },
      { type: 'anime', title: '动漫1', content: '<p>动漫</p>', status: 'published', rating: 8 },
      { type: 'galgame', title: '游戏1', content: '<p>游戏</p>', status: 'published', rating: 9 }
    ]
    for (const post of posts) {
      await request(app)
        .post('/api/posts').set('Authorization', `Bearer ${token}`).send(post)
    }
  })

  it('GET /api/stats/profile - 获取个人统计', async () => {
    const res = await request(app).get('/api/stats/profile')
    expect(res.status).toBe(200)
    expect(res.body.articles).toBeGreaterThanOrEqual(2)
    expect(res.body.anime).toBeGreaterThanOrEqual(1)
    expect(res.body.galgame).toBeGreaterThanOrEqual(1)
    expect(res.body.totalPosts).toBeGreaterThanOrEqual(4)
  })

  it('GET /api/stats/yearly - 获取年度报告', async () => {
    const res = await request(app).get('/api/stats/yearly').query({ year: new Date().getFullYear() })
    expect(res.status).toBe(200)
    expect(res.body.totalPosts).toBeGreaterThanOrEqual(4)
  })
})
