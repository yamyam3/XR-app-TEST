import * as THREE from "three";
import { markerContent } from "../shared/content";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Immersive-ar root element could not be found.");
}

const styles = `
  :root {
    color-scheme: dark;
    --panel: rgba(7, 18, 26, 0.74);
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
    background: #020617;
    color: var(--text);
    font-family: "Segoe UI", "Hiragino Sans", sans-serif;
  }

  .page {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background:
      radial-gradient(circle at 15% 15%, rgba(34, 197, 94, 0.18), transparent 18%),
      radial-gradient(circle at 85% 18%, rgba(14, 165, 233, 0.18), transparent 22%),
      linear-gradient(180deg, #07131a 0%, #0b1620 42%, #07131a 100%);
  }

  .viewer {
    position: fixed;
    inset: 0;
    z-index: 1;
  }

  .viewer canvas {
    position: absolute;
    inset: 0;
    width: 100vw !important;
    height: 100vh !important;
    display: block;
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
  <div id="viewer-root" class="viewer"></div>
  <div class="hud">
    <section class="panel">
      <div class="eyebrow">Immersive-ar</div>
      <h1>Quest 3 Passthrough AR</h1>
      <p>
        Quest Browser の <code>immersive-ar</code> セッションを使い、パススルー空間に 3D オブジェクトを固定表示します。
        これは marker tracking ではなく、没入型表示の確認用ページです。
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
          <button id="start-button" class="button" type="button">Start immersive-ar</button>
          <button id="refresh-button" class="button secondary" type="button">Refresh capability</button>
        </div>
      </div>
    </section>
    <section class="status">
      <div class="eyebrow">Runtime status</div>
      <div id="status-title" class="status-title">Idle</div>
      <div id="status-body" class="status-body">
        Quest Browser で Start immersive-ar を押すと、パススルー空間の正面にオブジェクトを配置します。
      </div>
    </section>
  </div>
`;

app.append(page);

const viewerRoot = page.querySelector<HTMLDivElement>("#viewer-root");
const metricList = page.querySelector<HTMLDivElement>("#metric-list");
const notesList = page.querySelector<HTMLUListElement>("#notes-list");
const startButton = page.querySelector<HTMLButtonElement>("#start-button");
const refreshButton = page.querySelector<HTMLButtonElement>("#refresh-button");
const statusTitle = page.querySelector<HTMLDivElement>("#status-title");
const statusBody = page.querySelector<HTMLDivElement>("#status-body");

if (!viewerRoot || !metricList || !notesList || !startButton || !refreshButton || !statusTitle || !statusBody) {
  throw new Error("Immersive-ar UI elements could not be initialized.");
}

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
viewerRoot.append(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 100);
camera.position.set(0, 1.6, 2);

const hemi = new THREE.HemisphereLight(0xf8fafc, 0x0f172a, 2.2);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xffffff, 1.2);
dir.position.set(2, 4, 1);
scene.add(dir);

const anchorGroup = new THREE.Group();
anchorGroup.position.set(0, 1.5, -1.5);
scene.add(anchorGroup);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(0.32, 0.06, 20, 64),
  new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0x92400e,
    emissiveIntensity: 0.35,
    roughness: 0.24,
    metalness: 0.42
  })
);
ring.rotation.x = Math.PI / 2;
anchorGroup.add(ring);

const orb = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.2, 1),
  new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x082f49,
    emissiveIntensity: 0.55,
    roughness: 0.22,
    metalness: 0.28
  })
);
orb.position.y = 0.28;
anchorGroup.add(orb);

const pedestal = new THREE.Mesh(
  new THREE.CylinderGeometry(0.2, 0.28, 0.12, 48),
  new THREE.MeshStandardMaterial({
    color: 0x0f766e,
    roughness: 0.38,
    metalness: 0.14
  })
);
pedestal.position.y = -0.12;
anchorGroup.add(pedestal);

