const path = require('path')
const express = require('express')
const multer = require('multer')
const router = express.Router()
const uploadController = require('../controllers/uploadController')
const authMiddleware = require('../middleware/auth')

// multer 白名单：图片 + 音频
const ALLOWED_EXT = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg',
  '.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'
])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase()
    if (ALLOWED_EXT.has(ext)) {
      cb(null, true)
    } else {
      cb(Object.assign(new Error(`不支持的文件格式: ${ext}`), { status: 400 }))
    }
  }
})

router.post('/file', authMiddleware, upload.single('file'), uploadController.file)
router.post('/presigned', authMiddleware, uploadController.presignedUrl)
router.post('/image', authMiddleware, uploadController.image)
router.delete('/image', authMiddleware, uploadController.deleteImage)
router.post('/audio', authMiddleware, uploadController.audio)
router.delete('/audio', authMiddleware, uploadController.deleteAudio)

module.exports = router
