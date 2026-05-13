const { DataTypes } = require('sequelize')
const sequelize = require('../config/db.config')

const Quote = sequelize.define('Quote', {
  ja:        { type: DataTypes.STRING(500), allowNull: false },
  zh:        { type: DataTypes.STRING(500), allowNull: false },
  source:    { type: DataTypes.STRING(200) },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'quotes'
})

module.exports = Quote
