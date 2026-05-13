const jwt = require('jsonwebtoken')

function getToken(req) {
  // 优先从 httpOnly cookie 读取
  if (req.cookies && req.cookies.token) {
    return req.cookies.token
  }
  // 兼容 Authorization header
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1]
  }
  return null
}

function authMiddleware(req, res, next) {
  const token = getToken(req)
  if (!token) {
    return res.status(401).json({ message: '未登录' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch (err) {
    return res.status(401).json({ message: '登录已过期' })
  }
}

module.exports = authMiddleware
