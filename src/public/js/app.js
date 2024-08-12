const socket = io();
const videoContainer = document.getElementById("videoContainer");
const myVideoStream = document.getElementById("myVideo");
const muteBtn = document.getElementById("muteBtn");
const cameraSwitchBtn = document.getElementById("cameraSwitchBtn");
const cameraSelects = document.getElementById("cameraSelects");

let myStream;
let cameraOn = false;
let muteOn = false;

async function getCamerasAvailable() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices(); // 가능한 모든 장치
    const cameras = devices.filter((d) => d.kind === "videoinput");
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label; // 기기명 추출
      cameraSelects.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getVideoMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    myVideoStream.srcObject = myStream; // video stream 연결
    await getCamerasAvailable();
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

muteBtn.addEventListener("click", handleMuteClick);
cameraSwitchBtn.addEventListener("click", handleCameraCLick);

getVideoMedia();
