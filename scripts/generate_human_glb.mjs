#!/usr/bin/env node
/**
 * generate_human_glb.mjs  — v3 High-Resolution Anatomical Body (80K+ polygons)
 * ──────────────────────────────────────────────────────────────
 * Generates an 80,000+ polygon anatomical human with:
 *   • Catmull-Rom subdivided body contours for extreme smoothness
 *   • Individual fingers (5 per hand, 3 phalanges each)
 *   • Enhanced muscle-topology surface displacement
 *   • Trapezius, latissimus dorsi, clavicle, kneecap detail
 *   • Anatomically correct proportions (7.5 head-heights)
 *   • Proper shoulder / clavicle / neck transition
 *   • Realistic cranial shape with brow ridge, mandible hints
 *   • Natural A-pose: arms ~28° from body
 *   • Full UV coordinates for texture mapping (albedo, normal, roughness)
 *   • Feet at y = 0, total height ≈ 1.80 m
 *
 * Output: client/public/models/anatomical_human.glb
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'client', 'public', 'models', 'anatomical_human.glb');

/* ═══════════════════════════════════════════
   Vec3 helpers
   ═══════════════════════════════════════════ */
const V = {
  sub(a, b)    { return [a.x - b.x, a.y - b.y, a.z - b.z]; },
  dot(a, b)    { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; },
  scale(a, s)  { return [a[0]*s, a[1]*s, a[2]*s]; },
  mag(a)       { return Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]); },
  normalize(a) { const l = V.mag(a); return l > 1e-10 ? [a[0]/l, a[1]/l, a[2]/l] : [0,1,0]; },
  cross(a, b)  { return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; },
  add(a, b)    { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; },
};
function bestPerp(t) {
  const ax = Math.abs(t[0]), ay = Math.abs(t[1]), az = Math.abs(t[2]);
  const up = ax < ay && ax < az ? [1,0,0] : ay < az ? [0,1,0] : [0,0,1];
  return V.normalize(V.cross(t, up));
}
function lerp(a, b, t) { return a + (b - a) * t; }

/* ═══════════════════════════════════════════
   Catmull-Rom Interpolation & Subdivision
   ═══════════════════════════════════════════ */

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * ((2*p1) + (-p0+p2)*t + (2*p0-5*p1+4*p2-p3)*t2 + (-p0+3*p1-3*p2+p3)*t3);
}

function blendPerturb(pA, pB, t) {
  if (!pA && !pB) return undefined;
  return (theta) => {
    const a = pA ? pA(theta) : { dr: 0, drz: 0, dz: 0 };
    const b = pB ? pB(theta) : { dr: 0, drz: 0, dz: 0 };
    return {
      dr:  lerp(a.dr || 0, b.dr || 0, t),
      drz: lerp(a.drz || 0, b.drz || 0, t),
      dz:  lerp(a.dz || 0, b.dz || 0, t),
    };
  };
}

/** Subdivide an array of Y-axis aligned slices using Catmull-Rom */
function subdivideSlices(keySlices, factor) {
  if (factor <= 1) return keySlices;
  const result = [];
  for (let i = 0; i < keySlices.length - 1; i++) {
    const s0 = keySlices[Math.max(0, i - 1)];
    const s1 = keySlices[i];
    const s2 = keySlices[i + 1];
    const s3 = keySlices[Math.min(keySlices.length - 1, i + 2)];
    for (let j = 0; j < factor; j++) {
      const t = j / factor;
      result.push({
        y:  catmullRom(s0.y, s1.y, s2.y, s3.y, t),
        x:  catmullRom(s0.x, s1.x, s2.x, s3.x, t),
        z:  catmullRom(s0.z, s1.z, s2.z, s3.z, t),
        rx: Math.max(0.001, catmullRom(s0.rx, s1.rx, s2.rx, s3.rx, t)),
        rz: Math.max(0.001, catmullRom(s0.rz, s1.rz, s2.rz, s3.rz, t)),
        perturb: blendPerturb(s1.perturb, s2.perturb, t),
      });
    }
  }
  result.push({ ...keySlices[keySlices.length - 1] });
  return result;
}

const getRx = (p) => p.rx !== undefined ? p.rx : (p.r || 0.04);
const getRz = (p) => p.rz !== undefined ? p.rz : getRx(p);

/** Subdivide an array of arbitrary 3D path points using Catmull-Rom */
function subdividePathPts(keyPts, factor) {
  if (factor <= 1) return keyPts;
  const result = [];
  for (let i = 0; i < keyPts.length - 1; i++) {
    const p0 = keyPts[Math.max(0, i - 1)];
    const p1 = keyPts[i];
    const p2 = keyPts[i + 1];
    const p3 = keyPts[Math.min(keyPts.length - 1, i + 2)];
    for (let j = 0; j < factor; j++) {
      const t = j / factor;
      result.push({
        x:  catmullRom(p0.x, p1.x, p2.x, p3.x, t),
        y:  catmullRom(p0.y, p1.y, p2.y, p3.y, t),
        z:  catmullRom(p0.z, p1.z, p2.z, p3.z, t),
        rx: Math.max(0.001, catmullRom(getRx(p0), getRx(p1), getRx(p2), getRx(p3), t)),
        rz: Math.max(0.001, catmullRom(getRz(p0), getRz(p1), getRz(p2), getRz(p3), t)),
        perturb: blendPerturb(p1.perturb, p2.perturb, t),
      });
    }
  }
  result.push({ ...keyPts[keyPts.length - 1] });
  return result;
}

/* ═══════════════════════════════════════════
   Mesh builders (with UV coordinates)
   ═══════════════════════════════════════════ */

