const secrets = require('./secrets')

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      database: 'reactdb',
      user: 'william',
      password: 'battle',
      port: 3366,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'mysql2',
    connection: {
      database: secrets.DB_NAME,
      user: secrets.DB_USER,
      password: secrets.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
}
