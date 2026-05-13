const quoteService = require('../services/quoteService')

exports.getPublic = async (req, res, next) => {
  try {
    const quotes = await quoteService.getPublicList()
    res.json({ code: 200, data: quotes })
  } catch (err) {
    next(err)
  }
}

exports.getAdmin = async (req, res, next) => {
  try {
    const result = await quoteService.getAdminList(req.query)
    res.json({ code: 200, data: result })
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const quote = await quoteService.create(req.body)
    res.status(201).json({ code: 201, data: quote, message: '名言添加成功' })
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const quote = await quoteService.update(req.params.id, req.body)
    res.json({ code: 200, data: quote, message: '名言更新成功' })
  } catch (err) {
    next(err)
  }
}

exports.delete = async (req, res, next) => {
  try {
    await quoteService.delete(req.params.id)
    res.json({ code: 200, message: '名言删除成功' })
  } catch (err) {
    next(err)
  }
}
