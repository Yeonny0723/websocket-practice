const socket = io(); // 서버 연결 socket.io 내장 함수

const roomCreateContainer = document.getElementById("room-create__container");
const roomCreateForm = roomCreateContainer.querySelector("form");
const roomContainer = document.getElementById("room__container");
const roomForm = roomContainer.querySelector("form");
roomContainer.hidden = true;

let roomName;
let nickname;

function showRoom() {
  roomCreateContainer.hidden = true;
  roomContainer.hidden = false;
  const h3 = roomContainer.querySelector("h3");
  h3.innerText = `방: ${roomName}`;
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const roomInput = roomCreateForm.querySelector("#room-name");
  const nickInput = roomCreateForm.querySelector("#nickname");
  const _roomName = roomInput.value;
  const _nickname = nickInput.value;
  roomName = _roomName;
  nickname = _nickname;
  socket.emit("create_room", _roomName, _nickname, showRoom);
  roomInput.value = "";
  nickInput.value = "";
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = roomForm.querySelector("input");
  const message = input.value;
  input.value = "";
  socket.emit("send_message", message, roomName, nickname, () => {
    addMessage(`You: ${message}`);
  });
}

function addMessage(message) {
  const ul = document.getElementById("chat__container");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

roomCreateForm.addEventListener("submit", handleRoomSubmit);
roomForm.addEventListener("submit", handleMessageSubmit);

socket.on("join", (nickname) => addMessage(`${nickname} joined.`));
socket.on("send_message", addMessage);
socket.on("leave", (nickname) => addMessage(`${nickname} left.`));
socket.on("list_rooms", (publicRooms) => {
  const roomList = document.querySelector("ul");
  roomList.innerHTML = "";
  publicRooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
