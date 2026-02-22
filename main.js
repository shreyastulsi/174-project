import * as THREE from "three";
// ==============================
// Renderer / Scene / Camera
// ==============================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f14);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400);

// Lights
scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 0.65));

const dir = new THREE.DirectionalLight(0xffffff, 0.95);
dir.position.set(30, 40, 20);
dir.castShadow = true;
dir.shadow.mapSize.set(2048, 2048);
dir.shadow.camera.left = -25;
dir.shadow.camera.right = 25;
dir.shadow.camera.top = 25;
dir.shadow.camera.bottom = -25;
dir.shadow.bias = -0.0002;
dir.shadow.normalBias = 0.02;
scene.add(dir);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 400),
  new THREE.MeshStandardMaterial({ color: 0x141b22, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Debug grid
const grid = new THREE.GridHelper(400, 80, 0x223344, 0x1b2a35);
grid.position.y = 0.01;
scene.add(grid);

// ==============================
// ==============================
function buildTrack({ points, trackWidth = 11, segments = 900, roadY = 0.08 }) {
  const curve = new THREE.CatmullRomCurve3(points, true, "centripetal", 0.5);
  const halfW = trackWidth / 2;

  const samplePts = [];
  const sampleTan = [];
  const sampleLeft = [];

  for (let i = 0; i < segments; i++) {
    const t = i / segments; // [0,1)
    const p = curve.getPointAt(t);
    p.y = roadY;

    const tan = curve.getTangentAt(t).setY(0).normalize();
    const left = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

    samplePts.push(p);
    sampleTan.push(tan);
    sampleLeft.push(left);
  }

  // ---- Track ribbon geometry ----
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i < segments; i++) {
    const p = samplePts[i];
    const left = sampleLeft[i];

    const vL = p.clone().addScaledVector(left, halfW);
    const vR = p.clone().addScaledVector(left, -halfW);

    positions.push(vL.x, vL.y, vL.z);
    positions.push(vR.x, vR.y, vR.z);

    uvs.push(0, i / segments);
    uvs.push(1, i / segments);
  }

  // wrap connectivity
  for (let i = 0; i < segments; i++) {
    const ni = (i + 1) % segments;

    const i0 = 2 * i;
    const i1 = 2 * i + 1;
    const i2 = 2 * ni;
    const i3 = 2 * ni + 1;

    indices.push(i0, i2, i1);
    indices.push(i2, i3, i1);
  }

  const trackGeo = new THREE.BufferGeometry();
  trackGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  trackGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  trackGeo.setIndex(indices);
  trackGeo.computeVertexNormals();

  const trackMat = new THREE.MeshStandardMaterial({
    color: 0x2b2f36,
    roughness: 0.9,
    metalness: 0.0,
  });

  const trackMesh = new THREE.Mesh(trackGeo, trackMat);
  trackMesh.receiveShadow = true;
  trackMesh.castShadow = false;
  scene.add(trackMesh);

  // ---- Edge paint strips (both sides) painted INSIDE road, on top ----
  const edgePaintW = 0.9;
  const edgeY = roadY + 0.03;

  const edgeMat = new THREE.MeshStandardMaterial({
    color: 0x7a1d1d,
    roughness: 0.85,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });

  const edgePos = [];
  const edgeIdx = [];

  function addEdgeStrip(sign) {
    const base = edgePos.length / 3;

    for (let i = 0; i < segments; i++) {
      const p = samplePts[i];
      const left = sampleLeft[i];

      const inner = p.clone().addScaledVector(left, sign * (halfW - edgePaintW));
      const outer = p.clone().addScaledVector(left, sign * halfW);
      inner.y = edgeY;
      outer.y = edgeY;

      edgePos.push(outer.x, outer.y, outer.z);
      edgePos.push(inner.x, inner.y, inner.z);
    }

    for (let i = 0; i < segments; i++) {
      const ni = (i + 1) % segments;
      const i0 = base + 2 * i;
      const i1 = base + 2 * i + 1;
      const i2 = base + 2 * ni;
      const i3 = base + 2 * ni + 1;

      edgeIdx.push(i0, i2, i1);
      edgeIdx.push(i2, i3, i1);
    }
  }

  addEdgeStrip(+1);
  addEdgeStrip(-1);

  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute(edgePos, 3));
  edgeGeo.setIndex(edgeIdx);
  edgeGeo.computeVertexNormals();

  const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
  edgeMesh.receiveShadow = true;
  edgeMesh.castShadow = false;
  scene.add(edgeMesh);

  return { curve, trackWidth, halfW, segments, samplePts, sampleTan, sampleLeft, roadY, edgeY };
}

