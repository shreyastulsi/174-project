import * as THREE from "three";
// ==============================
// Renderer / Scene / Camera
// ==============================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87c7ff);
scene.fog = new THREE.FogExp2(0x9fd4ff, 0.0025);
const menuScene = new THREE.Scene();
menuScene.background = new THREE.Color(0x0b1020);
menuScene.fog = new THREE.FogExp2(0x10172b, 0.012);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400);

const MAX_ANISO = renderer.capabilities.getMaxAnisotropy();
const textureLoader = new THREE.TextureLoader();

function loadRepeatTexture(path, { repeat = [1, 1], colorSpace = THREE.SRGBColorSpace } = {}) {
  const tex = textureLoader.load(new URL(path, import.meta.url).href);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = Math.min(16, MAX_ANISO || 8);
  if (colorSpace) tex.colorSpace = colorSpace;
  return tex;
}

function makeDashAlphaTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 256;
  const ctx = c.getContext("2d");

  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#ffffff";
  for (let y = 0; y < c.height; y += 54) {
    ctx.fillRect(10, y + 6, c.width - 20, 26);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = Math.min(16, MAX_ANISO || 8);
  return tex;
}

function makeArrowDecalTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d");

  ctx.clearRect(0, 0, c.width, c.height);
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate(-Math.PI / 2);

  // Soft backing
  ctx.fillStyle = "rgba(10, 12, 14, 0.22)";
  ctx.fillRect(-78, -44, 156, 88);

  // Main arrow
  ctx.fillStyle = "rgba(255, 241, 167, 0.95)";
  ctx.beginPath();
  ctx.moveTo(-72, 0);
  ctx.lineTo(6, 0);
  ctx.lineTo(6, -26);
  ctx.lineTo(72, 0);
  ctx.lineTo(6, 26);
  ctx.lineTo(6, 0);
  ctx.closePath();
  ctx.fill();

  // Accent chevrons
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 8;
  for (const x of [-34, -8, 18]) {
    ctx.beginPath();
    ctx.moveTo(x - 12, -18);
    ctx.lineTo(x, 0);
    ctx.lineTo(x - 12, 18);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, MAX_ANISO || 8);
  return tex;
}

function makeKartNumberDecalTexture(bodyColor, number) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d");
  const base = new THREE.Color(bodyColor);
  const accent = base.clone().offsetHSL(0.03, 0.05, 0.18);

  ctx.clearRect(0, 0, c.width, c.height);

  ctx.fillStyle = `#${accent.getHexString()}`;
  ctx.beginPath();
  ctx.moveTo(18, 190);
  ctx.lineTo(104, 190);
  ctx.lineTo(228, 58);
  ctx.lineTo(238, 72);
  ctx.lineTo(114, 206);
  ctx.lineTo(18, 206);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.beginPath();
  ctx.arc(132, 124, 58, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 10;
  ctx.strokeStyle = "rgba(18, 24, 30, 0.88)";
  ctx.stroke();

  ctx.fillStyle = "rgba(20, 24, 30, 0.95)";
  ctx.font = "bold 108px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(number), 132, 128);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, MAX_ANISO || 8);
  return tex;
}

function makeKartSideStripeTexture(bodyColor) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 96;
  const ctx = c.getContext("2d");
  const base = new THREE.Color(bodyColor);
  const accent = base.clone().offsetHSL(-0.02, 0.04, 0.22);

  ctx.clearRect(0, 0, c.width, c.height);

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillRect(8, 16, 190, 18);

  ctx.fillStyle = `#${accent.getHexString()}`;
  ctx.beginPath();
  ctx.moveTo(20, 52);
  ctx.lineTo(126, 52);
  ctx.lineTo(182, 24);
  ctx.lineTo(236, 24);
  ctx.lineTo(176, 62);
  ctx.lineTo(20, 62);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(18,24,30,0.65)";
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 14, 194, 22);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, MAX_ANISO || 8);
  return tex;
}

function makeBoostPadTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext("2d");

  ctx.clearRect(0, 0, c.width, c.height);

  // Dark base panel
  ctx.fillStyle = "rgba(10,18,28,0.92)";
  ctx.fillRect(0, 0, c.width, c.height);

  // Outer rails
  ctx.fillStyle = "rgba(71, 216, 255, 0.28)";
  ctx.fillRect(4, 4, 16, c.height - 8);
  ctx.fillRect(c.width - 20, 4, 16, c.height - 8);

  // Energy lanes
  for (let i = 0; i < 4; i++) {
    const y = 10 + i * 29;
    ctx.fillStyle = i % 2 === 0 ? "rgba(91, 248, 255, 0.82)" : "rgba(255, 241, 111, 0.82)";
    ctx.fillRect(24, y, c.width - 48, 18);
  }

  // Chevrons
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  for (let x = 36; x < c.width - 30; x += 44) {
    ctx.beginPath();
    ctx.moveTo(x, 22);
    ctx.lineTo(x + 12, 14);
    ctx.lineTo(x + 24, 22);
    ctx.lineTo(x + 16, 22);
    ctx.lineTo(x + 4, 14);
    ctx.lineTo(x - 8, 22);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, 84);
    ctx.lineTo(x + 12, 76);
    ctx.lineTo(x + 24, 84);
    ctx.lineTo(x + 16, 84);
    ctx.lineTo(x + 4, 76);
    ctx.lineTo(x - 8, 84);
    ctx.closePath();
    ctx.fill();
  }

  // Soft glow overlay
  const glow = ctx.createLinearGradient(0, 0, 0, c.height);
  glow.addColorStop(0, "rgba(255,255,255,0.08)");
  glow.addColorStop(0.5, "rgba(255,255,255,0)");
  glow.addColorStop(1, "rgba(0,0,0,0.12)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, c.width, c.height);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, MAX_ANISO || 8);
  return tex;
}

const grassTex = loadRepeatTexture("./assets/textures/grass.svg", { repeat: [14, 14] });
const asphaltTex = loadRepeatTexture("./assets/textures/asphalt.svg", { repeat: [4, 32] });
const curbTex = loadRepeatTexture("./assets/textures/curb_stripe.svg", { repeat: [1, 32] });
const dashedLineAlphaTex = makeDashAlphaTexture();
const arrowDecalTex = makeArrowDecalTexture();
const boostPadTex = makeBoostPadTexture();

// Lights
const hemi = new THREE.HemisphereLight(0xeaf6ff, 0x4f7f43, 0.95);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xfff4d6, 1.15);
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
scene.add(dir.target);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 400),
  new THREE.MeshStandardMaterial({
    map: grassTex,
    color: 0xbbe17d,
    roughness: 0.95,
    metalness: 0.0,
  })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Debug grid
const grid = new THREE.GridHelper(400, 80, 0x223344, 0x1b2a35);
grid.position.y = 0.01;
grid.visible = false;
scene.add(grid);

// ==============================
// ==============================
function buildTrack({ points, trackWidth = 11, segments = 900, roadY = 0.08 }) {
  const curve = new THREE.CatmullRomCurve3(points, true, "centripetal", 0.5);
  const halfW = trackWidth / 2;
  const loopLength = curve.getLength();

  asphaltTex.repeat.set(Math.max(2, trackWidth / 7), Math.max(10, loopLength / 9));
  curbTex.repeat.set(1, Math.max(20, loopLength / 3.6));

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
    map: asphaltTex,
    color: 0xd8dde5,
    roughness: 0.82,
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
    map: curbTex,
    color: 0xffffff,
    roughness: 0.7,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });

  const edgePos = [];
  const edgeUvs = [];
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

      const v = i / segments;
      edgeUvs.push(0, v);
      edgeUvs.push(1, v);
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
  edgeGeo.setAttribute("uv", new THREE.Float32BufferAttribute(edgeUvs, 2));
  edgeGeo.setIndex(edgeIdx);
  edgeGeo.computeVertexNormals();

  const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
  edgeMesh.receiveShadow = true;
  edgeMesh.castShadow = false;
  scene.add(edgeMesh);

  return {
    curve,
    trackWidth,
    halfW,
    segments,
    samplePts,
    sampleTan,
    sampleLeft,
    roadY,
    edgeY,
    trackMesh,
    edgeMesh,
    loopLength,
  };
}

function addTrackPaintStrip(track, {
  offset = 0,
  width = 0.35,
  y = track.edgeY + 0.01,
  color = 0xffffff,
  opacity = 1,
  dashed = false,
  repeatV = 40,
} = {}) {
  const { samplePts, sampleLeft, segments } = track;
  const positions = [];
  const uvs = [];
  const indices = [];
  const half = width * 0.5;

  for (let i = 0; i < segments; i++) {
    const p = samplePts[i];
    const left = sampleLeft[i];
    const center = p.clone().addScaledVector(left, offset);

    const outer = center.clone().addScaledVector(left, half);
    const inner = center.clone().addScaledVector(left, -half);
    outer.y = y;
    inner.y = y;

    positions.push(outer.x, outer.y, outer.z);
    positions.push(inner.x, inner.y, inner.z);

    const v = (i / segments) * repeatV;
    uvs.push(0, v);
    uvs.push(1, v);
  }

  for (let i = 0; i < segments; i++) {
    const ni = (i + 1) % segments;
    const i0 = 2 * i;
    const i1 = 2 * i + 1;
    const i2 = 2 * ni;
    const i3 = 2 * ni + 1;
    indices.push(i0, i2, i1, i2, i3, i1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.62,
    metalness: 0.0,
    transparent: dashed || opacity < 1,
    opacity,
    alphaMap: dashed ? dashedLineAlphaTex : null,
    alphaTest: dashed ? 0.35 : 0,
    polygonOffset: true,
    polygonOffsetFactor: -8,
    polygonOffsetUnits: -8,
    side: THREE.DoubleSide,
  });
  mat.depthWrite = !dashed;

  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = false;
  mesh.castShadow = false;
  mesh.renderOrder = 8;
  scene.add(mesh);
  return mesh;
}

function addRoadArrowDecals(track, placements) {
  const mat = new THREE.MeshStandardMaterial({
    map: arrowDecalTex,
    color: 0xffffff,
    transparent: true,
    roughness: 0.7,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -10,
    polygonOffsetUnits: -10,
  });
  mat.depthWrite = false;

  const meshes = [];

  for (const placement of placements) {
    const idx = ((placement.idx % track.segments) + track.segments) % track.segments;
    const p = track.samplePts[idx].clone();
    const tan = track.sampleTan[idx].clone().normalize();
    const left = track.sampleLeft[idx].clone().normalize();

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(placement.w ?? 7, placement.h ?? 5.8),
      mat
    );

    plane.position.copy(p);
    plane.position.addScaledVector(left, placement.lateral ?? 0);
    plane.position.y = track.edgeY + 0.04;
    const yawArrow = Math.atan2(tan.x, tan.z) + Math.PI + (placement.yawOffset ?? 0);
    plane.rotation.set(-Math.PI / 2, 0, yawArrow);

    plane.renderOrder = 9;
    scene.add(plane);
    meshes.push(plane);
  }

  return { material: mat, meshes };
}

function addBoostPads(track, placements) {
  const padGroup = new THREE.Group();
  const pads = [];

  const baseMat = new THREE.MeshStandardMaterial({
    map: boostPadTex,
    color: 0xffffff,
    roughness: 0.42,
    metalness: 0.08,
    emissive: 0x2c8fd6,
    emissiveIntensity: 0.95,
    polygonOffset: true,
    polygonOffsetFactor: -9,
    polygonOffsetUnits: -9,
    transparent: true,
  });
  baseMat.depthWrite = false;

  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x7be9ff,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < placements.length; i++) {
    const placement = placements[i];
    const idx = ((placement.idx % track.segments) + track.segments) % track.segments;
    const width = placement.width ?? 12;
    const length = placement.length ?? 4.8;
    const p = track.samplePts[idx].clone();
    const tan = track.sampleTan[idx].clone().normalize();
    const left = track.sampleLeft[idx].clone().normalize();
    p.addScaledVector(left, placement.lateral ?? 0);

    const yawPad = Math.atan2(tan.x, tan.z) + (placement.yawOffset ?? 0);
    const yBase = track.edgeY + 0.035;

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 1.12, length * 1.18),
      glowMat.clone()
    );
    glow.position.set(p.x, yBase - 0.004, p.z);
    // Plane is flattened first, then rotated around its normal (world up) using Z.
    glow.rotation.set(-Math.PI / 2, 0, yawPad);
    glow.renderOrder = 7;
    padGroup.add(glow);

    const pad = new THREE.Mesh(
      new THREE.PlaneGeometry(width, length),
      baseMat.clone()
    );
    pad.position.set(p.x, yBase, p.z);
    pad.rotation.set(-Math.PI / 2, 0, yawPad);
    pad.renderOrder = 8;
    padGroup.add(pad);

    pads.push({
      id: i,
      mesh: pad,
      glow,
      position: p.clone(),
      tangent: tan,
      left,
      width,
      length,
    });
  }

  scene.add(padGroup);
  return { pads, group: padGroup };
}

