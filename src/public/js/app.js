const socket = io();
const videoContainer = document.getElementById("videoContainer");
const myVideoStream = document.getElementById("myVideo");
const muteBtn = document.getElementById("muteBtn");
const cameraSwitchBtn = document.getElementById("cameraSwitchBtn");

let videoStream;
let cameraOn = false;
let muteOn = false;

async function getVideoMedia() {
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    myVideoStream.srcObject = videoStream; // video stream 연결
  } catch (e) {
    console.log(e);
  }
}

function handleMuteClick() {
  if (muteOn) {
    muteBtn.innerText = "Mute";
    muteOn = false;
  } else {
    muteBtn.innerText = "UnMute";
    muteOn = true;
  }
}

function handleCameraCLick() {
  if (cameraOn) {
    cameraSwitchBtn.innerText = "Off";
    cameraOn = false;
  } else {
    cameraSwitchBtn.innerText = "On";
    cameraOn = true;
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraSwitchBtn.addEventListener("click", handleCameraCLick);

getVideoMedia();