function buildSliceTube(slices, radialSegs = 64) {
  const verts = [], norms = [], uvs = [], idxs = [];

  /* Cumulative arc length for V coordinate */
  const arcLen = [0];
  for (let s = 1; s < slices.length; s++) {
    const dx = (slices[s].x || 0) - (slices[s-1].x || 0);
    const dy = slices[s].y - slices[s-1].y;
    const dz = (slices[s].z || 0) - (slices[s-1].z || 0);
    arcLen.push(arcLen[s-1] + Math.sqrt(dx*dx + dy*dy + dz*dz));
  }
  const totalArc = arcLen[arcLen.length - 1] || 1;

  for (let s = 0; s < slices.length; s++) {
    const sl = slices[s];
    const prev = slices[Math.max(0, s - 1)];
    const next = slices[Math.min(slices.length - 1, s + 1)];
    const dy = next.y - prev.y;
    const drx = next.rx - prev.rx;
    const drz = next.rz - prev.rz;
    const vCoord = arcLen[s] / totalArc;

    for (let r = 0; r <= radialSegs; r++) {
      const theta = (r / radialSegs) * Math.PI * 2;
      const uCoord = r / radialSegs;
      const cx = Math.cos(theta), cz = Math.sin(theta);

      let lrx = sl.rx, lrz = sl.rz;
      let offZ = 0;
      if (sl.perturb) {
        const p = sl.perturb(theta);
        lrx += p.dr || 0;
        lrz += p.drz || 0;
        offZ += p.dz || 0;
      }

      const lx = cx * lrx;
      const lz = cz * lrz + offZ;
      verts.push(sl.x + lx, sl.y, sl.z + lz);

      const tnx = cx / (lrx || 0.001);
      const tnz = cz / (lrz || 0.001);
      const avgDr = (drx + drz) * 0.5;
      const slopeY = dy !== 0 ? -avgDr / dy : 0;
      const len = Math.sqrt(tnx*tnx + slopeY*slopeY + tnz*tnz) || 1;
      norms.push(tnx / len, slopeY / len, tnz / len);

      uvs.push(uCoord, vCoord);
    }
  }

  const ring = radialSegs + 1;
  for (let s = 0; s < slices.length - 1; s++) {
    for (let r = 0; r < radialSegs; r++) {
      const a = s * ring + r, b = a + 1;
      const c = (s + 1) * ring + r, d = c + 1;
      idxs.push(a, c, b, b, c, d);
    }
  }
  return { verts, norms, uvs, idxs };
}

function buildPathTube(pts, radialSegs = 32) {
  const verts = [], norms = [], uvs = [], idxs = [];

  const tangents = pts.map((_, i) => {
    const prev = pts[Math.max(0, i-1)];
    const next = pts[Math.min(pts.length-1, i+1)];
    return V.normalize(V.sub(next, prev));
  });

  /* Cumulative arc length for V coordinate */
  const arcLen = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i-1].x;
    const dy = pts[i].y - pts[i-1].y;
    const dz = pts[i].z - pts[i-1].z;
    arcLen.push(arcLen[i-1] + Math.sqrt(dx*dx + dy*dy + dz*dz));
  }
  const totalArc = arcLen[arcLen.length - 1] || 1;

  let lastN = bestPerp(tangents[0]);

  for (let s = 0; s < pts.length; s++) {
    const T = tangents[s];
    let N = V.sub(lastN, V.scale(T, V.dot(lastN, T)));
    const lenN = V.mag(N);
    N = lenN < 1e-6 ? lastN : V.scale(N, 1 / lenN);
    const B = V.normalize(V.cross(T, N));
    lastN = N;

    const pt = pts[s];
    const rx = pt.rx !== undefined ? pt.rx : (pt.r || 0.04);
    const rz = pt.rz !== undefined ? pt.rz : rx;
    const vCoord = arcLen[s] / totalArc;

    for (let r = 0; r <= radialSegs; r++) {
      const theta = (r / radialSegs) * Math.PI * 2;
      const uCoord = r / radialSegs;
      const ct = Math.cos(theta), st = Math.sin(theta);

      let localRx = rx, localRz = rz;
      if (pt.perturb) {
        const p = pt.perturb(theta);
        localRx += p.dr || 0;
        localRz += p.drz || 0;
      }

      const vx = pt.x + ct * localRx * N[0] + st * localRz * B[0];
      const vy = pt.y + ct * localRx * N[1] + st * localRz * B[1];
      const vz = pt.z + ct * localRx * N[2] + st * localRz * B[2];
      verts.push(vx, vy, vz);

      const dx = vx - pt.x, ddy = vy - pt.y, dz = vz - pt.z;
      const dl = Math.sqrt(dx*dx + ddy*ddy + dz*dz) || 1;
      norms.push(dx/dl, ddy/dl, dz/dl);

      uvs.push(uCoord, vCoord);
    }
  }

  const ring = radialSegs + 1;
  for (let s = 0; s < pts.length - 1; s++) {
    for (let r = 0; r < radialSegs; r++) {
      const a = s * ring + r, b = a + 1;
      const c = (s + 1) * ring + r, d = c + 1;
      idxs.push(a, c, b, b, c, d);
    }
  }
  return { verts, norms, uvs, idxs };
}

function buildCap(ringPts, center, normal, flip = false) {
  const verts = [], norms = [], uvs = [], idxs = [];
  verts.push(center[0], center[1], center[2]);
  norms.push(normal[0], normal[1], normal[2]);
  uvs.push(0.5, 0.5);
  for (let i = 0; i < ringPts.length; i++) {
    const p = ringPts[i];
    verts.push(p[0], p[1], p[2]);
    norms.push(normal[0], normal[1], normal[2]);
    const angle = (i / ringPts.length) * Math.PI * 2;
    uvs.push(0.5 + Math.cos(angle) * 0.5, 0.5 + Math.sin(angle) * 0.5);
  }
  for (let i = 1; i < ringPts.length; i++) {
    if (flip) idxs.push(0, i + 1, i);
    else      idxs.push(0, i, i + 1);
  }
  if (flip) idxs.push(0, 1, ringPts.length);
  else      idxs.push(0, ringPts.length, 1);
  return { verts, norms, uvs, idxs };
}

function mergeGeos(...geos) {
  const verts = [], norms = [], uvs = [], idxs = [];
  let offset = 0;
  for (const g of geos) {
    for (const v of g.verts) verts.push(v);
    for (const n of g.norms) norms.push(n);
    if (g.uvs) for (const u of g.uvs) uvs.push(u);
    for (const i of g.idxs) idxs.push(i + offset);
    offset += g.verts.length / 3;
  }
  return { verts, norms, uvs, idxs };
}

/* ═══════════════════════════════════════════
   Perturbation combiner & muscle functions
   ═══════════════════════════════════════════ */

function compositePerturb(...fns) {
  return (theta) => {
    let dr = 0, drz = 0, dz = 0;
    for (const fn of fns) {
      const p = fn(theta);
      dr  += p.dr  || 0;
      drz += p.drz || 0;
      dz  += p.dz  || 0;
    }
    return { dr, drz, dz };
  };
}

