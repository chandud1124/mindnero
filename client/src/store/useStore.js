import { create } from 'zustand';

/* ═══════════════════ Lobe Colors (Anatomy Textbook Standard) ═══════════════════ */
export const LOBE_COLORS = {
  frontal:   '#7CB9E8', // light blue
  parietal:  '#77DD77', // green
  temporal:  '#FFB347', // orange
  occipital: '#B19CD9', // purple
  motor:     '#E8686A', // red strip
  broca:     '#CC7722', // dark orange patch
};

/* ═══════════════════ Brain Mapping ═══════════════════ */
export const BRAIN_MAPPING = {
  right_hand: {
    name: 'Left Motor Cortex',
    lobe: 'Left Motor Cortex',
    lobeId: 'motor_left',
    hemisphere: 'left',
    color: LOBE_COLORS.motor,
    description:
      'Primary motor cortex (M1) — controls voluntary movement of the contralateral (right) upper extremity via the lateral corticospinal tract.',
  },
  left_hand: {
    name: 'Right Motor Cortex',
    lobe: 'Right Motor Cortex',
    lobeId: 'motor_right',
    hemisphere: 'right',
    color: LOBE_COLORS.motor,
    description:
      'Primary motor cortex (M1) — controls voluntary movement of the contralateral (left) upper extremity via the lateral corticospinal tract.',
  },
  eye: {
    name: 'Occipital Lobe',
    lobe: 'Occipital Lobe',
    lobeId: 'occipital',
    hemisphere: 'both',
    color: LOBE_COLORS.occipital,
    description:
      'Primary visual cortex (V1) — receives afferent signals from the lateral geniculate nucleus of the thalamus for visual processing.',
  },
  ear: {
    name: 'Temporal Lobe',
    lobe: 'Temporal Lobe',
    lobeId: 'temporal',
    hemisphere: 'left',
    color: LOBE_COLORS.temporal,
    description:
      "Primary auditory cortex (A1) in Heschl's gyrus — processes tonotopic input from the medial geniculate body.",
  },
  mouth: {
    name: "Broca's Area",
    lobe: "Broca's Area",
    lobeId: 'broca',
    hemisphere: 'left',
    color: LOBE_COLORS.broca,
    description:
      "Broca's area (BA 44 / 45) — motor speech production centre; lesions cause expressive (non-fluent) aphasia.",
  },
  forehead: {
    name: 'Frontal Lobe',
    lobe: 'Frontal Lobe',
    lobeId: 'frontal',
    hemisphere: 'both',
    color: LOBE_COLORS.frontal,
    description:
      'Dorsolateral prefrontal cortex — executive functions including planning, working memory, and cognitive flexibility.',
  },
  right_leg: {
    name: 'Left Paracentral Lobule',
    lobe: 'Left Motor Cortex (Leg Area)',
    lobeId: 'motor_left',
    hemisphere: 'left',
    color: LOBE_COLORS.motor,
    description:
      'Paracentral lobule — medial surface of primary motor cortex (M1) controlling voluntary movement of the contralateral (right) lower extremity via the lateral corticospinal tract.',
  },
  left_leg: {
    name: 'Right Paracentral Lobule',
    lobe: 'Right Motor Cortex (Leg Area)',
    lobeId: 'motor_right',
    hemisphere: 'right',
    color: LOBE_COLORS.motor,
    description:
      'Paracentral lobule — medial surface of primary motor cortex (M1) controlling voluntary movement of the contralateral (left) lower extremity via the lateral corticospinal tract.',
  },
};

/* ═══════════════════ Sensor Positions (A-pose body — Sketchfab basemesh) ═══════════════════ */
export const SENSOR_POSITIONS = {
  right_hand: { x: 0.95, y: 0.33, z: 0.22 },
  left_hand:  { x: -0.95, y: 0.33, z: 0.22 },
  eye:        { x: 0.0, y: 1.50, z: 0.14 },
  ear:        { x: -0.12, y: 1.45, z: 0.0 },
  mouth:      { x: 0.0, y: 1.36, z: 0.11 },
  forehead:   { x: 0.0, y: 1.62, z: 0.11 },
  right_leg:  { x: 0.26, y: -0.98, z: 0.11 },
  left_leg:   { x: -0.26, y: -0.98, z: 0.11 },
};

/* ═══════════════════════════════════════════════════════════════════════
   ANATOMICAL SIGNAL PATHWAYS
   Each sensor's exact signal route from peripheral receptor → brain.
   Follows real nerve anatomy with decussation at medulla.
   ═══════════════════════════════════════════════════════════════════════ */
