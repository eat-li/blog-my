const express = require('express')
const router = express.Router()
const quoteController = require('../controllers/quoteController')
const authMiddleware = require('../middleware/auth')

router.get('/',         quoteController.getPublic)
router.get('/admin',   authMiddleware, quoteController.getAdmin)
router.post('/',       authMiddleware, quoteController.create)
router.put('/:id',     authMiddleware, quoteController.update)
router.delete('/:id',  authMiddleware, quoteController.delete)

module.exports = router
