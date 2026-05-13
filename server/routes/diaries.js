const express = require('express')
const router = express.Router()
const diaryController = require('../controllers/diaryController')
const authMiddleware = require('../middleware/auth')

// 管理接口（具体路由放在 :id 之前）
router.get('/admin/list', authMiddleware, diaryController.getAdminList)
router.post('/',          authMiddleware, diaryController.create)
router.put('/:id',        authMiddleware, diaryController.update)
router.delete('/:id',     authMiddleware, diaryController.delete)

// 公开接口
router.get('/',           diaryController.getPublicList)
router.get('/:id',        diaryController.getPublicDetail)

module.exports = router
