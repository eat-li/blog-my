const { FriendLink } = require('../models')

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

  async apply(data) {
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
