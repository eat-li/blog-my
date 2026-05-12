const { DataTypes } = require('sequelize')
const sequelize = require('../config/db.config')

const Tag = sequelize.define('Tag', {
  name: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  }
}, {
  tableName: 'tags'
})

module.exports = Tag