// ==============================
// Track layout:
// 1) long straight
// 2) left turn 
// 3) right turn 
// 4) straight back (down -Z) returning to start
// ==============================
const trackPoints = [
    // --- Start: LONG STRAIGHT (up +Z), lane at x = 0 ---
    new THREE.Vector3(0, 0, -40),
    new THREE.Vector3(0, 0, -10),
    new THREE.Vector3(0, 0, 25),
    new THREE.Vector3(0, 0, 65),
    new THREE.Vector3(0, 0, 105),
  
    // --- TOP SECTION: LEFT TURN + SHIFT to the right lane (x -> +80) ---
    new THREE.Vector3(-10, 0, 120),
    new THREE.Vector3(-25, 0, 135),
    new THREE.Vector3(10, 0, 150),
    new THREE.Vector3(45, 0, 150),
    new THREE.Vector3(80, 0, 135),
  
    // --- RIGHT TURN SECTION (start heading down) ---
    new THREE.Vector3(92, 0, 120),
    new THREE.Vector3(96, 0, 95),
  
    // --- LONG STRAIGHT BACK (down -Z), lane at x = +90 ---
    new THREE.Vector3(96, 0, 55),
    new THREE.Vector3(96, 0, 15),
    new THREE.Vector3(96, 0, -25),
    new THREE.Vector3(96, 0, -65),
  
    // --- BOTTOM SECTION: curve back to start lane (x -> 0)---
    new THREE.Vector3(85, 0, -85),
    new THREE.Vector3(60, 0, -100),
    new THREE.Vector3(30, 0, -105),
    new THREE.Vector3(0, 0, -95),
  ];
  
  

const trackData = buildTrack({
  points: trackPoints,
  trackWidth: 18,
  segments: 1000,
  roadY: 0.08,
});

// ==============================
// Start/Finish line
// ==============================
function makeCheckerTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext("2d");

  const cols = 16;
  const rows = 4;
  const w = c.width / cols;
  const h = c.height / rows;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.fillStyle = "#111111";
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      if ((r + col) % 2 === 0) ctx.fillRect(col * w, r * h, w, h);
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  return tex;
}

function addStartFinishLineAtIndex(track, idx) {
  const { samplePts, sampleTan, halfW } = track;

  const p = samplePts[idx].clone();
  const tan = sampleTan[idx].clone().normalize();

  const tex = makeCheckerTexture();

  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.6,
    polygonOffset: true,
    polygonOffsetFactor: -10,
    polygonOffsetUnits: -10,
  });

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(halfW * 2.15, 1.6), mat);

  plane.position.set(p.x, track.edgeY + 0.04, p.z);

  plane.rotation.x = -Math.PI / 2;

  const yaw = Math.atan2(tan.x, tan.z);
  plane.rotation.y = yaw;

  plane.castShadow = false;
  plane.receiveShadow = false;

  plane.renderOrder = 10;
  plane.material.depthWrite = false;

  scene.add(plane);

  return { position: p, tangent: tan, yaw };
}

const START_IDX = Math.floor(trackData.segments * 0.06);
const startLine = addStartFinishLineAtIndex(trackData, START_IDX);

