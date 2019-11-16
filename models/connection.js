const { Sequelize } = require('sequelize')
const config = require('../config/config')
const sequelize = new Sequelize(config.dbConnection, {
  logging: false,
  dialectOptions: {
    timezone: 'Etc/GMT0',
  },
})

module.exports = sequelize
