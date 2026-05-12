const messageService = require('../services/messageService')

exports.getPublic = async (req, res, next) => {
  try {
    const result = await messageService.getPublicList(req.query)
    res.json(result)
  } catch (err) { next(err) }
}

exports.create = async (req, res, next) => {
  try {
    const message = await messageService.create(req.body, req.ip)
    res.status(201).json({ message })
  } catch (err) { next(err) }
}

exports.getAdmin = async (req, res, next) => {
  try {
    const result = await messageService.getAdminList(req.query)
    res.json(result)
  } catch (err) { next(err) }
}

exports.review = async (req, res, next) => {
  try {
    const message = await messageService.review(req.params.id, req.body.status)
    res.json({ message })
  } catch (err) { next(err) }
}

exports.delete = async (req, res, next) => {
  try {
    await messageService.delete(req.params.id)
    res.json({ message: '删除成功' })
  } catch (err) { next(err) }
}
