const { Op, fn } = require('sequelize')
const { Post, Category, Tag } = require('../models')
const { sanitize } = require('../utils/sanitize')

class PostService {
  async list(query) {
    const { type, category_id, tag_id, status = 'published', page = 1, pageSize = 10, random } = query
    const where = {}
    if (status && status !== 'all') where.status = status
    if (type) where.type = type
    if (category_id) where.category_id = category_id

    const offset = (page - 1) * pageSize
    const include = [{ model: Category, attributes: ['id', 'name'] }]

    if (tag_id) {
      include.push({
        model: Tag,
        where: { id: tag_id },
        attributes: ['id', 'name'],
        through: { attributes: [] }
      })
    }

    const order = random === 'true' ? [[fn('RAND')]] : [['createdAt', 'DESC']]

    const { count, rows } = await Post.findAndCountAll({
      where,
      include,
      order,
      offset: parseInt(offset),
      limit: parseInt(pageSize)
    })

    return { posts: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) }
  }

  async getLatest() {
    const types = ['article', 'anime', 'galgame']
    const result = {}
    for (const type of types) {
      const posts = await Post.findAll({
        where: { status: 'published', type },
        include: [{ model: Category, attributes: ['id', 'name'] }],
        order: [['createdAt', 'DESC']],
        limit: 2
      })
      result[type] = posts
    }
    return result
  }

  async getHeatmap() {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const posts = await Post.findAll({
      where: {
        status: 'published',
        createdAt: { [Op.gte]: oneYearAgo }
      },
      attributes: ['createdAt']
    })

    const heatmap = {}
    posts.forEach(post => {
      const date = post.createdAt.toISOString().split('T')[0]
      heatmap[date] = (heatmap[date] || 0) + 1
    })

    return { heatmap }
  }

  async getArchive() {
    const posts = await Post.findAll({
      where: { status: 'published' },
      attributes: ['id', 'type', 'title', 'createdAt'],
      order: [['createdAt', 'DESC']]
    })

    const archive = {}
    posts.forEach(post => {
      const d = new Date(post.createdAt)
      const year = d.getFullYear()
      const month = d.getMonth() + 1
      if (!archive[year]) archive[year] = {}
      if (!archive[year][month]) archive[year][month] = []
      archive[year][month].push(post)
    })

    return archive
  }

  async getById(id) {
    const post = await Post.findByPk(id, {
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: Tag, attributes: ['id', 'name'], through: { attributes: [] } }
      ]
    })
    if (!post) {
      throw Object.assign(new Error('内容不存在'), { status: 404 })
    }
    return post
  }

  async incrementViews(id) {
    const post = await Post.findByPk(id)
    if (!post) {
      throw Object.assign(new Error('内容不存在'), { status: 404 })
    }
    await post.increment('views')
    return { views: post.views + 1 }
  }

  async create(data, userId) {
    const { type, title, content, summary, cover_image, category_id, rating, metadata, status, tags } = data
    const post = await Post.create({
      type, title: sanitize(title), content: sanitize(content), summary, cover_image, category_id, rating, metadata,
      status: status || 'draft',
      user_id: userId
    })
    if (tags && tags.length > 0) {
      const tagInstances = await Tag.findAll({ where: { id: tags } })
      await post.setTags(tagInstances)
    }
    return post
  }

  async update(id, data) {
    const post = await Post.findByPk(id)
    if (!post) {
      throw Object.assign(new Error('内容不存在'), { status: 404 })
    }
    const allowedFields = ['type', 'title', 'content', 'summary', 'cover_image', 'category_id', 'rating', 'metadata', 'status']
    const filtered = {}
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        filtered[field] = field === 'title' || field === 'content' || field === 'summary'
          ? sanitize(data[field])
          : data[field]
      }
    })
    await post.update(filtered)
    if (data.tags) {
      const tagInstances = await Tag.findAll({ where: { id: data.tags } })
      await post.setTags(tagInstances)
    }
    return post
  }

  async delete(id) {
    const post = await Post.findByPk(id)
    if (!post) {
      throw Object.assign(new Error('内容不存在'), { status: 404 })
    }
    await post.destroy()
  }
}

module.exports = new PostService()