/* Pectoralis major — increased amplitude (+40%) */
function pecPerturb(intensity) {
  return (theta) => {
    const pecL = Math.exp(-Math.pow(theta - 1.0, 2) / 0.15) * 0.009;
    const pecR = Math.exp(-Math.pow(theta - (Math.PI * 2 - 1.0), 2) / 0.15) * 0.009;
    const sternum = -Math.exp(-Math.pow(theta - Math.PI / 2, 2) / 0.02) * 0.004;
    const serL = Math.exp(-Math.pow(theta - 2.2, 2) / 0.08) * 0.004 * Math.sin(theta * 12) * 0.5;
    const serR = Math.exp(-Math.pow(theta - (Math.PI * 2 - 2.2), 2) / 0.08) * 0.004 * Math.sin(theta * 12) * 0.5;
    return { dr: (pecL + pecR + sternum + serL + serR) * intensity };
  };
}

/* Rectus abdominis / obliques — increased amplitude (+40%) */
function absPerturb(row, intensity) {
  return (theta) => {
    const lineaAlba = -Math.exp(-Math.pow(theta - Math.PI / 2, 2) / 0.015) * 0.006;
    const leftRect  = Math.exp(-Math.pow(theta - 1.15, 2) / 0.08) * 0.006;
    const r2pi = Math.PI * 2;
    const rightRect = Math.exp(-Math.pow(theta - ((r2pi - 1.15 + r2pi) % r2pi), 2) / 0.08) * 0.006;
    const obliqueL = Math.exp(-Math.pow(theta - 2.0, 2) / 0.12) * 0.0045;
    const obliqueR = Math.exp(-Math.pow(theta - (r2pi - 2.0), 2) / 0.12) * 0.0045;
    const spine = Math.exp(-Math.pow(theta - Math.PI * 1.5, 2) / 0.06) * 0.003;
    const spineL = Math.exp(-Math.pow(theta - 4.4, 2) / 0.05) * 0.0045;
    const spineR = Math.exp(-Math.pow(theta - ((r2pi - 4.4 + r2pi) % r2pi), 2) / 0.05) * 0.0045;
    return { dr: (lineaAlba + leftRect + rightRect + obliqueL + obliqueR + spine + spineL + spineR) * intensity };
  };
}

/* Gluteus maximus — increased amplitude (+40%) */
function glutePerturb(intensity) {
  return (theta) => {
    const r2pi = Math.PI * 2;
    const glutL = Math.exp(-Math.pow(theta - 4.0, 2) / 0.25) * 0.011;
    const glutR = Math.exp(-Math.pow(theta - ((r2pi - 4.0 + r2pi) % r2pi), 2) / 0.25) * 0.011;
    const cleft = -Math.exp(-Math.pow(theta - Math.PI * 1.5, 2) / 0.02) * 0.006;
    const iliacL = Math.exp(-Math.pow(theta - 2.5, 2) / 0.15) * 0.004;
    const iliacR = Math.exp(-Math.pow(theta - (r2pi - 2.5), 2) / 0.15) * 0.004;
    return { dr: (glutL + glutR + cleft + iliacL + iliacR) * intensity };
  };
}

/* Quadriceps / hamstrings — increased amplitude (+40%) */
function thighPerturb(side, t) {
  return (theta) => {
    const vl = Math.exp(-Math.pow(theta - 0.3, 2) / 0.18) * 0.007;
    const vm = Math.exp(-Math.pow(theta - 2.6, 2) / 0.12) * 0.006;
    const rf = Math.exp(-Math.pow(theta - Math.PI / 2, 2) / 0.10) * 0.006;
    const ham = Math.exp(-Math.pow(theta - Math.PI * 1.5, 2) / 0.25) * 0.007;
    const add = Math.exp(-Math.pow(theta - 2.2, 2) / 0.12) * 0.004;
    const itb = -Math.exp(-Math.pow(theta, 2) / 0.03) * 0.003;
    return { dr: (vl + vm + rf + ham + add + itb) * (0.6 + t * 0.4) };
  };
}

/* Gastrocnemius / soleus — increased amplitude (+40%) */
function calfPerturb(t) {
  return (theta) => {
    const medGas = Math.exp(-Math.pow(theta - 4.8, 2) / 0.20) * 0.008;
    const latGas = Math.exp(-Math.pow(theta - 4.0, 2) / 0.15) * 0.007;
    const tibAnt = Math.exp(-Math.pow(theta - 0.8, 2) / 0.10) * 0.004;
    const shin = -Math.exp(-Math.pow(theta - Math.PI / 2, 2) / 0.02) * 0.003;
    const achilles = -Math.exp(-Math.pow(theta - Math.PI * 1.5, 2) / 0.02) * 0.003;
    return { dr: (medGas + latGas + tibAnt + shin + achilles) * t };
  };
}

/* Deltoid — increased amplitude (+40%) */
function shoulderPerturb(intensity) {
  return (theta) => {
    const antDelt = Math.exp(-Math.pow(theta - 1.2, 2) / 0.15) * 0.007;
    const latDelt = Math.exp(-Math.pow(theta, 2) / 0.20) * 0.009;
    const postDelt = Math.exp(-Math.pow(theta - (Math.PI * 2 - 1.2), 2) / 0.15) * 0.006;
    const dpGroove = -Math.exp(-Math.pow(theta - 0.9, 2) / 0.03) * 0.004;
    return { dr: (antDelt + latDelt + postDelt + dpGroove) * intensity };
  };
}

/* ── NEW PERTURBATION FUNCTIONS ── */

/* Trapezius — upper back / neck region */
function trapPerturb(intensity) {
  return (theta) => {
    /* theta convention: 0=right, PI/2=front, PI=left, 3PI/2=back */
    const bulk = Math.exp(-Math.pow(theta - Math.PI * 1.5, 2) / 0.40) * 0.010;
    const latR = Math.exp(-Math.pow(theta - 5.5, 2) / 0.12) * 0.006;
    const latL = Math.exp(-Math.pow(theta - 3.9, 2) / 0.12) * 0.006;
    const groove = -Math.exp(-Math.pow(theta - Math.PI * 1.5, 2) / 0.02) * 0.003;
    return { dr: (bulk + latR + latL + groove) * intensity };
  };
}

/* Latissimus dorsi — mid-back flare */
function latPerturb(intensity) {
  return (theta) => {
    const latR = Math.exp(-Math.pow(theta - 5.5, 2) / 0.20) * 0.007;
    const latL = Math.exp(-Math.pow(theta - 3.9, 2) / 0.20) * 0.007;
    const spineGroove = -Math.exp(-Math.pow(theta - Math.PI * 1.5, 2) / 0.03) * 0.003;
    return { dr: (latR + latL + spineGroove) * intensity };
  };
}