function createRampSurfaceGeometry(width, length, peakHeight, lengthSegments = 28) {
  const halfW = width * 0.5;
  const halfL = length * 0.5;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= lengthSegments; i++) {
    const v = i / lengthSegments;
    const z = THREE.MathUtils.lerp(-halfL, halfL, v);
    const normalized = z / halfL; // [-1, 1]
    const profile = Math.max(0, Math.cos(normalized * Math.PI * 0.5));
    const y = peakHeight * profile;

    positions.push(-halfW, y, z);
    positions.push(halfW, y, z);

    uvs.push(0, v);
    uvs.push(1, v);
  }

  for (let i = 0; i < lengthSegments; i++) {
    const i0 = 2 * i;
    const i1 = i0 + 1;
    const i2 = i0 + 2;
    const i3 = i0 + 3;
    indices.push(i0, i2, i1, i2, i3, i1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function addTrackRamps(track, placements) {
  const group = new THREE.Group();
  const ramps = [];
  const mat = new THREE.MeshStandardMaterial({
    map: asphaltTex,
    color: 0xd8dde5,
    roughness: 0.72,
    metalness: 0.02,
    polygonOffset: true,
    polygonOffsetFactor: -6,
    polygonOffsetUnits: -6,
  });

  for (let i = 0; i < placements.length; i++) {
    const placement = placements[i];
    const idx = ((placement.idx % track.segments) + track.segments) % track.segments;
    const center = track.samplePts[idx].clone();
    const baseTangent = track.sampleTan[idx].clone().normalize();
    const baseLeft = track.sampleLeft[idx].clone().normalize();
    center.addScaledVector(baseLeft, placement.lateral ?? 0);

    const width = placement.width ?? 12;
    const length = placement.length ?? 22;
    const peakHeight = placement.height ?? 1.8;
    const yaw = Math.atan2(baseTangent.x, baseTangent.z) + (placement.yawOffset ?? 0);
    const tangent = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).normalize();
    const left = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

    const mesh = new THREE.Mesh(
      createRampSurfaceGeometry(width, length, peakHeight, placement.segments ?? 28),
      mat
    );
    mesh.position.set(center.x, track.roadY + 0.012, center.z);
    mesh.rotation.y = yaw;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    mesh.renderOrder = 7;
    group.add(mesh);

    ramps.push({
      id: i,
      mesh,
      center: center.clone(),
      tangent,
      left,
      halfW: width * 0.5,
      halfL: length * 0.5,
      peakHeight,
    });
  }

  scene.add(group);
  return { ramps, group, material: mat };
}

// ==============================
// Track layout:
// 1) long straight
// 2) left turn 
// 3) right turn 
// 4) straight back (down -Z) returning to start
// ==============================
const trackPoints = [
    // --- LONG STRAIGHT (up +Z) at x = 0 ---
    new THREE.Vector3(0, 0, -55),
    new THREE.Vector3(0, 0, -15),
    new THREE.Vector3(0, 0, 25),
    new THREE.Vector3(0, 0, 65),
    new THREE.Vector3(0, 0, 105),

    // --- TOP TURN: smooth right-hand sweep ---
    new THREE.Vector3(5, 0, 135),
    new THREE.Vector3(20, 0, 155),
    new THREE.Vector3(50, 0, 165),
    new THREE.Vector3(80, 0, 155),
    new THREE.Vector3(100, 0, 135),

    // --- RIGHT TURN into back straight ---
    new THREE.Vector3(110, 0, 110),
    new THREE.Vector3(115, 0, 85),

    // --- BACK STRAIGHT (down -Z) at x ≈ 115 ---
    new THREE.Vector3(115, 0, 55),
    new THREE.Vector3(115, 0, 15),
    new THREE.Vector3(115, 0, -25),
    new THREE.Vector3(115, 0, -65),

    // --- BOTTOM TURN: wide arc back to start straight ---
    new THREE.Vector3(110, 0, -95),
    new THREE.Vector3(90, 0, -120),
    new THREE.Vector3(60, 0, -135),
    new THREE.Vector3(30, 0, -130),
    new THREE.Vector3(5, 0, -110),
    new THREE.Vector3(0, 0, -85),
  ];
  
  

const trackData = buildTrack({
  points: trackPoints,
  trackWidth: 36,
  segments: 1000,
  roadY: 0.08,
});

// Road paint and decals for a more arcade track look.
const edgeLineInset = trackData.halfW - 1.55;
const trackEdgeLineL = addTrackPaintStrip(trackData, {
  offset: edgeLineInset,
  width: 0.22,
  color: 0xf6f6f3,
  y: trackData.edgeY + 0.018,
  repeatV: trackData.loopLength / 3,
});
const trackEdgeLineR = addTrackPaintStrip(trackData, {
  offset: -edgeLineInset,
  width: 0.22,
  color: 0xf6f6f3,
  y: trackData.edgeY + 0.018,
  repeatV: trackData.loopLength / 3,
});
const trackCenterDash = addTrackPaintStrip(trackData, {
  offset: 0,
  width: 0.34,
  color: 0xfff2a6,
  opacity: 0.92,
  dashed: true,
  y: trackData.edgeY + 0.02,
  repeatV: trackData.loopLength / 2.2,
});

const roadArrowDecals = addRoadArrowDecals(trackData, [
  { idx: Math.floor(trackData.segments * 0.18), lateral: 6.5 },
  { idx: Math.floor(trackData.segments * 0.28), lateral: -4.5 },
  { idx: Math.floor(trackData.segments * 0.48), lateral: 4.5 },
  { idx: Math.floor(trackData.segments * 0.66), lateral: -5.5 },
  { idx: Math.floor(trackData.segments * 0.86), lateral: 5.5 },
]);

const boostPadSystem = addBoostPads(trackData, [
  { idx: Math.floor(trackData.segments * 0.115), width: 16, length: 5.2 },
  { idx: Math.floor(trackData.segments * 0.245), width: 14, length: 5.0 },
  { idx: Math.floor(trackData.segments * 0.435), width: 15, length: 5.0 },
  { idx: Math.floor(trackData.segments * 0.615), width: 16, length: 5.2 },
  { idx: Math.floor(trackData.segments * 0.79), width: 14, length: 5.0 },
]);
const boostPads = boostPadSystem.pads;

const rampSystem = addTrackRamps(trackData, [
  { idx: Math.floor(trackData.segments * 0.155), lateral: -6.0, width: 10.5, length: 21, height: 1.8 },
  { idx: Math.floor(trackData.segments * 0.335), lateral: 5.5, width: 10.5, length: 19, height: 1.6 },
  { idx: Math.floor(trackData.segments * 0.565), lateral: -5.0, width: 11.5, length: 24, height: 2.0 },
  { idx: Math.floor(trackData.segments * 0.765), lateral: 6.0, width: 10.5, length: 20, height: 1.7 },
]);
const trackRamps = rampSystem.ramps;

const SURFACE_SLOPE_SAMPLE_DIST = 1.2;
const MAX_SURFACE_PITCH = 0.36;
const surfaceForwardProbe = new THREE.Vector3();
const surfacePosProbe = new THREE.Vector3();
const defaultSurfacePose = { y: 0, pitch: 0 };

function getRampHeightAtPosition(pos) {
  let bestHeight = 0;

  for (const ramp of trackRamps) {
    const dx = pos.x - ramp.center.x;
    const dz = pos.z - ramp.center.z;
    const localL = dx * ramp.left.x + dz * ramp.left.z;
    const localF = dx * ramp.tangent.x + dz * ramp.tangent.z;
    if (Math.abs(localL) > ramp.halfW || Math.abs(localF) > ramp.halfL) continue;

    const normalized = localF / ramp.halfL; // [-1, 1]
    const profile = Math.max(0, Math.cos(normalized * Math.PI * 0.5));
    const height = ramp.peakHeight * profile;
    if (height > bestHeight) bestHeight = height;
  }

  return bestHeight;
}

function sampleTrackSurfacePose(pos, headingYaw, out = defaultSurfacePose) {
  const yCenter = getRampHeightAtPosition(pos);
  surfaceForwardProbe.set(Math.sin(headingYaw), 0, Math.cos(headingYaw));

  surfacePosProbe.copy(pos).addScaledVector(surfaceForwardProbe, SURFACE_SLOPE_SAMPLE_DIST);
  const yFront = getRampHeightAtPosition(surfacePosProbe);

  surfacePosProbe.copy(pos).addScaledVector(surfaceForwardProbe, -SURFACE_SLOPE_SAMPLE_DIST);
  const yBack = getRampHeightAtPosition(surfacePosProbe);

  const pitch = Math.atan2(yFront - yBack, SURFACE_SLOPE_SAMPLE_DIST * 2);
  out.y = yCenter;
  out.pitch = THREE.MathUtils.clamp(pitch, -MAX_SURFACE_PITCH, MAX_SURFACE_PITCH);
  return out;
}

function applyKartToTrackSurface(kartGroup, headingYaw) {
  const pose = sampleTrackSurfacePose(kartGroup.position, headingYaw);
  kartGroup.position.y = pose.y;
  kartGroup.rotation.x = pose.pitch;
}

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
  tex.colorSpace = THREE.SRGBColorSpace;
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

  return { position: p, tangent: tan, yaw, mesh: plane, material: mat };
}

const START_IDX = Math.floor(trackData.segments * 0.06);
const startLine = addStartFinishLineAtIndex(trackData, START_IDX);

function makeKartPaintMaterial(color) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.28,
    metalness: 0.06,
    clearcoat: 1,
    clearcoatRoughness: 0.2,
  });
}

function makeKartGlassMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0x9fd7ff,
    roughness: 0.08,
    metalness: 0.03,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    transparent: true,
    opacity: 0.45,
  });
}

function makeHeadlightMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xffffd2,
    roughness: 0.35,
    emissive: 0x4b3b0d,
    emissiveIntensity: 0.45,
  });
}

function makeKartTrimMaterial(color = 0x161a21) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0.04 });
}

function makeKartSeatMaterial(color = 0x272d37) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.02 });
}

function makeKartRimMaterial(color = 0xdce3ed) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.7 });
}

function makeKartHubMaterial(color = 0x7a8798) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.35 });
}

const kartDarkMat = makeKartTrimMaterial();
const kartTireMat = new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 1, metalness: 0.0 });
const kartRimMat = makeKartRimMaterial();
const kartHubMat = makeKartHubMaterial();
const kartExhaustMat = new THREE.MeshStandardMaterial({ color: 0x9fa7b5, roughness: 0.35, metalness: 0.75 });

function addKartDecals(group, bodyColor, number) {
  const hoodTex = makeKartNumberDecalTexture(bodyColor, number);
  const sideTex = makeKartSideStripeTexture(bodyColor);

  const hoodMat = new THREE.MeshStandardMaterial({
    map: hoodTex,
    transparent: true,
    alphaTest: 0.1,
    roughness: 0.65,
    polygonOffset: true,
    polygonOffsetFactor: -8,
    polygonOffsetUnits: -8,
  });
  hoodMat.depthWrite = false;

  const sideMat = new THREE.MeshStandardMaterial({
    map: sideTex,
    transparent: true,
    alphaTest: 0.1,
    roughness: 0.65,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -8,
    polygonOffsetUnits: -8,
  });
  sideMat.depthWrite = false;

  const hoodDecal = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 1.05), hoodMat);
  hoodDecal.position.set(0, 0.89, 0.95);
  hoodDecal.rotation.x = -Math.PI / 2;
  hoodDecal.renderOrder = 12;
  group.add(hoodDecal);

  const leftDecal = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.32), sideMat);
  leftDecal.position.set(1.215, 0.62, 0.1);
  leftDecal.rotation.y = Math.PI / 2;
  leftDecal.renderOrder = 12;
  group.add(leftDecal);

  const rightDecal = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.32), sideMat);
  rightDecal.position.set(-1.215, 0.62, 0.1);
  rightDecal.rotation.y = -Math.PI / 2;
  rightDecal.renderOrder = 12;
  group.add(rightDecal);

  return {
    number,
    hoodMat,
    sideMat,
    hoodDecal,
    leftDecal,
    rightDecal,
  };
}

