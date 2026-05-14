const { DataTypes } = require('sequelize')
const sequelize = require('../config/db.config')

const Gallery = sequelize.define('Gallery', {
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(500)
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  thumbnail_url: {
    type: DataTypes.STRING(500)
  },
  album: {
    type: DataTypes.STRING(50),
    defaultValue: '默认'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  user_id: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'galleries'
})

module.exports = Gallery