// ==============================
// Kart + Driver
// ==============================
const kart = new THREE.Group();
scene.add(kart);

const redMat = new THREE.MeshStandardMaterial({ color: 0xff3b3b, roughness: 0.45, metalness: 0.1 });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1.0 });
const glassMat = new THREE.MeshStandardMaterial({
  color: 0x88aacc,
  roughness: 0.2,
  metalness: 0.0,
  transparent: true,
  opacity: 0.5,
});
const lightMat = new THREE.MeshStandardMaterial({ color: 0xffffcc, roughness: 0.6, emissive: 0x222200 });

// Body
const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.6, 3.2), redMat);
body.position.y = 0.55;
body.castShadow = true;
kart.add(body);

// Hood (front marker, +Z)
const hood = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 1.2), redMat);
hood.position.set(0, 0.75, 1.05);
hood.castShadow = true;
kart.add(hood);

// Windshield
const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.08), glassMat);
windshield.position.set(0, 1.0, 0.55);
windshield.rotation.x = -0.35;
windshield.castShadow = true;
kart.add(windshield);

// Spoiler (rear)
const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.35), darkMat);
spoiler.position.set(0, 1.0, -1.45);
spoiler.castShadow = true;
kart.add(spoiler);

// Lights
const headL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.1), lightMat);
const headR = headL.clone();
headL.position.set(-0.75, 0.55, 1.65);
headR.position.set(0.75, 0.55, 1.65);
kart.add(headL, headR);

// Seat
const seat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 1.0), darkMat);
seat.position.set(0, 0.8, -0.15);
seat.castShadow = true;
kart.add(seat);

// Steering column
const column = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 12), darkMat);
column.position.set(0, 1.05, 0.2);
column.rotation.x = Math.PI / 2.6;
column.castShadow = true;
kart.add(column);

// Steering wheel
const steering = new THREE.Group();
steering.position.set(0, 1.15, 0.28);
kart.add(steering);

const wheelRing = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.05, 10, 20), darkMat);
wheelRing.rotation.x = Math.PI / 2;
wheelRing.castShadow = true;
steering.add(wheelRing);

const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.45), darkMat);
spoke.castShadow = true;
steering.add(spoke);

// Driver
const driver = new THREE.Group();
kart.add(driver);

const torso = new THREE.Mesh(
  new THREE.CylinderGeometry(0.25, 0.35, 0.75, 16),
  new THREE.MeshStandardMaterial({ color: 0x3355aa, roughness: 0.9 })
);
torso.position.set(0, 1.18, -0.15);
torso.castShadow = true;
driver.add(torso);

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.23, 18, 18),
  new THREE.MeshStandardMaterial({ color: 0xf2c9a0, roughness: 0.9 })
);
head.position.set(0, 1.7, -0.15);
head.castShadow = true;
driver.add(head);

// Hands on wheel
const handMat = new THREE.MeshStandardMaterial({ color: 0xf2c9a0, roughness: 0.9 });
const handL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), handMat);
const handR = handL.clone();
handL.position.set(-0.23, 0.0, 0.0);
handR.position.set(0.23, 0.0, 0.0);
handL.castShadow = handR.castShadow = true;
steering.add(handL, handR);

// Wheels
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 1 });
function makeWheel(x, z) {
  const w = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.25, 18), wheelMat);
  w.rotation.z = Math.PI / 2;
  w.position.set(x, 0.35, z);
  w.castShadow = true;
  kart.add(w);
  return w;
}
const wheels = [
  makeWheel(-0.95, 1.15),
  makeWheel(0.95, 1.15),
  makeWheel(-0.95, -1.15),
  makeWheel(0.95, -1.15),
];

// Spawn behind the start line, facing along the straight
kart.position.set(startLine.position.x, 0, startLine.position.z);
let yaw = startLine.yaw;

// Put kart behind line
{
  const tan = startLine.tangent.clone().normalize();
  kart.position.addScaledVector(tan, -3.2);
}

