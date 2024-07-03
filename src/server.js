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

function handleConnection(socket) {
  console.log(socket);
}

websocketServer.on("connection", handleConnection); // ('event', cbFunc)

server.listen(3000, handleListen);
