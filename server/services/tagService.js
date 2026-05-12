const { Tag } = require('../models')

class TagService {
  async list() {
    return await Tag.findAll({ order: [['name', 'ASC']] })
  }

  async create(data) {
    return await Tag.create(data)
  }

  async delete(id) {
    const tag = await Tag.findByPk(id)
    if (!tag) throw Object.assign(new Error('标签不存在'), { status: 404 })
    await tag.destroy()
  }
}

module.exports = new TagService()
