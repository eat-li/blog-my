const express = require('express')
const router = express.Router()
const postController = require('../controllers/postController')
const authMiddleware = require('../middleware/auth')

router.get('/', postController.list)
router.get('/latest', postController.latest)
router.get('/heatmap', postController.heatmap)
router.get('/:id', postController.detail)
router.post('/:id/view', postController.view)
router.post('/', authMiddleware, postController.create)
router.put('/:id', authMiddleware, postController.update)
router.delete('/:id', authMiddleware, postController.delete)

module.exports = router
