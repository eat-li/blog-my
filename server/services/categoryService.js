const { Category } = require('../models')

class CategoryService {
  async list() {
    return await Category.findAll({ order: [['name', 'ASC']] })
  }

  async create(data) {
    return await Category.create(data)
  }

  async update(id, data) {
    const category = await Category.findByPk(id)
    if (!category) throw Object.assign(new Error('分类不存在'), { status: 404 })
    await category.update(data)
    return category
  }

  async delete(id) {
    const category = await Category.findByPk(id)
    if (!category) throw Object.assign(new Error('分类不存在'), { status: 404 })
    await category.destroy()
  }
}

module.exports = new CategoryService()