kart.rotation.y = yaw;

// ==============================
// AI Kart
// ==============================
function buildKartModel(bodyColor) {
  const g = new THREE.Group();
  const bMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.45, metalness: 0.1 });
  const dkMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1.0 });
  const glMat = new THREE.MeshStandardMaterial({ color: 0x88aacc, roughness: 0.2, metalness: 0.0, transparent: true, opacity: 0.5 });
  const ltMat = new THREE.MeshStandardMaterial({ color: 0xffffcc, roughness: 0.6, emissive: 0x222200 });

  const b = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.6, 3.2), bMat); b.position.y = 0.55; b.castShadow = true; g.add(b);
  const h = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 1.2), bMat); h.position.set(0, 0.75, 1.05); h.castShadow = true; g.add(h);
  const ws = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.08), glMat); ws.position.set(0, 1.0, 0.55); ws.rotation.x = -0.35; ws.castShadow = true; g.add(ws);
  const sp = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.35), dkMat); sp.position.set(0, 1.0, -1.45); sp.castShadow = true; g.add(sp);
  const hL2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.1), ltMat); const hR2 = hL2.clone(); hL2.position.set(-0.75, 0.55, 1.65); hR2.position.set(0.75, 0.55, 1.65); g.add(hL2, hR2);
  const st = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 1.0), dkMat); st.position.set(0, 0.8, -0.15); st.castShadow = true; g.add(st);

  // Driver
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.75, 16), new THREE.MeshStandardMaterial({ color: 0x33aa55, roughness: 0.9 }));
  tr.position.set(0, 1.18, -0.15); tr.castShadow = true; g.add(tr);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.23, 18, 18), new THREE.MeshStandardMaterial({ color: 0xf2c9a0, roughness: 0.9 }));
  hd.position.set(0, 1.7, -0.15); hd.castShadow = true; g.add(hd);

  // Wheels
  const wMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 1 });
  const aiWheels = [];
  function mkW(x, z) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.25, 18), wMat); w.rotation.z = Math.PI / 2; w.position.set(x, 0.35, z); w.castShadow = true; g.add(w); aiWheels.push(w); return w; }
  mkW(-0.95, 1.15); mkW(0.95, 1.15); mkW(-0.95, -1.15); mkW(0.95, -1.15);

  return { group: g, wheels: aiWheels };
}

const aiKartData = buildKartModel(0x3b8bff);
const aiKart = aiKartData.group;
scene.add(aiKart);

// AI state — starts offset beside and behind the player
let aiTrackT = 0.06;              // parametric position on the curve [0,1)
const AI_SPEED = 14.5;            // units/sec — slightly slower than player max
let aiNearestIdx = START_IDX;

// Spawn AI next to the player on the grid
{
  const left = trackData.sampleLeft[START_IDX];
  aiKart.position.copy(kart.position).addScaledVector(left, 4);
  aiKart.position.addScaledVector(startLine.tangent, -2);
  aiKart.rotation.y = yaw;
}

function updateAI(dt) {
  const N = trackData.segments;
  const curve = trackData.curve;

  // Advance parametric t based on AI speed
  // Arc-length of whole curve ≈ curve.getLength()
  const totalLen = curve.getLength();
  aiTrackT += (AI_SPEED * dt) / totalLen;
  if (aiTrackT >= 1) aiTrackT -= 1;

  // Target: a lookahead point slightly ahead on the curve
  const lookahead = 0.012;
  let targetT = aiTrackT + lookahead;
  if (targetT >= 1) targetT -= 1;

  const targetPos = curve.getPointAt(targetT);
  targetPos.y = 0;

  const curPos = curve.getPointAt(aiTrackT);
  curPos.y = 0;

  // Smoothly move AI toward target
  const aiYaw = Math.atan2(targetPos.x - curPos.x, targetPos.z - curPos.z);
  aiKart.position.lerp(curPos, 8 * dt);
  aiKart.position.y = 0;
  aiKart.rotation.y = aiYaw;

  // Spin wheels
  const spin = AI_SPEED * dt * 1.5;
  for (const w of aiKartData.wheels) w.rotation.x += spin;

  // Update nearest index for collision
  aiNearestIdx = findNearestSampleIndexXZFor(aiKart.position, aiNearestIdx);
}

