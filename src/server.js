import http from "http";
import SocketIo from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on ws://localhost:3000`);

const httpServer = http.createServer(app);
const websocketServer = SocketIo(httpServer);

websocketServer.on("connection", (socket) => {
  socket.onAny((event) => {
    console.log(`${event} 이벤트 발생!`);
  });
  socket.on("create_room", (roomName, cbFunc) => {
    socket.join(roomName);
    cbFunc();
    socket.to(roomName).emit("join");
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => socket.to(room).emit("leave"));
  });
  socket.on("send_message", (msg, room, cbFunc) => {
    socket.to(room).emit("send_message", msg);
    cbFunc();
  });
});

httpServer.listen(3000, handleListen);
