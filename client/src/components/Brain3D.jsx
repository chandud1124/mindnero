import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer as ThreeEffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import useStore, {
  BRAIN_MAPPING, NERVE_PATHWAYS, SENSOR_POSITIONS, NERVE_ANATOMY, LOBE_COLORS,
} from '../store/useStore';

/* ═══════════════════ Constants ═══════════════════ */
const ANATOMY = {
  feetY: -0.98,
  brainCenterY: 1.55,
  spineTopY: 1.27,
  spineBottomY: -0.05,
};

const NERVE_CLR = '#C9A84C';
const NERVE_ACTIVE_CLR = '#D4A843';

/* ─── Cross-component signal tracking (module-level for useFrame perf) ─── */
const SIGNAL_STATE = { progress: 0, active: false, pathCurve: null, camCurve: null, impulseId: null };

/* ─── Smooth camera path offset from nerve pathway ─── */
function computeCameraPath(pathway) {
  if (!pathway?.length || pathway.length < 2) return null;
  const pts = pathway.map((p) => {
    const zOff = Math.max(0.8, 1.15 - Math.abs(p.x) * 0.4);
    return new THREE.Vector3(p.x * 0.3, p.y + 0.18, p.z + zOff);
  });
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
}

/* ─── Lobe centre positions (brain-local coords) ─── */
const LOBE_CENTERS = {
  frontal:     [0, 0.03, 0.055],
  parietal:    [0, 0.06, -0.02],
  temporal:    [-0.09, -0.02, 0.015],
  occipital:   [0, 0.0, -0.085],
  motor_left:  [-0.05, 0.045, 0.025],
  motor_right: [0.05, 0.045, 0.025],
  broca:       [-0.075, 0.005, 0.05],
};

/* ═══════════════════ Nerve Tube ═══════════════════ */
const NerveTube = ({ points, radius = 0.003, color = NERVE_CLR, opacity = 0.55, emissiveIntensity = 0.35 }) => {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
    [points],
  );
  return (
    <mesh>
      <tubeGeometry args={[curve, 36, radius, 8, false]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        roughness={0.7}
        emissive={new THREE.Color(color)}
        emissiveIntensity={emissiveIntensity}
        toneMapped
      />
    </mesh>
  );
};

/* ═══════════════════ GLB Model Loader ═══════════════════ */
const useAnatomicalModel = () => {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    new GLTFLoader().load(
      '/handsome_male_basemesh/scene.gltf',
      (gltf) => {
        if (!cancelled) {
          setModel(gltf.scene);
          setLoading(false);
        }
      },
      undefined,
      (err) => {
        console.error('Failed to load anatomical model:', err);
        if (!cancelled) setLoading(false);
      },
    );
    return () => { cancelled = true; };
  }, []);
  return { model, loading };
};

