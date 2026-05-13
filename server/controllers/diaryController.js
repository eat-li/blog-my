const diaryService = require('../services/diaryService')

exports.getPublicList = async (req, res, next) => {
  try {
    const result = await diaryService.getPublicList(req.query)
    res.json({ code: 200, data: result })
  } catch (err) { next(err) }
}

exports.getPublicDetail = async (req, res, next) => {
  try {
    const diary = await diaryService.getPublicById(req.params.id)
    res.json({ code: 200, data: diary })
  } catch (err) { next(err) }
}

exports.getAdminList = async (req, res, next) => {
  try {
    const result = await diaryService.getAdminList(req.query)
    res.json({ code: 200, data: result })
  } catch (err) { next(err) }
}

exports.create = async (req, res, next) => {
  try {
    const diary = await diaryService.create(req.body)
    res.status(201).json({ code: 201, data: diary, message: '日记创建成功' })
  } catch (err) { next(err) }
}

exports.update = async (req, res, next) => {
  try {
    const diary = await diaryService.update(req.params.id, req.body)
    res.json({ code: 200, data: diary, message: '日记更新成功' })
  } catch (err) { next(err) }
}

exports.delete = async (req, res, next) => {
  try {
    await diaryService.delete(req.params.id)
    res.json({ code: 200, message: '日记删除成功' })
  } catch (err) { next(err) }
}
