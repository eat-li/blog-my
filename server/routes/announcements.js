const express = require('express')
const router = express.Router()
const announcementController = require('../controllers/announcementController')
const authMiddleware = require('../middleware/auth')

router.get('/',         announcementController.getActive)
router.get('/admin',   authMiddleware, announcementController.getAdmin)
router.post('/',       authMiddleware, announcementController.create)
router.put('/:id',     authMiddleware, announcementController.update)
router.delete('/:id',  authMiddleware, announcementController.delete)

module.exports = router