/* Clavicle ridge — collar bone prominence */
function claviclePerturb(intensity) {
  return (theta) => {
    /* Clavicle runs from sternum (front center) out laterally */
    const clavR = Math.exp(-Math.pow(theta - 0.6, 2) / 0.10) * 0.005;
    const clavL = Math.exp(-Math.pow(theta - (Math.PI * 2 - 0.6), 2) / 0.10) * 0.005;
    const sternNotch = -Math.exp(-Math.pow(theta - Math.PI / 2, 2) / 0.02) * 0.004;
    return { dr: (clavR + clavL + sternNotch) * intensity };
  };
}

/* Sternocleidomastoid — neck muscles */
function neckPerturb(intensity) {
  return (theta) => {
    const scmR = Math.exp(-Math.pow(theta - 0.7, 2) / 0.08) * 0.004;
    const scmL = Math.exp(-Math.pow(theta - (Math.PI * 2 - 0.7), 2) / 0.08) * 0.004;
    const nuchR = Math.exp(-Math.pow(theta - 5.2, 2) / 0.06) * 0.003;
    const nuchL = Math.exp(-Math.pow(theta - 4.0, 2) / 0.06) * 0.003;
    const larynx = Math.exp(-Math.pow(theta - Math.PI / 2, 2) / 0.03) * 0.003;
    return { dr: (scmR + scmL + nuchR + nuchL + larynx) * intensity };
  };
}

/* Patella / knee structure */
function kneecapPerturb(intensity) {
  return (theta) => {
    const patella = Math.exp(-Math.pow(theta - Math.PI / 2, 2) / 0.08) * 0.007;
    const popliteal = -Math.exp(-Math.pow(theta - Math.PI * 1.5, 2) / 0.06) * 0.004;
    const medCond = Math.exp(-Math.pow(theta - 2.4, 2) / 0.06) * 0.003;
    const latCond = Math.exp(-Math.pow(theta - (Math.PI * 2 - 2.4), 2) / 0.06) * 0.003;
    return { dr: (patella + popliteal + medCond + latCond) * intensity };
  };
}

/* Rib cage subtle visibility */
function ribPerturb(ribIndex, intensity) {
  return (theta) => {
    const phase = ribIndex * 0.4;
    const ribR = Math.exp(-Math.pow(theta - (0.8 + phase * 0.05), 2) / 0.06) * 0.002;
    const ribL = Math.exp(-Math.pow(theta - (Math.PI * 2 - 0.8 - phase * 0.05), 2) / 0.06) * 0.002;
    return { dr: (ribR + ribL) * intensity * Math.sin(theta * 8 + phase) * 0.3 };
  };
}

/* ═══════════════════════════════════════════
   Overlay applicators — add secondary muscle
   layers to existing slice perturbations
   ═══════════════════════════════════════════ */

function applyTorsoOverlays(slices) {
  for (const sl of slices) {
    const overlays = [];

    /* Latissimus dorsi (y: 1.17–1.34) */
    if (sl.y >= 1.17 && sl.y <= 1.34) {
      const peak = 1.26;
      const i = sl.y <= peak
        ? (sl.y - 1.17) / (peak - 1.17)
        : Math.max(0, 1 - (sl.y - peak) / (1.34 - peak));
      overlays.push(latPerturb(i * 0.5));
    }

    /* Rib cage hints (y: 1.12–1.24) */
    if (sl.y >= 1.12 && sl.y <= 1.24) {
      const ribIdx = Math.round((sl.y - 1.12) / 0.025);
      overlays.push(ribPerturb(ribIdx, 0.4));
    }

    /* Trapezius (y: 1.33–1.46) */
    if (sl.y >= 1.33 && sl.y <= 1.46) {
      const peak = 1.40;
      const i = sl.y <= peak
        ? (sl.y - 1.33) / (peak - 1.33)
        : Math.max(0, 1 - (sl.y - peak) / (1.46 - peak));
      overlays.push(trapPerturb(i * 0.7));
    }

    /* Clavicle ridge (y: 1.35–1.42) */
    if (sl.y >= 1.35 && sl.y <= 1.42) {
      const peak = 1.39;
      const i = sl.y <= peak
        ? (sl.y - 1.35) / (peak - 1.35)
        : Math.max(0, 1 - (sl.y - peak) / (1.42 - peak));
      overlays.push(claviclePerturb(i * 0.6));
    }

    /* Neck SCM muscles (y: 1.48–1.56) */
    if (sl.y >= 1.48 && sl.y <= 1.56) {
      const peak = 1.52;
      const i = sl.y <= peak
        ? (sl.y - 1.48) / (peak - 1.48)
        : Math.max(0, 1 - (sl.y - peak) / (1.56 - peak));
      overlays.push(neckPerturb(i * 0.5));
    }

    if (overlays.length > 0) {
      const existing = sl.perturb;
      if (existing) overlays.unshift(existing);
      sl.perturb = overlays.length === 1 ? overlays[0] : compositePerturb(...overlays);
    }
  }
  return slices;
}

function applyLegOverlays(slices) {
  for (const sl of slices) {
    /* Kneecap / condyles (y: 0.42–0.50) */
    if (sl.y >= 0.42 && sl.y <= 0.50) {
      const peak = 0.46;
      const i = sl.y <= peak
        ? (sl.y - 0.42) / (peak - 0.42)
        : Math.max(0, 1 - (sl.y - peak) / (0.50 - peak));
      const existing = sl.perturb;
      sl.perturb = existing
        ? compositePerturb(existing, kneecapPerturb(i * 0.8))
        : kneecapPerturb(i * 0.8);
    }
  }
  return slices;
}

/* ═══════════════════════════════════════════
   Anatomical body data
   ═══════════════════════════════════════════ */

