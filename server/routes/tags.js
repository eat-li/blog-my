const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const tagController = require('../controllers/tagController')
const authMiddleware = require('../middleware/auth')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }
  next()
}

router.get('/', tagController.list)
router.post('/', authMiddleware, [
  body('name').trim().notEmpty().withMessage('标签名称不能为空')
], validate, tagController.create)
router.delete('/:id', authMiddleware, tagController.delete)

module.exports = router
