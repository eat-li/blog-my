const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const diaryController = require('../controllers/diaryController')
const authMiddleware = require('../middleware/auth')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }
  next()
}

// 管理接口（具体路由放在 :id 之前）
router.get('/admin/list', authMiddleware, diaryController.getAdminList)
router.post('/',          authMiddleware, [
  body('title').trim().notEmpty().withMessage('日记标题不能为空'),
  body('content').notEmpty().withMessage('日记内容不能为空')
], validate, diaryController.create)
router.put('/:id',        authMiddleware, [
  body('title').optional().trim().notEmpty().withMessage('日记标题不能为空'),
  body('content').optional().notEmpty().withMessage('日记内容不能为空')
], validate, diaryController.update)
router.delete('/:id',     authMiddleware, diaryController.delete)

// 公开接口
router.get('/',           diaryController.getPublicList)
router.get('/:id',        diaryController.getPublicDetail)

module.exports = router