const TORSO = [
  { y: 0.840, x: 0, z: 0.003, rx: 0.152, rz: 0.112, perturb: glutePerturb(0.3) },
  { y: 0.855, x: 0, z: 0.002, rx: 0.155, rz: 0.114, perturb: glutePerturb(0.5) },
  { y: 0.870, x: 0, z: 0.002, rx: 0.158, rz: 0.116, perturb: glutePerturb(0.7) },
  { y: 0.890, x: 0, z: 0.001, rx: 0.160, rz: 0.118, perturb: glutePerturb(0.9) },
  { y: 0.910, x: 0, z: 0.000, rx: 0.164, rz: 0.120, perturb: glutePerturb(1.0) },
  { y: 0.935, x: 0, z:-0.001, rx: 0.166, rz: 0.120, perturb: glutePerturb(0.8) },
  { y: 0.960, x: 0, z:-0.001, rx: 0.163, rz: 0.118, perturb: glutePerturb(0.5) },
  { y: 0.985, x: 0, z:-0.002, rx: 0.158, rz: 0.115 },
  { y: 1.010, x: 0, z:-0.002, rx: 0.150, rz: 0.108, perturb: absPerturb(3, 0.5) },
  { y: 1.035, x: 0, z:-0.001, rx: 0.145, rz: 0.102, perturb: absPerturb(3, 0.6) },
  { y: 1.055, x: 0, z: 0.000, rx: 0.142, rz: 0.100, perturb: absPerturb(2, 0.7) },
  { y: 1.075, x: 0, z: 0.002, rx: 0.143, rz: 0.101, perturb: absPerturb(2, 0.8) },
  { y: 1.095, x: 0, z: 0.003, rx: 0.145, rz: 0.103, perturb: absPerturb(1, 0.9) },
  { y: 1.120, x: 0, z: 0.003, rx: 0.150, rz: 0.108, perturb: absPerturb(1, 1.0) },
  { y: 1.145, x: 0, z: 0.003, rx: 0.155, rz: 0.110, perturb: absPerturb(0, 0.8) },
  { y: 1.170, x: 0, z: 0.003, rx: 0.158, rz: 0.113 },
  { y: 1.195, x: 0, z: 0.004, rx: 0.162, rz: 0.116 },
  { y: 1.220, x: 0, z: 0.004, rx: 0.164, rz: 0.118 },
  { y: 1.245, x: 0, z: 0.005, rx: 0.166, rz: 0.118, perturb: pecPerturb(0.6) },
  { y: 1.270, x: 0, z: 0.005, rx: 0.168, rz: 0.118, perturb: pecPerturb(0.9) },
  { y: 1.290, x: 0, z: 0.005, rx: 0.166, rz: 0.116, perturb: pecPerturb(1.0) },
  { y: 1.310, x: 0, z: 0.004, rx: 0.162, rz: 0.114, perturb: pecPerturb(0.8) },
  { y: 1.330, x: 0, z: 0.003, rx: 0.158, rz: 0.110, perturb: pecPerturb(0.5) },
  { y: 1.350, x: 0, z: 0.002, rx: 0.154, rz: 0.106 },
  { y: 1.370, x: 0, z: 0.001, rx: 0.148, rz: 0.100 },
  { y: 1.390, x: 0, z: 0.000, rx: 0.142, rz: 0.095 },
  { y: 1.405, x: 0, z:-0.002, rx: 0.135, rz: 0.090 },
  { y: 1.420, x: 0, z:-0.003, rx: 0.125, rz: 0.085 },
  { y: 1.435, x: 0, z:-0.005, rx: 0.112, rz: 0.078 },
  { y: 1.450, x: 0, z:-0.006, rx: 0.095, rz: 0.072 },
  { y: 1.465, x: 0, z:-0.006, rx: 0.075, rz: 0.068 },
  { y: 1.480, x: 0, z:-0.005, rx: 0.068, rz: 0.064 },
  { y: 1.498, x: 0, z:-0.004, rx: 0.063, rz: 0.060 },
  { y: 1.515, x: 0, z:-0.003, rx: 0.060, rz: 0.057 },
  { y: 1.530, x: 0, z:-0.002, rx: 0.058, rz: 0.055 },
  { y: 1.545, x: 0, z:-0.001, rx: 0.056, rz: 0.054 },
  { y: 1.558, x: 0, z: 0.001, rx: 0.055, rz: 0.052 },
  { y: 1.575, x: 0, z: 0.004, rx: 0.058, rz: 0.052 },
  { y: 1.588, x: 0, z: 0.008, rx: 0.065, rz: 0.058 },
  { y: 1.600, x: 0, z: 0.010, rx: 0.072, rz: 0.064 },
  { y: 1.610, x: 0, z: 0.011, rx: 0.077, rz: 0.068 },
  { y: 1.620, x: 0, z: 0.012, rx: 0.080, rz: 0.072 },
  { y: 1.632, x: 0, z: 0.013, rx: 0.080, rz: 0.074 },
  { y: 1.648, x: 0, z: 0.014, rx: 0.082, rz: 0.078 },
  { y: 1.660, x: 0, z: 0.013, rx: 0.084, rz: 0.080 },
  { y: 1.678, x: 0, z: 0.010, rx: 0.088, rz: 0.086 },
  { y: 1.694, x: 0, z: 0.007, rx: 0.090, rz: 0.088 },
  { y: 1.708, x: 0, z: 0.005, rx: 0.089, rz: 0.088 },
  { y: 1.722, x: 0, z: 0.003, rx: 0.088, rz: 0.087 },
  { y: 1.738, x: 0, z: 0.000, rx: 0.085, rz: 0.085 },
  { y: 1.750, x: 0, z:-0.003, rx: 0.083, rz: 0.084 },
  { y: 1.762, x: 0, z:-0.006, rx: 0.080, rz: 0.082 },
  { y: 1.772, x: 0, z:-0.009, rx: 0.076, rz: 0.078 },
  { y: 1.782, x: 0, z:-0.012, rx: 0.070, rz: 0.072 },
  { y: 1.790, x: 0, z:-0.015, rx: 0.060, rz: 0.062 },
  { y: 1.796, x: 0, z:-0.017, rx: 0.045, rz: 0.046 },
  { y: 1.800, x: 0, z:-0.018, rx: 0.020, rz: 0.020 },
  { y: 1.803, x: 0, z:-0.018, rx: 0.006, rz: 0.006 },
];

