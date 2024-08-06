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
  console.log("socket", socket);
  socket.on("createRoom", (payload, cbFunc) => {
    cbFunc(); // 프론트 함수를 백엔드에서 실행할 수 있음 !! - 실시간 업데이트 - 서버 푸시 알림
  });
});

httpServer.listen(3000, handleListen);
