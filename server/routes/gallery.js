const express = require('express')
const router = express.Router()
const galleryController = require('../controllers/galleryController')
const authMiddleware = require('../middleware/auth')

router.get('/', galleryController.list)
router.get('/admin', authMiddleware, galleryController.adminList)
router.post('/', authMiddleware, galleryController.create)
router.put('/:id', authMiddleware, galleryController.update)
router.delete('/:id', authMiddleware, galleryController.remove)

module.exports = router
