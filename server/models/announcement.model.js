const { DataTypes } = require('sequelize')
const sequelize = require('../config/db.config')

const Announcement = sequelize.define('Announcement', {
  content:    { type: DataTypes.STRING(500), allowNull: false },
  is_active:  { type: DataTypes.BOOLEAN, defaultValue: true },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'announcements'
})

module.exports = Announcement
