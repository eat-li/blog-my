const { Quote } = require('../models')

class QuoteService {
  async getPublicList() {
    const quotes = await Quote.findAll({
      order: [['sort_order', 'ASC'], ['createdAt', 'DESC']]
    })
    return quotes
  }

  async getAdminList(query) {
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 20
    const offset = (page - 1) * limit

    const { count, rows } = await Quote.findAndCountAll({
      order: [['sort_order', 'ASC'], ['createdAt', 'DESC']],
      limit,
      offset
    })

    return {
      list: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  }

  async create(data) {
    if (!data.ja || !data.ja.trim()) {
      throw Object.assign(new Error('日文原文不能为空'), { status: 400 })
    }
    if (!data.zh || !data.zh.trim()) {
      throw Object.assign(new Error('中文翻译不能为空'), { status: 400 })
    }

    const quote = await Quote.create({
      ja: data.ja.trim(),
      zh: data.zh.trim(),
      source: data.source || '',
      sort_order: data.sort_order ?? 0
    })

    return quote
  }

  async update(id, data) {
    const quote = await Quote.findByPk(id)
    if (!quote) {
      throw Object.assign(new Error('名言不存在'), { status: 404 })
    }

    if (data.ja !== undefined && !data.ja.trim()) {
      throw Object.assign(new Error('日文原文不能为空'), { status: 400 })
    }
    if (data.zh !== undefined && !data.zh.trim()) {
      throw Object.assign(new Error('中文翻译不能为空'), { status: 400 })
    }

    await quote.update({
      ja: data.ja?.trim(),
      zh: data.zh?.trim(),
      source: data.source,
      sort_order: data.sort_order
    })

    return quote
  }

  async delete(id) {
    const quote = await Quote.findByPk(id)
    if (!quote) {
      throw Object.assign(new Error('名言不存在'), { status: 404 })
    }
    await quote.destroy()
  }
}

module.exports = new QuoteService()