function refreshKartDecals(decalPack, bodyColor) {
  if (!decalPack) return;

  const nextHood = makeKartNumberDecalTexture(bodyColor, decalPack.number);
  const nextSide = makeKartSideStripeTexture(bodyColor);

  const prevHood = decalPack.hoodMat.map;
  const prevSide = decalPack.sideMat.map;
  decalPack.hoodMat.map = nextHood;
  decalPack.sideMat.map = nextSide;
  decalPack.hoodMat.needsUpdate = true;
  decalPack.sideMat.needsUpdate = true;

  if (prevHood) prevHood.dispose();
  if (prevSide) prevSide.dispose();
}

function addKartExhausts(group) {
  for (const x of [-0.42, 0.42]) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.28, 12), kartExhaustMat);
    pipe.position.set(x, 0.46, -1.77);
    pipe.rotation.z = Math.PI / 2;
    pipe.castShadow = true;
    group.add(pipe);
  }
}

function addKartWheel(parent, x, z, mats = {}) {
  const tireMat = mats.tireMat ?? kartTireMat;
  const rimMat = mats.rimMat ?? kartRimMat;
  const hubMat = mats.hubMat ?? kartHubMat;

  const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.25, 18), tireMat);
  tire.rotation.z = Math.PI / 2;
  tire.position.set(x, 0.35, z);
  tire.castShadow = true;

  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.255, 16), rimMat);
  rim.castShadow = true;
  tire.add(rim);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.27, 12), hubMat);
  hub.castShadow = true;
  tire.add(hub);

  parent.add(tire);
  return tire;
}

// ==============================
// Kart + Driver
// ==============================
const kart = new THREE.Group();
scene.add(kart);

const redMat = makeKartPaintMaterial(0xff3b3b);
const playerTrimMat = makeKartTrimMaterial(0x161a21);
const playerSeatMat = makeKartSeatMaterial(0x2a3039);
const playerRimMat = makeKartRimMaterial(0xdce3ed);
const playerHubMat = makeKartHubMaterial(0x7a8798);
const darkMat = playerTrimMat;
const glassMat = makeKartGlassMaterial();
const lightMat = makeHeadlightMaterial();

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

// Side pods / fenders for chunkier silhouette
for (const x of [-1.1, 1.1]) {
  const pod = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 2.2), redMat);
  pod.position.set(x, 0.45, 0.0);
  pod.castShadow = true;
  kart.add(pod);
}

// Lights
const headL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.1), lightMat);
const headR = headL.clone();
headL.position.set(-0.75, 0.55, 1.65);
headR.position.set(0.75, 0.55, 1.65);
kart.add(headL, headR);

// Seat
const seat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 1.0), playerSeatMat);
seat.position.set(0, 0.8, -0.15);
seat.castShadow = true;
kart.add(seat);

const playerDecals = addKartDecals(kart, 0xff3b3b, 1);
addKartExhausts(kart);

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
function makeWheel(x, z) {
  return addKartWheel(kart, x, z, {
    rimMat: playerRimMat,
    hubMat: playerHubMat,
  });
}
const wheels = [
  makeWheel(-0.95, 1.15),
  makeWheel(0.95, 1.15),
  makeWheel(-0.95, -1.15),
  makeWheel(0.95, -1.15),
];

// Spawn at the start line — player gets lane index 2 (centre of 5)
// All 5 karts are evenly spread across the start line axis
const LANE_SPACING = 7;          // units between lane centres
const TOTAL_LANES = 5;           // 1 player + 4 AI
const LANE_ORIGIN = -(TOTAL_LANES - 1) / 2 * LANE_SPACING; // leftmost lane offset
const PLAYER_LANE = 2;           // 0-indexed, centre
const CUSTOMIZER_LIFT_Y = 0.28;
const CUSTOMIZER_PLATFORM_HEIGHT = 0.22;
const CUSTOMIZER_MENU_POSITION = new THREE.Vector3(0, CUSTOMIZER_LIFT_Y, 0);
const CUSTOMIZER_MENU_YAW = Math.PI * 0.1;

kart.position.set(startLine.position.x, 0, startLine.position.z);
let yaw = startLine.yaw;

// Offset player to its lane (lateral along the start line)
{
  const left = trackData.sampleLeft[START_IDX];
  const laneOffset = LANE_ORIGIN + PLAYER_LANE * LANE_SPACING;
  kart.position.addScaledVector(left, laneOffset);
}

kart.rotation.y = yaw;
applyKartToTrackSurface(kart, yaw);
const playerRaceSpawnPosition = kart.position.clone();
const playerRaceSpawnYaw = yaw;

function buildCustomizerPlatform() {
  const g = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(4.35, 4.65, CUSTOMIZER_PLATFORM_HEIGHT, 48),
    new THREE.MeshStandardMaterial({
      color: 0x1a2432,
      roughness: 0.6,
      metalness: 0.35,
    })
  );
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(4.08, 4.08, 0.03, 48),
    new THREE.MeshStandardMaterial({
      color: 0x2f3f55,
      roughness: 0.45,
      metalness: 0.15,
    })
  );
  top.position.y = CUSTOMIZER_PLATFORM_HEIGHT * 0.5 - 0.025;
  top.receiveShadow = true;
  g.add(top);

  const topRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.75, 0.08, 12, 48),
    new THREE.MeshStandardMaterial({
      color: 0x89d8ff,
      roughness: 0.3,
      metalness: 0.55,
      emissive: 0x16465f,
      emissiveIntensity: 0.55,
    })
  );
  topRing.rotation.x = Math.PI / 2;
  topRing.position.y = CUSTOMIZER_PLATFORM_HEIGHT * 0.5 - 0.005;
  g.add(topRing);

  const glowDisc = new THREE.Mesh(
    new THREE.CircleGeometry(3.45, 48),
    new THREE.MeshBasicMaterial({
      color: 0x9be6ff,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    })
  );
  glowDisc.rotation.x = -Math.PI / 2;
  glowDisc.position.y = CUSTOMIZER_PLATFORM_HEIGHT * 0.5 - 0.006;
  glowDisc.renderOrder = 6;
  g.add(glowDisc);

  return g;
}

