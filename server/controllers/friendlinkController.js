const friendlinkService = require('../services/friendlinkService')

exports.getPublic = async (req, res, next) => {
  try {
    const links = await friendlinkService.getPublicList()
    res.json({ code: 200, data: links })
  } catch (err) {
    next(err)
  }
}

exports.getAdmin = async (req, res, next) => {
  try {
    const result = await friendlinkService.getAdminList(req.query)
    res.json({ code: 200, data: result })
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const link = await friendlinkService.create(req.body)
    res.status(201).json({ code: 201, data: link, message: '友链添加成功' })
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const link = await friendlinkService.update(req.params.id, req.body)
    res.json({ code: 200, data: link, message: '友链更新成功' })
  } catch (err) {
    next(err)
  }
}

exports.delete = async (req, res, next) => {
  try {
    await friendlinkService.delete(req.params.id)
    res.json({ code: 200, message: '友链删除成功' })
  } catch (err) {
    next(err)
  }
}
