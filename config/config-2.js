const secrets = require('../secrets')

module.exports = {
  development: {
    username: 'root',
    password: 'sylo',
    database: 'reactdb',
    host: '172.17.0.2',
    dialect: 'mysql',
    dialectOptions: {
      timezone: 'Etc/GMT0',
    },
  },
  production: {
    username: 'pi',
    password: secrets.DB_PASSWORD,
    database: 'reactdb',
    host: '127.0.0.1',
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      timezone: 'Etc/GMT0',
    },
  },
}
