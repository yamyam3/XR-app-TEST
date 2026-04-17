import * as THREE from "three";
import { THREEx } from "@ar-js-org/ar.js-threejs";
import { markerContent } from "../shared/content";
import { resolveAssetUrl } from "../shared/assets";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Immersive-ar-with-marker root element could not be found.");
}

const styles = `
  :root {
    color-scheme: dark;
    --panel: rgba(7, 18, 26, 0.78);
    --panel-strong: rgba(5, 14, 20, 0.9);
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
    background: #020617;
    color: var(--text);
    font-family: "Segoe UI", "Hiragino Sans", sans-serif;
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
  }

  .viewer canvas {
    position: absolute;
    inset: 0;
    z-index: 2;
    width: 100vw !important;
    height: 100vh !important;
    margin: 0 !important;
    display: block;
    background: transparent !important;
  }

  .marker-camera-feed {
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
    z-index: 5;
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
    width: min(440px, calc(100vw - 36px));
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
    min-width: 86px;
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

  .actions {
    margin-top: 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .button {
    min-height: 44px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(134, 239, 172, 0.3);
    background: rgba(34, 197, 94, 0.14);
    color: var(--text);
    cursor: pointer;
  }

  .button.secondary {
    border-color: var(--line);
    background: rgba(15, 23, 42, 0.36);
  }

  .button:disabled {
    cursor: default;
    opacity: 0.48;
  }

  .notes {
    margin: 12px 0 0;
    padding-left: 18px;
    color: var(--muted);
    line-height: 1.6;
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

  .hint {
    margin-top: 10px;
    color: var(--muted);
    font-size: 0.86rem;
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

const page = document.createElement("div");
page.className = "page";
page.innerHTML = `
  <style>${styles}</style>
  <div id="marker-viewer" class="viewer"></div>
  <div id="immersive-viewer" class="viewer" hidden></div>
  <div class="hud">
    <section class="panel">
      <div class="eyebrow">Immersive-ar-with-marker</div>
      <h1>Marker To Immersive AR</h1>
      <p>
        まずは <code>Hiro</code> マーカーを検出し、その時点の相対位置を保存してから
        <code>immersive-ar</code> セッションへ移ります。没入後は保存した位置関係を元に
        パススルー空間へオブジェクトを再配置します。
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
          <button id="refresh-button" class="button secondary" type="button">Refresh capability</button>
          <button id="capture-button" class="button" type="button" disabled>Capture marker pose</button>
          <button id="start-button" class="button" type="button" disabled>Start immersive-ar</button>
        </div>
        <div class="hint">
          1. マーカーを認識  2. Capture marker pose  3. Start immersive-ar の順で進めます。
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

const markerViewer = page.querySelector<HTMLDivElement>("#marker-viewer");
const immersiveViewer = page.querySelector<HTMLDivElement>("#immersive-viewer");
const metricList = page.querySelector<HTMLDivElement>("#metric-list");
const notesList = page.querySelector<HTMLUListElement>("#notes-list");
const refreshButton = page.querySelector<HTMLButtonElement>("#refresh-button");
const captureButton = page.querySelector<HTMLButtonElement>("#capture-button");
const startButton = page.querySelector<HTMLButtonElement>("#start-button");
const statusTitle = page.querySelector<HTMLDivElement>("#status-title");
const statusBody = page.querySelector<HTMLDivElement>("#status-body");

if (
  !markerViewer ||
  !immersiveViewer ||
  !metricList ||
  !notesList ||
  !refreshButton ||
  !captureButton ||
  !startButton ||
  !statusTitle ||
  !statusBody
) {
  throw new Error("Immersive-ar-with-marker UI elements could not be initialized.");
}

const markerRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
markerRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
markerRenderer.setClearColor(0x000000, 0);
markerRenderer.setSize(window.innerWidth, window.innerHeight);
markerViewer.append(markerRenderer.domElement);

const immersiveRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
immersiveRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
immersiveRenderer.setSize(window.innerWidth, window.innerHeight);
immersiveRenderer.xr.enabled = true;
immersiveViewer.append(immersiveRenderer.domElement);

const markerScene = new THREE.Scene();
markerScene.visible = false;
const markerCamera = new THREE.Camera();
markerScene.add(markerCamera);

const trackedRoot = new THREE.Group();
trackedRoot.visible = false;
markerScene.add(trackedRoot);

const markerLight = new THREE.HemisphereLight(0xf8fafc, 0x020617, 2.4);
trackedRoot.add(markerLight);

const markerRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.42, 0.07, 20, 64),
  new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0x92400e,
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.48
  })
);
markerRing.rotation.x = Math.PI / 2;
markerRing.position.y = 0.35;
trackedRoot.add(markerRing);

const markerOrb = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.22, 1),
  new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x082f49,
    emissiveIntensity: 0.55,
    roughness: 0.2,
    metalness: 0.32
  })
);
markerOrb.position.y = 0.55;
trackedRoot.add(markerOrb);

const markerBase = new THREE.Mesh(
  new THREE.CylinderGeometry(0.3, 0.4, 0.14, 48),
  new THREE.MeshStandardMaterial({
    color: 0x0f766e,
    roughness: 0.36,
    metalness: 0.18
  })
);
markerBase.position.y = 0.08;
trackedRoot.add(markerBase);

const markerPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(1.25, 1.25),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide
  })
);
markerPlane.rotation.x = -Math.PI / 2;
trackedRoot.add(markerPlane);

const immersiveScene = new THREE.Scene();
const immersiveCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 100);
immersiveScene.add(new THREE.HemisphereLight(0xf8fafc, 0x0f172a, 2.2));
const immersiveLight = new THREE.DirectionalLight(0xffffff, 1.2);
immersiveLight.position.set(2, 4, 1);
immersiveScene.add(immersiveLight);

const anchorGroup = new THREE.Group();
immersiveScene.add(anchorGroup);

const immersiveRing = markerRing.clone() as THREE.Mesh;
const immersiveOrb = markerOrb.clone() as THREE.Mesh;
const immersiveBase = markerBase.clone() as THREE.Mesh;
const immersivePlane = new THREE.Mesh(
  new THREE.CircleGeometry(0.42, 48),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.09
  })
);
immersivePlane.rotation.x = -Math.PI / 2;
immersivePlane.position.y = -0.18;
anchorGroup.add(immersiveRing, immersiveOrb, immersiveBase, immersivePlane);

let arToolkitSource: InstanceType<typeof THREEx.ArToolkitSource> | null = null;
let arToolkitContext: InstanceType<typeof THREEx.ArToolkitContext> | null = null;
let markerControls: InstanceType<typeof THREEx.ArMarkerControls> | null = null;
let markerFound = false;
let markerPoseCaptured = false;
let contextInitialized = false;
let xrSession: XRSession | null = null;
let immersiveSupported: boolean | null = null;
let markerTrackingAvailable: boolean | null = null;
let markerPlacementApplied = false;
let lastAnimationTime = 0;
let markerLocalPosition = new THREE.Vector3(0, 0, -1.5);
let markerLocalQuaternion = new THREE.Quaternion();

const setRuntimeStatus = (title: string, body: string) => {
  statusTitle.textContent = title;
  statusBody.textContent = body;
};

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

