const socket = io(); // 서버 연결 socket.io 내장 함수

const roomCreateContainer = document.getElementById("room-create__container");
const roomCreateForm = roomCreateContainer.querySelector("form");
const roomContainer = document.getElementById("room__container");
const roomForm = roomContainer.querySelector("form");
roomContainer.hidden = true;

let roomName;

function showRoom() {
  roomCreateContainer.hidden = true;
  roomContainer.hidden = false;
  const h3 = roomContainer.querySelector("h3");
  h3.innerText = `방: ${roomName}`;
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = roomCreateForm.querySelector("input");
  roomName = input.value;
  socket.emit("create_room", input.value, showRoom);
  input.value = "";
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = roomForm.querySelector("input");
  const message = input.value;
  input.value = "";
  socket.emit("send_message", message, roomName, () => {
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

socket.on("join", () => addMessage("Someone joined."));
socket.on("send_message", addMessage);
socket.on("leave", () => addMessage("Someone left."));
