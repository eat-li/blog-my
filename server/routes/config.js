const express = require('express')
const router = express.Router()
const configController = require('../controllers/configController')
const authMiddleware = require('../middleware/auth')

router.get('/public', configController.getPublic)
router.get('/:key', configController.getByKey)
router.put('/:key', authMiddleware, configController.update)

module.exports = router
