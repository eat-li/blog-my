const { Gallery } = require('../models')
const { Op } = require('sequelize')

exports.list = async () => {
  const items = await Gallery.findAll({
    order: [['sort_order', 'ASC'], ['createdAt', 'DESC']],
    attributes: ['id', 'title', 'description', 'url', 'thumbnail_url', 'album', 'sort_order', 'createdAt']
  })
  return items
}

exports.adminList = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit
  const { count, rows } = await Gallery.findAndCountAll({
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    attributes: ['id', 'title', 'description', 'url', 'thumbnail_url', 'album', 'sort_order', 'createdAt']
  })
  return { total: count, list: rows, page, limit }
}

exports.create = async (data, userId) => {
  return Gallery.create({ ...data, user_id: userId })
}

exports.update = async (id, data) => {
  const item = await Gallery.findByPk(id)
  if (!item) return null
  return item.update(data)
}

exports.remove = async (id) => {
  const item = await Gallery.findByPk(id)
  if (!item) return null
  await item.destroy()
  return item
}
