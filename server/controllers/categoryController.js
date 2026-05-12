const categoryService = require('../services/categoryService')

exports.list = async (req, res, next) => {
  try {
    const categories = await categoryService.list()
    res.json({ categories })
  } catch (err) { next(err) }
}

exports.create = async (req, res, next) => {
  try {
    const category = await categoryService.create(req.body)
    res.status(201).json({ category })
  } catch (err) { next(err) }
}

exports.update = async (req, res, next) => {
  try {
    const category = await categoryService.update(req.params.id, req.body)
    res.json({ category })
  } catch (err) { next(err) }
}

exports.delete = async (req, res, next) => {
  try {
    await categoryService.delete(req.params.id)
    res.json({ message: '删除成功' })
  } catch (err) { next(err) }
}
