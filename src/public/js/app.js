const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => console.log("Connected to Server!"));
setTimeout(() => {
  socket.send("Hello from Browser!");
}, 10000);
socket.addEventListener("message", (message) => console.log(message));
socket.addEventListener("close", () =>
  console.log("Disconnected from server!")
);
