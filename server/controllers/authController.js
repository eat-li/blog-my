const authService = require('../services/authService')

// 是否使用安全cookie（仅在生产环境中启用）
const isSecureCookie = process.env.NODE_ENV === 'production'

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.username, req.body.password)
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: isSecureCookie,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.json({ user: result.user })
  } catch (err) {
    next(err)
  }
}

exports.logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: 'lax'
  })
  res.json({ message: '已登出' })
}

exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.userId)
    res.json({ user })
  } catch (err) {
    next(err)
  }
}
