const { Category } = require('../models')
const { filterFields } = require('../utils/helpers')

const CATEGORY_FIELDS = ['name', 'description', 'icon']

class CategoryService {
  async list() {
    return await Category.findAll({ order: [['name', 'ASC']] })
  }

  async create(data) {
    return await Category.create(filterFields(data, CATEGORY_FIELDS))
  }

  async update(id, data) {
    const category = await Category.findByPk(id)
    if (!category) throw Object.assign(new Error('分类不存在'), { status: 404 })
    await category.update(filterFields(data, CATEGORY_FIELDS))
    return category
  }

  async delete(id) {
    const category = await Category.findByPk(id)
    if (!category) throw Object.assign(new Error('分类不存在'), { status: 404 })
    await category.destroy()
  }
}

module.exports = new CategoryService()
