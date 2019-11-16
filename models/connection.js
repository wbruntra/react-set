const { Sequelize } = require('sequelize')
const sequelize = new Sequelize('mariadb://root:sylo@172.17.0.2:3306/reactdb', {
  logging: false,
  dialectOptions: {
    timezone: 'Etc/GMT0',
  },
})

module.exports = sequelize