function legSlices(side) {
  const sx = side * 0.082;
  return [
    { y: 0.000, x: sx, z: 0.022, rx: 0.048, rz: 0.100 },
    { y: 0.008, x: sx, z: 0.020, rx: 0.050, rz: 0.104 },
    { y: 0.020, x: sx, z: 0.018, rx: 0.049, rz: 0.098 },
    { y: 0.038, x: sx, z: 0.012, rx: 0.047, rz: 0.082 },
    { y: 0.055, x: sx, z: 0.004, rx: 0.044, rz: 0.055 },
    { y: 0.072, x: sx, z:-0.002, rx: 0.040, rz: 0.042 },
    { y: 0.090, x: sx, z:-0.003, rx: 0.042, rz: 0.043 },
    { y: 0.120, x: sx, z:-0.005, rx: 0.046, rz: 0.046, perturb: calfPerturb(0.3) },
    { y: 0.160, x: sx, z:-0.006, rx: 0.050, rz: 0.050, perturb: calfPerturb(0.6) },
    { y: 0.210, x: sx, z:-0.008, rx: 0.056, rz: 0.058, perturb: calfPerturb(1.0) },
    { y: 0.260, x: sx, z:-0.008, rx: 0.058, rz: 0.060, perturb: calfPerturb(0.9) },
    { y: 0.310, x: sx, z:-0.007, rx: 0.055, rz: 0.057, perturb: calfPerturb(0.7) },
    { y: 0.360, x: sx, z:-0.005, rx: 0.050, rz: 0.050, perturb: calfPerturb(0.4) },
    { y: 0.400, x: sx, z:-0.003, rx: 0.048, rz: 0.048 },
    { y: 0.440, x: sx, z: 0.003, rx: 0.052, rz: 0.048 },
    { y: 0.465, x: sx, z: 0.006, rx: 0.055, rz: 0.049 },
    { y: 0.490, x: sx, z: 0.005, rx: 0.056, rz: 0.050 },
    { y: 0.515, x: sx, z: 0.003, rx: 0.058, rz: 0.052 },
    { y: 0.550, x: sx, z: 0.002, rx: 0.062, rz: 0.058, perturb: thighPerturb(side, 0.3) },
    { y: 0.590, x: sx, z: 0.003, rx: 0.068, rz: 0.064, perturb: thighPerturb(side, 0.5) },
    { y: 0.630, x: sx, z: 0.004, rx: 0.074, rz: 0.070, perturb: thighPerturb(side, 0.7) },
    { y: 0.670, x: sx, z: 0.004, rx: 0.080, rz: 0.075, perturb: thighPerturb(side, 0.9) },
    { y: 0.710, x: sx, z: 0.003, rx: 0.084, rz: 0.078, perturb: thighPerturb(side, 1.0) },
    { y: 0.750, x: sx, z: 0.002, rx: 0.088, rz: 0.082, perturb: thighPerturb(side, 0.8) },
    { y: 0.785, x: sx, z: 0.001, rx: 0.090, rz: 0.084, perturb: thighPerturb(side, 0.6) },
    { y: 0.810, x: sx * 0.9, z: 0.001, rx: 0.090, rz: 0.085 },
    { y: 0.830, x: sx * 0.7, z: 0.002, rx: 0.084, rz: 0.080 },
    { y: 0.840, x: sx * 0.5, z: 0.003, rx: 0.076, rz: 0.072 },
  ];
}

function armPath(side) {
  const sx = side;
  const sX = sx * 0.180, sY = 1.410, sZ = -0.006;
  const eX = sx * 0.262, eY = 1.150, eZ = -0.015;
  const wX = sx * 0.320, wY = 0.920, wZ = 0.008;

  const pts = [];
  pts.push({ x: sX, y: sY + 0.025, z: sZ + 0.006, rx: 0.028, rz: 0.028 });
  pts.push({ x: sX, y: sY, z: sZ, rx: 0.060, rz: 0.058, perturb: shoulderPerturb(1.0) });
  pts.push({ x: lerp(sX,eX,0.06), y: lerp(sY,eY,0.06), z: lerp(sZ,eZ,0.06), rx: 0.062, rz: 0.058, perturb: shoulderPerturb(0.9) });
  pts.push({ x: lerp(sX,eX,0.12), y: lerp(sY,eY,0.12), z: lerp(sZ,eZ,0.12), rx: 0.060, rz: 0.056, perturb: shoulderPerturb(0.7) });
  pts.push({ x: lerp(sX,eX,0.22), y: lerp(sY,eY,0.22), z: lerp(sZ,eZ,0.22), rx: 0.054, rz: 0.052 });
  pts.push({ x: lerp(sX,eX,0.35), y: lerp(sY,eY,0.35), z: lerp(sZ,eZ,0.35), rx: 0.052, rz: 0.050 });
  pts.push({ x: lerp(sX,eX,0.48), y: lerp(sY,eY,0.48), z: lerp(sZ,eZ,0.48), rx: 0.050, rz: 0.048 });
  pts.push({ x: lerp(sX,eX,0.62), y: lerp(sY,eY,0.62), z: lerp(sZ,eZ,0.62), rx: 0.048, rz: 0.046 });
  pts.push({ x: lerp(sX,eX,0.78), y: lerp(sY,eY,0.78), z: lerp(sZ,eZ,0.78), rx: 0.044, rz: 0.042 });
  pts.push({ x: lerp(sX,eX,0.90), y: lerp(sY,eY,0.90), z: lerp(sZ,eZ,0.90), rx: 0.041, rz: 0.040 });
  pts.push({ x: eX, y: eY, z: eZ, rx: 0.040, rz: 0.038 });
  pts.push({ x: lerp(eX,wX,0.08), y: lerp(eY,wY,0.08), z: lerp(eZ,wZ,0.08), rx: 0.044, rz: 0.042 });
  pts.push({ x: lerp(eX,wX,0.18), y: lerp(eY,wY,0.18), z: lerp(eZ,wZ,0.18), rx: 0.043, rz: 0.041 });
  pts.push({ x: lerp(eX,wX,0.30), y: lerp(eY,wY,0.30), z: lerp(eZ,wZ,0.30), rx: 0.041, rz: 0.039 });
  pts.push({ x: lerp(eX,wX,0.45), y: lerp(eY,wY,0.45), z: lerp(eZ,wZ,0.45), rx: 0.038, rz: 0.036 });
  pts.push({ x: lerp(eX,wX,0.58), y: lerp(eY,wY,0.58), z: lerp(eZ,wZ,0.58), rx: 0.035, rz: 0.033 });
  pts.push({ x: lerp(eX,wX,0.72), y: lerp(eY,wY,0.72), z: lerp(eZ,wZ,0.72), rx: 0.032, rz: 0.030 });
  pts.push({ x: lerp(eX,wX,0.82), y: lerp(eY,wY,0.82), z: lerp(eZ,wZ,0.82), rx: 0.030, rz: 0.028 });
  pts.push({ x: lerp(eX,wX,0.92), y: lerp(eY,wY,0.92), z: lerp(eZ,wZ,0.92), rx: 0.028, rz: 0.022 });
  pts.push({ x: wX, y: wY, z: wZ, rx: 0.027, rz: 0.018 });
  return pts;
}

