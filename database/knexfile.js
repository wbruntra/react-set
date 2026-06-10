// knexfile.js
const path = require('path')

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, 'react-db-dev.sqlite3'),
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'migrations'),
    },
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, 'react-db-production.sqlite3'),
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'migrations'),
    },
    // Production-specific options
    acquireConnectionTimeout: 60000,
    asyncStackTraces: false,
  },
}
