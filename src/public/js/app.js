const socket = io(); // 서버 연결 socket.io 내장 함수

const roomContainer = document.getElementById("room-container");
const form = roomContainer.querySelector("form");

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  // emit(커스텀이벤트, ...페이로드 여러개...)
  socket.emit("createRoom", { payload: input.value }, () => {
    console.log("메시지 전달 완료! 콜백!");
  });
}

form.addEventListener("submit", handleRoomSubmit);
