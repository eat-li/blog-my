const express = require('express')
const router = express.Router()
const messageController = require('../controllers/messageController')
const authMiddleware = require('../middleware/auth')

router.get('/', messageController.getPublic)
router.post('/', messageController.create)
router.get('/admin', authMiddleware, messageController.getAdmin)
router.put('/:id/review', authMiddleware, messageController.review)
router.delete('/:id', authMiddleware, messageController.delete)

module.exports = router