function buildCustomizerMenuEnvironment() {
  const g = new THREE.Group();

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(14, 64),
    new THREE.MeshStandardMaterial({
      color: 0x182234,
      roughness: 0.86,
      metalness: 0.08,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  g.add(floor);

  const floorRing = new THREE.Mesh(
    new THREE.RingGeometry(5.2, 5.7, 64),
    new THREE.MeshBasicMaterial({
      color: 0x7be0ff,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  floorRing.rotation.x = -Math.PI / 2;
  floorRing.position.y = 0.015;
  floorRing.renderOrder = 4;
  g.add(floorRing);

  const backWall = new THREE.Mesh(
    new THREE.CylinderGeometry(10.8, 10.8, 9.4, 48, 1, true, 0, Math.PI * 2),
    new THREE.MeshStandardMaterial({
      color: 0x111c31,
      roughness: 0.75,
      metalness: 0.18,
      side: THREE.DoubleSide,
    })
  );
  backWall.position.y = 4.2;
  g.add(backWall);

  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(7.6, 1.2),
    new THREE.MeshBasicMaterial({
      color: 0xe7f8ff,
      transparent: true,
      opacity: 0.9,
    })
  );
  banner.position.set(0, 6.8, -8.6);
  banner.renderOrder = 4;
  g.add(banner);

  const titlePlate = new THREE.Mesh(
    new THREE.PlaneGeometry(7.1, 1.0),
    new THREE.MeshBasicMaterial({
      color: 0x102136,
      transparent: true,
      opacity: 0.95,
    })
  );
  titlePlate.position.set(0, 6.8, -8.55);
  titlePlate.renderOrder = 5;
  g.add(titlePlate);

  return {
    group: g,
    floor,
    floorRing,
    backWall,
    banner,
    titlePlate,
  };
}

const customizerPlatform = buildCustomizerPlatform();
menuScene.add(customizerPlatform);
const menuEnvironment = buildCustomizerMenuEnvironment();
menuScene.add(menuEnvironment.group);

const menuHemLight = new THREE.HemisphereLight(0xdff3ff, 0x1b2740, 0.9);
menuScene.add(menuHemLight);

const menuKeyLight = new THREE.DirectionalLight(0xfff3d0, 1.25);
menuKeyLight.position.set(5, 9, 7);
menuKeyLight.castShadow = false;
menuScene.add(menuKeyLight);

const menuFillLight = new THREE.DirectionalLight(0x86dcff, 0.5);
menuFillLight.position.set(-7, 4, -4);
menuScene.add(menuFillLight);

const ARENA_THEMES = [
  {
    id: "sunny",
    label: "Sunny Green",
    description: "Bright grass, clear sky, classic daytime arcade track.",
    arena: {
      sceneBg: 0x87c7ff,
      fogColor: 0x9fd4ff,
      fogDensity: 0.0025,
      exposure: 1.06,
      hemiSky: 0xeaf6ff,
      hemiGround: 0x4f7f43,
      hemiIntensity: 0.95,
      dirColor: 0xfff4d6,
      dirIntensity: 1.15,
      groundColor: 0xbbe17d,
      trackColor: 0xd8dde5,
      curbColor: 0xffffff,
      edgeLineColor: 0xf6f6f3,
      centerLineColor: 0xfff2a6,
      centerLineOpacity: 0.92,
      arrowColor: 0xffffff,
      arrowOpacity: 1,
      menuBg: 0x0b1020,
      menuFogColor: 0x10172b,
      menuFogDensity: 0.012,
      menuFloor: 0x182234,
      menuRing: 0x7be0ff,
      menuWall: 0x111c31,
      menuBanner: 0xe7f8ff,
      menuTitle: 0x102136,
      menuHemSky: 0xdff3ff,
      menuHemGround: 0x1b2740,
      menuHemIntensity: 0.9,
      menuKeyColor: 0xfff3d0,
      menuKeyIntensity: 1.25,
      menuFillColor: 0x86dcff,
      menuFillIntensity: 0.5,
      preview: {
        skyTop: "#86c8ff",
        skyBottom: "#d8f1ff",
        horizon: "#9dd27a",
        terrain: "#83c65a",
        road: "#5e6570",
        curb1: "#f4f4f2",
        curb2: "#ce2f32",
        accent: "#ffe16d",
      },
    },
  },
  {
    id: "neon_night",
    label: "Night Neon",
    description: "Dark course with lit curbs and glowing signs.",
    arena: {
      sceneBg: 0x040915,
      fogColor: 0x071123,
      fogDensity: 0.0052,
      exposure: 0.98,
      hemiSky: 0x6dcfff,
      hemiGround: 0x0d1426,
      hemiIntensity: 0.45,
      dirColor: 0x9dc3ff,
      dirIntensity: 0.48,
      groundColor: 0x2f4e4d,
      trackColor: 0x9aa7ba,
      curbColor: 0xc5ebff,
      edgeLineColor: 0xd7f3ff,
      centerLineColor: 0x7cf8ff,
      centerLineOpacity: 0.96,
      arrowColor: 0x95f7ff,
      arrowOpacity: 0.95,
      menuBg: 0x070a17,
      menuFogColor: 0x0a0f1f,
      menuFogDensity: 0.016,
      menuFloor: 0x12192b,
      menuRing: 0x68f2ff,
      menuWall: 0x0f1630,
      menuBanner: 0x95eeff,
      menuTitle: 0x091225,
      menuHemSky: 0x8ae6ff,
      menuHemGround: 0x12182b,
      menuHemIntensity: 0.7,
      menuKeyColor: 0xa0cbff,
      menuKeyIntensity: 0.85,
      menuFillColor: 0x53e3ff,
      menuFillIntensity: 0.78,
      preview: {
        skyTop: "#06102a",
        skyBottom: "#112045",
        horizon: "#173a48",
        terrain: "#214f52",
        road: "#3a4354",
        curb1: "#d7f5ff",
        curb2: "#22b8d9",
        accent: "#6bf4ff",
      },
    },
  },
  {
    id: "sunset_desert",
    label: "Sunset Desert",
    description: "Warm dusk sky with sandy runoff and amber lighting.",
    arena: {
      sceneBg: 0xffb36c,
      fogColor: 0xffa76b,
      fogDensity: 0.0034,
      exposure: 1.02,
      hemiSky: 0xffd7b0,
      hemiGround: 0x8f6a3f,
      hemiIntensity: 0.82,
      dirColor: 0xffd39a,
      dirIntensity: 1.0,
      groundColor: 0xd8c07d,
      trackColor: 0xd7c0ab,
      curbColor: 0xfff1df,
      edgeLineColor: 0xfff5dc,
      centerLineColor: 0xffbf5e,
      centerLineOpacity: 0.93,
      arrowColor: 0xffefcc,
      arrowOpacity: 0.88,
      menuBg: 0x1d1020,
      menuFogColor: 0x231426,
      menuFogDensity: 0.014,
      menuFloor: 0x2c2131,
      menuRing: 0xffb55a,
      menuWall: 0x2a1a2d,
      menuBanner: 0xffe4bd,
      menuTitle: 0x271727,
      menuHemSky: 0xffd7b3,
      menuHemGround: 0x2b1a26,
      menuHemIntensity: 0.84,
      menuKeyColor: 0xffbf78,
      menuKeyIntensity: 1.0,
      menuFillColor: 0xff7d77,
      menuFillIntensity: 0.42,
      preview: {
        skyTop: "#ff9858",
        skyBottom: "#ffd9a8",
        horizon: "#cfb06d",
        terrain: "#c8a35f",
        road: "#7a6f6a",
        curb1: "#fff1de",
        curb2: "#d96f3a",
        accent: "#ffb84f",
      },
    },
  },
];

function getArenaTheme(themeId) {
  return ARENA_THEMES.find((t) => t.id === themeId) ?? ARENA_THEMES[0];
}

function applyArenaTheme(themeId) {
  const theme = getArenaTheme(themeId);
  const t = theme.arena;

  scene.background.setHex(t.sceneBg);
  if (scene.fog) {
    scene.fog.color.setHex(t.fogColor);
    scene.fog.density = t.fogDensity;
  }
  renderer.toneMappingExposure = t.exposure;

  hemi.color.setHex(t.hemiSky);
  hemi.groundColor.setHex(t.hemiGround);
  hemi.intensity = t.hemiIntensity;
  dir.color.setHex(t.dirColor);
  dir.intensity = t.dirIntensity;

  ground.material.color.setHex(t.groundColor);
  trackData.trackMesh.material.color.setHex(t.trackColor);
  trackData.edgeMesh.material.color.setHex(t.curbColor);
  rampSystem.material.color.setHex(t.trackColor);

  trackEdgeLineL.material.color.setHex(t.edgeLineColor);
  trackEdgeLineR.material.color.setHex(t.edgeLineColor);
  trackCenterDash.material.color.setHex(t.centerLineColor);
  trackCenterDash.material.opacity = t.centerLineOpacity;
  trackCenterDash.material.needsUpdate = true;

  if (roadArrowDecals?.material) {
    roadArrowDecals.material.color.setHex(t.arrowColor);
    roadArrowDecals.material.opacity = t.arrowOpacity;
    roadArrowDecals.material.needsUpdate = true;
  }

  menuScene.background.setHex(t.menuBg);
  if (menuScene.fog) {
    menuScene.fog.color.setHex(t.menuFogColor);
    menuScene.fog.density = t.menuFogDensity;
  }

  menuEnvironment.floor.material.color.setHex(t.menuFloor);
  menuEnvironment.floorRing.material.color.setHex(t.menuRing);
  menuEnvironment.backWall.material.color.setHex(t.menuWall);
  menuEnvironment.banner.material.color.setHex(t.menuBanner);
  menuEnvironment.titlePlate.material.color.setHex(t.menuTitle);

  menuHemLight.color.setHex(t.menuHemSky);
  menuHemLight.groundColor.setHex(t.menuHemGround);
  menuHemLight.intensity = t.menuHemIntensity;
  menuKeyLight.color.setHex(t.menuKeyColor);
  menuKeyLight.intensity = t.menuKeyIntensity;
  menuFillLight.color.setHex(t.menuFillColor);
  menuFillLight.intensity = t.menuFillIntensity;

  return theme;
}

function makeThemePreviewDataUrl(theme) {
  const p = theme.arena.preview;
  const c = document.createElement("canvas");
  c.width = 420;
  c.height = 180;
  const ctx = c.getContext("2d");

  const sky = ctx.createLinearGradient(0, 0, 0, 110);
  sky.addColorStop(0, p.skyTop);
  sky.addColorStop(1, p.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, c.width, 110);

  ctx.fillStyle = p.horizon;
  ctx.fillRect(0, 98, c.width, 18);

  ctx.fillStyle = p.terrain;
  ctx.fillRect(0, 110, c.width, 70);

  // Stylized road wedge
  ctx.fillStyle = p.road;
  ctx.beginPath();
  ctx.moveTo(112, 180);
  ctx.lineTo(164, 108);
  ctx.lineTo(256, 108);
  ctx.lineTo(308, 180);
  ctx.closePath();
  ctx.fill();

  // Curbs
  const curbWidth = 10;
  for (let i = 0; i < 7; i++) {
    const t0 = i / 7;
    const t1 = (i + 1) / 7;
    const leftBottom = 112 + (164 - 112) * t0;
    const leftTop = 112 + (164 - 112) * t1;
    const rightBottom = 308 + (256 - 308) * t0;
    const rightTop = 308 + (256 - 308) * t1;
    const yBottom = 180 + (108 - 180) * t0;
    const yTop = 180 + (108 - 180) * t1;
    ctx.fillStyle = i % 2 === 0 ? p.curb1 : p.curb2;
    ctx.beginPath();
    ctx.moveTo(leftBottom, yBottom);
    ctx.lineTo(leftBottom + curbWidth, yBottom);
    ctx.lineTo(leftTop + curbWidth * 0.55, yTop);
    ctx.lineTo(leftTop, yTop);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(rightBottom, yBottom);
    ctx.lineTo(rightBottom - curbWidth, yBottom);
    ctx.lineTo(rightTop - curbWidth * 0.55, yTop);
    ctx.lineTo(rightTop, yTop);
    ctx.closePath();
    ctx.fill();
  }

  // Center line
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 5;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  ctx.moveTo(210, 172);
  ctx.lineTo(210, 118);
  ctx.stroke();

  // Glowy sign dots for night/sunset cards
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  for (const x of [18, 34, 50, 66, 352, 368, 384, 400]) {
    ctx.beginPath();
    ctx.arc(x, 20 + (x % 3) * 2, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  return c.toDataURL("image/png");
}

// ==============================
// AI Kart
// ==============================
function buildKartModel(bodyColor, number = 2) {
  const g = new THREE.Group();
  const bMat = makeKartPaintMaterial(bodyColor);
  const dkMat = kartDarkMat;
  const glMat = makeKartGlassMaterial();
  const ltMat = makeHeadlightMaterial();

  const b = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.6, 3.2), bMat); b.position.y = 0.55; b.castShadow = true; g.add(b);
  const h = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 1.2), bMat); h.position.set(0, 0.75, 1.05); h.castShadow = true; g.add(h);
  for (const x of [-1.1, 1.1]) {
    const pod = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 2.2), bMat);
    pod.position.set(x, 0.45, 0);
    pod.castShadow = true;
    g.add(pod);
  }
  const ws = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.08), glMat); ws.position.set(0, 1.0, 0.55); ws.rotation.x = -0.35; ws.castShadow = true; g.add(ws);
  const sp = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.35), dkMat); sp.position.set(0, 1.0, -1.45); sp.castShadow = true; g.add(sp);
  const hL2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.1), ltMat); const hR2 = hL2.clone(); hL2.position.set(-0.75, 0.55, 1.65); hR2.position.set(0.75, 0.55, 1.65); g.add(hL2, hR2);
  const st = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 1.0), dkMat); st.position.set(0, 0.8, -0.15); st.castShadow = true; g.add(st);
  addKartDecals(g, bodyColor, number);
  addKartExhausts(g);

  // Driver
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.75, 16), new THREE.MeshStandardMaterial({ color: 0x33aa55, roughness: 0.9 }));
  tr.position.set(0, 1.18, -0.15); tr.castShadow = true; g.add(tr);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.23, 18, 18), new THREE.MeshStandardMaterial({ color: 0xf2c9a0, roughness: 0.9 }));
  hd.position.set(0, 1.7, -0.15); hd.castShadow = true; g.add(hd);

  // Wheels
  const aiWheels = [];
  function mkW(x, z) { const w = addKartWheel(g, x, z); aiWheels.push(w); return w; }
  mkW(-0.95, 1.15); mkW(0.95, 1.15); mkW(-0.95, -1.15); mkW(0.95, -1.15);

  return { group: g, wheels: aiWheels };
}

// ==============================
// AI Racers (4 total) — all lined up on the start line, each with unique attributes
// ==============================
const START_T = 0.06;  // same parametric t as the player's start

// AI lane indices (0-4, skipping PLAYER_LANE = 2)
const AI_LANES = [0, 1, 3, 4];

const AI_PROFILES = [
  {
    name: "Speedster",
    colorLabel: "Blue",
    color: 0x3b8bff,       // blue
    speed: 19.0,           // fastest top speed
    lookahead: 0.008,      // short lookahead → late apex, worse cornering
    lerpRate: 5,           // sluggish turn responsiveness
    lateralOff: -5,        // prefers far right (matches lane 0 side)
    lane: AI_LANES[0],
  },
  {
    name: "Steady",
    colorLabel: "Orange",
    color: 0xff9f1c,       // orange
    speed: 18.0,           // moderate speed
    lookahead: 0.018,      // long lookahead → smooth, wide racing line
    lerpRate: 10,          // very responsive steering
    lateralOff: -2,        // prefers slightly right (matches lane 1 side)
    lane: AI_LANES[1],
  },
  {
    name: "Aggressor",
    colorLabel: "Teal",
    color: 0x2ec4b6,       // teal
    speed: 17.7,           // fast
    lookahead: 0.012,      // balanced lookahead
    lerpRate: 6,           // slightly sluggish
    lateralOff: 2,         // prefers slightly left (matches lane 3 side)
    lane: AI_LANES[2],
  },
  {
    name: "Rookie",
    colorLabel: "Purple",
    color: 0xc77dff,       // purple
    speed: 17.5,           // slowest
    lookahead: 0.022,      // very far lookahead → wide sweeping turns
    lateralOff: 5,         // prefers far left (matches lane 4 side)
    lerpRate: 12,          // snappy steering but slow overall
    lane: AI_LANES[3],
  },
];

const aiRacers = [];

for (let aiIndex = 0; aiIndex < AI_PROFILES.length; aiIndex++) {
  const prof = AI_PROFILES[aiIndex];
  const data = buildKartModel(prof.color, aiIndex + 2);
  scene.add(data.group);

  // Place on the start line in its assigned lane — same row as the player
  const left = trackData.sampleLeft[START_IDX];
  const laneOffset = LANE_ORIGIN + prof.lane * LANE_SPACING;
  data.group.position.copy(startLine.position);
  data.group.position.addScaledVector(left, laneOffset);
  data.group.rotation.y = yaw;
  applyKartToTrackSurface(data.group, yaw);

  aiRacers.push({
    data,
    group: data.group,
    wheels: data.wheels,
    colorLabel: prof.colorLabel,
    trackT: START_T,
    nearestIdx: START_IDX,
    maxSpeed: prof.speed,
    currentSpeed: 0,
    lookahead: prof.lookahead,
    lerpRate: prof.lerpRate,
    lateralOff: prof.lateralOff,
    currentLateral: laneOffset,
    startLaneOffset: laneOffset,
    boostTimer: 0,
    boostPadId: -1,
    // Spinout state
    spinning: false,
    spinVel: 0,
    // Race state
    lap: 1,
    prevProgress: START_T,
    passedCheckpoint: false,
    // Recovery state after spinout
    recoveryTimer: 0,
    recoveryLateralBlendBoost: 0,
  });
}

function isPositionOnBoostPad(pos, pad) {
  const dx = pos.x - pad.position.x;
  const dz = pos.z - pad.position.z;
  const localL = dx * pad.left.x + dz * pad.left.z;
  const localF = dx * pad.tangent.x + dz * pad.tangent.z;
  return Math.abs(localL) <= pad.width * 0.5 && Math.abs(localF) <= pad.length * 0.5;
}

function findBoostPadHit(pos) {
  for (const pad of boostPads) {
    if (isPositionOnBoostPad(pos, pad)) return pad;
  }
  return null;
}

function triggerPlayerBoost() {
  playerBoostTimer = Math.max(playerBoostTimer, BOOST_DURATION);
  if (speed >= 0) {
    const boostedMax = MAX_SPEED * BOOST_MAX_MULT;
    const minKick = MAX_SPEED * BOOST_PLAYER_MIN_SPEED_FACTOR;
    speed = Math.min(boostedMax, Math.max(speed, minKick) + 2.1);
  } else {
    speed = Math.min(MAX_SPEED * 0.55, speed + 4.0);
  }
  showBoostFeedback();
}

function checkPlayerBoostPads() {
  const pad = findBoostPadHit(kart.position);
  if (pad) {
    if (playerBoostPadId !== pad.id) {
      triggerPlayerBoost();
    }
    playerBoostPadId = pad.id;
  } else {
    playerBoostPadId = -1;
  }
}