const floorShadow = new THREE.Mesh(
  new THREE.CircleGeometry(0.42, 48),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.09
  })
);
floorShadow.rotation.x = -Math.PI / 2;
floorShadow.position.y = -0.18;
anchorGroup.add(floorShadow);

let xrSession: XRSession | null = null;
let immersiveSupported: boolean | null = null;
let anchorPlaced = false;

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
    ["immersive-ar", immersiveSupported],
    ["session active", xrSession !== null]
  ];

  metrics.forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "metric-item";
    item.innerHTML = `<strong>${label}</strong><span class="${badgeClass(value)}">${badgeText(value)}</span>`;
    metricList.append(item);
  });

  const notes: string[] = [
    "このページは marker tracking ではなく、Quest の immersive-ar セッションでパススルー空間にオブジェクトを配置します。",
    "オブジェクトは開始時に視線の正面、およそ 1.5m 先へ配置します。"
  ];

  if (window.isSecureContext) {
    notes.push("Secure Context で実行中です。HTTPS 条件は満たしています。");
  } else {
    notes.push("Secure Context ではありません。immersive-ar には HTTPS が必要です。");
  }

  if (immersiveSupported === false) {
    notes.push("Quest Browser の開き方や権限状態によっては immersive-ar が unavailable になります。");
  }

  notes.forEach((note) => {
    const item = document.createElement("li");
    item.textContent = note;
    notesList.append(item);
  });
};

const placeAnchorInFront = () => {
  const xrCamera = renderer.xr.getCamera();
  xrCamera.updateMatrixWorld(true);

  const worldPosition = new THREE.Vector3();
  const worldQuaternion = new THREE.Quaternion();
  const worldScale = new THREE.Vector3();
  xrCamera.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);

  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(worldQuaternion).normalize();
  const target = worldPosition.clone().add(forward.multiplyScalar(1.5));

  anchorGroup.position.copy(target);
  anchorGroup.quaternion.copy(worldQuaternion);
  anchorGroup.rotation.x = 0;
  anchorGroup.rotation.z = 0;
  anchorPlaced = true;
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

const refreshCapability = async () => {
  if (!("xr" in navigator) || !navigator.xr) {
    immersiveSupported = false;
    renderCapability();
    return;
  }

  try {
    immersiveSupported = await navigator.xr.isSessionSupported("immersive-ar");
  } catch {
    immersiveSupported = false;
  }

  renderCapability();
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
    setRuntimeStatus("Starting session", "immersive-ar セッションを開始しています。Quest 側の確認が必要な場合があります。");
    const session = await tryRequestSession();
    xrSession = session;
    anchorPlaced = false;

    renderer.xr.setReferenceSpaceType("local-floor");
    renderer.xr.setSession(session);

    session.addEventListener("end", () => {
      xrSession = null;
      anchorPlaced = false;
      startButton.textContent = "Start immersive-ar";
      setRuntimeStatus("Session ended", "immersive-ar セッションを終了しました。再開すると再配置します。");
      renderCapability();
    });

    startButton.textContent = "End immersive-ar";
    setRuntimeStatus("Session active", "パススルー空間に入りました。視線の正面にオブジェクトを配置します。");
    renderCapability();
  } catch (error) {
    setRuntimeStatus(
      "Session failed",
      `immersive-ar セッション開始に失敗しました: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

startButton.addEventListener("click", () => {
  void startSession();
});

refreshButton.addEventListener("click", () => {
  void refreshCapability();
});

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
});

const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const elapsed = clock.getElapsedTime();
  ring.rotation.z = elapsed * 0.8;
  orb.rotation.x = elapsed * 0.6;
  orb.rotation.y = elapsed * 1.1;
  orb.position.y = 0.28 + Math.sin(elapsed * 1.7) * 0.04;

  if (xrSession && !anchorPlaced) {
    placeAnchorInFront();
    setRuntimeStatus("Object placed", "共有オブジェクトを視線の正面 1.5m 先へ配置しました。ヘッドセットを動かして見え方を確認してください。");
  }

  renderer.render(scene, camera);
});

void refreshCapability();
