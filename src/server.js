import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on ws://localhost:3000`);

// http & ws 프로토콜 모두 이해하는 서버 생성
const server = http.createServer(app);
const websocketServer = new WebSocket.Server({ server });

const browserSockets = []; // 서버와 응답하는 여러 브라우저의 소캣 저장하여 받은 메시지를 모두의 브라우저로 전달할 수 있음.

websocketServer.on("connection", (socket) => {
  browserSockets.push(socket);
  console.log("Connected to browser!");
  socket.send("Hello from Server!");
  socket.on("message", (message) =>
    browserSockets.forEach((socket) => socket.send(message))
  );
  socket.on("close", () => console.log("Disconnected from Browser!"));
});

server.listen(3000, handleListen);
