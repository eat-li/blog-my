const { Op, fn } = require('sequelize')
const { Post, Category, Tag, sequelize } = require('../models')
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
    // 三种类型互不依赖，并行查询减少等待时间
    const types = ['article', 'anime', 'galgame']
    const results = await Promise.all(
      types.map(type =>
        Post.findAll({
          where: { status: 'published', type },
          include: [{ model: Category, attributes: ['id', 'name'] }],
          order: [['createdAt', 'DESC']],
          limit: 2
        })
      )
    )
    return Object.fromEntries(types.map((type, i) => [type, results[i]]))
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
    // 事务保护：文章创建和标签关联要么全部成功，要么全部回滚
    const transaction = await sequelize.transaction()
    try {
      const post = await Post.create({
        type, title: sanitize(title), content: sanitize(content), summary, cover_image, category_id, rating, metadata,
        status: status || 'draft',
        user_id: userId
      }, { transaction })
      if (tags && tags.length > 0) {
        const tagInstances = await Tag.findAll({ where: { id: tags }, transaction })
        await post.setTags(tagInstances, { transaction })
      }
      await transaction.commit()
      return post
    } catch (err) {
      await transaction.rollback()
      throw err
    }
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
    // 事务保护：文章更新和标签关联要么全部成功，要么全部回滚
    const transaction = await sequelize.transaction()
    try {
      await post.update(filtered, { transaction })
      if (data.tags) {
        const tagInstances = await Tag.findAll({ where: { id: data.tags }, transaction })
        await post.setTags(tagInstances, { transaction })
      }
      await transaction.commit()
      return post
    } catch (err) {
      await transaction.rollback()
      throw err
    }
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
