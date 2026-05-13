const express = require('express')
const multer = require('multer')
const router = express.Router()
const uploadController = require('../controllers/uploadController')
const authMiddleware = require('../middleware/auth')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 30 * 1024 * 1024 } })

router.post('/file', authMiddleware, upload.single('file'), uploadController.file)
router.post('/presigned', authMiddleware, uploadController.presignedUrl)
router.post('/image', authMiddleware, uploadController.image)
router.delete('/image', authMiddleware, uploadController.deleteImage)
router.post('/audio', authMiddleware, uploadController.audio)
router.delete('/audio', authMiddleware, uploadController.deleteAudio)

module.exports = router
