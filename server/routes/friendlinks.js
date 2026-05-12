const express = require('express')
const router = express.Router()
const friendlinkController = require('../controllers/friendlinkController')
const authMiddleware = require('../middleware/auth')

router.get('/',         friendlinkController.getPublic)
router.get('/admin',   authMiddleware, friendlinkController.getAdmin)
router.post('/',       authMiddleware, friendlinkController.create)
router.put('/:id',     authMiddleware, friendlinkController.update)
router.delete('/:id',  authMiddleware, friendlinkController.delete)

module.exports = router