// ==============================
// Input
// ==============================
const keys = { w: false, a: false, s: false, d: false };
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k in keys) keys[k] = true;
});
window.addEventListener("keyup", (e) => {
  const k = e.key.toLowerCase();
  if (k in keys) keys[k] = false;
});

// ==============================
// Orbit camera
// ==============================
let isDragging = false;
let lastX = 0;
let lastY = 0;

let orbitYaw = Math.PI;
let orbitPitch = 0.4;
let orbitDistance = 9.0;
let manualYawOffset = 0;          // temporary offset while dragging
const CAM_FOLLOW_SPEED = 3.0;     // how fast the camera re-centres (higher = snappier)

renderer.domElement.addEventListener("mousedown", (e) => {
  isDragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
});
window.addEventListener("mouseup", () => (isDragging = false));
window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;

  manualYawOffset -= dx * 0.005;
  orbitPitch -= dy * 0.005;
  orbitPitch = Math.max(0.08, Math.min(1.15, orbitPitch));
});
renderer.domElement.addEventListener("wheel", (e) => {
  orbitDistance += e.deltaY * 0.01;
  orbitDistance = Math.max(5.0, Math.min(20.0, orbitDistance));
});

// ==============================
// Physics + Track boundary collision
// ==============================
let speed = 0;
let steerInput = 0;

const MAX_SPEED = 18;
const ACCEL = 16;
const BRAKE = 22;
const DRAG = 3.6;

const STEER_RATE = 2.4;
const MAX_STEER = 0.7;
const TURN_GAIN = 1.4;

const KART_RADIUS = 1.1;
const TRACK_MARGIN = 0.25;
const allowedLateral = trackData.halfW - KART_RADIUS - TRACK_MARGIN;

let nearestIdx = START_IDX;

const speedEl = document.getElementById("speed");
const clock = new THREE.Clock();

function findNearestSampleIndexXZ(pos) {
  return findNearestSampleIndexXZFor(pos, nearestIdx);
}

function findNearestSampleIndexXZFor(pos, hint) {
  const N = trackData.samplePts.length;
  const searchWin = 40;
  let bestIdx = hint;
  let bestD2 = Infinity;

  for (let offset = -searchWin; offset <= searchWin; offset++) {
    let idx = (hint + offset) % N;
    if (idx < 0) idx += N;
    const p = trackData.samplePts[idx];
    const dx = pos.x - p.x;
    const dz = pos.z - p.z;
    const d2 = dx * dx + dz * dz;
    if (d2 < bestD2) {
      bestD2 = d2;
      bestIdx = idx;
    }
  }

  return bestIdx;
}

function resolveTrackCollision() {
  const idx = findNearestSampleIndexXZ(kart.position);
  nearestIdx = idx;
  const center = trackData.samplePts[idx];
  const left = trackData.sampleLeft[idx];

  const diff = new THREE.Vector3().subVectors(kart.position, center);
  diff.y = 0;
  const lateral = diff.dot(left);

  if (Math.abs(lateral) > allowedLateral) {
    const over = Math.abs(lateral) - allowedLateral;
    const sign = Math.sign(lateral);

    kart.position.addScaledVector(left, -sign * over);
    speed *= 0.92;
  }

  kart.position.y = 0;
}