const renderCapability = () => {
  metricList.innerHTML = "";
  notesList.innerHTML = "";

  const hasNavigatorXR = "xr" in navigator;
  const metrics: Array<[string, boolean | null]> = [
    ["navigator.xr", hasNavigatorXR],
    ["marker tracking", markerTrackingAvailable],
    ["immersive-ar", immersiveSupported],
    ["pose captured", markerPoseCaptured]
  ];

  metrics.forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "metric-item";
    item.innerHTML = `<strong>${label}</strong><span class="${badgeClass(value)}">${badgeText(value)}</span>`;
    metricList.append(item);
  });

  const notes: string[] = [
    "このページでは marker tracking と immersive-ar を同時に走らせず、先にマーカー位置を確定してから没入型に移ります。",
    "保存するのは検出時のカメラ基準の相対位置です。Quest の内部座標に直接アンカーするわけではないため、位置は近似になります。"
  ];

  if (window.isSecureContext) {
    notes.push("Secure Context で実行中です。HTTPS 条件は満たしています。");
  } else {
    notes.push("Secure Context ではありません。カメラと immersive-ar に HTTPS が必要です。");
  }

  if (markerTrackingAvailable === true && immersiveSupported === true) {
    notes.push("両方の前提が揃っています。マーカー検出後に没入型へ移れます。");
  }

  notes.forEach((note) => {
    const item = document.createElement("li");
    item.textContent = note;
    notesList.append(item);
  });
};

const updateButtons = () => {
  captureButton.disabled = !markerFound || xrSession !== null;
  startButton.disabled = !markerPoseCaptured || immersiveSupported !== true;
  startButton.textContent = xrSession ? "End immersive-ar" : "Start immersive-ar";
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
  video.classList.add("marker-camera-feed");
  video.muted = true;
  video.autoplay = true;
  video.setAttribute("playsinline", "true");

  if (video.parentElement !== markerViewer) {
    markerViewer.append(video);
  }

  return true;
};

const resizeMarkerStage = () => {
  markerRenderer.setSize(window.innerWidth, window.innerHeight, false);

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

const resizeImmersiveStage = () => {
  immersiveCamera.aspect = window.innerWidth / window.innerHeight;
  immersiveCamera.updateProjectionMatrix();
  immersiveRenderer.setSize(window.innerWidth, window.innerHeight, false);
};

const captureMarkerPose = () => {
  trackedRoot.updateMatrixWorld(true);
  markerLocalPosition.setFromMatrixPosition(trackedRoot.matrixWorld);
  trackedRoot.matrixWorld.decompose(new THREE.Vector3(), markerLocalQuaternion, new THREE.Vector3());
  markerPoseCaptured = true;
  renderCapability();
  updateButtons();
  setRuntimeStatus("Pose captured", "マーカー検出時の相対位置を保存しました。Start immersive-ar で没入型へ移れます。");
};

const applyCapturedPoseInImmersive = () => {
  const xrCamera = immersiveRenderer.xr.getCamera();
  xrCamera.updateMatrixWorld(true);

  const cameraPosition = new THREE.Vector3();
  const cameraQuaternion = new THREE.Quaternion();
  const cameraScale = new THREE.Vector3();
  xrCamera.matrixWorld.decompose(cameraPosition, cameraQuaternion, cameraScale);

  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraQuaternion).normalize();
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cameraQuaternion).normalize();
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(cameraQuaternion).normalize();

  const lateral = THREE.MathUtils.clamp(markerLocalPosition.x, -0.6, 0.6);
  const vertical = THREE.MathUtils.clamp(markerLocalPosition.y, -0.35, 0.35);
  const depth = THREE.MathUtils.clamp(-markerLocalPosition.z, 0.9, 1.8);

  const targetPosition = cameraPosition
    .clone()
    .add(right.multiplyScalar(lateral))
    .add(up.multiplyScalar(vertical))
    .add(forward.multiplyScalar(depth));

  const targetEuler = new THREE.Euler().setFromQuaternion(cameraQuaternion, "YXZ");
  targetEuler.x = 0;
  targetEuler.z = 0;

  anchorGroup.position.copy(targetPosition);
  anchorGroup.quaternion.setFromEuler(targetEuler);
  anchorGroup.scale.setScalar(1.2);
  markerPlacementApplied = true;
};

