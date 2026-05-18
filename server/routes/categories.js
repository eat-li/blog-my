const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const categoryController = require('../controllers/categoryController')
const authMiddleware = require('../middleware/auth')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }
  next()
}

router.get('/', categoryController.list)
router.post('/', authMiddleware, [
  body('name').trim().notEmpty().withMessage('分类名称不能为空')
], validate, categoryController.create)
router.put('/:id', authMiddleware, [
  body('name').optional().trim().notEmpty().withMessage('分类名称不能为空')
], validate, categoryController.update)
router.delete('/:id', authMiddleware, categoryController.delete)

module.exports = router