function triggerAIBoost(ai) {
  ai.boostTimer = Math.max(ai.boostTimer, BOOST_DURATION * 0.95);
  ai.currentSpeed = Math.min(
    ai.maxSpeed * (BOOST_MAX_MULT - 0.03),
    Math.max(ai.currentSpeed, ai.maxSpeed * BOOST_AI_MIN_SPEED_FACTOR) + 1.8
  );
}

function checkAIBoostPads(ai) {
  const pad = findBoostPadHit(ai.group.position);
  if (pad) {
    if (ai.boostPadId !== pad.id) {
      triggerAIBoost(ai);
    }
    ai.boostPadId = pad.id;
  } else {
    ai.boostPadId = -1;
  }
}

function updateAllAI(dt) {
  const curve = trackData.curve;
  const totalLen = trackData.loopLength; // use cached loop length

  for (const ai of aiRacers) {
    if (ai.boostTimer > 0) {
      ai.boostTimer = Math.max(0, ai.boostTimer - dt);
    }

    if (ai.recoveryTimer > 0) {
      ai.recoveryTimer = Math.max(0, ai.recoveryTimer - dt);
    }

    // --- Handle spinout ---
    if (ai.spinning) {
      // Decelerate
      ai.currentSpeed *= Math.max(0, 1 - 4 * dt);

      // Apply spin rotation
      ai.group.rotation.y += ai.spinVel * dt;

      // Decay spin
      const spinSign = Math.sign(ai.spinVel);
      ai.spinVel -= spinSign * SPIN_DECAY * dt;
      if (Math.abs(ai.spinVel) < SPIN_RECOVER_THRESHOLD) {
        ai.spinning = false;
        ai.spinVel = 0;

        // Enter a short recovery mode instead of snapping to perfect driving immediately
        ai.recoveryTimer = AI_RECOVERY_DURATION;
        ai.recoveryLateralBlendBoost = 0;
        ai.currentSpeed *= 0.55;

        // Snap trackT to current position so AI resumes from here
        ai.nearestIdx = findNearestSampleIndexXZFor(ai.group.position, ai.nearestIdx);
        ai.trackT = ai.nearestIdx / trackData.segments;
      }

      // Still spin wheels
      const spin = ai.currentSpeed * dt * 1.5;
      for (const w of ai.wheels) w.rotation.x += spin;
      applyKartToTrackSurface(ai.group, ai.group.rotation.y);
      continue;  // skip normal AI driving while spinning
    }

    // --- Normal driving / recovery driving ---
    const recovering = ai.recoveryTimer > 0;
    const recoveryAlpha = clamp01(ai.recoveryTimer / AI_RECOVERY_DURATION);

    const aiBoosted = ai.boostTimer > 0;
    const aiTargetMaxSpeedBase = ai.maxSpeed * (aiBoosted ? (BOOST_MAX_MULT - 0.03) : 1);
    const aiTargetMaxSpeed = recovering ? aiTargetMaxSpeedBase * AI_RECOVERY_SPEED_MULT : aiTargetMaxSpeedBase;

    const AI_ACCEL = ACCEL;
    const aiAccelBonus = aiBoosted ? BOOST_ACCEL_BONUS * 0.7 : 0;
    ai.currentSpeed = Math.min(aiTargetMaxSpeed, ai.currentSpeed + (AI_ACCEL + aiAccelBonus) * dt);

    // Gradually blend from current lateral toward preferred racing line
    const baseBlendSpeed = 0.3;
    const recoveryBlendMultiplier = recovering ? (0.35 + 0.65 * (1 - recoveryAlpha)) : 1.0;
    const lateralBlendSpeed = baseBlendSpeed * recoveryBlendMultiplier;

    const lateralDiff = ai.lateralOff - ai.currentLateral;
    ai.currentLateral += lateralDiff * lateralBlendSpeed * dt;

    // Advance parametric t based on current speed
    ai.trackT += (ai.currentSpeed * dt) / totalLen;
    if (ai.trackT >= 1) ai.trackT -= 1;
    if (ai.trackT < 0) ai.trackT += 1;

    // Per-racer lookahead controls how early it starts turning
    const lookahead = ai.lookahead + (recovering ? AI_RECOVERY_LOOKAHEAD_BONUS : 0);
    let targetT = ai.trackT + lookahead;
    if (targetT >= 1) targetT -= 1;

    const targetPos = curve.getPointAt(targetT);
    const curPos = curve.getPointAt(ai.trackT);

    // Apply current (blended) lateral offset
    const tan = curve.getTangentAt(ai.trackT).setY(0).normalize();
    const leftDir = new THREE.Vector3(-tan.z, 0, tan.x);
    curPos.addScaledVector(leftDir, ai.currentLateral);

    // Apply the same lateral offset to the target so the kart faces along the track
    const tanTarget = curve.getTangentAt(targetT).setY(0).normalize();
    const leftTarget = new THREE.Vector3(-tanTarget.z, 0, tanTarget.x);
    targetPos.addScaledVector(leftTarget, ai.currentLateral);

    // Orient along the track tangent for a clean heading
    const aiYaw = Math.atan2(tan.x, tan.z);
    const lerpRate = recovering ? ai.lerpRate * AI_RECOVERY_LERP_MULT : ai.lerpRate;
    ai.group.position.lerp(curPos, lerpRate * dt);
    ai.group.rotation.y = aiYaw;
    applyKartToTrackSurface(ai.group, aiYaw);

    // Spin wheels
    const spin = ai.currentSpeed * dt * 1.5;
    for (const w of ai.wheels) w.rotation.x += spin;

    checkAIBoostPads(ai);
    ai.nearestIdx = findNearestSampleIndexXZFor(ai.group.position, ai.nearestIdx);
  }
}

// ==============================
// Countdown + Race state
// ==============================
let raceStarted = false;
let racePaused = false;
let countdownStarted = false;
let countdownIntervalId = null;
let customizationActive = true;
let previewKartSpin = 0;
const countdownEl = document.getElementById("countdown");
const pauseBannerEl = document.getElementById("pauseBanner");
const customizeOverlayEl = document.getElementById("customizeOverlay");
const customizePanelEl = document.getElementById("customizePanel");
const themePanelEl = document.getElementById("themePanel");
const customizeTitleEl = document.getElementById("customizeTitle");
const customizeSubEl = document.getElementById("customizeSub");
const themeGridEl = document.getElementById("themeGrid");
const themePanelTitleEl = document.getElementById("themePanelTitle");
const themePanelSubEl = document.getElementById("themePanelSub");
const customizeSectionsEl = document.getElementById("customizeSections");
const customizePaletteEl = document.getElementById("customizePalette");
const customizeSelectionEl = document.getElementById("customizeSelection");
const themeSelectionTextEl = document.getElementById("themeSelectionText");
const nextToThemeBtn = document.getElementById("nextToThemeBtn");
const acceptCustomizationBtn = document.getElementById("acceptCustomization");
const customizeBackBtn = document.getElementById("customizeBackBtn");
const raceHudPanelEl = document.getElementById("raceHud");
const pauseRaceBtn = document.getElementById("pauseRaceBtn");
const restartRaceBtn = document.getElementById("restartRaceBtn");

const KART_CUSTOMIZER_SECTIONS = [
  {
    id: "body",
    label: "Body Paint",
    colors: [0xff3b3b, 0x3b8bff, 0xff9f1c, 0x2ec4b6, 0xc77dff, 0x72ef5c, 0xffd166, 0xffffff, 0x111827],
  },
  {
    id: "trim",
    label: "Trim",
    colors: [0x161a21, 0x2b3440, 0x424b57, 0x0f3d53, 0x5b1f28, 0x1f5c31, 0x6b4f1d, 0xdbe2ea, 0x101010],
  },
  {
    id: "seat",
    label: "Seat",
    colors: [0x2a3039, 0x3a2525, 0x203647, 0x2e4430, 0x4a3c2e, 0x6b1f2f, 0xc9b38f, 0x121212],
  },
  {
    id: "rims",
    label: "Rims",
    colors: [0xdce3ed, 0xb4bcc8, 0x8b95a3, 0xf2c14e, 0xff8c42, 0x5ad0ff, 0xb9ff6d, 0xf4f4f4],
  },
];

const playerKartCustomization = {
  body: 0xff3b3b,
  trim: 0x161a21,
  seat: 0x2a3039,
  rims: 0xdce3ed,
};

let activeCustomizerSection = "body";
let startMenuStep = "kart";
let selectedArenaThemeId = ARENA_THEMES[0].id;

function hexLabel(hex) {
  return `#${hex.toString(16).padStart(6, "0").toUpperCase()}`;
}

function updateStartMenuStepUI() {
  if (customizePanelEl) customizePanelEl.classList.remove("hidden");
  if (themePanelEl) themePanelEl.classList.add("hidden");
  if (customizeOverlayEl) customizeOverlayEl.style.alignItems = "flex-end";

  if (customizeTitleEl) customizeTitleEl.textContent = "Kart Customizer";
  if (customizeSubEl) {
    customizeSubEl.textContent = "Pick a section, click a color, then start the race.";
  }
  if (nextToThemeBtn) nextToThemeBtn.textContent = "Accept & Start Race";

  updateCustomizerSelectionText();
}

function setStartMenuStep(step) {
  startMenuStep = "kart";
  updateStartMenuStepUI();
}

function renderThemeGrid() {
  if (!themeGridEl) return;
  themeGridEl.innerHTML = "";

  for (const theme of ARENA_THEMES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "themeCard";
    if (theme.id === selectedArenaThemeId) btn.classList.add("active");
    btn.title = `${theme.label}: ${theme.description}`;

    const thumb = document.createElement("div");
    thumb.className = "themeThumb";
    thumb.style.backgroundImage = `url("${makeThemePreviewDataUrl(theme)}")`;

    const meta = document.createElement("div");
    meta.className = "themeMeta";
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = theme.label;
    const desc = document.createElement("div");
    desc.className = "desc";
    desc.textContent = theme.description;
    meta.append(name, desc);
    btn.append(thumb, meta);

    btn.addEventListener("click", () => {
      selectedArenaThemeId = theme.id;
      applyArenaTheme(selectedArenaThemeId);
      renderThemeGrid();
      updateCustomizerSelectionText();
    });

    themeGridEl.appendChild(btn);
  }
}

function setCustomizerPresentation(active) {
  if (active) {
    if (kart.parent !== menuScene) menuScene.add(kart);
    kart.position.copy(CUSTOMIZER_MENU_POSITION);
    kart.rotation.set(0, CUSTOMIZER_MENU_YAW, 0);
  } else {
    if (kart.parent !== scene) scene.add(kart);
    kart.position.copy(playerRaceSpawnPosition);
    yaw = playerRaceSpawnYaw;
    kart.rotation.set(0, yaw, 0);
    applyKartToTrackSurface(kart, yaw);
  }
  steering.rotation.y = 0;

  customizerPlatform.visible = active;
  if (active) {
    customizerPlatform.position.set(0, CUSTOMIZER_LIFT_Y - CUSTOMIZER_PLATFORM_HEIGHT * 0.5, 0);
    customizerPlatform.rotation.y = 0;
  }

  for (const ai of aiRacers) {
    ai.group.visible = !active;
  }

  if (raceHudPanelEl) {
    raceHudPanelEl.style.display = active ? "none" : "";
  }
}

function applyPlayerKartCustomization() {
  redMat.color.setHex(playerKartCustomization.body);
  playerTrimMat.color.setHex(playerKartCustomization.trim);
  playerSeatMat.color.setHex(playerKartCustomization.seat);
  playerRimMat.color.setHex(playerKartCustomization.rims);

  // Slightly darken hub color so the rim still reads as a separate part.
  const hubColor = new THREE.Color(playerKartCustomization.rims).multiplyScalar(0.62);
  playerHubMat.color.copy(hubColor);

  refreshKartDecals(playerDecals, playerKartCustomization.body);
}

function renderCustomizerSections() {
  if (!customizeSectionsEl) return;
  customizeSectionsEl.innerHTML = "";

  for (const section of KART_CUSTOMIZER_SECTIONS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = section.label;
    btn.className = section.id === activeCustomizerSection ? "active" : "";
    btn.addEventListener("click", () => {
      activeCustomizerSection = section.id;
      renderCustomizerSections();
      renderCustomizerPalette();
      updateCustomizerSelectionText();
    });
    customizeSectionsEl.appendChild(btn);
  }
}

