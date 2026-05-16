const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const postController = require('../controllers/postController')
const authMiddleware = require('../middleware/auth')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }
  next()
}

router.get('/', postController.list)
router.get('/latest', postController.latest)
router.get('/heatmap', postController.heatmap)
router.get('/archive', postController.archive)
router.get('/:id', postController.detail)
router.post('/:id/view', postController.view)
router.post('/', authMiddleware, [
  body('title').trim().notEmpty().withMessage('标题不能为空'),
  body('content').notEmpty().withMessage('内容不能为空'),
  body('type').isIn(['article', 'anime', 'galgame']).withMessage('内容类型不合法')
], validate, postController.create)
router.put('/:id', authMiddleware, postController.update)
router.delete('/:id', authMiddleware, postController.delete)

module.exports = router
