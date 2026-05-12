const { DataTypes } = require('sequelize')
const sequelize = require('../config/db.config')

const FriendLink = sequelize.define('FriendLink', {
  nickname:   { type: DataTypes.STRING(50), allowNull: false },
  avatar:     { type: DataTypes.STRING(500) },
  signature:  { type: DataTypes.STRING(200) },
  url:        { type: DataTypes.STRING(500), allowNull: false },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  status:     { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'approved' }
}, {
  tableName: 'friendlinks'
})

module.exports = FriendLink
