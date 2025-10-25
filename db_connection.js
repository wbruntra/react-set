const knexfile = require('./knexfile')
const NODE_ENV = process.env.NODE_ENV || 'development'

const config = knexfile[NODE_ENV]
console.log(`Using database configuration for: ${NODE_ENV}`)

const knex = require('knex')({
  ...config,
  client: require('knex-bun-sqlite'),
  useNullAsDefault: true,
})

module.exports = knex