// Kart-to-kart collision
const COLLISION_DIST = 2.4;   // combined radii for two karts
const BUMP_FORCE = 12;
function resolveKartCollision(dt) {
  const dx = kart.position.x - aiKart.position.x;
  const dz = kart.position.z - aiKart.position.z;
  const dist = Math.sqrt(dx * dx + dz * dz);

  if (dist < COLLISION_DIST && dist > 0.001) {
    const overlap = COLLISION_DIST - dist;
    const nx = dx / dist;
    const nz = dz / dist;

    // Push player kart out
    kart.position.x += nx * overlap * 0.5;
    kart.position.z += nz * overlap * 0.5;

    // Push AI kart out
    aiKart.position.x -= nx * overlap * 0.5;
    aiKart.position.z -= nz * overlap * 0.5;

    // Slow the player down on impact
    speed *= 0.85;
  }
}

function updatePhysics(dt) {
  const throttle = keys.w ? 1 : 0;
  const brake = keys.s ? 1 : 0;

  // A = left (+), D = right (-)
  const steerTarget = (keys.a ? 1 : 0) + (keys.d ? -1 : 0);

  // corresponding steering
  const steerDelta = steerTarget - steerInput;
  const maxStep = STEER_RATE * dt;
  steerInput += Math.max(-maxStep, Math.min(maxStep, steerDelta));
  steerInput = Math.max(-1, Math.min(1, steerInput));

  // Speed
  if (throttle) speed += ACCEL * dt;
  if (brake) speed -= BRAKE * dt;

  if (!throttle && !brake) {
    const sign = Math.sign(speed);
    const mag = Math.abs(speed);
    speed = sign * Math.max(0, mag - DRAG * dt);
  }

  speed = Math.max(-MAX_SPEED * 0.35, Math.min(MAX_SPEED, speed));

  // Turning
  const steer = steerInput * MAX_STEER;
  const speedFactor = Math.min(1, Math.abs(speed) / MAX_SPEED);
  const yawRate = TURN_GAIN * steer * speedFactor * (speed >= 0 ? 1 : -1);
  yaw += yawRate * dt;

  // Integrate
  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  kart.position.addScaledVector(forward, speed * dt);
  kart.rotation.y = yaw;

  // Wheel spin
  const wheelSpin = speed * dt * 1.5;
  for (const w of wheels) w.rotation.x += wheelSpin;

  // Steering wheel animation (A=left => wheel left)
  steering.rotation.y = steerInput * 0.65;

  resolveTrackCollision();
  resolveKartCollision(dt);

  if (speedEl) speedEl.textContent = speed.toFixed(1);
}

function updateCamera(dt) {
  // Desired yaw is directly behind the kart (+PI from kart heading)
  const desiredYaw = yaw + Math.PI;

  // Smoothly decay the manual drag offset back to zero
  if (!isDragging) {
    manualYawOffset *= Math.max(0, 1 - CAM_FOLLOW_SPEED * dt);
  }

  // Lerp orbitYaw toward desiredYaw (shortest-arc)
  let diff = desiredYaw - orbitYaw;
  // Normalise to (-PI, PI]
  diff = ((diff + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  orbitYaw += diff * Math.min(1, CAM_FOLLOW_SPEED * dt);

  const finalYaw = orbitYaw + manualYawOffset;

  const target = new THREE.Vector3().copy(kart.position);
  target.y += 1.25;

  const x = orbitDistance * Math.cos(orbitPitch) * Math.sin(finalYaw);
  const y = orbitDistance * Math.sin(orbitPitch);
  const z = orbitDistance * Math.cos(orbitPitch) * Math.cos(finalYaw);

  camera.position.set(target.x + x, target.y + y, target.z + z);
  camera.lookAt(target);
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(0.033, clock.getDelta());

  updateAI(dt);
  updatePhysics(dt);
  updateCamera(dt);

  // Keep shadow light centred on the kart so the tight frustum always covers it
  dir.position.set(kart.position.x + 30, 40, kart.position.z + 20);
  dir.target.position.copy(kart.position);
  dir.target.updateMatrixWorld();

  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