export const NERVE_PATHWAYS = {
  /* ── Right hand → Left motor cortex ──
     Digital nn. → Median n. → Brachial plexus → Dorsal column → Medulla decussation → Left M1 */
  right_hand: [
    { x: 0.95, y: 0.33, z: 0.22 },   // fingertips
    { x: 0.91, y: 0.36, z: 0.21 },   // palm (digital nerves)
    { x: 0.84, y: 0.41, z: 0.18 },   // wrist — carpal tunnel
    { x: 0.78, y: 0.47, z: 0.14 },   // forearm anterior
    { x: 0.72, y: 0.54, z: 0.10 },   // mid-forearm
    { x: 0.65, y: 0.61, z: 0.05 },   // proximal forearm
    { x: 0.60, y: 0.69, z: 0.02 },   // elbow — antecubital fossa
    { x: 0.52, y: 0.79, z: -0.01 },  // upper arm medial
    { x: 0.44, y: 0.88, z: -0.02 },  // mid upper arm
    { x: 0.33, y: 0.99, z: -0.02 },  // brachial plexus trunks
    { x: 0.23, y: 1.08, z: -0.02 },  // supraclavicular
    { x: 0.11, y: 1.15, z: -0.03 },  // cervical root (C6-C7)
    { x: 0.04, y: 1.20, z: -0.03 },  // dorsal column entry
    { x: 0.00, y: 1.28, z: -0.03 },  // ascending spinal cord
    { x: 0.00, y: 1.33, z: -0.03 },  // upper cervical cord
    { x: 0.00, y: 1.38, z: -0.02 },  // medulla oblongata
    { x: -0.01, y: 1.42, z: -0.01 }, // DECUSSATION (pyramidal)
    { x: -0.03, y: 1.46, z: 0.00 },  // contralateral ascent
    { x: -0.05, y: 1.50, z: 0.01 },  // internal capsule
    { x: -0.06, y: 1.53, z: 0.02 },  // corona radiata
    { x: -0.08, y: 1.57, z: 0.03 },  // left motor cortex (M1)
  ],
  /* ── Left hand → Right motor cortex (mirror) ── */
  left_hand: [
    { x: -0.95, y: 0.33, z: 0.22 },
    { x: -0.91, y: 0.36, z: 0.21 },
    { x: -0.84, y: 0.41, z: 0.18 },
    { x: -0.78, y: 0.47, z: 0.14 },
    { x: -0.72, y: 0.54, z: 0.10 },
    { x: -0.65, y: 0.61, z: 0.05 },
    { x: -0.60, y: 0.69, z: 0.02 },
    { x: -0.52, y: 0.79, z: -0.01 },
    { x: -0.44, y: 0.88, z: -0.02 },
    { x: -0.33, y: 0.99, z: -0.02 },
    { x: -0.23, y: 1.08, z: -0.02 },
    { x: -0.11, y: 1.15, z: -0.03 },
    { x: -0.04, y: 1.20, z: -0.03 },
    { x: 0.00, y: 1.28, z: -0.03 },
    { x: 0.00, y: 1.33, z: -0.03 },
    { x: 0.00, y: 1.38, z: -0.02 },
    { x: 0.01, y: 1.42, z: -0.01 },
    { x: 0.03, y: 1.46, z: 0.00 },
    { x: 0.05, y: 1.50, z: 0.01 },
    { x: 0.06, y: 1.53, z: 0.02 },
    { x: 0.08, y: 1.57, z: 0.03 },
  ],
  /* ── Eye → Occipital lobe  (CN II → chiasm → LGN → V1) ── */
  eye: [
    { x: 0.00, y: 1.50, z: 0.11 },
    { x: 0.00, y: 1.48, z: 0.08 },
    { x: 0.00, y: 1.46, z: 0.05 },
    { x: 0.00, y: 1.44, z: 0.02 },
    { x: 0.00, y: 1.42, z: -0.01 },
    { x: 0.00, y: 1.40, z: -0.04 },
    { x: 0.00, y: 1.39, z: -0.06 },
    { x: 0.00, y: 1.38, z: -0.08 },
  ],
  /* ── Ear → Temporal lobe  (CN VIII → cochlear nucleus → MGN → A1) ── */
  ear: [
    { x: -0.12, y: 1.45, z: 0.00 },
    { x: -0.09, y: 1.44, z: -0.01 },
    { x: -0.06, y: 1.43, z: -0.01 },
    { x: -0.03, y: 1.40, z: -0.02 },
    { x: -0.05, y: 1.39, z: -0.01 },
    { x: -0.08, y: 1.38, z: 0.00 },
    { x: -0.09, y: 1.38, z: 0.01 },
  ],
  /* ── Mouth → Broca's area  (CN VII/XII → pons → BA 44/45) ── */
  mouth: [
    { x: 0.00, y: 1.36, z: 0.10 },
    { x: -0.02, y: 1.37, z: 0.08 },
    { x: -0.03, y: 1.38, z: 0.05 },
    { x: -0.02, y: 1.37, z: 0.02 },
    { x: -0.04, y: 1.39, z: 0.03 },
    { x: -0.06, y: 1.41, z: 0.05 },
    { x: -0.07, y: 1.40, z: 0.05 },
  ],
  /* ── Forehead → Frontal lobe  (CN V₁ → trigeminal ganglion → PFC) ── */
  forehead: [
    { x: 0.00, y: 1.62, z: 0.08 },
    { x: 0.00, y: 1.60, z: 0.07 },
    { x: 0.00, y: 1.57, z: 0.05 },
    { x: 0.00, y: 1.54, z: 0.04 },
    { x: 0.00, y: 1.52, z: 0.06 },
    { x: 0.00, y: 1.51, z: 0.08 },
  ],
  /* ── Right leg → Left motor cortex (Paracentral lobule)
     Digital nn. → Tibial n. → Sciatic n. → Sacral plexus → Cauda equina →
     Conus medullaris → Dorsal column → Medulla decussation → Left paracentral lobule ── */
  right_leg: [
    { x: 0.26, y: -0.98, z: 0.11 },   // toes
    { x: 0.25, y: -0.94, z: 0.08 },   // dorsum of foot
    { x: 0.24, y: -0.88, z: 0.03 },   // ankle (tarsal tunnel)
    { x: 0.23, y: -0.80, z: -0.02 },  // lower calf
    { x: 0.22, y: -0.72, z: -0.06 },  // mid calf
    { x: 0.21, y: -0.64, z: -0.10 },  // upper calf
    { x: 0.21, y: -0.56, z: -0.13 },  // popliteal fossa (behind knee)
    { x: 0.20, y: -0.48, z: -0.14 },  // lower thigh
    { x: 0.20, y: -0.40, z: -0.14 },  // mid thigh (sciatic nerve)
    { x: 0.20, y: -0.32, z: -0.12 },  // upper thigh
    { x: 0.19, y: -0.24, z: -0.10 },  // proximal thigh
    { x: 0.16, y: -0.16, z: -0.07 },  // gluteal region
    { x: 0.12, y: -0.08, z: -0.05 },  // sacral plexus (L4-S3)
    { x: 0.08, y: 0.00, z: -0.04 },   // lumbosacral trunk
    { x: 0.04, y: 0.10, z: -0.03 },   // cauda equina root (L3-L4)
    { x: 0.02, y: 0.22, z: -0.03 },   // ascending cauda equina
    { x: 0.00, y: 0.35, z: -0.03 },   // conus medullaris — SPINAL CORD ENTRY
    { x: 0.00, y: 0.50, z: -0.03 },   // lower thoracic cord (T12)
    { x: 0.00, y: 0.65, z: -0.03 },   // mid thoracic cord (T8)
    { x: 0.00, y: 0.80, z: -0.03 },   // upper thoracic cord (T4)
    { x: 0.00, y: 0.95, z: -0.03 },   // lower cervical cord (C7)
    { x: 0.00, y: 1.10, z: -0.03 },   // cervical cord (C4)
    { x: 0.00, y: 1.27, z: -0.03 },   // cervicomedullary junction
    { x: 0.00, y: 1.33, z: -0.03 },   // lower medulla
    { x: 0.00, y: 1.38, z: -0.02 },   // medulla oblongata — BRAIN ENTRY
    { x: -0.01, y: 1.42, z: -0.01 },  // DECUSSATION (pyramidal)
    { x: -0.02, y: 1.46, z: 0.00 },   // contralateral midbrain
    { x: -0.03, y: 1.50, z: 0.00 },   // thalamus (VPL nucleus)
    { x: -0.04, y: 1.54, z: -0.01 },  // corona radiata
    { x: -0.04, y: 1.58, z: 0.00 },   // left paracentral lobule (leg area M1)
  ],
  /* ── Left leg → Right motor cortex (mirror) ── */
  left_leg: [
    { x: -0.26, y: -0.98, z: 0.11 },
    { x: -0.25, y: -0.94, z: 0.08 },
    { x: -0.24, y: -0.88, z: 0.03 },
    { x: -0.23, y: -0.80, z: -0.02 },
    { x: -0.22, y: -0.72, z: -0.06 },
    { x: -0.21, y: -0.64, z: -0.10 },
    { x: -0.21, y: -0.56, z: -0.13 },
    { x: -0.20, y: -0.48, z: -0.14 },
    { x: -0.20, y: -0.40, z: -0.14 },
    { x: -0.20, y: -0.32, z: -0.12 },
    { x: -0.19, y: -0.24, z: -0.10 },
    { x: -0.16, y: -0.16, z: -0.07 },
    { x: -0.12, y: -0.08, z: -0.05 },
    { x: -0.08, y: 0.00, z: -0.04 },
    { x: -0.04, y: 0.10, z: -0.03 },
    { x: -0.02, y: 0.22, z: -0.03 },
    { x: 0.00, y: 0.35, z: -0.03 },
    { x: 0.00, y: 0.50, z: -0.03 },
    { x: 0.00, y: 0.65, z: -0.03 },
    { x: 0.00, y: 0.80, z: -0.03 },
    { x: 0.00, y: 0.95, z: -0.03 },
    { x: 0.00, y: 1.10, z: -0.03 },
    { x: 0.00, y: 1.27, z: -0.03 },
    { x: 0.00, y: 1.33, z: -0.03 },
    { x: 0.00, y: 1.38, z: -0.02 },
    { x: 0.01, y: 1.42, z: -0.01 },
    { x: 0.02, y: 1.46, z: 0.00 },
    { x: 0.03, y: 1.50, z: 0.00 },
    { x: 0.04, y: 1.54, z: -0.01 },
    { x: 0.04, y: 1.58, z: 0.00 },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════
   STRUCTURAL NERVE ANATOMY
   Always-visible nerve pathways forming the peripheral & central NS.
   Each entry: { path: [[x,y,z], ...], radius, label? }
   ═══════════════════════════════════════════════════════════════════════ */
export const NERVE_ANATOMY = {
  /* ── Central ── */
  spinalCord: {
    path: [[0,1.27,-0.03],[0,1.20,-0.03],[0,1.10,-0.03],[0,0.95,-0.03],[0,0.75,-0.03],[0,0.55,-0.03],[0,0.38,-0.03],[0,0.35,-0.03]],
    radius: 0.007,
    label: 'Spinal Cord (C1–L1)',
  },
  brainstem: {
    path: [[0,1.27,-0.03],[0,1.31,-0.025],[0,1.36,-0.015],[0,1.41,-0.005],[0,1.45,0.0]],
    radius: 0.006,
  },
  /* ── Conus Medullaris (tapered end of spinal cord at L1-L2) ── */
  conusMedullaris: {
    path: [[0,0.38,-0.03],[0,0.35,-0.03],[0,0.33,-0.035]],
    radius: 0.005,
  },
  /* ── Cauda Equina (horse-tail nerve roots below conus, L2–S5) ── */
  caudaEquina_L2_R: { path: [[0,0.35,-0.03],[0.02,0.28,-0.030],[0.04,0.20,-0.028],[0.06,0.12,-0.020]], radius: 0.002 },
  caudaEquina_L3_R: { path: [[0,0.35,-0.03],[0.03,0.26,-0.032],[0.05,0.16,-0.030],[0.07,0.06,-0.025]], radius: 0.002 },
  caudaEquina_L4_R: { path: [[0,0.35,-0.03],[0.04,0.24,-0.035],[0.06,0.12,-0.035],[0.08,0.00,-0.030]], radius: 0.002 },
  caudaEquina_L5_R: { path: [[0,0.35,-0.03],[0.04,0.22,-0.038],[0.07,0.08,-0.040],[0.09,-0.04,-0.038]], radius: 0.002 },
  caudaEquina_S1_R: { path: [[0,0.35,-0.03],[0.03,0.20,-0.040],[0.06,0.04,-0.042],[0.09,-0.06,-0.040]], radius: 0.0018 },
  caudaEquina_S2_R: { path: [[0,0.35,-0.03],[0.02,0.18,-0.042],[0.04,0.02,-0.045],[0.07,-0.06,-0.042]], radius: 0.0018 },
  caudaEquina_L2_L: { path: [[0,0.35,-0.03],[-0.02,0.28,-0.030],[-0.04,0.20,-0.028],[-0.06,0.12,-0.020]], radius: 0.002 },
  caudaEquina_L3_L: { path: [[0,0.35,-0.03],[-0.03,0.26,-0.032],[-0.05,0.16,-0.030],[-0.07,0.06,-0.025]], radius: 0.002 },
  caudaEquina_L4_L: { path: [[0,0.35,-0.03],[-0.04,0.24,-0.035],[-0.06,0.12,-0.035],[-0.08,0.00,-0.030]], radius: 0.002 },
  caudaEquina_L5_L: { path: [[0,0.35,-0.03],[-0.04,0.22,-0.038],[-0.07,0.08,-0.040],[-0.09,-0.04,-0.038]], radius: 0.002 },
  caudaEquina_S1_L: { path: [[0,0.35,-0.03],[-0.03,0.20,-0.040],[-0.06,0.04,-0.042],[-0.09,-0.06,-0.040]], radius: 0.0018 },
  caudaEquina_S2_L: { path: [[0,0.35,-0.03],[-0.02,0.18,-0.042],[-0.04,0.02,-0.045],[-0.07,-0.06,-0.042]], radius: 0.0018 },

  /* ── Right Brachial Plexus Roots (C5-T1) ── */
  rootC5_R: { path: [[0,1.12,-0.03],[0.07,1.115,-0.02],[0.16,1.11,-0.01],[0.25,1.09,0.0]], radius: 0.0025 },
  rootC6_R: { path: [[0,1.08,-0.03],[0.07,1.075,-0.02],[0.16,1.07,-0.01],[0.25,1.06,0.0]], radius: 0.0025 },
  rootC7_R: { path: [[0,1.04,-0.03],[0.07,1.035,-0.02],[0.16,1.03,-0.01],[0.25,1.02,0.0]], radius: 0.0025 },
  rootC8_R: { path: [[0,1.00,-0.03],[0.07,0.995,-0.02],[0.16,0.99,-0.01],[0.25,0.98,0.0]], radius: 0.0025 },
  rootT1_R: { path: [[0,0.96,-0.03],[0.07,0.955,-0.02],[0.16,0.95,-0.01],[0.25,0.94,0.0]], radius: 0.0025 },

  /* ── Right Terminal Branches ── */
  medianNerve_R: {
    path: [[0.25,1.05,0.00],[0.33,1.00,-0.01],[0.42,0.92,-0.02],[0.50,0.84,-0.02],[0.58,0.74,0.00],[0.65,0.63,0.05],[0.72,0.54,0.10],[0.78,0.47,0.14],[0.84,0.41,0.18],[0.91,0.36,0.21],[0.95,0.33,0.22]],
    radius: 0.003,
  },
  ulnarNerve_R: {
    path: [[0.25,0.98,-0.01],[0.33,0.94,-0.02],[0.42,0.87,-0.02],[0.52,0.80,-0.02],[0.60,0.71,0.00],[0.67,0.62,0.03],[0.73,0.54,0.08],[0.80,0.47,0.13],[0.86,0.40,0.17],[0.93,0.35,0.21]],
    radius: 0.0025,
  },
  radialNerve_R: {
    path: [[0.25,1.08,-0.02],[0.33,1.02,-0.02],[0.44,0.93,-0.03],[0.52,0.84,-0.02],[0.58,0.75,-0.01],[0.65,0.65,0.03],[0.72,0.56,0.08],[0.78,0.48,0.12],[0.84,0.42,0.16]],
    radius: 0.0025,
  },

  /* ── Left Brachial Plexus Roots (C5-T1) ── */
  rootC5_L: { path: [[0,1.12,-0.03],[-0.07,1.115,-0.02],[-0.16,1.11,-0.01],[-0.25,1.09,0.0]], radius: 0.0025 },
  rootC6_L: { path: [[0,1.08,-0.03],[-0.07,1.075,-0.02],[-0.16,1.07,-0.01],[-0.25,1.06,0.0]], radius: 0.0025 },
  rootC7_L: { path: [[0,1.04,-0.03],[-0.07,1.035,-0.02],[-0.16,1.03,-0.01],[-0.25,1.02,0.0]], radius: 0.0025 },
  rootC8_L: { path: [[0,1.00,-0.03],[-0.07,0.995,-0.02],[-0.16,0.99,-0.01],[-0.25,0.98,0.0]], radius: 0.0025 },
  rootT1_L: { path: [[0,0.96,-0.03],[-0.07,0.955,-0.02],[-0.16,0.95,-0.01],[-0.25,0.94,0.0]], radius: 0.0025 },

  /* ── Left Terminal Branches ── */
  medianNerve_L: {
    path: [[-0.25,1.05,0.00],[-0.33,1.00,-0.01],[-0.42,0.92,-0.02],[-0.50,0.84,-0.02],[-0.58,0.74,0.00],[-0.65,0.63,0.05],[-0.72,0.54,0.10],[-0.78,0.47,0.14],[-0.84,0.41,0.18],[-0.91,0.36,0.21],[-0.95,0.33,0.22]],
    radius: 0.003,
  },
  ulnarNerve_L: {
    path: [[-0.25,0.98,-0.01],[-0.33,0.94,-0.02],[-0.42,0.87,-0.02],[-0.52,0.80,-0.02],[-0.60,0.71,0.00],[-0.67,0.62,0.03],[-0.73,0.54,0.08],[-0.80,0.47,0.13],[-0.86,0.40,0.17],[-0.93,0.35,0.21]],
    radius: 0.0025,
  },
  radialNerve_L: {
    path: [[-0.25,1.08,-0.02],[-0.33,1.02,-0.02],[-0.44,0.93,-0.03],[-0.52,0.84,-0.02],[-0.58,0.75,-0.01],[-0.65,0.65,0.03],[-0.72,0.56,0.08],[-0.78,0.48,0.12],[-0.84,0.42,0.16]],
    radius: 0.0025,
  },

  /* ── Right Lumbo-Sacral / Leg ── */
  sciaticNerve_R: {
    path: [[0.10,-0.05,-0.04],[0.14,-0.10,-0.06],[0.17,-0.17,-0.09],[0.19,-0.24,-0.11],[0.20,-0.32,-0.12],[0.20,-0.38,-0.13],[0.20,-0.44,-0.14]],
    radius: 0.004,
  },
  tibialNerve_R: {
    path: [[0.20,-0.44,-0.14],[0.21,-0.52,-0.14],[0.21,-0.60,-0.13],[0.21,-0.68,-0.12],[0.22,-0.76,-0.10],[0.22,-0.84,-0.07],[0.24,-0.90,-0.02],[0.26,-0.96,0.06]],
    radius: 0.003,
  },
  peronealNerve_R: {
    path: [[0.20,-0.44,-0.14],[0.22,-0.52,-0.13],[0.23,-0.60,-0.11],[0.23,-0.68,-0.09],[0.24,-0.76,-0.06],[0.25,-0.84,-0.02],[0.27,-0.94,0.04]],
    radius: 0.0025,
  },
  femoralNerve_R: {
    path: [[0.10,0.00,-0.01],[0.13,-0.06,0.00],[0.16,-0.12,-0.02],[0.18,-0.20,-0.05],[0.19,-0.28,-0.08],[0.20,-0.36,-0.11],[0.20,-0.44,-0.13]],
    radius: 0.003,
  },

  /* ── Left Lumbo-Sacral / Leg ── */
  sciaticNerve_L: {
    path: [[-0.10,-0.05,-0.04],[-0.14,-0.10,-0.06],[-0.17,-0.17,-0.09],[-0.19,-0.24,-0.11],[-0.20,-0.32,-0.12],[-0.20,-0.38,-0.13],[-0.20,-0.44,-0.14]],
    radius: 0.004,
  },
  tibialNerve_L: {
    path: [[-0.20,-0.44,-0.14],[-0.21,-0.52,-0.14],[-0.21,-0.60,-0.13],[-0.21,-0.68,-0.12],[-0.22,-0.76,-0.10],[-0.22,-0.84,-0.07],[-0.24,-0.90,-0.02],[-0.26,-0.96,0.06]],
    radius: 0.003,
  },
  peronealNerve_L: {
    path: [[-0.20,-0.44,-0.14],[-0.22,-0.52,-0.13],[-0.23,-0.60,-0.11],[-0.23,-0.68,-0.09],[-0.24,-0.76,-0.06],[-0.25,-0.84,-0.02],[-0.27,-0.94,0.04]],
    radius: 0.0025,
  },
  femoralNerve_L: {
    path: [[-0.10,0.00,-0.01],[-0.13,-0.06,0.00],[-0.16,-0.12,-0.02],[-0.18,-0.20,-0.05],[-0.19,-0.28,-0.08],[-0.20,-0.36,-0.11],[-0.20,-0.44,-0.13]],
    radius: 0.003,
  },

  /* ── Cranial Nerves ── */
  opticNerve_R: { path: [[0.03,1.50,0.10],[0.02,1.48,0.08],[0.01,1.47,0.05],[0.0,1.45,0.02]], radius: 0.003 },
  opticNerve_L: { path: [[-0.03,1.50,0.10],[-0.02,1.48,0.08],[-0.01,1.47,0.05],[0.0,1.45,0.02]], radius: 0.003 },
  opticTract: { path: [[0.0,1.45,0.02],[0.0,1.43,-0.01],[0.0,1.41,-0.04],[0.0,1.39,-0.06]], radius: 0.0025 },
  trigeminalNerve: { path: [[0.05,1.62,0.07],[0.04,1.58,0.06],[0.03,1.50,0.04],[0.0,1.44,0.01]], radius: 0.002 },
  facialNerve: { path: [[0.04,1.36,0.09],[0.05,1.38,0.06],[0.04,1.37,0.03],[0.0,1.34,0.01]], radius: 0.002 },
  vestibulocochlear: { path: [[-0.10,1.45,0.0],[-0.07,1.43,-0.01],[-0.04,1.41,-0.01],[-0.01,1.39,-0.01]], radius: 0.002 },

  /* ── Intercostal Nerves (Thoracic spinal branches) ── */
  intercostalT2_R: { path: [[0,1.00,-0.03],[0.04,0.995,-0.015],[0.09,0.99,0.005],[0.15,0.98,0.025],[0.18,0.97,0.03]], radius: 0.002 },
  intercostalT3_R: { path: [[0,0.92,-0.03],[0.04,0.915,-0.015],[0.09,0.91,0.005],[0.15,0.90,0.025],[0.18,0.89,0.03]], radius: 0.002 },
  intercostalT4_R: { path: [[0,0.84,-0.03],[0.04,0.835,-0.015],[0.09,0.83,0.005],[0.15,0.82,0.025],[0.18,0.81,0.03]], radius: 0.002 },
  intercostalT6_R: { path: [[0,0.70,-0.03],[0.04,0.695,-0.015],[0.09,0.69,0.005],[0.15,0.68,0.025],[0.16,0.67,0.03]], radius: 0.002 },
  intercostalT8_R: { path: [[0,0.56,-0.03],[0.04,0.555,-0.015],[0.09,0.55,0.005],[0.14,0.54,0.025]], radius: 0.002 },
  intercostalT10_R: { path: [[0,0.44,-0.03],[0.04,0.435,-0.015],[0.09,0.43,0.005],[0.14,0.42,0.02]], radius: 0.002 },
  intercostalT2_L: { path: [[0,1.00,-0.03],[-0.04,0.995,-0.015],[-0.09,0.99,0.005],[-0.15,0.98,0.025],[-0.18,0.97,0.03]], radius: 0.002 },
  intercostalT3_L: { path: [[0,0.92,-0.03],[-0.04,0.915,-0.015],[-0.09,0.91,0.005],[-0.15,0.90,0.025],[-0.18,0.89,0.03]], radius: 0.002 },
  intercostalT4_L: { path: [[0,0.84,-0.03],[-0.04,0.835,-0.015],[-0.09,0.83,0.005],[-0.15,0.82,0.025],[-0.18,0.81,0.03]], radius: 0.002 },
  intercostalT6_L: { path: [[0,0.70,-0.03],[-0.04,0.695,-0.015],[-0.09,0.69,0.005],[-0.15,0.68,0.025],[-0.16,0.67,0.03]], radius: 0.002 },
  intercostalT8_L: { path: [[0,0.56,-0.03],[-0.04,0.555,-0.015],[-0.09,0.55,0.005],[-0.14,0.54,0.025]], radius: 0.002 },
  intercostalT10_L: { path: [[0,0.44,-0.03],[-0.04,0.435,-0.015],[-0.09,0.43,0.005],[-0.14,0.42,0.02]], radius: 0.002 },

  /* ── Dorsal Rami (posterior spinal branches) ── */
  dorsalT3_R: { path: [[0,0.92,-0.03],[0.02,0.915,-0.05],[0.04,0.91,-0.065]], radius: 0.0015 },
  dorsalT6_R: { path: [[0,0.70,-0.03],[0.02,0.695,-0.05],[0.04,0.69,-0.065]], radius: 0.0015 },
  dorsalL1_R: { path: [[0,0.34,-0.03],[0.02,0.335,-0.05],[0.04,0.33,-0.065]], radius: 0.0015 },
  dorsalL3_R: { path: [[0,0.18,-0.03],[0.02,0.175,-0.05],[0.04,0.17,-0.065]], radius: 0.0015 },
  dorsalT3_L: { path: [[0,0.92,-0.03],[-0.02,0.915,-0.05],[-0.04,0.91,-0.065]], radius: 0.0015 },
  dorsalT6_L: { path: [[0,0.70,-0.03],[-0.02,0.695,-0.05],[-0.04,0.69,-0.065]], radius: 0.0015 },
  dorsalL1_L: { path: [[0,0.34,-0.03],[-0.02,0.335,-0.05],[-0.04,0.33,-0.065]], radius: 0.0015 },
  dorsalL3_L: { path: [[0,0.18,-0.03],[-0.02,0.175,-0.05],[-0.04,0.17,-0.065]], radius: 0.0015 },

  /* ── Lumbar Plexus Detail ── */
  obturatorNerve_R: { path: [[0.06,-0.02,-0.02],[0.10,-0.08,0.00],[0.14,-0.14,-0.02],[0.17,-0.22,-0.05]], radius: 0.0022 },
  obturatorNerve_L: { path: [[-0.06,-0.02,-0.02],[-0.10,-0.08,0.00],[-0.14,-0.14,-0.02],[-0.17,-0.22,-0.05]], radius: 0.0022 },
  ilioinguinal_R: { path: [[0.02,0.06,-0.03],[0.06,0.04,-0.01],[0.10,0.02,0.00],[0.14,0.00,0.01]], radius: 0.0018 },
  ilioinguinal_L: { path: [[-0.02,0.06,-0.03],[-0.06,0.04,-0.01],[-0.10,0.02,0.00],[-0.14,0.00,0.01]], radius: 0.0018 },
};

/* ═══════════════════ Store ═══════════════════ */
const useStore = create((set, get) => ({
  isConnected: false,
  connectionStatus: 'disconnected',
  activeSensor: null,
  activeLobe: null,
  activeColor: null,
  activationHistory: [],
  neuralImpulses: [],
  soundEnabled: true,
  showInfo: false,
  infoContent: null,
  xrayMode: false,
  nervousSystemView: true,
  showSkeleton: false,
  skinTransparency: 0.20,
  neuralSpeed: 1.0,
  resetViewTrigger: 0,

  setConnectionStatus: (status) =>
    set({ connectionStatus: status, isConnected: status === 'connected' }),

  activateSensor: (sensorData) => {
    const { sensor, intensity } = sensorData;
    const mapping = BRAIN_MAPPING[sensor];
    if (!mapping) return;
    const pathway = NERVE_PATHWAYS[sensor] || [];
    const speed = get().neuralSpeed;

    /* Slow-motion durations scaled by pathway length */
    const isLeg = sensor.includes('leg');
    const isHand = sensor.includes('hand');
    const baseDuration = isLeg ? 2500 / speed : isHand ? 2200 / speed : 1500 / speed;
    const baseDelay = 100 / speed;

    /* Biological synapse delays (ms) at spinal cord entry and brainstem */
    const spinalDelay = (isLeg || isHand) ? 300 / speed : 0;
    const cortexDelay = (isLeg || isHand) ? 300 / speed : 0;

    /* Normalized progress markers along the CatmullRomCurve3 */
    const spinalProgress = isLeg ? 0.48 : isHand ? 0.55 : 0;
    const brainProgress  = isLeg ? 0.82 : isHand ? 0.80 : 0;

    /* Time (ms) when signal arrives at the brain — triggers delayed camera zoom */
    const brainArrivalTime = (isLeg || isHand)
      ? baseDuration * brainProgress + spinalDelay + baseDelay
      : baseDelay + 200;

    /* Total wall-clock time including biological delays */
    const totalTime = baseDuration + spinalDelay + cortexDelay + baseDelay;

    const impulse = {
      id: `${Date.now()}-impulse`,
      sensor, pathway,
      color: mapping.color,
      startTime: Date.now(),
      duration: baseDuration,
      delay: baseDelay,
      intensity: intensity || 1.0,
      spinalDelay, cortexDelay,
      spinalProgress, brainProgress,
    };

    set((s) => ({
      activeSensor: sensor,
      activeLobe: null,
      activeColor: null,
      neuralImpulses: [...s.neuralImpulses, impulse],
      showInfo: false,
      infoContent: null,
      activationHistory: [
        { sensor, lobe: mapping.lobe, time: new Date(), color: mapping.color },
        ...s.activationHistory.slice(0, 19),
      ],
    }));

    /* Delayed brain region activation — camera zooms in after signal reaches cortex */
    setTimeout(() => {
      set((s) => {
        if (s.activeSensor !== sensor) return {};
        return {
          activeLobe: mapping.lobeId,
          activeColor: mapping.color,
          showInfo: true,
          infoContent: { lobe: mapping.lobe, description: mapping.description, color: mapping.color, sensor, pathwayLength: pathway.length },
        };
      });
    }, brainArrivalTime);

    /* Clear activation state */
    setTimeout(() => {
      set((s) => (s.activeSensor === sensor ? { activeSensor: null, activeLobe: null, activeColor: null, showInfo: false, infoContent: null } : {}));
    }, totalTime + 1400);

    /* Remove impulse */
    setTimeout(() => {
      set((s) => ({ neuralImpulses: s.neuralImpulses.filter((i) => i.id !== impulse.id) }));
    }, totalTime + 600);
  },

  clearImpulses: () => set({ neuralImpulses: [] }),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleXrayMode: () => set((s) => ({ xrayMode: !s.xrayMode })),
  toggleNervousSystem: () => set((s) => ({ nervousSystemView: !s.nervousSystemView })),
  toggleSkeleton: () => set((s) => ({ showSkeleton: !s.showSkeleton })),
  setSkinTransparency: (v) => set({ skinTransparency: Math.min(0.85, Math.max(0.05, Number(v) || 0.2)) }),
  setNeuralSpeed: (v) => set({ neuralSpeed: Math.min(3, Math.max(0.25, Number(v) || 1)) }),
  resetView: () => set((s) => ({ resetViewTrigger: s.resetViewTrigger + 1, activeLobe: null })),
  hideInfo: () => set({ showInfo: false, infoContent: null }),
}));

export default useStore;
