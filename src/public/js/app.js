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
    const currentCamera = myStream.getVideoTracks()[0]; // 현재 비디오 device
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
}

muteBtn.addEventListener("click", handleMuteClick);
cameraSwitchBtn.addEventListener("click", handleCameraCLick);
cameraSelects.addEventListener("input", handleCameraChange);

getVideoMedia();
