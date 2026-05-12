const authService = require('../services/authService')

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.username, req.body.password)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.userId)
    res.json({ user })
  } catch (err) {
    next(err)
  }
}
