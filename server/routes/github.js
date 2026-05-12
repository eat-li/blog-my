const express = require('express')
const router = express.Router()
const githubController = require('../controllers/githubController')

router.get('/repos', githubController.repos)
router.get('/user', githubController.user)

module.exports = router
