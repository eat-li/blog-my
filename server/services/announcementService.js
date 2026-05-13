const { Announcement } = require('../models')

class AnnouncementService {
  // 公开接口：只返回启用的公告
  async getActiveList() {
    return Announcement.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['createdAt', 'DESC']]
    })
  }

  // 后台：分页列表
  async getAdminList(query) {
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 20
    const offset = (page - 1) * limit

    const { count, rows } = await Announcement.findAndCountAll({
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
    if (!data.content || !data.content.trim()) {
      throw Object.assign(new Error('公告内容不能为空'), { status: 400 })
    }
    return Announcement.create({
      content: data.content.trim(),
      is_active: data.is_active !== undefined ? data.is_active : true,
      sort_order: data.sort_order ?? 0
    })
  }

  async update(id, data) {
    const announcement = await Announcement.findByPk(id)
    if (!announcement) {
      throw Object.assign(new Error('公告不存在'), { status: 404 })
    }
    if (data.content !== undefined && !data.content.trim()) {
      throw Object.assign(new Error('公告内容不能为空'), { status: 400 })
    }
    await announcement.update({
      content: data.content?.trim(),
      is_active: data.is_active,
      sort_order: data.sort_order
    })
    return announcement
  }

  async delete(id) {
    const announcement = await Announcement.findByPk(id)
    if (!announcement) {
      throw Object.assign(new Error('公告不存在'), { status: 404 })
    }
    await announcement.destroy()
  }
}

module.exports = new AnnouncementService()
