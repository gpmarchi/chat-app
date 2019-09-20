const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

const publicDirectoryPath = path.join(__dirname, "../public");

const app = express();

app.use(express.json());
app.use(express.static(publicDirectoryPath));

app.disable("x-powered-by");

const server = http.createServer(app);
const io = socketio(server);

io.on("connection", socket => {
  console.log("New websocket connection!");

  socket.emit("message", "Welcome!");
  socket.broadcast.emit("message", "A new user has joined!");

  socket.on("sendMessage", (message, ackCallback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return ackCallback("Profanity is not allowed!");
    }

    io.emit("message", message);
    ackCallback("Message delivered!");
  });

  socket.on("sendLocation", (location, ackCallback) => {
    const { latitude, longitude } = location;
    io.emit("message", `https://google.com/maps?q=${latitude},${longitude}`);
    ackCallback("Location shared!");
  });

  socket.on("disconnect", () => {
    io.emit("message", "A user has left!");
  });
});

module.exports = server;
