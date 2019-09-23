const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage
} = require("./utils/messages");

const publicDirectoryPath = path.join(__dirname, "../public");

const app = express();

app.use(express.json());
app.use(express.static(publicDirectoryPath));

app.disable("x-powered-by");

const server = http.createServer(app);
const io = socketio(server);

io.on("connection", socket => {
  console.log("New websocket connection!");

  socket.on("sendMessage", (message, ackCallback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return ackCallback("Profanity is not allowed!");
    }

    io.to("test").emit("message", generateMessage(message));
    ackCallback("Message delivered!");
  });

  socket.on("sendLocation", (location, ackCallback) => {
    const { latitude, longitude } = location;
    io.emit(
      "locationMessage",
      generateLocationMessage(
        `https://google.com/maps?q=${latitude},${longitude}`
      )
    );
    ackCallback("Location shared!");
  });

  socket.on("join", ({ username, room }) => {
    socket.join(room);
    socket.emit("message", generateMessage("Welcome!"));
    socket.broadcast
      .to(room)
      .emit("message", generateMessage(`${username} has joined!`));
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left!"));
  });
});

module.exports = server;
