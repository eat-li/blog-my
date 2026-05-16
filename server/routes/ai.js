const express = require('express')
const router = express.Router()
const aiController = require('../controllers/aiController')
const authMiddleware = require('../middleware/auth')

router.post('/assist', authMiddleware, aiController.assist)
router.get('/types', authMiddleware, aiController.types)

module.exports = router
