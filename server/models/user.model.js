const { DataTypes } = require('sequelize')
const sequelize = require('../config/db.config')

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING(50)
  },
  avatar: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'users'
})

module.exports = User
