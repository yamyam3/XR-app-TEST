import * as THREE from "three";
import { THREEx } from "@ar-js-org/ar.js-threejs";
import { markerContent } from "../shared/content";
import { resolveAssetUrl } from "../shared/assets";
import type { QuestArCapability } from "../shared/types";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Quest-ar root element could not be found.");
}

const styles = `
  :root {
    color-scheme: dark;
    --panel: rgba(7, 18, 26, 0.78);
    --panel-strong: rgba(5, 14, 20, 0.88);
    --line: rgba(148, 163, 184, 0.18);
    --text: #e2e8f0;
    --muted: #94a3b8;
    --ok: #86efac;
    --warn: #fdba74;
    --danger: #fca5a5;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: "Segoe UI", "Hiragino Sans", sans-serif;
    background: #020617;
    color: var(--text);
  }

  .page {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #020617;
  }

  .viewer {
    position: fixed;
    inset: 0;
    z-index: 1;
    overflow: hidden;
    background: #020617;
  }

  .viewer canvas {
    position: absolute;
    inset: 0;
    z-index: 2;
    width: 100vw !important;
    height: 100vh !important;
    margin: 0 !important;
    background: transparent !important;
  }

  .quest-camera-feed {
    position: absolute !important;
    inset: 0;
    z-index: 1 !important;
    width: 100vw !important;
    height: 100vh !important;
    max-width: none !important;
    max-height: none !important;
    margin: 0 !important;
    object-fit: cover;
    background: #000;
  }

  .hud {
    position: fixed;
    inset: 0;
    z-index: 4;
    pointer-events: none;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 18px;
    gap: 18px;
  }

  .panel,
  .status {
    pointer-events: auto;
    width: min(420px, calc(100vw - 36px));
    border: 1px solid var(--line);
    border-radius: 22px;
    background: var(--panel);
    backdrop-filter: blur(16px);
    box-shadow: 0 24px 60px rgba(2, 6, 23, 0.24);
  }

  .panel {
    padding: 18px;
  }

  .status {
    align-self: flex-end;
    padding: 16px 18px;
    background: var(--panel-strong);
  }

  .eyebrow {
    color: #86efac;
    font-size: 0.76rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }

  h1 {
    margin: 8px 0 12px;
    font-size: clamp(1.8rem, 4vw, 3rem);
    line-height: 0.96;
  }

  p {
    margin: 0 0 12px;
    color: var(--muted);
    line-height: 1.65;
  }

  .card {
    margin-top: 14px;
    border: 1px solid var(--line);
    border-radius: 18px;
    padding: 14px;
    background: rgba(15, 23, 42, 0.34);
  }

  .card strong {
    display: block;
    margin-bottom: 8px;
  }

  .metric {
    display: grid;
    gap: 8px;
  }

  .metric-item {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 0.95rem;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 82px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--line);
    background: rgba(15, 23, 42, 0.42);
    color: var(--muted);
    font-size: 0.82rem;
  }

  .badge.ok {
    color: var(--ok);
  }

  .badge.warn {
    color: var(--warn);
  }

  .badge.danger {
    color: var(--danger);
  }

  .notes {
    margin: 12px 0 0;
    padding-left: 18px;
    color: var(--muted);
    line-height: 1.6;
  }

  .actions {
    margin-top: 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .button {
    min-height: 42px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(134, 239, 172, 0.3);
    background: rgba(34, 197, 94, 0.14);
    color: var(--text);
    cursor: pointer;
  }

  .status-title {
    font-size: 1rem;
    font-weight: 700;
  }

  .status-body {
    margin-top: 8px;
    color: var(--muted);
    font-size: 0.94rem;
    line-height: 1.55;
  }

  @media (max-width: 880px) {
    .hud {
      flex-direction: column;
      align-items: stretch;
    }

    .status {
      align-self: auto;
    }
  }
`;

