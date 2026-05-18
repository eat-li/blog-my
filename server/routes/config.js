const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const configController = require('../controllers/configController')
const authMiddleware = require('../middleware/auth')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }
  next()
}

router.get('/public', configController.getPublic)
router.get('/:key', configController.getByKey)
router.put('/:key', authMiddleware, [
  body('value').notEmpty().withMessage('配置值不能为空')
], validate, configController.update)

module.exports = router
