module.exports = {
  development: {
    username: 'root',
    password: 'sylo',
    database: 'reactdb',
    host: '172.17.0.2',
    dialect: 'mariadb',
    dialectOptions: {
      timezone: 'Etc/GMT0',
    },
  },
  production: {
    username: 'pi',
    password: 'curses',
    database: 'reactdb',
    host: '127.0.0.1',
    dialect: 'mariadb',
    logging: false,
    dialectOptions: {
      timezone: 'Etc/GMT0',
    },
  },
}
