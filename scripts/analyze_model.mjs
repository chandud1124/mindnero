#!/usr/bin/env node
/**
 * analyze_model.mjs — Analyze the Sketchfab basemesh to determine body landmarks
 * in both raw model space and after auto-fit + rotation transform.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gltfPath = path.resolve(__dirname, '..', 'client', 'public', 'handsome_male_basemesh', 'scene.gltf');
const binPath  = path.resolve(__dirname, '..', 'client', 'public', 'handsome_male_basemesh', 'scene.bin');

const gltf = JSON.parse(fs.readFileSync(gltfPath, 'utf8'));
const bin  = fs.readFileSync(binPath);

/* ── Extract all position vertices ── */
const posAccessorIndices = [0, 3, 6]; // POSITION accessors from the GLTF
const allVerts = [];

for (const accIdx of posAccessorIndices) {
  const acc = gltf.accessors[accIdx];
  const bv  = gltf.bufferViews[acc.bufferView];
  const baseOff = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  const stride  = bv.byteStride || 12;

  for (let i = 0; i < acc.count; i++) {
    const off = baseOff + i * stride;
    const x = bin.readFloatLE(off);
    const y = bin.readFloatLE(off + 4);
    const z = bin.readFloatLE(off + 8);
    allVerts.push([x, y, z]);
  }
}

console.log(`Total vertices: ${allVerts.length.toLocaleString()}`);

/* ── Raw bounding box ── */
let rMinX = Infinity, rMinY = Infinity, rMinZ = Infinity;
let rMaxX = -Infinity, rMaxY = -Infinity, rMaxZ = -Infinity;
for (const [x, y, z] of allVerts) {
  if (x < rMinX) rMinX = x; if (x > rMaxX) rMaxX = x;
  if (y < rMinY) rMinY = y; if (y > rMaxY) rMaxY = y;
  if (z < rMinZ) rMinZ = z; if (z > rMaxZ) rMaxZ = z;
}
console.log(`\n═══ Raw Model Space ═══`);
console.log(`  X range: [${rMinX.toFixed(4)}, ${rMaxX.toFixed(4)}]  width: ${(rMaxX-rMinX).toFixed(4)}`);
console.log(`  Y range: [${rMinY.toFixed(4)}, ${rMaxY.toFixed(4)}]  height: ${(rMaxY-rMinY).toFixed(4)}`);
console.log(`  Z range: [${rMinZ.toFixed(4)}, ${rMaxZ.toFixed(4)}]  depth: ${(rMaxZ-rMinZ).toFixed(4)}`);

/* ── Auto-fit transform (matching Brain3D.jsx logic) ── */
const cx = (rMinX + rMaxX) / 2;
const cy = (rMinY + rMaxY) / 2;
const cz = (rMinZ + rMaxZ) / 2;
const rawH = rMaxY - rMinY;
const TARGET_H = 2.66;
const FEET_Y = -0.98;
const s = TARGET_H / rawH;
const footWorldY = (rMinY - cy) * s;
const yOff = FEET_Y - footWorldY;

console.log(`\n═══ Auto-Fit Parameters ═══`);
console.log(`  Center: (${cx.toFixed(4)}, ${cy.toFixed(4)}, ${cz.toFixed(4)})`);
console.log(`  Scale factor: ${s.toFixed(4)}`);
console.log(`  Y offset: ${yOff.toFixed(4)}`);

/* ── Transform functions ── */
// Without rotation (what the mesh data maps to before the group rotation)
const toScene = (rx, ry, rz) => [
  -(rx - cx) * s,             // negated by rotation [0, PI, 0]
  (ry - cy) * s + yOff,
  -(rz - cz) * s,             // negated by rotation [0, PI, 0]
];

console.log(`\n═══ Scene Space (after auto-fit + rotation [0,PI,0]) ═══`);
const [sMinX, sMinY, sMinZ] = toScene(rMaxX, rMinY, rMaxZ); // X/Z inverted due to rotation
const [sMaxX, sMaxY, sMaxZ] = toScene(rMinX, rMaxY, rMinZ);
console.log(`  X range: [${Math.min(sMinX,sMaxX).toFixed(4)}, ${Math.max(sMinX,sMaxX).toFixed(4)}]`);
console.log(`  Y range: [${sMinY.toFixed(4)}, ${sMaxY.toFixed(4)}]`);
console.log(`  Z range: [${Math.min(sMinZ,sMaxZ).toFixed(4)}, ${Math.max(sMinZ,sMaxZ).toFixed(4)}]`);

/* ── Analyze head region (top 13% of height) — determine face direction ── */
const headThreshY = rMaxY - rawH * 0.13; // top 13%
const headVerts = allVerts.filter(v => v[1] > headThreshY);
let headZSum = 0, headZCount = 0;
let headZMin = Infinity, headZMax = -Infinity;
for (const [x, y, z] of headVerts) {
  headZSum += z; headZCount++;
  if (z < headZMin) headZMin = z;
  if (z > headZMax) headZMax = z;
}
const headZAvg = headZSum / headZCount;

