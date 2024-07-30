const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nicknameForm = document.querySelector("#nickname");
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => console.log("Connected to Server!"));

socket.addEventListener("message", async (event) => {
  const message = await event.data;
  const li = document.createElement("li");
  li.innerText = message;
  messageList.append(li);
  const input = messageForm.querySelector("input");
  input.value = "";
});

socket.addEventListener("close", () =>
  console.log("Disconnected from server!")
);

function formatMsg(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

function handleMsgSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(formatMsg("new_message", input.value));
  input.value = "";
}

function handleNickSubmit(event) {
  event.preventDefault();
  const input = nicknameForm.querySelector("input");
  socket.send(formatMsg("nickname", input.value));
  input.value = "";
}

messageForm.addEventListener("submit", handleMsgSubmit);
nicknameForm.addEventListener("submit", handleNickSubmit);
