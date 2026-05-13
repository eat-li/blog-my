const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const { body, validationResult } = require('express-validator')
const authController = require('../controllers/authController')
const authMiddleware = require('../middleware/auth')

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: '登录尝试过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false
})

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }
  next()
}

router.post('/login', loginLimiter, [
  body('username').trim().notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], validate, authController.login)
router.post('/logout', authController.logout)
router.get('/me', authMiddleware, authController.getMe)

module.exports = router