console.log(`\n═══ Head Region Analysis (top 13%, raw Y > ${headThreshY.toFixed(3)}) ═══`);
console.log(`  Vertices: ${headVerts.length}`);
console.log(`  Z range: [${headZMin.toFixed(4)}, ${headZMax.toFixed(4)}]`);
console.log(`  Z avg:   ${headZAvg.toFixed(4)}`);
console.log(`  Face direction: ${headZAvg > 0 ? '+Z (need 180° Y rot)' : '-Z (model already faces camera at +Z after 180° rot)'}`);

/* ── Determine face vs back of head more precisely ── */
const topHeadThresh = rMaxY - rawH * 0.05; // top 5% = top of cranium
const faceThreshY = rMaxY - rawH * 0.10;   // 5-10% from top = face area
const faceVerts = allVerts.filter(v => v[1] > faceThreshY && v[1] < topHeadThresh);
let faceZAvg = 0;
for (const [x, y, z] of faceVerts) faceZAvg += z;
faceZAvg /= faceVerts.length || 1;

// Nose = the vertex with the most extreme Z in the face region
let noseVert = null, noseZ = -Infinity;
for (const v of faceVerts) {
  if (v[2] > noseZ) { noseZ = v[2]; noseVert = v; }
}
let backHeadVert = null, backZ = Infinity;
for (const v of faceVerts) {
  if (v[2] < backZ) { backZ = v[2]; backHeadVert = v; }
}

console.log(`\n═══ Face Direction Detection ═══`);
console.log(`  Nose candidate (max Z in face area): raw (${noseVert?.map(v=>v.toFixed(4)).join(', ')})`);
console.log(`  Back head (min Z in face area):      raw (${backHeadVert?.map(v=>v.toFixed(4)).join(', ')})`);
if (noseVert) {
  const noseScene = toScene(...noseVert);
  console.log(`  Nose in scene space: (${noseScene.map(v=>v.toFixed(4)).join(', ')})`);
}

/* ── Analyze arm/hand positions ── */
// Find extreme X vertices (hands in A-pose)
const rightHandRaw = allVerts.reduce((best, v) => v[0] > best[0] ? v : best, allVerts[0]);
const leftHandRaw  = allVerts.reduce((best, v) => v[0] < best[0] ? v : best, allVerts[0]);

console.log(`\n═══ Hand Positions ═══`);
console.log(`  Max +X vertex (one hand) raw: (${rightHandRaw.map(v=>v.toFixed(4)).join(', ')})`);
console.log(`  Max -X vertex (other hand) raw: (${leftHandRaw.map(v=>v.toFixed(4)).join(', ')})`);
const rhScene = toScene(...rightHandRaw);
const lhScene = toScene(...leftHandRaw);
console.log(`  Max +X in scene (becomes -X after rot): (${rhScene.map(v=>v.toFixed(4)).join(', ')})`);
console.log(`  Max -X in scene (becomes +X after rot): (${lhScene.map(v=>v.toFixed(4)).join(', ')})`);

// Find hand region more precisely — verts at extreme X within ±0.05 of max
const handRThresh = rMaxX - 0.05;
const handLThresh = rMinX + 0.05;
const handRVerts = allVerts.filter(v => v[0] > handRThresh);
const handLVerts = allVerts.filter(v => v[0] < handLThresh);
let hrY = 0, hlY = 0;
for (const v of handRVerts) hrY += v[1];
for (const v of handLVerts) hlY += v[1];
hrY /= handRVerts.length || 1;
hlY /= handLVerts.length || 1;

console.log(`  Right-hand cluster avg Y (raw): ${hrY.toFixed(4)} (${handRVerts.length} verts)`);
console.log(`  Left-hand cluster avg Y (raw): ${hlY.toFixed(4)} (${handLVerts.length} verts)`);

/* ── Analyze body Y slices — find shoulder, hip, knee ── */
const sliceWidth = 0.02;
function analyzeSlice(yCenter) {
  const verts = allVerts.filter(v => Math.abs(v[1] - yCenter) < sliceWidth);
  if (verts.length === 0) return null;
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const [x, _, z] of verts) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }
  return { count: verts.length, minX, maxX, minZ, maxZ, width: maxX - minX, depth: maxZ - minZ };
}

console.log(`\n═══ Body Cross-Sections (raw Y → scene Y) ═══`);
const yLevels = [
  { raw: 0.90, label: 'Forehead' },
  { raw: 0.82, label: 'Eye level' },
  { raw: 0.78, label: 'Ear level' },
  { raw: 0.72, label: 'Mouth' },
  { raw: 0.66, label: 'Chin/Jaw' },
  { raw: 0.58, label: 'Neck' },
  { raw: 0.50, label: 'Shoulder level' },
  { raw: 0.40, label: 'Upper chest' },
  { raw: 0.25, label: 'Mid chest' },
  { raw: 0.10, label: 'Lower torso' },
  { raw: 0.0,  label: 'Navel' },
  { raw: -0.10, label: 'Hip' },
  { raw: -0.25, label: 'Upper thigh' },
  { raw: -0.42, label: 'Knee area' },
  { raw: -0.60, label: 'Calf' },
  { raw: -0.80, label: 'Ankle' },
];