/* ═══════════════════ Anatomical Skin Mesh (GLB model) ═══════════════════ */
const SkinMesh = ({ xrayMode, skinTransparency }) => {
  const { model, loading } = useAnatomicalModel();
  const groupRef = useRef();

  const { scene, scaleFactor, yOffset } = useMemo(() => {
    if (!model) return { scene: null, scaleFactor: 1, yOffset: 0 };
    const cloned = model.clone(true);

    /* Apply anatomical skin material — realistic skin tone, no plastic */
    cloned.traverse((c) => {
      if (c.isMesh) {
        c.material = new THREE.MeshPhysicalMaterial({
          color: xrayMode ? '#C8D5E0' : '#f1d2c6',
          transparent: true,
          opacity: xrayMode ? Math.min(0.08, skinTransparency) : skinTransparency,
          roughness: 0.70,
          metalness: 0,
          /* Subsurface-scattering approximation via sheen */
          sheen: 0.25,
          sheenColor: new THREE.Color('#f5a08a'),
          sheenRoughness: 0.6,
          transmission: xrayMode ? 0.18 : 0,
          thickness: 0.8,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });

    /* Auto-fit: measure bounding box, scale to target height, place feet */
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    /* Centre the model at origin */
    cloned.position.set(-center.x, -center.y, -center.z);

    /* Scale so total height = 2.66 scene-units (head to toe) */
    const TARGET_H = 2.66;
    const s = size.y > 0 ? TARGET_H / size.y : 1;
    const footWorldY = (box.min.y - center.y) * s;

    return { scene: cloned, scaleFactor: s, yOffset: ANATOMY.feetY - footWorldY };
  }, [model, xrayMode, skinTransparency]);

  /* Subtle breathing animation */
  useFrame((state) => {
    if (!groupRef.current) return;
    const breathe = 1 + Math.sin(state.clock.elapsedTime * 1.1) * 0.002;
    groupRef.current.scale.y = scaleFactor * breathe;
  });

  /* Loading indicator — translucent silhouette outline, NOT a capsule */
  if (loading || !scene) {
    return (
      <group>
        {/* Wireframe silhouette while loading */}
        <mesh position={[0, 0.34, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 1.85, 16, 12, true]} />
          <meshBasicMaterial color="#B8C4CE" transparent opacity={0.08} wireframe />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={[0, yOffset, 0]} scale={[scaleFactor, scaleFactor, scaleFactor]}>
      <primitive object={scene} />
    </group>
  );
};

/* ═══════════════════ Sensor Highlights ═══════════════════ */
const SensorHighlights = ({ activeSensor }) => (
  <group>
    {Object.entries(SENSOR_POSITIONS).map(([sensor, pos]) => {
      const active = sensor === activeSensor;
      return (
        <mesh key={sensor} position={[pos.x, pos.y, pos.z]}>
          <sphereGeometry args={[(sensor.includes('hand') || sensor.includes('leg')) ? 0.03 : 0.02, 12, 12]} />
          <meshStandardMaterial
            color={active ? '#E5B94E' : '#B8AFA0'}
            transparent
            opacity={active ? 0.6 : 0.10}
            emissive={new THREE.Color(active ? '#E5B94E' : '#000')}
            emissiveIntensity={active ? 0.5 : 0}
          />
        </mesh>
      );
    })}
  </group>
);

/* ═══════════════════ Touch Highlight ═══════════════════ */
const TouchHighlight = ({ sensor }) => {
  const ref = useRef();
  const pos = SENSOR_POSITIONS[sensor];
  if (!pos) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useFrame((state) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.15;
    ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref} position={[pos.x, pos.y, pos.z]}>
      <sphereGeometry args={[0.038, 14, 14]} />
      <meshBasicMaterial color={BRAIN_MAPPING[sensor]?.color || '#E5B94E'} transparent opacity={0.25} depthWrite={false} />
    </mesh>
  );
};

/* ═══════════════════ Skeleton ═══════════════════ */
const SkeletonLayer = ({ visible }) => {
  if (!visible) return null;
  const mid = (ANATOMY.spineTopY + ANATOMY.spineBottomY) / 2;
  return (
    <group>
      <mesh position={[0, mid, -0.03]}>
        <cylinderGeometry args={[0.012, 0.012, ANATOMY.spineTopY - ANATOMY.spineBottomY, 12]} />
        <meshStandardMaterial color="#ddd4c2" transparent opacity={0.55} roughness={0.5} />
      </mesh>
      <mesh position={[0, ANATOMY.spineBottomY - 0.07, -0.03]}>
        <capsuleGeometry args={[0.015, 0.14, 8, 12]} />
        <meshStandardMaterial color="#d8cdb8" transparent opacity={0.5} roughness={0.5} />
      </mesh>
      {[1, -1].map((side) => (
        <mesh key={side} position={[side * 0.12, 1.12, -0.01]} rotation={[0, 0, side * -0.25]}>
          <capsuleGeometry args={[0.008, 0.16, 6, 8]} />
          <meshStandardMaterial color="#ddd4c2" transparent opacity={0.4} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};

/* ═══════════════════ Peripheral Nervous System ═══════════════════ */
const PeripheralNervousSystem = ({ visible, activeSensor }) => {
  if (!visible) return null;
  const activeKey = activeSensor || '';
  const isRightArm = activeKey === 'right_hand';
  const isLeftArm = activeKey === 'left_hand';
  const isRightLeg = activeKey === 'right_leg';
  const isLeftLeg = activeKey === 'left_leg';
  const hasBodySignal = isRightArm || isLeftArm || isRightLeg || isLeftLeg;

  const armNerves = ['medianNerve', 'ulnarNerve', 'radialNerve'];
  const legNerves = ['sciaticNerve', 'tibialNerve', 'peronealNerve', 'femoralNerve', 'obturatorNerve'];

  return (
    <group>
      {Object.entries(NERVE_ANATOMY).map(([key, nerve]) => {
        const isCentral = key === 'spinalCord' || key === 'brainstem' || key === 'conusMedullaris';
        const isOnActivePath =
          (hasBodySignal && isCentral) ||
          (isRightArm && key.endsWith('_R') && (key.startsWith('root') || armNerves.some((n) => key.startsWith(n)))) ||
          (isLeftArm  && key.endsWith('_L') && (key.startsWith('root') || armNerves.some((n) => key.startsWith(n)))) ||
          (isRightLeg && key.endsWith('_R') && (legNerves.some((n) => key.startsWith(n)) || key.startsWith('caudaEquina'))) ||
          (isLeftLeg  && key.endsWith('_L') && (legNerves.some((n) => key.startsWith(n)) || key.startsWith('caudaEquina')));

        return (
          <NerveTube
            key={key}
            points={nerve.path}
            radius={nerve.radius}
            opacity={isOnActivePath ? 0.78 : 0.40}
            color={isOnActivePath ? NERVE_ACTIVE_CLR : NERVE_CLR}
            emissiveIntensity={isOnActivePath ? 0.55 : 0.25}
          />
        );
      })}

      {activeSensor && NERVE_PATHWAYS[activeSensor] && (
        <NerveTube
          points={NERVE_PATHWAYS[activeSensor].map(({ x, y, z }) => [x, y, z])}
          radius={0.005}
          opacity={0.70}
          color={BRAIN_MAPPING[activeSensor]?.color || NERVE_ACTIVE_CLR}
          emissiveIntensity={0.5}
        />
      )}
    </group>
  );
};

/* ═══════════════════ Brain Lobe Geometry Builder ═══════════════════
   Creates an ellipsoid with gyri/sulci cortical displacement. */
const buildLobeGeo = (rx, ry, rz, detail = 1.0) => {
  const geo = new THREE.SphereGeometry(1, 52, 52);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize();

    /* Gyri — broad convex ridges */
    const g1 = Math.sin((v.x + v.y) * 26) * 0.032;
    const g2 = Math.sin((v.y - v.z) * 22) * 0.025;
    const g3 = Math.cos((v.x * 1.5 + v.z) * 30) * 0.022;
    const g4 = Math.sin((v.x - v.y * 0.5) * 38) * 0.014;

    /* Sulci — sharp concave valleys */
    const s1 = -Math.abs(Math.sin(v.x * 16 + v.z * 18 - v.y * 12)) * 0.022;
    const s2 = -Math.abs(Math.cos(v.y * 14 + v.x * 20)) * 0.015;

    const disp = (g1 + g2 + g3 + g4 + s1 + s2) * detail;
    const r = 1 + disp;
    pos.setXYZ(i, v.x * rx * r, v.y * ry * r, v.z * rz * r);
  }
  geo.computeVertexNormals();
  return geo;
};

/* ═══════════════════ Single Brain Lobe Mesh ═══════════════════ */
const BrainLobe = ({ geometry, position, color, active }) => (
  <mesh geometry={geometry} position={position}>
    <meshPhysicalMaterial
      color={color}
      transparent
      opacity={active ? 0.72 : 0.32}
      roughness={0.55}
      clearcoat={0.12}
      emissive={new THREE.Color(active ? color : '#000')}
      emissiveIntensity={active ? 0.35 : 0}
      depthWrite={false}
    />
  </mesh>
);

/* ═══════════════════ Segmented Brain (separate lobe meshes) ═══════════════════ */
const SegmentedBrain = ({ activeLobe }) => {
  /* Each lobe has unique ellipsoid radii → unique gyri/sulci pattern */
  const frontalGeo   = useMemo(() => buildLobeGeo(0.085, 0.065, 0.058), []);
  const parietalGeo  = useMemo(() => buildLobeGeo(0.075, 0.050, 0.058), []);
  const temporalGeo  = useMemo(() => buildLobeGeo(0.032, 0.038, 0.062), []);
  const occipitalGeo = useMemo(() => buildLobeGeo(0.055, 0.050, 0.038), []);
  const motorGeo     = useMemo(() => buildLobeGeo(0.014, 0.055, 0.016, 0.6), []);
  const brocaGeo     = useMemo(() => buildLobeGeo(0.020, 0.020, 0.020, 0.8), []);
  const cerebellumGeo = useMemo(() => buildLobeGeo(0.042, 0.032, 0.035, 1.2), []);

  return (
    <group position={[0, ANATOMY.brainCenterY, 0]}>
      {/* Outer translucent meninges shell */}
      <mesh scale={[1, 1.05, 1.10]}>
        <sphereGeometry args={[0.165, 48, 48]} />
        <meshPhysicalMaterial color="#F0E8E0" transparent opacity={0.07} roughness={0.8} depthWrite={false} />
      </mesh>

      {/* ── FRONTAL LOBE (light blue) ── */}
      <BrainLobe geometry={frontalGeo} position={[0, 0.03, 0.055]} color={LOBE_COLORS.frontal} active={activeLobe === 'frontal'} />

      {/* ── PARIETAL LOBE (green) ── */}
      <BrainLobe geometry={parietalGeo} position={[0, 0.06, -0.02]} color={LOBE_COLORS.parietal} active={activeLobe === 'parietal'} />

      {/* ── LEFT TEMPORAL LOBE (orange) ── */}
      <BrainLobe geometry={temporalGeo} position={[-0.09, -0.02, 0.015]} color={LOBE_COLORS.temporal} active={activeLobe === 'temporal'} />
      {/* ── RIGHT TEMPORAL LOBE (orange) ── */}
      <BrainLobe geometry={temporalGeo} position={[0.09, -0.02, 0.015]} color={LOBE_COLORS.temporal} active={activeLobe === 'temporal'} />

      {/* ── OCCIPITAL LOBE (purple) ── */}
      <BrainLobe geometry={occipitalGeo} position={[0, 0.0, -0.085]} color={LOBE_COLORS.occipital} active={activeLobe === 'occipital'} />

      {/* ── LEFT MOTOR CORTEX STRIP (red) ── */}
      <BrainLobe geometry={motorGeo} position={[-0.05, 0.045, 0.025]} color={LOBE_COLORS.motor} active={activeLobe === 'motor_left'} />
      {/* ── RIGHT MOTOR CORTEX STRIP (red) ── */}
      <BrainLobe geometry={motorGeo} position={[0.05, 0.045, 0.025]} color={LOBE_COLORS.motor} active={activeLobe === 'motor_right'} />

      {/* ── BROCA'S AREA (dark orange) ── */}
      <BrainLobe geometry={brocaGeo} position={[-0.075, 0.005, 0.05]} color={LOBE_COLORS.broca} active={activeLobe === 'broca'} />

      {/* ── Cerebellum ── */}
      <mesh geometry={cerebellumGeo} position={[0, -0.065, -0.065]}>
        <meshPhysicalMaterial color="#E0C0C8" transparent opacity={0.65} roughness={0.55} clearcoat={0.08} />
      </mesh>

      {/* ── Corpus callosum ── */}
      <mesh position={[0, -0.025, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.016, 0.09, 12, 16]} />
        <meshStandardMaterial color="#ddc8ae" transparent opacity={0.62} roughness={0.5} />
      </mesh>

      {/* ── Brainstem ── */}
      <mesh position={[0, -0.11, -0.01]}>
        <capsuleGeometry args={[0.015, 0.08, 10, 14]} />
        <meshStandardMaterial color="#d4b99e" transparent opacity={0.72} roughness={0.5} />
      </mesh>

      {/* ── Longitudinal fissure (medial gap line) ── */}
      <mesh position={[0, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.001, 0.001, 0.22, 4]} />
        <meshBasicMaterial color="#B0A090" transparent opacity={0.25} />
      </mesh>
    </group>
  );
};

/* ═══════════════════ Signal Flow (water-like flowing animation) ═══════════════════ */
const TRAIL_COUNT = 15;

const SignalFlow = ({ impulse }) => {
  const headRef = useRef();
  const glowRef = useRef();
  const tubeRef = useRef();
  const trailRefs = useRef([]);
  const prog = useRef({ value: 0 });

  /* Nerve pathway curve + "pipe fill" tube geometry */
  const { curve, tubeGeo, totalIndices, segSize } = useMemo(() => {
    if (!impulse.pathway || impulse.pathway.length < 2) return {};
    const c = new THREE.CatmullRomCurve3(
      impulse.pathway.map((p) => new THREE.Vector3(p.x, p.y, p.z)),
      false, 'catmullrom', 0.5,
    );
    const tubSegs = Math.max(64, impulse.pathway.length * 8);
    const radSegs = 8;
    const geo = new THREE.TubeGeometry(c, tubSegs, 0.007, radSegs, false);
    const ips = radSegs * 6;
    geo.setDrawRange(0, 0);
    return { curve: c, tubeGeo: geo, totalIndices: tubSegs * ips, segSize: ips };
  }, [impulse.pathway]);

  /* Camera path for this signal */
  const camCurve = useMemo(() => {
    if (!impulse.pathway?.length) return null;
    return computeCameraPath(impulse.pathway);
  }, [impulse.pathway]);

  /* GSAP animation — mirrors biological timing with synapse pauses */
  useEffect(() => {
    if (!curve) return;
    prog.current.value = 0;

    /* Publish for CameraRig */
    SIGNAL_STATE.active = true;
    SIGNAL_STATE.pathCurve = curve;
    SIGNAL_STATE.camCurve = camCurve;
    SIGNAL_STATE.impulseId = impulse.id;
    SIGNAL_STATE.progress = 0;

    const totalDur = impulse.duration / 1000;
    const initDelay = (impulse.delay || 0) / 1000;
    const sp = impulse.spinalProgress || 0;
    const bp = impulse.brainProgress || 0;
    const hasBioDelays = sp > 0 && bp > 0;

    let cleanup;
    if (!hasBioDelays) {
      const tw = gsap.to(prog.current, { value: 1, duration: totalDur, delay: initDelay, ease: 'none' });
      cleanup = () => tw.kill();
    } else {
      const spDelay = (impulse.spinalDelay || 0) / 1000;
      const cxDelay = (impulse.cortexDelay || 0) / 1000;
      const tl = gsap.timeline({ delay: initDelay });
      tl.to(prog.current, { value: sp, duration: totalDur * sp, ease: 'none' });
      if (spDelay > 0) tl.to({}, { duration: spDelay });
      tl.to(prog.current, { value: bp, duration: totalDur * (bp - sp), ease: 'none' });
      if (cxDelay > 0) tl.to({}, { duration: cxDelay });
      tl.to(prog.current, { value: 1, duration: totalDur * (1 - bp), ease: 'none' });
      cleanup = () => tl.kill();
    }

    return () => {
      cleanup();
      if (SIGNAL_STATE.impulseId === impulse.id) {
        SIGNAL_STATE.active = false;
        SIGNAL_STATE.progress = 0;
      }
    };
  }, [curve, camCurve, impulse.duration, impulse.delay, impulse.id]);

  /* Per-frame updates — fills tube, moves head + trail */
  useFrame(() => {
    if (!curve) return;
    const v = prog.current.value;

    /* Update shared state for camera follow */
    if (SIGNAL_STATE.impulseId === impulse.id) {
      SIGNAL_STATE.progress = v;
    }

    /* ── Filled tube ("water" that has flowed) ── */
    if (tubeRef.current && totalIndices > 0) {
      if (v <= 0) {
        tubeRef.current.geometry.setDrawRange(0, 0);
      } else {
        const filled = Math.ceil((v * totalIndices) / segSize) * segSize;
        tubeRef.current.geometry.setDrawRange(0, Math.min(filled, totalIndices));
      }
    }

    /* ── Head sphere (bright leading edge) ── */
    if (headRef.current) {
      if (v <= 0 || v >= 1) {
        headRef.current.visible = false;
      } else {
        const pos = curve.getPointAt(v);
        headRef.current.visible = true;
        headRef.current.position.copy(pos);
        const pulse = 1 + Math.sin(v * Math.PI * 14) * 0.15;
        headRef.current.scale.setScalar(pulse);
        headRef.current.material.opacity = v > 0.93 ? (1 - v) * 14 : 0.9;
      }
    }

    /* ── Outer glow halo ── */
    if (glowRef.current) {
      if (v <= 0 || v >= 1) {
        glowRef.current.visible = false;
      } else {
        const pos = curve.getPointAt(v);
        glowRef.current.visible = true;
        glowRef.current.position.copy(pos);
        const pulse = 1.1 + Math.sin(v * Math.PI * 10) * 0.2;
        glowRef.current.scale.setScalar(pulse);
        glowRef.current.material.opacity = v > 0.93 ? (1 - v) * 6 : 0.2;
      }
    }

    /* ── Trail particles (fading droplets behind head) ── */
    const trailSpan = 0.08;
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const ref = trailRefs.current[i];
      if (!ref) continue;
      const offset = ((i + 1) / TRAIL_COUNT) * trailSpan;
      const tv = v - offset;
      if (tv <= 0 || v <= 0 || v >= 1) { ref.visible = false; continue; }
      const pos = curve.getPointAt(Math.min(tv, 0.999));
      ref.visible = true;
      ref.position.copy(pos);
      const fade = 1 - (i + 1) / TRAIL_COUNT;
      ref.material.opacity = fade * 0.55 * (v > 0.93 ? (1 - v) * 14 : 1);
      ref.scale.setScalar(0.6 + fade * 0.5);
    }
  });

  if (!curve) return null;
  const color = impulse.color || NERVE_ACTIVE_CLR;

  return (
    <group>
      {/* Filled tube — glowing "water" trail */}
      {tubeGeo && (
        <mesh ref={tubeRef} geometry={tubeGeo}>
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.55}
            emissive={new THREE.Color(color)}
            emissiveIntensity={0.6}
            roughness={0.5}
            toneMapped
          />
        </mesh>
      )}

      {/* Head — bright white leading sphere */}
      <mesh ref={headRef} visible={false}>
        <sphereGeometry args={[0.016, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" transparent />
      </mesh>

      {/* Outer glow — soft colour halo */}
      <mesh ref={glowRef} visible={false}>
        <sphereGeometry args={[0.035, 10, 10]} />
        <meshBasicMaterial color={color} transparent depthWrite={false} />
      </mesh>

      {/* Trail particles */}
      {Array.from({ length: TRAIL_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => { trailRefs.current[i] = el; }}
          visible={false}
        >
          <sphereGeometry args={[0.007, 8, 8]} />
          <meshBasicMaterial color={color} transparent depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

/* ═══════════════════ Neuron Burst ═══════════════════ */
const NeuronBurst = ({ activeLobe, activeColor }) => {
  const [progress, setProgress] = useState(0);

  const anchor = useMemo(() => {
    if (!activeLobe) return null;
    const c = LOBE_CENTERS[activeLobe];
    if (!c) return null;
    return new THREE.Vector3(c[0], c[1] + ANATOMY.brainCenterY, c[2]);
  }, [activeLobe]);

  const branches = useMemo(() => {
    if (!anchor) return [];
    return Array.from({ length: 10 }, (_, i) => {
      const theta = (i / 10) * Math.PI * 2;
      const lift = 0.018 + (i % 3) * 0.009;
      const end = new THREE.Vector3(
        anchor.x + Math.cos(theta) * 0.04,
        anchor.y + lift,
        anchor.z + Math.sin(theta) * 0.032,
      );
      const mid = anchor.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 0.005, 0));
      return [anchor, mid, end];
    });
  }, [anchor]);

  useEffect(() => {
    if (!anchor) { setProgress(0); return; }
    const s = { value: 0 };
    const tw = gsap.to(s, {
      value: 1, duration: 0.8, delay: 0.1, ease: 'power2.out',
      onUpdate: () => setProgress(s.value),
    });
    return () => tw.kill();
  }, [anchor, activeLobe]);

  if (!anchor || progress <= 0) return null;

  return (
    <group>
      {branches.map((b, i) => {
        const endPt = b[2].clone().lerp(b[0], 1 - progress);
        const geo = new THREE.BufferGeometry().setFromPoints([b[0], b[1], endPt]);
        return (
          <React.Fragment key={i}>
            <line geometry={geo}>
              <lineBasicMaterial color={activeColor || '#F4C4CE'} transparent opacity={0.12 + progress * 0.5} />
            </line>
            <mesh position={endPt.toArray()}>
              <sphereGeometry args={[0.003 + progress * 0.003, 8, 8]} />
              <meshBasicMaterial color={activeColor || '#F4C4CE'} transparent opacity={0.25 + progress * 0.45} />
            </mesh>
          </React.Fragment>
        );
      })}
    </group>
  );
};

/* ═══════════════════ Camera Rig (GSAP – medical viewer) ═══════════════════
   • Auto-fits model on first mount
   • Zooms to body sensor OR brain lobe on activation
   • Smooth GSAP transitions (1.2-1.8 s)  with power2.inOut
   • Dynamically updates OrbitControls.target
   ═══════════════════════════════════════════════════════════════════════ */

/* Full-body default — computed so the 2.66-unit model fits with 12 % padding
   at FOV 47 °:  halfH = 2.66/2 * 1.12 = 1.49 → dist = 1.49 / tan(23.5°) ≈ 3.43 */
const DEFAULT_CAM    = { x: 0, y: 0.35, z: 3.45 };
const DEFAULT_TARGET = { x: 0, y: 0.35, z: 0 };

/* ── Brain-lobe focus ── */
const LOBE_FOCUS = {
  motor_left:  { target: { x: -0.07, y: 1.57, z: 0.02 }, cam: { x: -0.40, y: 1.62, z: 0.70 } },
  motor_right: { target: { x:  0.07, y: 1.57, z: 0.02 }, cam: { x:  0.40, y: 1.62, z: 0.70 } },
  parietal:    { target: { x: 0, y: 1.61, z: -0.02 },     cam: { x: 0,     y: 1.65, z: 0.68 } },
  occipital:   { target: { x: 0, y: 1.54, z: -0.08 },     cam: { x: 0,     y: 1.58, z: 0.65 } },
  temporal:    { target: { x: -0.09, y: 1.53, z: 0.02 },  cam: { x: -0.50, y: 1.56, z: 0.78 } },
  broca:       { target: { x: -0.07, y: 1.54, z: 0.05 },  cam: { x: -0.44, y: 1.58, z: 0.72 } },
  frontal:     { target: { x: 0, y: 1.58, z: 0.08 },      cam: { x: 0,     y: 1.60, z: 0.66 } },
};

/* ── Body-sensor focus (hands / legs / skin) ── */
const SENSOR_FOCUS = {
  right_hand: { target: { x: 0.95, y: 0.33, z: 0.22 }, cam: { x: 1.25, y: 0.50, z: 1.10 } },
  left_hand:  { target: { x:-0.95, y: 0.33, z: 0.22 }, cam: { x:-1.25, y: 0.50, z: 1.10 } },
  right_leg:  { target: { x: 0.26, y:-0.55, z: 0.11 }, cam: { x: 0.55, y:-0.30, z: 1.35 } },
  left_leg:   { target: { x:-0.26, y:-0.55, z: 0.11 }, cam: { x:-0.55, y:-0.30, z: 1.35 } },
  skin:       { target: { x: 0, y: 0.70, z: 0.16 },    cam: { x: 0.40, y: 0.80, z: 1.30 } },
};

const CameraRig = ({ controlsRef, activeLobe, activeSensor, resetTrigger }) => {
  const { camera } = useThree();
  const tweens = useRef([]);
  const initialised = useRef(false);
  const followMode = useRef(false);
  const _tmpTarget = useMemo(() => new THREE.Vector3(), []);
  const _tmpCam = useMemo(() => new THREE.Vector3(), []);

  /* Kill any running tweens */
  const killTweens = useCallback(() => {
    tweens.current.forEach((tw) => tw.kill());
    tweens.current = [];
  }, []);

  /* Shared animate helper — targets both camera.position and controls.target */
  const animateTo = useCallback((target, cam, duration) => {
    if (!controlsRef.current) return;
    killTweens();
    const onUpdate = () => controlsRef.current?.update();
    tweens.current.push(
      gsap.to(controlsRef.current.target, { ...target, duration, ease: 'power2.inOut', onUpdate }),
      gsap.to(camera.position, { ...cam, duration, ease: 'power2.inOut', onUpdate }),
    );
  }, [camera, controlsRef, killTweens]);

  /* ── Initial auto-fit on mount ── */
  useEffect(() => {
    if (initialised.current || !controlsRef.current) return;
    initialised.current = true;
    controlsRef.current.target.set(DEFAULT_TARGET.x, DEFAULT_TARGET.y, DEFAULT_TARGET.z);
    camera.position.set(DEFAULT_CAM.x, DEFAULT_CAM.y, DEFAULT_CAM.z);
    controlsRef.current.update();
  }, [camera, controlsRef]);

  /* ── Start follow mode when sensor activates ── */
  useEffect(() => {
    if (!controlsRef.current || !initialised.current) return;
    if (activeSensor && NERVE_PATHWAYS[activeSensor]?.length >= 2) {
      followMode.current = true;
      killTweens();
    }
  }, [activeSensor, killTweens, controlsRef]);

  /* ── Per-frame camera follow along signal path ── */
  useFrame(() => {
    if (!controlsRef.current || !followMode.current) return;
    if (!SIGNAL_STATE.pathCurve || !SIGNAL_STATE.camCurve) return;

    const p = Math.max(0, Math.min(SIGNAL_STATE.progress, 0.999));
    SIGNAL_STATE.camCurve.getPointAt(p, _tmpCam);
    SIGNAL_STATE.pathCurve.getPointAt(p, _tmpTarget);

    /* Dynamic lerp — faster when far, smoother when close */
    const dist = camera.position.distanceTo(_tmpCam);
    const lerpFactor = Math.min(0.12, Math.max(0.04, dist * 0.07));

    camera.position.lerp(_tmpCam, lerpFactor);
    controlsRef.current.target.lerp(_tmpTarget, lerpFactor);
    controlsRef.current.update();
  });

  /* ── Transition to brain lobe when signal arrives ── */
  useEffect(() => {
    if (!controlsRef.current || !initialised.current) return;
    if (activeLobe) {
      followMode.current = false;
      const lobeFocus = LOBE_FOCUS[activeLobe];
      if (lobeFocus) {
        animateTo(lobeFocus.target, lobeFocus.cam, 1.2);
      }
    }
  }, [activeLobe, animateTo, controlsRef]);

  /* ── Return to default when nothing is active ── */
  useEffect(() => {
    if (!controlsRef.current || !initialised.current) return;
    if (!activeSensor && !activeLobe) {
      followMode.current = false;
      animateTo(DEFAULT_TARGET, DEFAULT_CAM, 1.2);
    }
  }, [activeSensor, activeLobe, animateTo, controlsRef]);

  /* ── Reset button ── */
  useEffect(() => {
    if (!controlsRef.current || !initialised.current) return;
    followMode.current = false;
    animateTo(DEFAULT_TARGET, DEFAULT_CAM, 1.2);
  }, [resetTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Cleanup on unmount */
  useEffect(() => () => killTweens(), [killTweens]);

  return null;
};

/* ═══════════════════ Bloom (minimal medical) ═══════════════════ */
const BloomEffect = () => {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef(null);

  useEffect(() => {
    const composer = new ThreeEffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.18,  // strength — very subtle
      0.22,  // radius
      0.82,  // threshold — only brightest elements bloom
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    composerRef.current = composer;
    return () => composer.dispose();
  }, [gl, scene, camera]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { composerRef.current?.setSize(size.width, size.height); }, [size]);

  useFrame((_, delta) => {
    if (composerRef.current) {
      gl.autoClear = false;
      gl.clear();
      composerRef.current.render(delta);
    }
  }, 1);

  return null;
};

/* ═══════════════════ Clickable Body Zones (Raycasting) ═══════════════════ */
const CLICK_ZONES = Object.entries(SENSOR_POSITIONS).map(([sensor, pos]) => {
  const isLimb = sensor.includes('hand') || sensor.includes('leg');
  return { sensor, pos: [pos.x, pos.y, pos.z], radius: isLimb ? 0.10 : 0.06 };
});

const BodyClickZones = () => {
  const activateSensor = useStore((s) => s.activateSensor);

  const handleClick = useCallback((sensor) => (e) => {
    e.stopPropagation();
    activateSensor({ sensor, intensity: 1.0 });
  }, [activateSensor]);

  return (
    <group>
      {CLICK_ZONES.map(({ sensor, pos, radius }) => (
        <mesh
          key={sensor}
          position={pos}
          onClick={handleClick(sensor)}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <sphereGeometry args={[radius, 12, 12]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      ))}
    </group>
  );
};

/* ═══════════════════ Human Body Group ═══════════════════ */
const HumanBody = ({ activeSensor, xrayMode, skinTransparency, showSkeleton, nervousSystemView }) => (
  <group>
    <SkinMesh xrayMode={xrayMode} skinTransparency={skinTransparency} />
    <SkeletonLayer visible={showSkeleton} />
    <PeripheralNervousSystem visible={nervousSystemView} activeSensor={activeSensor} />
    <SensorHighlights activeSensor={activeSensor} />
    {activeSensor && <TouchHighlight sensor={activeSensor} />}
    <BodyClickZones />
  </group>
);

/* ═══════════════════ Scene Background Syncer ═══════════════════ */
const SceneBackground = () => {
  const { scene } = useThree();
  const darkMode = useStore((s) => s.darkMode);

  useEffect(() => {
    if (darkMode) {
      scene.background = new THREE.Color('#0A0E17');
    } else {
      scene.background = null; // transparent — shows CSS background
    }
  }, [darkMode, scene]);

  return null;
};

/* ═══════════════════ Scene ═══════════════════ */
const Scene = () => {
  const controlsRef = useRef();
  const {
    activeSensor, activeLobe, activeColor, neuralImpulses,
    xrayMode, nervousSystemView, showSkeleton, skinTransparency, resetViewTrigger, darkMode,
  } = useStore();

  return (
    <>
      <SceneBackground />

      {/* ── Adaptive lighting ── */}
      <ambientLight intensity={darkMode ? 0.35 : 0.58} color="#FFFFFF" />
      <directionalLight
        position={[0, 4, 2]} intensity={darkMode ? 0.9 : 1.2} color={darkMode ? '#E8ECF4' : '#FAFBFF'}
        castShadow shadow-mapSize-width={512} shadow-mapSize-height={512}
      />
      <directionalLight position={[-2.5, 2, -1.5]} intensity={darkMode ? 0.25 : 0.40} color="#F0F2F8" />
      <pointLight position={[1.5, 1.6, 1.2]} intensity={darkMode ? 0.15 : 0.2} color="#FFF8F0" />
      <directionalLight position={[0, -1, 1]} intensity={0.10} color="#E8ECF4" />

      {/* Ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, ANATOMY.feetY - 0.01, 0]} receiveShadow>
        <planeGeometry args={[2.5, 2.5]} />
        <shadowMaterial transparent opacity={0.06} />
      </mesh>

      <HumanBody
        activeSensor={activeSensor}
        xrayMode={xrayMode}
        skinTransparency={skinTransparency}
        showSkeleton={showSkeleton}
        nervousSystemView={nervousSystemView}
      />

      <SegmentedBrain activeLobe={activeLobe} />
      <NeuronBurst activeLobe={activeLobe} activeColor={activeColor} />

      {nervousSystemView && neuralImpulses?.map((imp) => (
        <SignalFlow key={imp.id} impulse={imp} />
      ))}

      <BloomEffect />

      <OrbitControls
        ref={controlsRef}
        enablePan
        panSpeed={0.4}
        enableZoom
        zoomSpeed={0.8}
        minDistance={0.35}
        maxDistance={5.5}
        maxPolarAngle={Math.PI * 0.88}
        minPolarAngle={Math.PI * 0.08}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        /* no hardcoded target — CameraRig manages it dynamically */
      />
      <CameraRig controlsRef={controlsRef} activeLobe={activeLobe} activeSensor={activeSensor} resetTrigger={resetViewTrigger} />
    </>
  );
};

/* ═══════════════════ Canvas ═══════════════════ */
const Brain3D = () => (
  <div className="w-full h-full" style={{ position: 'fixed', inset: 0 }}>
    <Canvas
      camera={{ position: [0, 0.35, 3.45], fov: 47, near: 0.01, far: 50 }}
      dpr={[1, 1.75]}
      shadows
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.12,
      }}
      onCreated={({ gl }) => {
        gl.physicallyCorrectLights = true;
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
      style={{ background: 'transparent' }}
    >
      <Scene />
    </Canvas>
  </div>
);

export default Brain3D;
