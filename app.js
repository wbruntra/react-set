const express = require('express')
const path = require('path')
const logger = require('morgan')

const cookieSession = require('cookie-session')

const app = express()

app.use(
  cookieSession({
    name: 'session',
    keys: ['changeme'],
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  }),
)

const routes = require('./routes')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'client', 'build')))

app.use('/api', routes)

if (process.env.NODE_ENV === 'production') {
  app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
  })
}

module.exports = app
