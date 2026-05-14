const galleryService = require('../services/galleryService')

exports.list = async (req, res, next) => {
  try {
    const items = await galleryService.list()
    res.json({ data: items })
  } catch (err) { next(err) }
}

exports.adminList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const result = await galleryService.adminList(page, limit)
    res.json({ data: result })
  } catch (err) { next(err) }
}

exports.create = async (req, res, next) => {
  try {
    const { title, description, url, thumbnail_url, album } = req.body
    if (!title || !url) {
      return res.status(400).json({ message: '标题和图片 URL 不能为空' })
    }
    const item = await galleryService.create({ title, description, url, thumbnail_url, album }, req.userId)
    res.status(201).json({ data: item })
  } catch (err) { next(err) }
}

exports.update = async (req, res, next) => {
  try {
    const item = await galleryService.update(req.params.id, req.body)
    if (!item) return res.status(404).json({ message: '图片不存在' })
    res.json({ data: item })
  } catch (err) { next(err) }
}

exports.remove = async (req, res, next) => {
  try {
    const item = await galleryService.remove(req.params.id)
    if (!item) return res.status(404).json({ message: '图片不存在' })
    res.json({ message: '删除成功' })
  } catch (err) { next(err) }
}
