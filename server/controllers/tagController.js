const tagService = require('../services/tagService')

exports.list = async (req, res, next) => {
  try {
    const tags = await tagService.list()
    res.json({ tags })
  } catch (err) { next(err) }
}

exports.create = async (req, res, next) => {
  try {
    const tag = await tagService.create(req.body)
    res.status(201).json({ tag })
  } catch (err) { next(err) }
}

exports.delete = async (req, res, next) => {
  try {
    await tagService.delete(req.params.id)
    res.json({ message: '删除成功' })
  } catch (err) { next(err) }
}
