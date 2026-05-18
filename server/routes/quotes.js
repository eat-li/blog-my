const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const quoteController = require('../controllers/quoteController')
const authMiddleware = require('../middleware/auth')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }
  next()
}

router.get('/',         quoteController.getPublic)
router.get('/admin',   authMiddleware, quoteController.getAdmin)
router.post('/',       authMiddleware, [
  body('text').trim().notEmpty().withMessage('名言内容不能为空')
], validate, quoteController.create)
router.put('/:id',     authMiddleware, [
  body('text').optional().trim().notEmpty().withMessage('名言内容不能为空')
], validate, quoteController.update)
router.delete('/:id',  authMiddleware, quoteController.delete)

module.exports = router
