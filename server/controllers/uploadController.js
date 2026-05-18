const uploadService = require('../services/uploadService')

// 允许上传的文件类型白名单
const ALLOWED_IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'])
const ALLOWED_AUDIO_EXT = new Set(['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'])

/**
 * 校验文件扩展名是否在白名单内
 */
function assertAllowedExt(filename, allowedSet, label) {
  const path = require('path')
  const ext = path.extname(filename || '').toLowerCase()
  if (!ext || !allowedSet.has(ext)) {
    throw Object.assign(new Error(`不支持的${label}格式: ${ext || '无扩展名'}`), { status: 400 })
  }
}

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
    // 校验图片扩展名，防止非法文件上传
    assertAllowedExt(req.body.filename, ALLOWED_IMAGE_EXT, '图片')
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
    // 校验音频扩展名，防止非法文件上传
    assertAllowedExt(req.body.filename, ALLOWED_AUDIO_EXT, '音频')
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
