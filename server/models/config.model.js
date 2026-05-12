const { DataTypes } = require('sequelize')
const sequelize = require('../config/db.config')

const Config = sequelize.define('Config', {
  key: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  value: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'configs'
})

module.exports = Config