const capability: QuestArCapability = {
  hasNavigatorXR: "xr" in navigator,
  supportsImmersiveAR: null,
  markerTrackingAvailable: null,
  notes: []
};

const page = document.createElement("div");
page.className = "page";
page.innerHTML = `
  <style>${styles}</style>
  <div id="viewer-root" class="viewer"></div>
  <div class="hud">
    <section class="panel">
      <div class="eyebrow">Quest-ar</div>
      <h1>Quest 3 Marker AR</h1>
      <p>
        Quest Browser でカメラ映像の上に 3D オブジェクトを重ねる実験ページです。
        まずは <code>Hiro</code> パターンでマーカー検出を確認します。
      </p>
      <div class="card">
        <strong>Shared content</strong>
        <p>${markerContent.title}</p>
        <p>${markerContent.description}</p>
      </div>
      <div class="card">
        <strong>Capability report</strong>
        <div class="metric" id="metric-list"></div>
        <ul class="notes" id="notes-list"></ul>
        <div class="actions">
          <button id="refresh-button" class="button" type="button">Refresh capability</button>
        </div>
      </div>
    </section>
    <section class="status">
      <div class="eyebrow">Runtime status</div>
      <div id="status-title" class="status-title">Camera setup pending</div>
      <div id="status-body" class="status-body">
        Quest Browser でカメラ許可後に Hiro マーカーを映してください。
      </div>
    </section>
  </div>
`;

app.append(page);

const viewerRoot = page.querySelector<HTMLDivElement>("#viewer-root");
const metricList = page.querySelector<HTMLDivElement>("#metric-list");
const notesList = page.querySelector<HTMLUListElement>("#notes-list");
const refreshButton = page.querySelector<HTMLButtonElement>("#refresh-button");
const statusTitle = page.querySelector<HTMLDivElement>("#status-title");
const statusBody = page.querySelector<HTMLDivElement>("#status-body");

if (!viewerRoot || !metricList || !notesList || !refreshButton || !statusTitle || !statusBody) {
  throw new Error("Quest-ar UI elements could not be initialized.");
}

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
viewerRoot.append(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.Camera();
scene.add(camera);
scene.visible = false;

const markerRoot = new THREE.Group();
markerRoot.visible = false;
scene.add(markerRoot);

const keyLight = new THREE.HemisphereLight(0xf8fafc, 0x020617, 2.4);
markerRoot.add(keyLight);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(0.42, 0.07, 20, 64),
  new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0x92400e,
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.48
  })
);
ring.rotation.x = Math.PI / 2;
ring.position.y = 0.35;
markerRoot.add(ring);

const orb = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.22, 1),
  new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x082f49,
    emissiveIntensity: 0.55,
    roughness: 0.2,
    metalness: 0.32
  })
);
orb.position.y = 0.55;
markerRoot.add(orb);

const base = new THREE.Mesh(
  new THREE.CylinderGeometry(0.3, 0.4, 0.14, 48),
  new THREE.MeshStandardMaterial({
    color: 0x0f766e,
    roughness: 0.36,
    metalness: 0.18
  })
);
base.position.y = 0.08;
markerRoot.add(base);

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(1.25, 1.25),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide
  })
);
plane.rotation.x = -Math.PI / 2;
markerRoot.add(plane);

let arToolkitSource: InstanceType<typeof THREEx.ArToolkitSource> | null = null;
let arToolkitContext: InstanceType<typeof THREEx.ArToolkitContext> | null = null;
let arMarkerControls: InstanceType<typeof THREEx.ArMarkerControls> | null = null;
let markerSeen = false;
let contextInitialized = false;
let lastTimeMsec = 0;

const badgeClass = (value: boolean | null) => {
  if (value === true) {
    return "badge ok";
  }

  if (value === false) {
    return "badge danger";
  }

  return "badge warn";
};

const badgeText = (value: boolean | null) => {
  if (value === true) {
    return "supported";
  }

  if (value === false) {
    return "unavailable";
  }

  return "unknown";
};

