// require('dotenv').config()
const knexfile = require('./knexfile')
const NODE_ENV = process.env.NODE_ENV || 'development'

const config = knexfile[NODE_ENV]
console.log(`Using database configuration for: ${NODE_ENV}`)
console.log(config)

const knex = require('knex')(config)

module.exports = knex