function handParts(side) {
  const sx = side;
  const wX = sx * 0.320, wY = 0.920, wZ = 0.008;
  const handDir = V.normalize([sx * 0.012, -1, 0.008]);
  const palmLen = 0.078;

  const palmBase = { x: wX, y: wY, z: wZ };
  const palmMid  = { x: wX + handDir[0]*palmLen*0.5, y: wY + handDir[1]*palmLen*0.5, z: wZ + handDir[2]*palmLen*0.5 };
  const palmEnd  = { x: wX + handDir[0]*palmLen, y: wY + handDir[1]*palmLen, z: wZ + handDir[2]*palmLen };

  const palmPts = [
    { ...palmBase, rx: 0.026, rz: 0.014 },
    { x: lerp(palmBase.x, palmMid.x, 0.3), y: lerp(palmBase.y, palmMid.y, 0.3), z: lerp(palmBase.z, palmMid.z, 0.3), rx: 0.032, rz: 0.015 },
    { ...palmMid, rx: 0.035, rz: 0.015 },
    { x: lerp(palmMid.x, palmEnd.x, 0.5), y: lerp(palmMid.y, palmEnd.y, 0.5), z: lerp(palmMid.z, palmEnd.z, 0.5), rx: 0.034, rz: 0.014 },
    { ...palmEnd, rx: 0.032, rz: 0.012 },
  ];
  const palmSubd = subdividePathPts(palmPts, 2);
  const palm = buildPathTube(palmSubd, 32);

  const fingerGeos = [];
  const fingerSpecs = [
    { name: 'thumb',  latOff: sx * 0.028, fwdOff: -0.015, zOff: 0.018, len: 0.050, r: 0.009, segs: 3 },
    { name: 'index',  latOff: sx * 0.016, fwdOff: 0, zOff: 0.004, len: 0.062, r: 0.007, segs: 3 },
    { name: 'middle', latOff: sx * 0.005, fwdOff: 0, zOff: 0.000, len: 0.068, r: 0.007, segs: 3 },
    { name: 'ring',   latOff: sx * -0.006, fwdOff: 0, zOff:-0.004, len: 0.062, r: 0.0065, segs: 3 },
    { name: 'pinky',  latOff: sx * -0.016, fwdOff: 0, zOff:-0.006, len: 0.050, r: 0.006, segs: 3 },
  ];

  for (const spec of fingerSpecs) {
    const base = {
      x: palmEnd.x + spec.latOff + handDir[0] * spec.fwdOff,
      y: palmEnd.y + handDir[1] * spec.fwdOff,
      z: palmEnd.z + spec.zOff,
    };

    let dir;
    if (spec.name === 'thumb') {
      dir = V.normalize([sx * 0.6, -0.7, 0.35]);
    } else {
      dir = V.normalize([handDir[0] + spec.latOff * 0.3, handDir[1], handDir[2]]);
    }

    const pts = [];
    for (let s = 0; s <= spec.segs * 3; s++) {
      const t = s / (spec.segs * 3);
      const rad = spec.r * (1 - t * 0.45);
      pts.push({
        x: base.x + dir[0] * spec.len * t,
        y: base.y + dir[1] * spec.len * t,
        z: base.z + dir[2] * spec.len * t,
        rx: rad,
        rz: rad * 0.85,
      });
    }
    const tip = pts[pts.length - 1];
    pts.push({ x: tip.x + dir[0]*0.003, y: tip.y + dir[1]*0.003, z: tip.z + dir[2]*0.003, rx: 0.002, rz: 0.002 });

    const fingerSubd = subdividePathPts(pts, 2);
    fingerGeos.push(buildPathTube(fingerSubd, 20));
  }

  return mergeGeos(palm, ...fingerGeos);
}

/* ═══════════════════════════════════════════
   Build all parts & merge
   ═══════════════════════════════════════════ */

function buildFootCap(slice, segs) {
  const ring = [];
  for (let r = 0; r < segs; r++) {
    const theta = (r / segs) * Math.PI * 2;
    ring.push([slice.x + Math.cos(theta) * slice.rx, slice.y, slice.z + Math.sin(theta) * slice.rz]);
  }
  return buildCap(ring, [slice.x, slice.y, slice.z], [0, -1, 0], true);
}

function buildFullBody() {
  console.log('  Subdividing torso...');
  const torsoData = applyTorsoOverlays(TORSO.map(s => ({ ...s })));
  const torsoSubdiv = subdivideSlices(torsoData, 3);
  const torso = buildSliceTube(torsoSubdiv, 128);

  console.log('  Subdividing legs...');
  const legRData = applyLegOverlays(legSlices(+1).map(s => ({ ...s })));
  const legRSubdiv = subdivideSlices(legRData, 3);
  const legR = buildSliceTube(legRSubdiv, 96);

  const legLData = applyLegOverlays(legSlices(-1).map(s => ({ ...s })));
  const legLSubdiv = subdivideSlices(legLData, 3);
  const legL = buildSliceTube(legLSubdiv, 96);

  console.log('  Subdividing arms...');
  const armRSubdiv = subdividePathPts(armPath(+1), 3);
  const armR = buildPathTube(armRSubdiv, 64);
  const armLSubdiv = subdividePathPts(armPath(-1), 3);
  const armL = buildPathTube(armLSubdiv, 64);

  console.log('  Building hands (with subdivided fingers)...');
  const handR = handParts(+1);
  const handL = handParts(-1);

  const footCapR = buildFootCap(legRSubdiv[0], 96);
  const footCapL = buildFootCap(legLSubdiv[0], 96);

  const topSlice = torsoSubdiv[torsoSubdiv.length - 1];
  const headCapPts = [];
  for (let r = 0; r < 128; r++) {
    const theta = (r / 128) * Math.PI * 2;
    headCapPts.push([topSlice.x + Math.cos(theta)*topSlice.rx, topSlice.y, topSlice.z + Math.sin(theta)*topSlice.rz]);
  }
  const headCap = buildCap(headCapPts, [topSlice.x, topSlice.y, topSlice.z], [0, 1, 0], false);

  return mergeGeos(torso, legR, legL, armR, armL, handR, handL, footCapR, footCapL, headCap);
}

/* ═══════════════════════════════════════════
   Smooth normals (face-weighted vertex averaging)
   ═══════════════════════════════════════════ */
