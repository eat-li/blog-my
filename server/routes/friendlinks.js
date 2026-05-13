const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const friendlinkController = require('../controllers/friendlinkController')
const authMiddleware = require('../middleware/auth')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }
  next()
}

const linkValidation = [
  body('nickname').trim().notEmpty().withMessage('昵称不能为空'),
  body('url').trim().notEmpty().withMessage('网址不能为空').isURL().withMessage('网址格式不正确')
]

router.get('/',         friendlinkController.getPublic)
router.post('/apply',  linkValidation, validate, friendlinkController.apply)
router.get('/admin',   authMiddleware, friendlinkController.getAdmin)
router.post('/',       authMiddleware, linkValidation, validate, friendlinkController.create)
router.put('/:id',     authMiddleware, linkValidation, validate, friendlinkController.update)
router.delete('/:id',  authMiddleware, friendlinkController.delete)

module.exports = router
