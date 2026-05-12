const { DataTypes } = require('sequelize')
const sequelize = require('../config/db.config')

const Post = sequelize.define('Post', {
  type: {
    type: DataTypes.ENUM('article', 'anime', 'galgame'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  summary: {
    type: DataTypes.STRING(500)
  },
  cover_image: {
    type: DataTypes.STRING(255)
  },
  category_id: {
    type: DataTypes.INTEGER
  },
  rating: {
    type: DataTypes.INTEGER
  },
  metadata: {
    type: DataTypes.JSON
  },
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    defaultValue: 'draft'
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  user_id: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'posts'
})

module.exports = Post
