import { log } from "console";
import { Server } from "socket.io";

let playerState = {
  playing: false,
  played: 0,
  playedSeconds: 0,
  loaded: 0,
  loadedSeconds: 0,
  duration: 0,
  playbackRate: 1,
  loop: false,
  trackQueue: [],
  index: 0,
};
let logs = [];
let users = {};
// "socket.id": "username",

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.IO...");
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      io.to(socket.id).emit("receiveLog", logs);
      io.to(socket.id).emit("receiveUsers", users);
      io.to(socket.id).emit("receivePlayerState", playerState);

      socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        logs = [`${users[socket.id]} 離開了房間`, ...logs];
        if (users[socket.id]) delete users[socket.id];

        io.emit("receiveLog", logs);
        io.emit("receiveUsers", users);
      });

      socket.on("join", (username) => {
        logs = [`${username} 加入了房間`, ...logs];
        users[socket.id] = username;

        io.emit("receiveLog", logs);
        io.emit("receiveUsers", users);
      });

      socket.on("setUsername", (username) => {
        users[socket.id] = username;
        io.emit("receiveUsers", users);
      });

      socket.on("setLog", (newLogs) => {
        logs = newLogs;
        io.emit("receiveLog", logs);
      });
      socket.on("addLog", (newLog) => {
        logs = [newLog, ...logs];
        io.emit("receiveLog", logs);
      });

      socket.on("setPlayerState", (state) => {
        playerState = { ...playerState, ...state };
        io.emit("receivePlayerState", playerState);
      });
      socket.on("getPlayerState", () => {
        io.emit("getPlayerState", playerState);
      });
      // socket.on("updatePlayerState", (state) => {
      //   playerState = { ...playerState, ...state };
      // });

      socket.on("seek", (time) => {
        io.emit("seek", time);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("Socket.IO already initialized.");
  }

  res.end();
}
