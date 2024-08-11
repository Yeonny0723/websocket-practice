import http from "http";
import express from "express";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on ws://localhost:3000`);

const httpServer = http.createServer(app);
const websocketServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(websocketServer, {
  auth: false,
  mode: "development",
});

function getPublicRooms() {
  const { sids, rooms } = websocketServer.sockets.adapter; // 현재 서버의 어댑터에 연결된 모든 소켓과 룸 정보
  // sids: (k) socket id (v) room id. 소켓이 어떤 방에 참여 중인지.
  // rooms: (k) room id (v) socket id. 방에 어떤 소켓이 참여 중인지.

  // public room: 퍼플릭 룸은 소켓이 특정 룸에 join할 때 처음 생성 socket.join(<<roomName>>)
  // private room: 모든 socket은 자기의 sid를 이름으로 하는 private room을 가짐

  const publicRoooms = [];
  rooms.forEach((socketId, roomId) => {
    if (sids.get(roomId) === undefined) {
      // socket id랑 일치하는 방 이름이 없다면 퍼블릭룸!
      publicRoooms.push(roomId);
    }
  });
  return publicRoooms;
}

function countUser(roomName) {
  const rooms = websocketServer.sockets.adapter.rooms;
  const room = rooms.get(roomName);
  return room.size;
}

websocketServer.on("connection", (socket) => {
  socket.onAny((event) => {
    console.log(`${event} 이벤트 발생!`);
  });
  socket.on("create_room", (roomName, nickname, cbFunc) => {
    socket["nickname"] = nickname;
    socket.join(roomName);
    cbFunc();
    socket.to(roomName).emit("join", socket.nickname, countUser(roomName));
    websocketServer.sockets.emit("list_rooms", getPublicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((roomName) =>
      socket
        .to(roomName)
        .emit("leave", socket.nickname, countUser(roomName) - 1)
    );
  });
  socket.on("disconnect", () => {
    websocketServer.sockets.emit("list_rooms", getPublicRooms());
  });
  socket.on("send_message", (msg, room, nickname, cbFunc) => {
    socket.to(room).emit("send_message", `${nickname}: ${msg}`);
    cbFunc();
  });
});

httpServer.listen(3000, handleListen);
