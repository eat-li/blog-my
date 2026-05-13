const uploadService = require('../services/uploadService')

exports.presignedUrl = async (req, res, next) => {
  try {
    const { dir, filename } = req.body
    if (!filename) return res.status(400).json({ message: '缺少文件名' })
    const result = await uploadService.getPresignedUrl(dir || 'content/', filename)
    res.json(result)
  } catch (err) { next(err) }
}

exports.file = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: '请选择文件' })
    const dir = req.body.dir || 'content/'
    const result = await uploadService.uploadFile(req.file.buffer, req.file.originalname, dir)
    res.json(result)
  } catch (err) { next(err) }
}

exports.image = async (req, res, next) => {
  try {
    const result = await uploadService.uploadImage(req.body.base64, req.body.filename)
    res.json(result)
  } catch (err) { next(err) }
}

exports.deleteImage = async (req, res, next) => {
  try {
    const result = await uploadService.deleteImage(req.body.key)
    res.json(result)
  } catch (err) { next(err) }
}

exports.audio = async (req, res, next) => {
  try {
    const result = await uploadService.uploadAudio(req.body.base64, req.body.filename)
    res.json(result)
  } catch (err) { next(err) }
}

exports.deleteAudio = async (req, res, next) => {
  try {
    const result = await uploadService.deleteAudio(req.body.key)
    res.json(result)
  } catch (err) { next(err) }
}