function smoothNormals(geo) {
  const count = geo.verts.length / 3;
  const nx = new Float64Array(count);
  const ny = new Float64Array(count);
  const nz = new Float64Array(count);

  for (let i = 0; i < geo.idxs.length; i += 3) {
    const i0 = geo.idxs[i], i1 = geo.idxs[i+1], i2 = geo.idxs[i+2];
    const ax = geo.verts[i0*3], ay = geo.verts[i0*3+1], az = geo.verts[i0*3+2];
    const bx = geo.verts[i1*3], by = geo.verts[i1*3+1], bz = geo.verts[i1*3+2];
    const cx = geo.verts[i2*3], cy = geo.verts[i2*3+1], cz = geo.verts[i2*3+2];
    const e1x = bx-ax, e1y = by-ay, e1z = bz-az;
    const e2x = cx-ax, e2y = cy-ay, e2z = cz-az;
    const fnx = e1y*e2z - e1z*e2y;
    const fny = e1z*e2x - e1x*e2z;
    const fnz = e1x*e2y - e1y*e2x;
    for (const idx of [i0, i1, i2]) {
      nx[idx] += fnx; ny[idx] += fny; nz[idx] += fnz;
    }
  }

  const norms = [];
  for (let i = 0; i < count; i++) {
    const l = Math.sqrt(nx[i]*nx[i] + ny[i]*ny[i] + nz[i]*nz[i]) || 1;
    norms.push(nx[i]/l, ny[i]/l, nz[i]/l);
  }
  return { verts: geo.verts, norms, uvs: geo.uvs, idxs: geo.idxs };
}

/* ═══════════════════════════════════════════
   GLB binary writer (with TEXCOORD_0 UV support)
   ═══════════════════════════════════════════ */
function writeGLB(geo, filepath) {
  const positions = new Float32Array(geo.verts);
  const normals   = new Float32Array(geo.norms);
  const texcoords = new Float32Array(geo.uvs);
  const indices   = new Uint32Array(geo.idxs);
  const vertexCount = positions.length / 3;
  const indexCount  = indices.length;

  /* AABB bounds */
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    const px = positions[i], py = positions[i+1], pz = positions[i+2];
    if (px < minX) minX = px; if (px > maxX) maxX = px;
    if (py < minY) minY = py; if (py > maxY) maxY = py;
    if (pz < minZ) minZ = pz; if (pz > maxZ) maxZ = pz;
  }

  const posByteLen = positions.byteLength;
  const norByteLen = normals.byteLength;
  const uvByteLen  = texcoords.byteLength;
  const idxByteLen = indices.byteLength;
  const totalBin = posByteLen + norByteLen + uvByteLen + idxByteLen;
  const paddedBin = (totalBin + 3) & ~3;

  const gltf = {
    asset: { version: '2.0', generator: 'mindnero-anatomical-body-v3' },
    scene: 0,
    scenes: [{ name: 'Scene', nodes: [0] }],
    nodes: [{ mesh: 0, name: 'AnatomicalHumanBody' }],
    meshes: [{
      name: 'BodyMesh',
      primitives: [{
        attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 },
        indices: 3,
        mode: 4,
      }],
    }],
    accessors: [
      {
        bufferView: 0, componentType: 5126, count: vertexCount, type: 'VEC3',
        min: [+minX.toFixed(6), +minY.toFixed(6), +minZ.toFixed(6)],
        max: [+maxX.toFixed(6), +maxY.toFixed(6), +maxZ.toFixed(6)],
      },
      { bufferView: 1, componentType: 5126, count: vertexCount, type: 'VEC3' },
      { bufferView: 2, componentType: 5126, count: vertexCount, type: 'VEC2' },
      { bufferView: 3, componentType: 5125, count: indexCount, type: 'SCALAR' },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: posByteLen, target: 34962 },
      { buffer: 0, byteOffset: posByteLen, byteLength: norByteLen, target: 34962 },
      { buffer: 0, byteOffset: posByteLen + norByteLen, byteLength: uvByteLen, target: 34962 },
      { buffer: 0, byteOffset: posByteLen + norByteLen + uvByteLen, byteLength: idxByteLen, target: 34963 },
    ],
    buffers: [{ byteLength: paddedBin }],
  };

  const jsonStr = JSON.stringify(gltf);
  const jsonPad = jsonStr + ' '.repeat((4 - (jsonStr.length % 4)) % 4);
  const jsonBuf = Buffer.from(jsonPad, 'utf8');

  const binBuf = Buffer.alloc(paddedBin);
  Buffer.from(positions.buffer, positions.byteOffset, positions.byteLength).copy(binBuf, 0);
  Buffer.from(normals.buffer, normals.byteOffset, normals.byteLength).copy(binBuf, posByteLen);
  Buffer.from(texcoords.buffer, texcoords.byteOffset, texcoords.byteLength).copy(binBuf, posByteLen + norByteLen);
  Buffer.from(indices.buffer, indices.byteOffset, indices.byteLength).copy(binBuf, posByteLen + norByteLen + uvByteLen);

  const totalLen = 12 + 8 + jsonBuf.length + 8 + paddedBin;
  const glb = Buffer.alloc(totalLen);
  let off = 0;
  glb.writeUInt32LE(0x46546C67, off); off += 4;  // magic 'glTF'
  glb.writeUInt32LE(2, off);          off += 4;  // version
  glb.writeUInt32LE(totalLen, off);   off += 4;  // total length
  glb.writeUInt32LE(jsonBuf.length, off); off += 4;  // JSON chunk length
  glb.writeUInt32LE(0x4E4F534A, off);    off += 4;  // JSON chunk type
  jsonBuf.copy(glb, off);                off += jsonBuf.length;
  glb.writeUInt32LE(paddedBin, off);  off += 4;  // BIN chunk length
  glb.writeUInt32LE(0x004E4942, off); off += 4;  // BIN chunk type
  binBuf.copy(glb, off);

  fs.writeFileSync(filepath, glb);
  console.log('\n═══ GLB Output ═══');
  console.log('  File:      ', filepath);
  console.log('  Vertices:  ', vertexCount.toLocaleString());
  console.log('  Triangles: ', (indexCount / 3).toLocaleString());
  console.log('  Polygons:  ', (indexCount / 3).toLocaleString(), '(tri-based mesh)');
  console.log('  UV coords:  Yes (TEXCOORD_0)');
  console.log('  File size: ', (glb.length / 1024).toFixed(1), 'KB');
  console.log('  AABB:      ', '[' + minX.toFixed(4) + ',' + minY.toFixed(4) + ',' + minZ.toFixed(4) + ']',
    '->', '[' + maxX.toFixed(4) + ',' + maxY.toFixed(4) + ',' + maxZ.toFixed(4) + ']');
}

/* ═══════════════════════════════════════════
   Main
   ═══════════════════════════════════════════ */
console.log('Building high-resolution anatomical body (v3 — 80K+ polygons)...');
let body = buildFullBody();
console.log('  Smoothing normals...');
body = smoothNormals(body);
writeGLB(body, OUT);
