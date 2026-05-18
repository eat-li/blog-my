const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const galleryController = require('../controllers/galleryController')
const authMiddleware = require('../middleware/auth')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }
  next()
}

router.get('/', galleryController.list)
router.get('/admin', authMiddleware, galleryController.adminList)
router.post('/', authMiddleware, [
  body('url').trim().notEmpty().withMessage('图片地址不能为空')
], validate, galleryController.create)
router.put('/:id', authMiddleware, [
  body('url').optional().trim().notEmpty().withMessage('图片地址不能为空')
], validate, galleryController.update)
router.delete('/:id', authMiddleware, galleryController.remove)

module.exports = router
