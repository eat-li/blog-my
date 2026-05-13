const { Message } = require('../models')
const RateLimiter = require('../utils/rateLimiter')
const { sanitize } = require('../utils/sanitize')

// 留言频率限制：30秒/1条，1小时/30条，24小时/200条
const msgLimiter = new RateLimiter([
  { name: 'short', windowMs: 30_000,   max: 1 },
  { name: 'mid',   windowMs: 3600_000, max: 30 },
  { name: 'long',  windowMs: 86400_000, max: 200 }
])

class MessageService {
  async getPublicList(query) {
    const { page = 1, pageSize = 20 } = query
    const offset = (page - 1) * pageSize

    const { count, rows } = await Message.findAndCountAll({
      where: { status: 'approved', parent_id: null },
      include: [{ model: Message, as: 'Messages', where: { status: 'approved' }, required: false }],
      order: [['createdAt', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(pageSize)
    })

    return { messages: rows, total: count }
  }

  async create(data, ip) {
    const { nickname, content, email, parent_id } = data

    if (!nickname || nickname.length < 2 || nickname.length > 20) {
      throw Object.assign(new Error('昵称需要 2-20 个字符'), { status: 400 })
    }
    if (!content || content.length < 2 || content.length > 500) {
      throw Object.assign(new Error('留言内容需要 2-500 个字符'), { status: 400 })
    }

    // IP 频率限制
    const rateCheck = msgLimiter.check(ip)
    if (!rateCheck.allowed) {
      throw Object.assign(new Error(rateCheck.message), { status: 429 })
    }

    return await Message.create({
      nickname: sanitize(nickname), content: sanitize(content), email, ip,
      parent_id: parent_id || null
    })
  }

  async getAdminList(query) {
    const { status, page = 1, pageSize = 20 } = query
    const where = {}
    if (status) where.status = status

    const offset = (page - 1) * pageSize
    const { count, rows } = await Message.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(pageSize)
    })

    return { messages: rows, total: count }
  }

  async review(id, status) {
    if (!['approved', 'rejected'].includes(status)) {
      throw Object.assign(new Error('无效的状态'), { status: 400 })
    }
    const message = await Message.findByPk(id)
    if (!message) throw Object.assign(new Error('留言不存在'), { status: 404 })
    await message.update({ status })
    return message
  }

  async delete(id) {
    const message = await Message.findByPk(id)
    if (!message) throw Object.assign(new Error('留言不存在'), { status: 404 })
    await message.destroy()
  }
}

const instance = new MessageService()

// 测试专用：清空频率限制
if (process.env.NODE_ENV === 'test') {
  instance.clearLimiter = () => msgLimiter.clearAll()
}

module.exports = instance