const initMarkerContext = () => {
  if (!arToolkitSource || contextInitialized) {
    return;
  }

  contextInitialized = true;

  arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: resolveAssetUrl("assets/arjs/camera_para.dat"),
    detectionMode: "mono"
  });

  arToolkitContext.init(() => {
    markerCamera.projectionMatrix.copy(arToolkitContext!.getProjectionMatrix());

    const controller = (arToolkitContext as {
      arController: { canvas?: HTMLCanvasElement; orientation?: string; options?: { orientation?: string } } | null;
    }).arController;
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

    markerTrackingAvailable = true;
    renderCapability();
    setRuntimeStatus("Tracking ready", "Hiro マーカーを視野に入れ、安定したら Capture marker pose を押してください。");
    resizeMarkerStage();
  });

  markerControls = new THREEx.ArMarkerControls(arToolkitContext, trackedRoot, {
    type: "pattern",
    patternUrl: resolveAssetUrl("assets/arjs/patt.hiro")
  });

  void markerControls;
};

const refreshCapability = async () => {
  if (!("xr" in navigator) || !navigator.xr) {
    immersiveSupported = false;
    renderCapability();
    updateButtons();
    return;
  }

  try {
    immersiveSupported = await navigator.xr.isSessionSupported("immersive-ar");
  } catch {
    immersiveSupported = false;
  }

  renderCapability();
  updateButtons();
};

const stopMarkerStage = () => {
  markerViewer.hidden = true;
  const video = arToolkitSource?.domElement as HTMLVideoElement | undefined;
  if (video?.srcObject instanceof MediaStream) {
    video.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
  }
};

const tryRequestSession = async (): Promise<XRSession> => {
  if (!navigator.xr) {
    throw new Error("navigator.xr is unavailable.");
  }

  const attempts: XRSessionInit[] = [
    {
      requiredFeatures: ["local-floor"],
      optionalFeatures: ["dom-overlay"],
      domOverlay: { root: document.body }
    },
    {
      requiredFeatures: ["local"],
      optionalFeatures: ["dom-overlay"],
      domOverlay: { root: document.body }
    }
  ];

  let lastError: unknown = null;

  for (const init of attempts) {
    try {
      return await navigator.xr.requestSession("immersive-ar", init);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
};

const endSession = async () => {
  if (!xrSession) {
    return;
  }

  await xrSession.end();
};

const startSession = async () => {
  if (!navigator.xr) {
    setRuntimeStatus("Unavailable", "このブラウザでは navigator.xr が使えません。Quest Browser から開いてください。");
    return;
  }

  if (xrSession) {
    await endSession();
    return;
  }

  try {
    setRuntimeStatus("Starting session", "保存したマーカー位置を使って immersive-ar セッションを開始しています。");
    const session = await tryRequestSession();
    xrSession = session;
    markerPlacementApplied = false;

    stopMarkerStage();
    immersiveViewer.hidden = false;

    immersiveRenderer.xr.setReferenceSpaceType("local-floor");
    immersiveRenderer.xr.setSession(session);

    session.addEventListener("end", () => {
      xrSession = null;
      markerPlacementApplied = false;
      immersiveViewer.hidden = true;
      markerViewer.hidden = false;
      startButton.textContent = "Start immersive-ar";
      updateButtons();
      setRuntimeStatus("Session ended", "immersive-ar を終了しました。必要なら再度マーカーを見て位置を取り直してください。");
      renderCapability();
    });

    updateButtons();
    renderCapability();
    setRuntimeStatus("Session active", "immersive-ar に入りました。保存したマーカー位置を基準にオブジェクトを配置します。");
  } catch (error) {
    setRuntimeStatus(
      "Session failed",
      `immersive-ar セッション開始に失敗しました: ${error instanceof Error ? error.message : String(error)}`
    );
  }
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
      setRuntimeStatus("Camera ready", "カメラ映像を取得しました。Hiro マーカーを映してください。");

      const sourceVideo = arToolkitSource?.domElement as HTMLVideoElement | undefined;
      const maybeInit = () => {
        attachSourceVideo();
        if (sourceVideo && sourceVideo.videoWidth > 0 && sourceVideo.videoHeight > 0) {
          initMarkerContext();
          resizeMarkerStage();
        }
      };

      sourceVideo?.addEventListener("canplay", maybeInit, { once: true });
      sourceVideo?.addEventListener("loadedmetadata", maybeInit, { once: true });
      window.setTimeout(maybeInit, 700);
      window.setTimeout(resizeMarkerStage, 500);
    },
    () => {
      markerTrackingAvailable = false;
      renderCapability();
      updateButtons();
      setRuntimeStatus("Camera error", "Quest Browser でカメラ起動に失敗しました。権限設定と HTTPS 配信を確認してください。");
    }
  );
};

