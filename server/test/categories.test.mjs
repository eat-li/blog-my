import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { getApp } from './setup.mjs'
import { createAdminToken } from './helpers.mjs'

let app

beforeAll(() => {
  app = getApp()
})

describe('Categories API', () => {
  let token

  beforeAll(async () => {
    token = await createAdminToken(app)
  })

  it('POST /api/categories - 创建分类', async () => {
    const res = await request(app)
      .post('/api/categories').set('Authorization', `Bearer ${token}`)
      .send({ name: '技术', description: '技术相关文章' })
    expect(res.status).toBe(201)
    expect(res.body.category.name).toBe('技术')
  })

  it('POST /api/categories - 未登录不能创建', async () => {
    const res = await request(app).post('/api/categories').send({ name: '未登录分类' })
    expect(res.status).toBe(401)
  })

  it('GET /api/categories - 获取分类列表', async () => {
    const res = await request(app).get('/api/categories')
    expect(res.status).toBe(200)
    expect(res.body.categories.length).toBeGreaterThanOrEqual(1)
  })

  it('PUT /api/categories/:id - 更新分类', async () => {
    const list = await request(app).get('/api/categories')
    const res = await request(app)
      .put(`/api/categories/${list.body.categories[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '前端技术' })
    expect(res.status).toBe(200)
    expect(res.body.category.name).toBe('前端技术')
  })

  it('DELETE /api/categories/:id - 删除分类', async () => {
    const createRes = await request(app)
      .post('/api/categories').set('Authorization', `Bearer ${token}`)
      .send({ name: '临时分类' })
    const res = await request(app)
      .delete(`/api/categories/${createRes.body.category.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
  })
})
