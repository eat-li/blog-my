import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { getApp } from './setup.mjs'
import { createAdminToken, cleanDatabase } from './helpers.mjs'

let app
let token

beforeAll(() => {
  app = getApp()
})

describe('Posts API', () => {
  let userToken

  beforeAll(async () => {
    await cleanDatabase()
    userToken = await createAdminToken(app)
  })

  const testPost = {
    type: 'article',
    title: '测试文章标题',
    content: '<p>测试文章内容</p>',
    summary: '这是一篇测试文章',
    status: 'published',
    metadata: {
      writing_note: { mood: '开心', bgm: '测试BGM', weather: '晴', note: '测试备注' }
    }
  }

  it('POST /api/posts - 创建文章', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send(testPost)

    expect(res.status).toBe(201)
    expect(res.body.post.title).toBe(testPost.title)
    expect(res.body.post.metadata.writing_note.mood).toBe('开心')
  })

  it('POST /api/posts - 未登录不能创建', async () => {
    const res = await request(app).post('/api/posts').send(testPost)
    expect(res.status).toBe(401)
  })

  it('GET /api/posts - 获取文章列表', async () => {
    const res = await request(app).get('/api/posts')
    expect(res.status).toBe(200)
    expect(res.body.posts.length).toBeGreaterThanOrEqual(1)
  })

  it('GET /api/posts?type=article - 按类型筛选', async () => {
    const res = await request(app).get('/api/posts').query({ type: 'article' })
    expect(res.status).toBe(200)
    expect(res.body.posts.every(p => p.type === 'article')).toBe(true)
  })

  it('GET /api/posts/:id - 获取文章详情', async () => {
    const listRes = await request(app).get('/api/posts')
    const res = await request(app).get(`/api/posts/${listRes.body.posts[0].id}`)
    expect(res.status).toBe(200)
    expect(res.body.post.id).toBe(listRes.body.posts[0].id)
  })

  it('POST /api/posts/:id/view - 增加浏览量', async () => {
    const listRes = await request(app).get('/api/posts')
    const postId = listRes.body.posts[0].id
    const res = await request(app).post(`/api/posts/${postId}/view`)
    expect(res.status).toBe(200)
    expect(res.body.views).toBeGreaterThan(0)
  })

  it('GET /api/posts/latest - 获取最新内容', async () => {
    const res = await request(app).get('/api/posts/latest')
    expect(res.status).toBe(200)
    expect(res.body.article).toBeDefined()
  })

  it('GET /api/posts/heatmap - 获取热力图数据', async () => {
    const res = await request(app).get('/api/posts/heatmap')
    expect(res.status).toBe(200)
    expect(res.body.heatmap).toBeDefined()
  })

  it('GET /api/posts/99999 - 不存在的文章返回 404', async () => {
    const res = await request(app).get('/api/posts/99999')
    expect(res.status).toBe(404)
  })

  it('PUT /api/posts/:id - 更新文章', async () => {
    const listRes = await request(app).get('/api/posts')
    const res = await request(app)
      .put(`/api/posts/${listRes.body.posts[0].id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: '更新后的标题' })
    expect(res.status).toBe(200)
    expect(res.body.post.title).toBe('更新后的标题')
  })

  it('DELETE /api/posts/:id - 删除文章', async () => {
    const createRes = await request(app)
      .post('/api/posts').set('Authorization', `Bearer ${userToken}`)
      .send({ ...testPost, title: '待删除文章' })
    const res = await request(app)
      .delete(`/api/posts/${createRes.body.post.id}`)
      .set('Authorization', `Bearer ${userToken}`)
    expect(res.status).toBe(200)
  })
})
