const { Tag } = require('../models')
const { filterFields } = require('../utils/helpers')

const TAG_FIELDS = ['name']

class TagService {
  async list() {
    return await Tag.findAll({ order: [['name', 'ASC']] })
  }

  async create(data) {
    return await Tag.create(filterFields(data, TAG_FIELDS))
  }

  async delete(id) {
    const tag = await Tag.findByPk(id)
    if (!tag) throw Object.assign(new Error('标签不存在'), { status: 404 })
    await tag.destroy()
  }
}

module.exports = new TagService()