refreshButton.addEventListener("click", () => {
  void refreshCapability();
});

captureButton.addEventListener("click", () => {
  captureMarkerPose();
});

startButton.addEventListener("click", () => {
  void startSession();
});

window.addEventListener("resize", () => {
  resizeMarkerStage();
  resizeImmersiveStage();
});

window.addEventListener("arjs-video-loaded", () => {
  attachSourceVideo();
  resizeMarkerStage();
});

const markerAnimate = (nowMsec: number) => {
  requestAnimationFrame(markerAnimate);

  lastAnimationTime = lastAnimationTime || nowMsec - 1000 / 60;
  const deltaSec = Math.min(0.2, (nowMsec - lastAnimationTime) / 1000);
  lastAnimationTime = nowMsec;

  markerRing.rotation.z += deltaSec * 0.7;
  markerOrb.rotation.x += deltaSec * 0.9;
  markerOrb.rotation.y += deltaSec * 1.2;
  markerOrb.position.y = 0.55 + Math.sin(nowMsec / 320) * 0.05;

  immersiveRing.rotation.z += deltaSec * 0.8;
  immersiveOrb.rotation.x += deltaSec * 0.6;
  immersiveOrb.rotation.y += deltaSec * 1.1;
  immersiveOrb.position.y = 0.28 + Math.sin(nowMsec / 580) * 0.04;

  if (arToolkitContext && arToolkitSource?.ready && !xrSession) {
    arToolkitContext.update(arToolkitSource.domElement);
    markerScene.visible = trackedRoot.visible;

    if (trackedRoot.visible !== markerFound) {
      markerFound = trackedRoot.visible;
      updateButtons();

      if (markerFound) {
        setRuntimeStatus("Marker detected", "マーカーを認識しました。向きが安定したら Capture marker pose を押してください。");
      } else if (!markerPoseCaptured) {
        setRuntimeStatus("Searching marker", "カメラ映像は取得できています。Hiro マーカーを再度中央に映してください。");
      }
    }

    markerRenderer.render(markerScene, markerCamera);
  }
};

immersiveRenderer.setAnimationLoop(() => {
  const elapsed = performance.now();
  immersiveRing.rotation.z = (elapsed / 1000) * 0.8;
  immersiveOrb.rotation.x = (elapsed / 1000) * 0.6;
  immersiveOrb.rotation.y = (elapsed / 1000) * 1.1;
  immersiveOrb.position.y = 0.28 + Math.sin(elapsed / 580) * 0.04;

  if (xrSession && !markerPlacementApplied) {
    applyCapturedPoseInImmersive();
    setRuntimeStatus("Object placed", "保存したマーカー位置を元に、パススルー空間へオブジェクトを再配置しました。");
  }

  immersiveRenderer.render(immersiveScene, immersiveCamera);
});

setRuntimeStatus("Camera setup pending", "Quest Browser でカメラ許可後に Hiro マーカーを映してください。");
renderCapability();
updateButtons();
void refreshCapability();
initMarkerTracking();
requestAnimationFrame(markerAnimate);
