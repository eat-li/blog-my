const { DataTypes } = require('sequelize')
const sequelize = require('../config/db.config')

const Category = sequelize.define('Category', {
  name: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  icon: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'categories'
})

module.exports = Category