function renderCustomizerPalette() {
  if (!customizePaletteEl) return;
  customizePaletteEl.innerHTML = "";

  const section = KART_CUSTOMIZER_SECTIONS.find((s) => s.id === activeCustomizerSection);
  if (!section) return;

  const current = playerKartCustomization[section.id];
  for (const colorHex of section.colors) {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.style.background = hexLabel(colorHex);
    swatch.title = `${section.label}: ${hexLabel(colorHex)}`;
    if (current === colorHex) swatch.classList.add("active");
    swatch.addEventListener("click", () => {
      playerKartCustomization[section.id] = colorHex;
      applyPlayerKartCustomization();
      renderCustomizerPalette();
      updateCustomizerSelectionText();
    });
    customizePaletteEl.appendChild(swatch);
  }
}

function updateCustomizerSelectionText() {
  const section = KART_CUSTOMIZER_SECTIONS.find((s) => s.id === activeCustomizerSection);
  if (!section) return;
  if (customizeSelectionEl) {
    customizeSelectionEl.textContent =
      `${section.label}: ${hexLabel(playerKartCustomization[section.id])} • drag mouse to inspect`;
  }
  if (themeSelectionTextEl) {
    const theme = getArenaTheme(selectedArenaThemeId);
    themeSelectionTextEl.textContent = `Selected Theme: ${theme.label}`;
  }
}

function initKartCustomizer() {
  setCustomizerPresentation(true);
  applyArenaTheme(selectedArenaThemeId);
  applyPlayerKartCustomization();
  renderCustomizerSections();
  renderCustomizerPalette();
  setStartMenuStep("kart");

  if (nextToThemeBtn) {
    nextToThemeBtn.addEventListener("click", () => {
      beginRaceFromCustomizer();
    });
  }

  // Theme picker is temporarily disabled, keep the hidden controls inert.
  if (themePanelEl) themePanelEl.classList.add("hidden");
}

function beginRaceFromCustomizer() {
  if (!customizationActive) return;
  applyArenaTheme(selectedArenaThemeId);
  customizationActive = false;
  previewKartSpin = 0;
  setCustomizerPresentation(false);
  if (customizeOverlayEl) customizeOverlayEl.classList.add("hidden");
  resetRaceToStartState();
  startCountdown();
}

function startCountdown() {
  if (countdownStarted) return;
  clearCountdownInterval();
  raceStarted = false;
  setRacePaused(false);
  countdownStarted = true;
  let count = 3;
  countdownEl.textContent = count;
  countdownIntervalId = window.setInterval(() => {
    count--;
    if (count > 0) {
      countdownEl.textContent = count;
    } else if (count === 0) {
      countdownEl.textContent = "GO!";
    } else {
      countdownEl.textContent = "";
      raceStarted = true;
      clearCountdownInterval();
    }
  }, 1000);
}

initKartCustomizer();

// ==============================
// Input
// ==============================
const keys = { w: false, a: false, s: false, d: false };
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (customizationActive && k === "enter") {
    beginRaceFromCustomizer();
    return;
  }
  if (!customizationActive && k === "p") {
    toggleRacePaused();
    return;
  }
  if (!customizationActive && k === CAMERA_RESET_KEY) {
    // Recenter camera directly behind kart
    orbitYaw = yaw + Math.PI;
    manualYawOffset = 0;
    orbitPitch = 0.4;
    orbitDistance = 9.0;
    return;
  }
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

// Player spinout state
let playerSpinning = false;
let playerSpinVel = 0;            // radians/sec of spin
const SPIN_DECAY = 3.0;           // how fast spin slows (rad/s²)
const SPIN_RECOVER_THRESHOLD = 0.3; // stop spinning when |spinVel| drops below this

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

const BOOST_DURATION = 1.05;
const BOOST_MAX_MULT = 1.32;
const BOOST_ACCEL_BONUS = 14;
const BOOST_COAST_DRAG_MULT = 0.28;
const BOOST_PLAYER_MIN_SPEED_FACTOR = 0.78;
const BOOST_AI_MIN_SPEED_FACTOR = 0.86;

// ==============================
// Collision stability / gameplay polish
// ==============================
const COLLISION_BROADPHASE_RADIUS = 3.3;   // quick reject before SAT (roughly kart length+width)
const COLLISION_PAIR_COOLDOWN = 0.10;      // seconds; prevents repeated spin-trigger every frame
const MAX_SEPARATION_PUSH = 0.65;          // clamp positional correction per frame
const MIN_COLLISION_RETRIGGER_SPEED = 1.2;

// Pairwise cooldown maps
const playerAICollisionCooldown = new Map();   // key: ai index -> timer
const aiAICollisionCooldown = new Map();       // key: "i-j" -> timer

// AI post-spin recovery tuning
const AI_RECOVERY_DURATION = 0.9;
const AI_RECOVERY_SPEED_MULT = 0.78;
const AI_RECOVERY_LERP_MULT = 0.55;
const AI_RECOVERY_LOOKAHEAD_BONUS = 0.006;

// Camera polish
const CAMERA_RESET_KEY = "c";
const CAMERA_BOOST_FOV_BONUS = 4.5;       // degrees
const CAMERA_SPEED_FOV_BONUS = 2.5;       // degrees at high speed
const CAMERA_FOV_LERP_SPEED = 7.0;
const CAMERA_TARGET_LERP_SPEED = 8.0;

// Lap validation checkpoint (mid-track)
const CHECKPOINT_T = 0.56; // roughly opposite side of loop
const CHECKPOINT_WINDOW = 0.035;

// Camera smoothed target cache
const cameraTargetSmoothed = new THREE.Vector3();

// Lightweight feedback UI state
let boostFeedbackTimer = 0;
let spinFeedbackTimer = 0;
let personalBestFeedbackTimer = 0;
let personalBestFeedbackDuration = 2.1;

// Track progress checkpoint flags
let playerPassedCheckpoint = false;

let nearestIdx = START_IDX;
let playerBoostTimer = 0;
let playerBoostPadId = -1;

const speedEl = document.getElementById("speed");
const lapTimerEl = document.getElementById("lapTimer");
const bestLapEl = document.getElementById("bestLapTimer");
const leaderboardEl = document.getElementById("leaderboard");
const clock = new THREE.Clock();

let playerLap = 1;
let playerPrevProgress = START_T;
let playerLapElapsed = 0;
let bestLapTimeSec = Infinity;

function updatePauseUI() {
  if (pauseBannerEl) {
    pauseBannerEl.style.display = racePaused ? "block" : "none";
  }
  if (pauseRaceBtn) {
    pauseRaceBtn.textContent = racePaused ? "Resume" : "Pause";
  }
}

function clearCountdownInterval() {
  if (countdownIntervalId !== null) {
    clearInterval(countdownIntervalId);
    countdownIntervalId = null;
  }
}

function setRacePaused(paused) {
  racePaused = Boolean(paused) && raceStarted && !customizationActive;
  updatePauseUI();
}

function toggleRacePaused() {
  if (customizationActive || !raceStarted) return;
  setRacePaused(!racePaused);
}

function resetPlayerRaceState() {
  yaw = playerRaceSpawnYaw;
  kart.position.copy(playerRaceSpawnPosition);
  kart.rotation.set(0, yaw, 0);
  applyKartToTrackSurface(kart, yaw);

  speed = 0;
  steerInput = 0;
  playerBoostTimer = 0;
  playerBoostPadId = -1;
  playerSpinning = false;
  playerSpinVel = 0;
  nearestIdx = START_IDX;

  playerLap = 1;
  playerPrevProgress = START_T;
  playerLapElapsed = 0;
  playerPassedCheckpoint = false;

  steering.rotation.y = 0;
  for (const w of wheels) w.rotation.x = 0;

  cameraTargetSmoothed.set(0, 0, 0);
}

function resetAIRaceState() {
  const left = trackData.sampleLeft[START_IDX];

  for (const ai of aiRacers) {
    ai.group.position.copy(startLine.position);
    ai.group.position.addScaledVector(left, ai.startLaneOffset);
    ai.group.rotation.y = playerRaceSpawnYaw;
    applyKartToTrackSurface(ai.group, ai.group.rotation.y);
    ai.group.visible = true;

    ai.trackT = START_T;
    ai.nearestIdx = START_IDX;
    ai.currentSpeed = 0;
    ai.currentLateral = ai.startLaneOffset;
    ai.boostTimer = 0;
    ai.boostPadId = -1;
    ai.spinning = false;
    ai.spinVel = 0;
    ai.lap = 1;
    ai.prevProgress = START_T;
    ai.passedCheckpoint = false;
    ai.recoveryTimer = 0;
    ai.recoveryLateralBlendBoost = 0;

    for (const w of ai.wheels) w.rotation.x = 0;
  }
}

function resetRaceToStartState() {
  clearCountdownInterval();
  countdownStarted = false;
  raceStarted = false;
  setRacePaused(false);

  keys.w = keys.a = keys.s = keys.d = false;

  resetPlayerRaceState();
  resetAIRaceState();

  playerAICollisionCooldown.clear();
  aiAICollisionCooldown.clear();
  boostFeedbackTimer = 0;
  spinFeedbackTimer = 0;
  personalBestFeedbackTimer = 0;

  if (countdownEl) countdownEl.textContent = "";
  if (speedEl) speedEl.textContent = "0.0";
  if (lapTimerEl) lapTimerEl.textContent = "00:00.000";
  updateRaceHud(0);
}

function restartRace() {
  if (customizationActive) return;
  resetRaceToStartState();
  startCountdown();
}

if (pauseRaceBtn) {
  pauseRaceBtn.addEventListener("click", () => toggleRacePaused());
}
if (restartRaceBtn) {
  restartRaceBtn.addEventListener("click", () => restartRace());
}
updatePauseUI();

function formatTimeSec(seconds) {
  const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, "0");
  const totalSec = Math.floor(seconds);
  const mins = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const sec = (totalSec % 60).toString().padStart(2, "0");
  return `${mins}:${sec}.${ms}`;
}

function updateLapWrap(racer, progress, speedMag) {
  // Mark checkpoint when racer passes the mid-track checkpoint
  if (progressNear(progress, CHECKPOINT_T)) {
    racer.passedCheckpoint = true;
  }

  // Only count lap when crossing start line after checkpoint has been passed
  if (racer.prevProgress > 0.95 && progress < 0.05 && speedMag > 1 && racer.passedCheckpoint) {
    racer.lap += 1;
    racer.passedCheckpoint = false;
  }

  racer.prevProgress = progress;
}

function updateRaceHud(dt) {
  if (!lapTimerEl || !leaderboardEl) return;

  if (raceStarted && !racePaused) {
    playerLapElapsed += dt;
    const playerProgress = nearestIdx / trackData.segments;

    if (progressNear(playerProgress, CHECKPOINT_T)) {
      playerPassedCheckpoint = true;
    }

    if (playerPrevProgress > 0.95 && playerProgress < 0.05 && Math.abs(speed) > 1 && playerPassedCheckpoint) {
      const completedLapTime = playerLapElapsed;
      if (completedLapTime > 0 && completedLapTime < bestLapTimeSec) {
        bestLapTimeSec = completedLapTime;
        showPersonalBestFeedback(completedLapTime);
      }
      playerLap += 1;
      playerLapElapsed = 0;
      playerPassedCheckpoint = false;
    }

    playerPrevProgress = playerProgress;

    for (const ai of aiRacers) {
      const aiProgress = ai.trackT;
      updateLapWrap(ai, aiProgress, ai.currentSpeed);
    }
  }

  const playerProgress = nearestIdx / trackData.segments;
  playerPrevProgress = playerProgress;

  lapTimerEl.textContent = formatTimeSec(playerLapElapsed);
  if (bestLapEl) {
    bestLapEl.textContent = Number.isFinite(bestLapTimeSec) ? formatTimeSec(bestLapTimeSec) : "--:--.---";
  }

  const entries = [
    {
      color: "Red",
      lap: playerLap,
      progress: playerProgress,
      metric: (playerLap - 1) + playerProgress,
    },
    ...aiRacers.map((ai) => ({
      color: ai.colorLabel,
      lap: ai.lap,
      progress: ai.trackT,
      metric: (ai.lap - 1) + ai.trackT,
    })),
  ];

  entries.sort((a, b) => b.metric - a.metric);
  leaderboardEl.innerHTML = `<div style="margin-bottom:4px;"><b>Leaderboard</b></div>` +
    entries
      .map((entry, idx) => `<div class="row"><span>${idx + 1}. ${entry.color}</span><span>L${entry.lap}</span></div>`)
      .join("");
}

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
  applyKartToTrackSurface(kart, yaw);
}

// Kart-to-kart collision  
const KART_HALF_W = 1.05;
const KART_HALF_L = 1.6;

