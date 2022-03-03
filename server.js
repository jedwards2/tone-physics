const express = require("express");

const app = express();
const server = app.listen(3000);

app.use(express.static("public"));

console.log("hi");

const socket = require("socket.io");

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.sockets.on("connection", newConnection);

function newConnection(socket) {
  console.log(socket.id);

  socket.on("talkback", (msg) => {
    socket.broadcast.emit("talkback", msg);
  });
}
