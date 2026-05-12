const { Message } = require('../models')

// IP 防刷记录（内存缓存）
const ipCooldown = new Map()

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

    // IP 防刷
    const lastMsg = ipCooldown.get(ip)
    if (lastMsg && Date.now() - lastMsg < 30000) {
      throw Object.assign(new Error('操作太频繁，请 30 秒后再试'), { status: 429 })
    }
    ipCooldown.set(ip, Date.now())

    return await Message.create({
      nickname, content, email, ip,
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

// 测试专用：清空 IP 冷却
if (process.env.NODE_ENV === 'test') {
  instance.clearCooldown = () => ipCooldown.clear()
}

module.exports = instance