function getOBBCorners(pos, yawAngle, hw, hl) {
  const cosA = Math.cos(yawAngle);
  const sinA = Math.sin(yawAngle);
  // local axes in world XZ
  const fx = sinA, fz = cosA;   // forward (local +Z)
  const lx = -fz,  lz = fx;    // left    (local +X flipped to left)
  return [
    { x: pos.x + lx * hw + fx * hl, z: pos.z + lz * hw + fz * hl },
    { x: pos.x - lx * hw + fx * hl, z: pos.z - lz * hw + fz * hl },
    { x: pos.x - lx * hw - fx * hl, z: pos.z - lz * hw - fz * hl },
    { x: pos.x + lx * hw - fx * hl, z: pos.z + lz * hw - fz * hl },
  ];
}

function projectCorners(corners, ax, az) {
  let min = Infinity, max = -Infinity;
  for (const c of corners) {
    const d = c.x * ax + c.z * az;
    if (d < min) min = d;
    if (d > max) max = d;
  }
  return { min, max };
}

function obbOverlap(cornersA, cornersB) {
  // 4 potential separating axes: 2 edge normals from each box
  const axes = [];
  for (const corners of [cornersA, cornersB]) {
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      const ex = corners[j].x - corners[i].x;
      const ez = corners[j].z - corners[i].z;
      const len = Math.sqrt(ex * ex + ez * ez) || 1;
      axes.push({ x: -ez / len, z: ex / len }); // perpendicular
    }
  }

  let minOverlap = Infinity;
  let minAxis = null;

  for (const a of axes) {
    const pA = projectCorners(cornersA, a.x, a.z);
    const pB = projectCorners(cornersB, a.x, a.z);
    const overlap = Math.min(pA.max - pB.min, pB.max - pA.min);
    if (overlap <= 0) return null; // separated
    if (overlap < minOverlap) {
      minOverlap = overlap;
      minAxis = a;
    }
  }

  // Make sure the push direction points from B toward A
  const cx = cornersA.reduce((s, c) => s + c.x, 0) / 4;
  const cz = cornersA.reduce((s, c) => s + c.z, 0) / 4;
  const bx = cornersB.reduce((s, c) => s + c.x, 0) / 4;
  const bz = cornersB.reduce((s, c) => s + c.z, 0) / 4;
  const dot = (cx - bx) * minAxis.x + (cz - bz) * minAxis.z;
  if (dot < 0) { minAxis.x = -minAxis.x; minAxis.z = -minAxis.z; }

  return { overlap: minOverlap, nx: minAxis.x, nz: minAxis.z };
}

