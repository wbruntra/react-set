require('dotenv').config()
const knexfile = require('./knexfile')
const NODE_ENV = process.env.NODE_ENV || 'development'

const knex = require('knex')(knexfile[NODE_ENV])

module.exports = knex
