const { DataTypes } = require('sequelize')
const sequelize = require('../config/db.config')

const Message = sequelize.define('Message', {
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100)
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  ip: {
    type: DataTypes.STRING(45)
  },
  parent_id: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'messages'
})

module.exports = Message