const setRuntimeStatus = (title: string, body: string) => {
  statusTitle.textContent = title;
  statusBody.textContent = body;
};

const buildNotes = () => {
  const notes: string[] = [];

  notes.push(
    "このページは WebXR immersive-ar ではなく、Quest Browser 上で動く video-see-through 型のマーカーAR検証です。"
  );

  if (capability.supportsImmersiveAR === true) {
    notes.push("この端末では WebXR immersive-ar も利用可能です。必要なら別モードとして後から統合できます。");
  } else if (capability.supportsImmersiveAR === false) {
    notes.push("この端末またはこの開き方では WebXR immersive-ar は使えません。マーカー検出自体は別経路で試行しています。");
  }

  if (capability.markerTrackingAvailable === true) {
    notes.push("AR.js-threejs の初期化に成功しています。Hiro パターンを映すとマーカー追跡を試行します。");
  } else if (capability.markerTrackingAvailable === false) {
    notes.push("マーカー追跡の初期化に失敗しています。カメラ権限と HTTPS 配信、Quest Browser の挙動を確認してください。");
  } else {
    notes.push("マーカー追跡は初期化中です。カメラ許可完了後に状態が更新されます。");
  }

  if (window.isSecureContext) {
    notes.push("Secure Context で実行中です。HTTPS 条件は満たしています。");
  } else {
    notes.push("Secure Context ではありません。Quest Browser でのカメラ利用には HTTPS が必要です。");
  }

  capability.notes = notes;
};

const renderCapability = () => {
  buildNotes();
  metricList.innerHTML = "";
  notesList.innerHTML = "";

  const metrics: Array<[string, boolean | null]> = [
    ["navigator.xr", capability.hasNavigatorXR],
    ["immersive-ar", capability.supportsImmersiveAR],
    ["marker tracking", capability.markerTrackingAvailable]
  ];

  metrics.forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "metric-item";
    item.innerHTML = `<strong>${label}</strong><span class="${badgeClass(value)}">${badgeText(
      value
    )}</span>`;
    metricList.append(item);
  });

  capability.notes.forEach((note) => {
    const item = document.createElement("li");
    item.textContent = note;
    notesList.append(item);
  });
};

const getSourceOrientation = () => {
  if (!arToolkitSource?.domElement) {
    return "portrait";
  }

  return arToolkitSource.domElement.videoWidth > arToolkitSource.domElement.videoHeight
    ? "landscape"
    : "portrait";
};

const attachSourceVideo = () => {
  if (!arToolkitSource?.domElement) {
    return false;
  }

  const video = arToolkitSource.domElement as HTMLVideoElement;
  video.classList.add("quest-camera-feed");
  video.muted = true;
  video.autoplay = true;
  video.setAttribute("playsinline", "true");

  if (video.parentElement !== viewerRoot) {
    viewerRoot.append(video);
  }

  return true;
};

const onResize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  if (!arToolkitSource) {
    return;
  }

  arToolkitSource.onResizeElement();

  if (arToolkitContext && (arToolkitContext as { arController: { canvas?: HTMLCanvasElement } | null }).arController) {
    const controller = (arToolkitContext as { arController: { canvas?: HTMLCanvasElement } | null }).arController;
    if (controller?.canvas) {
      arToolkitSource.copyElementSizeTo(controller.canvas);
      controller.canvas.style.display = "none";
    }
  }
};

