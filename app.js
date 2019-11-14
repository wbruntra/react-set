var createError = require('http-errors')
var express = require('express')
var path = require('path')
var logger = require('morgan')
// var socket_io = require("socket.io");

var cookieSession = require('cookie-session')

var app = express()

app.use(
  cookieSession({
    name: 'session',
    keys: ['changeme'],
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  }),
)

var routes = require('./routes')


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

// app.use("/", (req, res) => {
//   res.send("OK");
// });

module.exports = app
