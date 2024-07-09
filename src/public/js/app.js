const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => console.log("Connected to Server!"));
setTimeout(() => {
  socket.send("Hello from Browser!");
}, 10000);
socket.addEventListener("message", async (event) => {
  console.log(`New Message: ${await event.data.text()}`);
  const input = messageForm.querySelector("input");
  input.value = "";
});
socket.addEventListener("close", () =>
  console.log("Disconnected from server!")
);

function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(input.value);
}

messageForm.addEventListener("submit", handleSubmit);
