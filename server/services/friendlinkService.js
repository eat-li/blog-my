const { FriendLink } = require('../models')
const RateLimiter = require('../utils/rateLimiter')

// 友链申请频率限制：60秒/1条，1小时/3条，24小时/10条
const applyLimiter = new RateLimiter([
  { name: 'short', windowMs: 60_000,   max: 1 },
  { name: 'mid',   windowMs: 3600_000, max: 3 },
  { name: 'long',  windowMs: 86400_000, max: 10 }
])

class FriendLinkService {
  async getPublicList() {
    const links = await FriendLink.findAll({
      where: { status: 'approved' },
      order: [['sort_order', 'ASC'], ['createdAt', 'DESC']]
    })
    return links
  }

  async getAdminList(query) {
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 20
    const offset = (page - 1) * limit
    const status = query.status

    const where = {}
    if (status) where.status = status

    const { count, rows } = await FriendLink.findAndCountAll({
      where,
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

  async apply(data, ip) {
    // IP 频率限制
    if (ip) {
      const rateCheck = applyLimiter.check(ip)
      if (!rateCheck.allowed) {
        throw Object.assign(new Error(rateCheck.message), { status: 429 })
      }
    }

    // 公开申请，强制待审核状态
    return this.create({ ...data, status: 'pending' })
  }

  async create(data) {
    if (!data.nickname || !data.nickname.trim()) {
      throw Object.assign(new Error('昵称不能为空'), { status: 400 })
    }
    if (!data.url || !data.url.trim()) {
      throw Object.assign(new Error('网站链接不能为空'), { status: 400 })
    }

    const link = await FriendLink.create({
      nickname: data.nickname.trim(),
      avatar: data.avatar || '',
      signature: data.signature || '',
      url: data.url.trim(),
      sort_order: data.sort_order ?? 0,
      status: data.status || 'approved'
    })

    return link
  }

  async update(id, data) {
    const link = await FriendLink.findByPk(id)
    if (!link) {
      throw Object.assign(new Error('友链不存在'), { status: 404 })
    }

    if (data.nickname !== undefined && !data.nickname.trim()) {
      throw Object.assign(new Error('昵称不能为空'), { status: 400 })
    }
    if (data.url !== undefined && !data.url.trim()) {
      throw Object.assign(new Error('网站链接不能为空'), { status: 400 })
    }

    await link.update({
      nickname: data.nickname?.trim(),
      avatar: data.avatar,
      signature: data.signature,
      url: data.url?.trim(),
      sort_order: data.sort_order,
      status: data.status
    })

    return link
  }

  async delete(id) {
    const link = await FriendLink.findByPk(id)
    if (!link) {
      throw Object.assign(new Error('友链不存在'), { status: 404 })
    }
    await link.destroy()
  }
}

module.exports = new FriendLinkService()