function randomSign() {
  if (Math.random() > 0.5) {
    return 1;
  }
  return -1;
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function pairKey(i, j) {
  return i < j ? `${i}-${j}` : `${j}-${i}`;
}

function updateCooldownMap(map, dt) {
  for (const [k, t] of map.entries()) {
    const next = t - dt;
    if (next <= 0) map.delete(k);
    else map.set(k, next);
  }
}

function getXZDistanceSq(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz;
}

function broadPhaseKartHit(posA, posB, radius = COLLISION_BROADPHASE_RADIUS) {
  return getXZDistanceSq(posA, posB) <= radius * radius;
}

function clampSeparationPush(overlap) {
  return Math.min(overlap, MAX_SEPARATION_PUSH);
}

function progressWrapDelta(prev, curr) {
  let d = curr - prev;
  if (d > 0.5) d -= 1;
  if (d < -0.5) d += 1;
  return d;
}

function progressNear(p, target, window = CHECKPOINT_WINDOW) {
  const d = Math.abs(progressWrapDelta(target, p));
  return d <= window;
}

function ensureFeedbackElements() {
  let boostEl = document.getElementById("boostFeedback");
  let spinEl = document.getElementById("spinFeedback");
  let personalBestEl = document.getElementById("personalBestFeedback");

  if (!boostEl) {
    boostEl = document.createElement("div");
    boostEl.id = "boostFeedback";
    boostEl.textContent = "BOOST!";
    boostEl.style.position = "fixed";
    boostEl.style.left = "50%";
    boostEl.style.bottom = "90px";
    boostEl.style.transform = "translateX(-50%)";
    boostEl.style.padding = "8px 14px";
    boostEl.style.borderRadius = "10px";
    boostEl.style.fontWeight = "700";
    boostEl.style.letterSpacing = "0.08em";
    boostEl.style.background = "rgba(20,40,70,0.65)";
    boostEl.style.color = "#aef4ff";
    boostEl.style.border = "1px solid rgba(150,240,255,0.35)";
    boostEl.style.display = "none";
    boostEl.style.pointerEvents = "none";
    boostEl.style.zIndex = "9999";
    document.body.appendChild(boostEl);
  }

  if (!spinEl) {
    spinEl = document.createElement("div");
    spinEl.id = "spinFeedback";
    spinEl.textContent = "SPINOUT!";
    spinEl.style.position = "fixed";
    spinEl.style.left = "50%";
    spinEl.style.top = "72px";
    spinEl.style.transform = "translateX(-50%)";
    spinEl.style.padding = "8px 14px";
    spinEl.style.borderRadius = "10px";
    spinEl.style.fontWeight = "700";
    spinEl.style.letterSpacing = "0.08em";
    spinEl.style.background = "rgba(70,20,20,0.65)";
    spinEl.style.color = "#ffd3d3";
    spinEl.style.border = "1px solid rgba(255,180,180,0.35)";
    spinEl.style.display = "none";
    spinEl.style.pointerEvents = "none";
    spinEl.style.zIndex = "9999";
    document.body.appendChild(spinEl);
  }

  if (!personalBestEl) {
    personalBestEl = document.createElement("div");
    personalBestEl.id = "personalBestFeedback";
    personalBestEl.textContent = "NEW PERSONAL BEST!";
    personalBestEl.style.position = "fixed";
    personalBestEl.style.left = "50%";
    personalBestEl.style.top = "68px";
    personalBestEl.style.transform = "translateX(-50%)";
    personalBestEl.style.padding = "10px 16px";
    personalBestEl.style.borderRadius = "12px";
    personalBestEl.style.fontWeight = "800";
    personalBestEl.style.letterSpacing = "0.05em";
    personalBestEl.style.background = "linear-gradient(135deg, rgba(115,255,190,0.92), rgba(84,178,255,0.9))";
    personalBestEl.style.color = "#0a2136";
    personalBestEl.style.border = "1px solid rgba(228,255,247,0.9)";
    personalBestEl.style.boxShadow = "0 10px 26px rgba(32,133,189,0.35)";
    personalBestEl.style.display = "none";
    personalBestEl.style.pointerEvents = "none";
    personalBestEl.style.whiteSpace = "nowrap";
    personalBestEl.style.textTransform = "uppercase";
    personalBestEl.style.zIndex = "9999";
    document.body.appendChild(personalBestEl);
  }

  return { boostEl, spinEl, personalBestEl };
}

function showBoostFeedback(duration = 0.35) {
  boostFeedbackTimer = Math.max(boostFeedbackTimer, duration);
}

function showSpinFeedback(duration = 0.55) {
  spinFeedbackTimer = Math.max(spinFeedbackTimer, duration);
}

function showPersonalBestFeedback(lapTimeSec, duration = 2.1) {
  const { personalBestEl } = ensureFeedbackElements();
  personalBestEl.textContent = `NEW PERSONAL BEST! ${formatTimeSec(lapTimeSec)}`;
  personalBestFeedbackDuration = duration;
  personalBestFeedbackTimer = Math.max(personalBestFeedbackTimer, duration);
}

function updateFeedbackUI(dt) {
  const { boostEl, spinEl, personalBestEl } = ensureFeedbackElements();

  boostFeedbackTimer = Math.max(0, boostFeedbackTimer - dt);
  spinFeedbackTimer = Math.max(0, spinFeedbackTimer - dt);
  personalBestFeedbackTimer = Math.max(0, personalBestFeedbackTimer - dt);

  boostEl.style.display = boostFeedbackTimer > 0 ? "block" : "none";
  spinEl.style.display = spinFeedbackTimer > 0 ? "block" : "none";
  personalBestEl.style.display = personalBestFeedbackTimer > 0 ? "block" : "none";

  if (boostFeedbackTimer > 0) {
    const a = clamp01(boostFeedbackTimer / 0.35);
    boostEl.style.opacity = String(Math.max(0.35, a));
    boostEl.style.transform = `translateX(-50%) scale(${1 + (1 - a) * 0.08})`;
  } else {
    boostEl.style.opacity = "1";
    boostEl.style.transform = "translateX(-50%)";
  }

  if (spinFeedbackTimer > 0) {
    const a = clamp01(spinFeedbackTimer / 0.55);
    spinEl.style.opacity = String(Math.max(0.35, a));
    spinEl.style.transform = `translateX(-50%) scale(${1 + (1 - a) * 0.06})`;
  } else {
    spinEl.style.opacity = "1";
    spinEl.style.transform = "translateX(-50%)";
  }

  if (personalBestFeedbackTimer > 0) {
    const duration = Math.max(0.001, personalBestFeedbackDuration);
    const t = clamp01(1 - (personalBestFeedbackTimer / duration));
    const intro = clamp01(t / 0.18);
    const outro = clamp01((t - 0.72) / 0.28);
    const opacity = clamp01(intro * (1 - outro * 0.92));
    const scale = 0.9 + intro * 0.14 - outro * 0.1;
    const y = (1 - intro) * 14 - outro * 20;

    personalBestEl.style.opacity = String(Math.max(0.01, opacity));
    personalBestEl.style.transform = `translate(-50%, ${y.toFixed(2)}px) scale(${scale.toFixed(3)})`;
  } else {
    personalBestEl.style.opacity = "1";
    personalBestEl.style.transform = "translateX(-50%)";
  }
}

function resolveKartCollision(dt) {
  // Update pairwise cooldown timers first
  updateCooldownMap(playerAICollisionCooldown, dt);
  updateCooldownMap(aiAICollisionCooldown, dt);

  // Player vs every AI kart
  for (let aiIndex = 0; aiIndex < aiRacers.length; aiIndex++) {
    const ai = aiRacers[aiIndex];

    // Broad-phase quick reject
    if (!broadPhaseKartHit(kart.position, ai.group.position)) continue;

    const pairCd = playerAICollisionCooldown.get(aiIndex) ?? 0;
    const cornersP = getOBBCorners(kart.position, yaw, KART_HALF_W, KART_HALF_L);
    const cornersAI = getOBBCorners(ai.group.position, ai.group.rotation.y, KART_HALF_W, KART_HALF_L);
    const result = obbOverlap(cornersP, cornersAI);
    if (!result) continue;

    const { nx, nz } = result;
    const overlap = clampSeparationPush(result.overlap);

    const preCollisionPlayerSpeed = speed;
    const playerForward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const aiForward = new THREE.Vector3(Math.sin(ai.group.rotation.y), 0, Math.cos(ai.group.rotation.y));

    const pVelX = playerForward.x * speed;
    const pVelZ = playerForward.z * speed;
    const aiVelX = aiForward.x * ai.currentSpeed;
    const aiVelZ = aiForward.z * ai.currentSpeed;
    const impactSpeed = Math.abs(speed) + ai.currentSpeed;

    // nx/nz points from AI -> player. Positive "playerIntoAI" means the player is driving into the AI.
    const playerIntoAI = Math.max(0, -(pVelX * nx + pVelZ * nz));
    const aiIntoPlayer = Math.max(0, aiVelX * nx + aiVelZ * nz);
    const playerInitiative = THREE.MathUtils.clamp(
      (playerIntoAI + 0.15 * Math.abs(speed)) / Math.max(0.001, playerIntoAI + aiIntoPlayer + 0.15 * impactSpeed),
      0,
      1
    );

    const headingDot = THREE.MathUtils.clamp(playerForward.dot(aiForward), -1, 1);
    const headingOpposition = (1 - headingDot) * 0.5; // 0 = same direction, 1 = head-on
    const sideImpact = THREE.MathUtils.clamp(1 - Math.abs(playerForward.x * nx + playerForward.z * nz), 0, 1);
    const torqueSign = Math.sign(playerForward.x * nz - playerForward.z * nx) || randomSign();
    const impactScale = THREE.MathUtils.clamp(impactSpeed / 18, 0, 1);

    // Bias separation so the struck AI gets displaced more than the player.
    const playerPushShare = THREE.MathUtils.clamp(0.38 - 0.22 * playerInitiative, 0.12, 0.4);
    const aiPushShare = 1 - playerPushShare;

    kart.position.x += nx * overlap * playerPushShare;
    kart.position.z += nz * overlap * playerPushShare;
    ai.group.position.x -= nx * overlap * aiPushShare;
    ai.group.position.z -= nz * overlap * aiPushShare;

    // A small forward shove helps "ramming" feel directional.
    const ramShove = Math.min(0.28, playerIntoAI * 0.018);
    if (ramShove > 0) {
      ai.group.position.addScaledVector(playerForward, ramShove);
    }

    // Small forward carry-through helps prevent the player from "sticking" on initiated hits.
    const playerCarryNudge = Math.min(0.12, playerIntoAI * 0.007);
    if (playerCarryNudge > 0 && preCollisionPlayerSpeed > 0) {
      kart.position.addScaledVector(playerForward, playerCarryNudge);
    }

    // Directional yaw disturbance
    const aiYawKick =
      torqueSign *
      (0.06 + 0.22 * sideImpact + 0.08 * headingOpposition) *
      (0.55 + 0.85 * impactScale) *
      (0.6 + 0.9 * playerInitiative);
    ai.group.rotation.y += aiYawKick;

    const playerYawKick = -torqueSign * Math.abs(aiYawKick) * (0.12 + 0.14 * (1 - playerInitiative));
    yaw += playerYawKick;
    kart.rotation.y = yaw;

    // Speed retention
    const playerRetain = THREE.MathUtils.clamp(
      0.93 - 0.12 * impactScale - 0.18 * (1 - playerInitiative) - 0.05 * headingOpposition,
      0.58,
      0.96
    );
    const aiRetain = THREE.MathUtils.clamp(
      0.42 - 0.14 * impactScale - 0.16 * playerInitiative - 0.06 * sideImpact,
      0.12,
      0.55
    );
    speed *= playerRetain;
    ai.currentSpeed *= aiRetain;

    // Preserve some player carry when player initiated contact
    if (preCollisionPlayerSpeed > 0 && playerInitiative > 0.55 && !playerSpinning) {
      const carryFloorFactor = THREE.MathUtils.clamp(
        0.42 + 0.22 * playerInitiative - 0.16 * headingOpposition - 0.14 * sideImpact,
        0.22,
        0.72
      );
      const carryFloorSpeed = preCollisionPlayerSpeed * carryFloorFactor;
      speed = Math.max(speed, carryFloorSpeed);
    }

    // Apply spin triggers with cooldown to prevent repeated frame-by-frame retrigger
    const canRetrigger = pairCd <= 0 && impactSpeed > MIN_COLLISION_RETRIGGER_SPEED;

    if (canRetrigger) {
      const aiSpinThreshold = 4.8 - 1.7 * playerInitiative - 0.9 * sideImpact;
      if (impactSpeed > aiSpinThreshold && !ai.spinning) {
        ai.spinning = true;
        ai.spinVel =
          torqueSign *
          (2.4 + impactSpeed * (0.12 + 0.08 * sideImpact)) *
          (0.9 + 0.7 * playerInitiative);
      }

      const playerSpinThreshold = 8.8 + 1.8 * playerInitiative - 1.1 * headingOpposition - 0.7 * sideImpact;
      const severeForPlayer = headingOpposition > 0.55 || sideImpact > 0.72;
      if (impactSpeed > playerSpinThreshold && severeForPlayer && !playerSpinning) {
        playerSpinning = true;
        playerSpinVel =
          -torqueSign *
          (1.4 + impactSpeed * 0.075) *
          (0.45 + 0.45 * (1 - playerInitiative));
        showSpinFeedback();
      }

      playerAICollisionCooldown.set(aiIndex, COLLISION_PAIR_COOLDOWN);
    }
  }

  // AI vs AI kart collision
  for (let i = 0; i < aiRacers.length; i++) {
    for (let j = i + 1; j < aiRacers.length; j++) {
      const a = aiRacers[i];
      const b = aiRacers[j];

      // Broad-phase quick reject
      if (!broadPhaseKartHit(a.group.position, b.group.position)) continue;

      const key = pairKey(i, j);
      const pairCd = aiAICollisionCooldown.get(key) ?? 0;

      const cA = getOBBCorners(a.group.position, a.group.rotation.y, KART_HALF_W, KART_HALF_L);
      const cB = getOBBCorners(b.group.position, b.group.rotation.y, KART_HALF_W, KART_HALF_L);
      const res = obbOverlap(cA, cB);
      if (!res) continue;

      const overlap = clampSeparationPush(res.overlap);

      a.group.position.x += res.nx * overlap * 0.5;
      a.group.position.z += res.nz * overlap * 0.5;
      b.group.position.x -= res.nx * overlap * 0.5;
      b.group.position.z -= res.nz * overlap * 0.5;

      // If on cooldown, only do mild separation (stability) but skip harsh re-trigger effects
      if (pairCd > 0) continue;

      const impactSpeed = a.currentSpeed + b.currentSpeed;
      if (impactSpeed > 4) {
        if (!a.spinning) {
          a.spinning = true;
          a.spinVel = randomSign() * (3 + impactSpeed * 0.15);
        }
        if (!b.spinning) {
          b.spinning = true;
          b.spinVel = randomSign() * (3 + impactSpeed * 0.15);
        }
      }
      a.currentSpeed *= 0.3;
      b.currentSpeed *= 0.3;

      aiAICollisionCooldown.set(key, COLLISION_PAIR_COOLDOWN);
    }
  }

  // Ensure all karts stay snapped to ramp height after collision pushes.
  applyKartToTrackSurface(kart, yaw);
  for (const ai of aiRacers) {
    applyKartToTrackSurface(ai.group, ai.group.rotation.y);
  }
}

function updatePhysics(dt) {
  if (playerBoostTimer > 0) {
    playerBoostTimer = Math.max(0, playerBoostTimer - dt);
  }
  const playerBoosted = playerBoostTimer > 0;

  //Handle spinout
  if (playerSpinning) {
    showSpinFeedback(0.15);

    // Decelerate
    speed *= Math.max(0, 1 - 4 * dt);

    // Apply spin
    yaw += playerSpinVel * dt;
    kart.rotation.y = yaw;

    // Decay spin velocity
    const spinSign = Math.sign(playerSpinVel);
    playerSpinVel -= spinSign * SPIN_DECAY * dt;
    if (Math.abs(playerSpinVel) < SPIN_RECOVER_THRESHOLD) {
      playerSpinning = false;
      playerSpinVel = 0;
      speed = 0;
    }

    // Still spin wheels
    const wheelSpin = speed * dt * 1.5;
    for (const w of wheels) w.rotation.x += wheelSpin;

    resolveTrackCollision();
    resolveKartCollision(dt);
    checkPlayerBoostPads();
    if (speedEl) speedEl.textContent = speed.toFixed(1);
    return;
  }

  let throttle = 0;
  if (keys.w) {
    throttle = 1;
  }

  let brake = 0;
  if (keys.s) {
    brake = 1;
  }

  // A = left (+), D = right (-)
  let steerTarget = 0;
  if (keys.a) {
    steerTarget += 1;
  }
  if (keys.d) {
    steerTarget -= 1;
  }

  // corresponding steering
  const steerDelta = steerTarget - steerInput;
  const maxStep = STEER_RATE * dt;
  steerInput += Math.max(-maxStep, Math.min(maxStep, steerDelta));
  steerInput = Math.max(-1, Math.min(1, steerInput));

  // Speed
  if (throttle) speed += (ACCEL + (playerBoosted ? BOOST_ACCEL_BONUS : 0)) * dt;
  if (brake) speed -= BRAKE * dt;

  if (!throttle && !brake) {
    const sign = Math.sign(speed);
    const mag = Math.abs(speed);
    const dragNow = playerBoosted && speed > 0 ? DRAG * BOOST_COAST_DRAG_MULT : DRAG;
    speed = sign * Math.max(0, mag - dragNow * dt);
  }

  const playerMaxForwardSpeed = MAX_SPEED * (playerBoosted ? BOOST_MAX_MULT : 1);
  speed = Math.max(-MAX_SPEED * 0.35, Math.min(playerMaxForwardSpeed, speed));

  // Turning
  const steer = steerInput * MAX_STEER;
  const speedFactor = Math.min(1, Math.abs(speed) / MAX_SPEED);
  let travelDirection = -1;
  if (speed >= 0) {
    travelDirection = 1;
  }
  const yawRate = TURN_GAIN * steer * speedFactor * travelDirection;
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
  checkPlayerBoostPads();

  if (speedEl) speedEl.textContent = speed.toFixed(1);
}

function updateCustomizationPreview(dt) {
  previewKartSpin += dt * 0.95;
  kart.position.copy(CUSTOMIZER_MENU_POSITION);
  kart.rotation.set(0, CUSTOMIZER_MENU_YAW + previewKartSpin, 0);
  customizerPlatform.position.set(0, CUSTOMIZER_LIFT_Y - CUSTOMIZER_PLATFORM_HEIGHT * 0.5, 0);
  customizerPlatform.rotation.y += dt * 0.6;

  const wheelSpin = dt * 1.6;
  for (const w of wheels) w.rotation.x += wheelSpin;

  if (!isDragging) {
    manualYawOffset *= Math.max(0, 1 - 2.4 * dt);
  }

  const target = new THREE.Vector3().copy(kart.position);
  target.y += 0.95;

  const previewPitch = Math.max(0.22, Math.min(1.05, orbitPitch));
  const previewRadius = Math.max(6.5, Math.min(14, orbitDistance));
  const camYaw = CUSTOMIZER_MENU_YAW + Math.PI * 0.62 + manualYawOffset;
  const x = previewRadius * Math.cos(previewPitch) * Math.sin(camYaw);
  const y = previewRadius * Math.sin(previewPitch);
  const z = previewRadius * Math.cos(previewPitch) * Math.cos(camYaw);

  camera.position.set(target.x + x, target.y + y + 0.5, target.z + z);
  camera.lookAt(target.x, target.y + 0.15, target.z);

  camera.fov += (60 - camera.fov) * Math.min(1, CAMERA_FOV_LERP_SPEED * dt);
  camera.updateProjectionMatrix();
}

function updateCamera(dt) {
  // Desired yaw is directly behind the kart (+PI from kart heading)
  const desiredYaw = yaw + Math.PI;

  // Smoothly decay the manual drag offset back to zero
  if (!isDragging) {
    manualYawOffset *= Math.max(0, 1 - CAM_FOLLOW_SPEED * dt);
  }

  // Lerp orbitYaw toward desiredYaw
  let diff = desiredYaw - orbitYaw;
  // Normalise to (-PI, PI]
  diff = ((diff + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  orbitYaw += diff * Math.min(1, CAM_FOLLOW_SPEED * dt);

  const finalYaw = orbitYaw + manualYawOffset;

  // Smoothed camera target for nicer motion
  const rawTarget = new THREE.Vector3().copy(kart.position);
  rawTarget.y += 1.25;

  if (!cameraTargetSmoothed.lengthSq()) {
    cameraTargetSmoothed.copy(rawTarget);
  } else {
    const a = Math.min(1, CAMERA_TARGET_LERP_SPEED * dt);
    cameraTargetSmoothed.lerp(rawTarget, a);
  }

  const x = orbitDistance * Math.cos(orbitPitch) * Math.sin(finalYaw);
  const y = orbitDistance * Math.sin(orbitPitch);
  const z = orbitDistance * Math.cos(orbitPitch) * Math.cos(finalYaw);

  camera.position.set(cameraTargetSmoothed.x + x, cameraTargetSmoothed.y + y, cameraTargetSmoothed.z + z);
  camera.lookAt(cameraTargetSmoothed);

  // Dynamic FOV: slight zoom-out at high speed / boost
  const speedFrac = clamp01(Math.abs(speed) / MAX_SPEED);
  const boostFrac = playerBoostTimer > 0 ? 1 : 0;
  const targetFov = 60 + speedFrac * CAMERA_SPEED_FOV_BONUS + boostFrac * CAMERA_BOOST_FOV_BONUS;
  camera.fov += (targetFov - camera.fov) * Math.min(1, CAMERA_FOV_LERP_SPEED * dt);
  camera.updateProjectionMatrix();
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(0.033, clock.getDelta());

  if (customizationActive) {
    updateCustomizationPreview(dt);
  } else if (raceStarted && !racePaused) {
    updateAllAI(dt);
    updatePhysics(dt);
    updateCamera(dt);
  } else {
    updateCamera(dt);
  }
  updateRaceHud(dt);
  updateFeedbackUI(dt);

  // Keep shadow light centred on the kart so the tight frustum always covers it
  if (!customizationActive) {
    dir.position.set(kart.position.x + 30, 40, kart.position.z + 20);
    dir.target.position.copy(kart.position);
    dir.target.updateMatrixWorld();
  }

  renderer.render(customizationActive ? menuScene : scene, camera);
}
ensureFeedbackElements();
animate();

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
