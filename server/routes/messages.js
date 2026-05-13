const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const messageController = require('../controllers/messageController')
const authMiddleware = require('../middleware/auth')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }
  next()
}

router.get('/', messageController.getPublic)
router.post('/', [
  body('nickname').trim().notEmpty().withMessage('昵称不能为空'),
  body('content').trim().notEmpty().withMessage('内容不能为空'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('邮箱格式不正确')
], validate, messageController.create)
router.get('/admin', authMiddleware, messageController.getAdmin)
router.put('/:id/review', authMiddleware, messageController.review)
router.delete('/:id', authMiddleware, messageController.delete)

module.exports = router
