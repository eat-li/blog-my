const announcementService = require('../services/announcementService')

exports.getActive = async (req, res, next) => {
  try {
    const list = await announcementService.getActiveList()
    res.json({ code: 200, data: list })
  } catch (err) {
    next(err)
  }
}

exports.getAdmin = async (req, res, next) => {
  try {
    const result = await announcementService.getAdminList(req.query)
    res.json({ code: 200, data: result })
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const announcement = await announcementService.create(req.body)
    res.status(201).json({ code: 201, data: announcement, message: '公告添加成功' })
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const announcement = await announcementService.update(req.params.id, req.body)
    res.json({ code: 200, data: announcement, message: '公告更新成功' })
  } catch (err) {
    next(err)
  }
}

exports.delete = async (req, res, next) => {
  try {
    await announcementService.delete(req.params.id)
    res.json({ code: 200, message: '公告删除成功' })
  } catch (err) {
    next(err)
  }
}
