const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models')

class AuthService {
  async login(username, password) {
    const user = await User.findOne({ where: { username } })
    if (!user) {
      throw Object.assign(new Error('用户名或密码错误'), { status: 401 })
    }
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      throw Object.assign(new Error('用户名或密码错误'), { status: 401 })
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    return {
      token,
      user: { id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar }
    }
  }

  async getMe(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    })
    if (!user) {
      throw Object.assign(new Error('用户不存在'), { status: 404 })
    }
    return user
  }
}

module.exports = new AuthService()