for (const { raw, label } of yLevels) {
  const sl = analyzeSlice(raw);
  if (!sl) continue;
  const sceneY = toScene(0, raw, 0)[1];
  console.log(`  Y=${raw.toFixed(2)} → scene Y=${sceneY.toFixed(3)} [${label}]  width=${sl.width.toFixed(3)} depth=${sl.depth.toFixed(3)} Xrange=[${sl.minX.toFixed(3)},${sl.maxX.toFixed(3)}] ${sl.count} verts`);
}

/* ── Generate recommended ANATOMY constants ── */
console.log(`\n═══ Recommended ANATOMY Constants ═══`);

// Brain center in the head — about 60% up from chin to top
const chinRawY = 0.69; // approximate from proportions
const headTopRawY = rMaxY;
const brainCenterRawY = chinRawY + (headTopRawY - chinRawY) * 0.65;
const brainCenterScene = toScene(0, brainCenterRawY, 0);

console.log(`  brainCenterY: ${brainCenterScene[1].toFixed(3)} (raw Y=${brainCenterRawY.toFixed(3)})`);
console.log(`  feetY: ${FEET_Y.toFixed(3)}`);

const spineTopRawY = 0.65; // C7 vertebra
const spineBottomRawY = -0.20; // L5/sacrum
const spineTopScene = toScene(0, spineTopRawY, 0);
const spineBottomScene = toScene(0, spineBottomRawY, 0);
console.log(`  spineTopY: ${spineTopScene[1].toFixed(3)} (raw Y=${spineTopRawY})`);
console.log(`  spineBottomY: ${spineBottomScene[1].toFixed(3)} (raw Y=${spineBottomRawY})`);

/* ── Recommended sensor positions ── */
console.log(`\n═══ Recommended SENSOR_POSITIONS ═══`);

// For sensors: use scene coordinates that overlay on the visual model
// Right hand (viewer's right = scene +X = model's left hand after rotation)
// The hand cluster at raw -X becomes +X after rotation
const handYScene = toScene(0, hlY, 0)[1]; // left-hand raw cluster Y
const handXScene = Math.abs(lhScene[0]);  // absolute X

console.log(`  right_hand: { x: ${handXScene.toFixed(2)}, y: ${handYScene.toFixed(2)}, z: 0.02 }`);
console.log(`  left_hand:  { x: ${(-handXScene).toFixed(2)}, y: ${handYScene.toFixed(2)}, z: 0.02 }`);

// Eye — face center at eye level
const eyeRawY = 0.82;
const eyeScene = toScene(0, eyeRawY, 0.10); // nose Z in raw ≈ +0.10
console.log(`  eye:        { x: 0.00, y: ${eyeScene[1].toFixed(2)}, z: ${eyeScene[2].toFixed(2)} }`);

// Ear — side of head at ear level
const earRawY = 0.80;
const earScene = toScene(-0.08, earRawY, 0);
console.log(`  ear:        { x: ${earScene[0].toFixed(2)}, y: ${earScene[1].toFixed(2)}, z: 0.00 }`);

// Mouth — face center
const mouthRawY = 0.72;
const mouthScene = toScene(0, mouthRawY, 0.08);
console.log(`  mouth:      { x: 0.00, y: ${mouthScene[1].toFixed(2)}, z: ${mouthScene[2].toFixed(2)} }`);

// Forehead
const foreheadRawY = 0.90;
const foreheadScene = toScene(0, foreheadRawY, 0.08);
console.log(`  forehead:   { x: 0.00, y: ${foreheadScene[1].toFixed(2)}, z: ${foreheadScene[2].toFixed(2)} }`);

/* ── Arm path estimation ── */
console.log(`\n═══ Arm Path (Scene Space) ═══`);
// Find the arm angle from shoulder to hand
const shoulderRawX = 0.18; // approximate raw shoulder half-width
const shoulderRawY = 0.55;
const handRawX = rMaxX;      // fingertip raw X
const handRawY = hrY;        // hand cluster raw Y

const armAngle = Math.atan2(shoulderRawY - handRawY, handRawX - shoulderRawX) * 180 / Math.PI;
console.log(`  Arm angle from horizontal: ${armAngle.toFixed(1)}°`);
console.log(`  Shoulder raw: (±${shoulderRawX}, ${shoulderRawY})`);
console.log(`  Hand raw: (±${handRawX.toFixed(3)}, ${handRawY.toFixed(3)})`);

const shoulderScene = toScene(-shoulderRawX, shoulderRawY, -0.01);
const elbowRawX = (shoulderRawX + handRawX) / 2;
const elbowRawY = (shoulderRawY + handRawY) / 2;
const elbowScene = toScene(-elbowRawX, elbowRawY, -0.01);
const handScene = toScene(-handRawX, handRawY, 0);

console.log(`  Right shoulder scene: (${shoulderScene.map(v=>v.toFixed(3)).join(', ')})`);
console.log(`  Right elbow scene:    (${elbowScene.map(v=>v.toFixed(3)).join(', ')})`);
console.log(`  Right hand scene:     (${handScene.map(v=>v.toFixed(3)).join(', ')})`);
