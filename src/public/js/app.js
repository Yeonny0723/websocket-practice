const socket = io();
const videoContainer = document.getElementById("videoContainer");
const myVideoStream = document.getElementById("myVideo");
const muteBtn = document.getElementById("muteBtn");
const cameraSwitchBtn = document.getElementById("cameraSwitchBtn");
const cameraSelects = document.getElementById("cameraSelects");
const roomJoinContainer = document.getElementById("joinRoomContainer");
const roomJoinForm = roomJoinContainer.querySelector("form");

videoContainer.hidden = true;

let myStream;
let cameraOn = false;
let muteOn = false;
let roomName;
let myPeerConnection; // 내 room에 참여하는 peer

async function getCamerasAvailable() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices(); // 가능한 모든 장치
    const cameras = devices.filter((d) => d.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0]; // 현재 비디오 device
    cameraSelects.innerHTML = "";
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label; // 기기명 추출
      if (currentCamera.label === camera.label) {
        // 선택된 기기 checked
        option.selected = true;
      }
      cameraSelects.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function startMedia() {
  roomJoinContainer.hidden = true;
  videoContainer.hidden = false;
  await getVideoMedia();
  makeConnection();
}

// peer 간 연결 설정 함수
function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  // peer 간의 스트림 트랙을 주고 받을 수 있는 원격 연결 설정 객체
  myStream // 내 스크림을 원격 피어 객체로 전송
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
  myPeerConnection.addEventListener("track", handleAddStream); // myPeerConnection.addTrack 이 완료된 후 발생하는 이벤트. 스트림 받아와 영상 연결하기!
  myPeerConnection.addEventListener("icecandidate", handleIce); // setRemoteDescription 호출 후 WebRTC의 ICE 프로세스가 시작되며 발생하는 이벤트
}

function handleAddStream(data) {
  debugger;
  const peerFace = document.getElementById("peerVideo");
  peerFace.srcObject = data.streams[0];
}

function handleIce(data) {
  socket.emit("ice", data.candidate, roomName);
  console.log("sent candidate");
}

async function getVideoMedia(deviceId) {
  // 선택된 장치 ID
  const initialConstraints = {
    // 최초 렌더링 (devicdId가 없을 때) 셀카 모드
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    // 카메라 변경 시 해당 device로 switch
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstraints
    );
    myVideoStream.srcObject = myStream; // video stream 연결
    await getCamerasAvailable();
    if (!deviceId) {
      await getCamerasAvailable();
    }
  } catch (e) {
    console.log(e);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (muteOn) {
    muteBtn.innerText = "Mute";
    muteOn = false;
  } else {
    muteBtn.innerText = "UnMute";
    muteOn = true;
  }
}

function handleCameraCLick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOn) {
    cameraSwitchBtn.innerText = "Off";
    cameraOn = false;
  } else {
    cameraSwitchBtn.innerText = "On";
    cameraOn = true;
  }
}

async function handleCameraChange() {
  await getVideoMedia(cameraSelects.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}

async function handleRoomJoinSubmit(event) {
  event.preventDefault();
  const roomNameInput = roomJoinForm.querySelector("input");
  await startMedia();
  socket.emit("join_room", roomNameInput.value);
  roomName = roomNameInput.value;
  roomNameInput.value = "";
}

muteBtn.addEventListener("click", handleMuteClick);
cameraSwitchBtn.addEventListener("click", handleCameraCLick);
cameraSelects.addEventListener("input", handleCameraChange);
roomJoinForm.addEventListener("submit", handleRoomJoinSubmit);

socket.on("room_joined", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
  console.log("received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("send the answer");
});

socket.on("answer", (answer) => {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
});
