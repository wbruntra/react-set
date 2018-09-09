var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
var socket_io = require("socket.io");

var app = express();
var io = socket_io();
const { guestAction } = require("./socket-events");
app.io = io;

// socket.io events
io.on("connection", function(socket) {
  socket.on("guest", action => {
    const data = guestAction(action);
    io.emit("host", data);
  });

  socket.on("host", data => {
    io.emit("guest", data);
  });
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", (req, res) => {
  res.send("OK");
});

module.exports = app;
