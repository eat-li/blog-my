const { DataTypes } = require('sequelize')
const sequelize = require('../config/db.config')

const Diary = sequelize.define('Diary', {
  title:     { type: DataTypes.STRING(200), allowNull: false },
  content:   { type: DataTypes.TEXT, allowNull: false },
  mood:      { type: DataTypes.STRING(50) },
  weather:   { type: DataTypes.STRING(50) },
  images:    { type: DataTypes.JSON, defaultValue: [] },
  is_public: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'diaries'
})

module.exports = Diary