const initArContext = () => {
  if (!arToolkitSource || contextInitialized) {
    return;
  }

  contextInitialized = true;

  arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: resolveAssetUrl("assets/arjs/camera_para.dat"),
    detectionMode: "mono"
  });

  arToolkitContext.init(() => {
    camera.projectionMatrix.copy(arToolkitContext!.getProjectionMatrix());

    const controller = (arToolkitContext as { arController: { canvas?: HTMLCanvasElement; orientation?: string; options?: { orientation?: string } } | null }).arController;
    const orientation = getSourceOrientation();

    if (controller) {
      controller.orientation = orientation;
      if (controller.options) {
        controller.options.orientation = orientation;
      }

      if (controller.canvas) {
        controller.canvas.style.display = "none";
      }
    }

    capability.markerTrackingAvailable = true;
    renderCapability();
    setRuntimeStatus("Tracking ready", "Hiro マーカーを視野に入れると、カメラ映像の上に 3D オブジェクトを重ねます。");
    onResize();
  });

  arMarkerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
    type: "pattern",
    patternUrl: resolveAssetUrl("assets/arjs/patt.hiro")
  });

  void arMarkerControls;
};

const refreshCapability = async () => {
  capability.hasNavigatorXR = "xr" in navigator;

  if (!capability.hasNavigatorXR || !navigator.xr) {
    capability.supportsImmersiveAR = false;
    renderCapability();
    return;
  }

  try {
    capability.supportsImmersiveAR = await navigator.xr.isSessionSupported("immersive-ar");
  } catch {
    capability.supportsImmersiveAR = false;
  }

  renderCapability();
};

const initMarkerTracking = () => {
  arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: "webcam",
    sourceWidth: window.innerWidth > window.innerHeight ? 640 : 480,
    sourceHeight: window.innerWidth > window.innerHeight ? 480 : 640,
    displayWidth: window.innerWidth,
    displayHeight: window.innerHeight
  });

  arToolkitSource.init(
    () => {
      attachSourceVideo();
      setRuntimeStatus("Camera ready", "カメラ映像を取得しました。Hiro マーカーの初期化を続行します。");

      const sourceVideo = arToolkitSource?.domElement as HTMLVideoElement | undefined;
      const maybeInit = () => {
        attachSourceVideo();
        if (sourceVideo && sourceVideo.videoWidth > 0 && sourceVideo.videoHeight > 0) {
          initArContext();
          onResize();
        }
      };

      sourceVideo?.addEventListener("canplay", maybeInit, { once: true });
      sourceVideo?.addEventListener("loadedmetadata", maybeInit, { once: true });
      window.setTimeout(maybeInit, 700);
      window.setTimeout(onResize, 500);
    },
    () => {
      capability.markerTrackingAvailable = false;
      renderCapability();
      setRuntimeStatus("Camera error", "Quest Browser でカメラ起動に失敗しました。権限設定と HTTPS 配信を確認してください。");
    }
  );
};

refreshButton.addEventListener("click", () => {
  void refreshCapability();
});

window.addEventListener("resize", () => {
  onResize();
});

window.addEventListener("arjs-video-loaded", () => {
  attachSourceVideo();
  onResize();
});

const animate = (nowMsec: number) => {
  requestAnimationFrame(animate);

  lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
  const deltaSec = Math.min(0.2, (nowMsec - lastTimeMsec) / 1000);
  lastTimeMsec = nowMsec;

  ring.rotation.z += deltaSec * 0.7;
  orb.rotation.x += deltaSec * 0.9;
  orb.rotation.y += deltaSec * 1.2;
  orb.position.y = 0.55 + Math.sin(nowMsec / 320) * 0.05;

  if (arToolkitContext && arToolkitSource?.ready) {
    arToolkitContext.update(arToolkitSource.domElement);

    const isVisible = markerRoot.visible;
    scene.visible = isVisible;

    if (isVisible !== markerSeen) {
      markerSeen = isVisible;

      if (isVisible) {
        setRuntimeStatus("Marker detected", "Hiro マーカーを認識しました。カメラ映像の上に共有コンテンツを表示しています。");
      } else {
        setRuntimeStatus("Searching marker", "カメラ映像は取得できています。Hiro マーカーを再度中央に映してください。");
      }
    }
  }

  renderer.render(scene, camera);
};

void refreshCapability();
setRuntimeStatus("Camera setup pending", "Quest Browser でカメラ許可後に Hiro マーカーを映してください。");
initMarkerTracking();
requestAnimationFrame(animate);
