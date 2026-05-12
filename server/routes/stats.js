const express = require('express')
const router = express.Router()
const statsController = require('../controllers/statsController')

router.get('/profile', statsController.profile)
router.get('/yearly', statsController.yearly)

module.exports = router
