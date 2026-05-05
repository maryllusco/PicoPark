const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = {};

io.on("connection", (socket) => {
  if (Object.keys(players).length >= 4) {
    socket.disconnect();
    return;
  }

  players[socket.id] = {
    x: 100,
    y: 100,
    input: {}
  };

  socket.on("keydown", (data) => {
    players[socket.id].input[data.direction] = true;
  });

  socket.on("keyup", (data) => {
    players[socket.id].input[data.direction] = false;
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
  });
});

setInterval(() => {
  for (let id in players) {
    const p = players[id];

    if (p.input.left) p.x -= 5;
    if (p.input.right) p.x += 5;
  }

  io.emit("state", players);
}, 1000 / 30);

server.listen(3000, () => {
  console.log("Server en http://localhost:3000");
});