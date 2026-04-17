import { markerContent } from "../shared/content";

const statusDot = document.querySelector<HTMLElement>("#status-dot");
const statusText = document.querySelector<HTMLElement>("#status-text");
const contentTitle = document.querySelector<HTMLElement>("#content-title");
const contentBody = document.querySelector<HTMLElement>("#content-body");
const markerEl = document.querySelector<HTMLElement>("#tracked-marker");
const sceneEl = document.querySelector<HTMLElement>("a-scene");

if (
  !statusDot ||
  !statusText ||
  !contentTitle ||
  !contentBody ||
  !markerEl ||
  !sceneEl
) {
  throw new Error("Phone-ar UI could not be initialized.");
}

const setStatus = (message: string, ready: boolean) => {
  statusText.textContent = message;
  statusDot.classList.toggle("ready", ready);
};

const showDefaultMessage = () => {
  contentTitle.textContent = "Marker not detected";
  contentBody.textContent =
    "カメラ許可後に Hiro マーカーを映すと、3D オブジェクトと説明文が表示されます。";
};

const showMarkerContent = () => {
  contentTitle.textContent = markerContent.title;
  contentBody.textContent = markerContent.description;
};

const attachFullscreenCameraStyles = () => {
  const sourceVideo = document.querySelector<HTMLVideoElement>("video.arjs-video");

  if (!sourceVideo) {
    return false;
  }

  sourceVideo.setAttribute("playsinline", "true");
  sourceVideo.muted = true;
  sourceVideo.autoplay = true;
  sourceVideo.style.display = "block";
  return true;
};

showDefaultMessage();
setStatus("カメラ準備中", false);

sceneEl.addEventListener("loaded", () => {
  setStatus("カメラ初期化完了。Hiro マーカーを探しています", false);
  window.setTimeout(() => {
    attachFullscreenCameraStyles();
  }, 300);
});

markerEl.addEventListener("markerFound", () => {
  setStatus("マーカー検出中", true);
  showMarkerContent();
});

markerEl.addEventListener("markerLost", () => {
  setStatus("マーカーを見失いました", false);
  showDefaultMessage();
});

window.addEventListener("camera-error", () => {
  setStatus("カメラにアクセスできません。権限設定を確認してください", false);
});

window.addEventListener("arjs-video-loaded", () => {
  setStatus("カメラ起動完了。Hiro マーカーを探しています", false);
  if (!attachFullscreenCameraStyles()) {
    window.setTimeout(() => {
      attachFullscreenCameraStyles();
    }, 800);
  }
});
