const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const announcementController = require('../controllers/announcementController')
const authMiddleware = require('../middleware/auth')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }
  next()
}

router.get('/',         announcementController.getActive)
router.get('/admin',   authMiddleware, announcementController.getAdmin)
router.post('/',       authMiddleware, [
  body('content').trim().notEmpty().withMessage('公告内容不能为空')
], validate, announcementController.create)
router.put('/:id',     authMiddleware, [
  body('content').optional().trim().notEmpty().withMessage('公告内容不能为空')
], validate, announcementController.update)
router.delete('/:id',  authMiddleware, announcementController.delete)

module.exports = router
