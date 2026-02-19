import { create } from 'zustand';

// Brain mapping configuration - Medical color scheme
export const BRAIN_MAPPING = {
  right_hand: {
    lobe: 'Left Motor Cortex',
    lobeId: 'motor_left',
    color: '#4A90E2',
    glowColor: 'rgba(74, 144, 226, 0.6)',
    description: 'Controls voluntary movements of the right side of the body',
    position: { x: -0.08, y: 1.52, z: 0 },
    category: 'motor',
    nervePath: ['right_hand', 'right_forearm', 'right_arm', 'spinal_c5', 'brainstem', 'motor_left']
  },
  left_hand: {
    lobe: 'Right Motor Cortex',
    lobeId: 'motor_right',
    color: '#4A90E2',
    glowColor: 'rgba(74, 144, 226, 0.6)',
    description: 'Controls voluntary movements of the left side of the body',
    position: { x: 0.08, y: 1.52, z: 0 },
    category: 'motor',
    nervePath: ['left_hand', 'left_forearm', 'left_arm', 'spinal_c5', 'brainstem', 'motor_right']
  },
  eye: {
    lobe: 'Occipital Lobe',
    lobeId: 'occipital',
    color: '#B388FF',
    glowColor: 'rgba(179, 136, 255, 0.6)',
    description: 'Processes visual information from the eyes',
    position: { x: 0, y: 1.47, z: -0.08 },
    category: 'vision',
    nervePath: ['eye', 'optic_nerve', 'occipital']
  },
  ear: {
    lobe: 'Temporal Lobe',
    lobeId: 'temporal',
    color: '#66BB6A',
    glowColor: 'rgba(102, 187, 106, 0.6)',
    description: 'Processes auditory information and language comprehension',
    position: { x: -0.09, y: 1.48, z: 0 },
    category: 'hearing',
    nervePath: ['ear', 'auditory_nerve', 'temporal']
  },
  mouth: {
    lobe: "Broca's Area",
    lobeId: 'broca',
    color: '#FF8A65',
    glowColor: 'rgba(255, 138, 101, 0.6)',
    description: 'Controls speech production and language processing',
    position: { x: -0.07, y: 1.51, z: 0.05 },
    category: 'speech',
    nervePath: ['mouth', 'trigeminal_nerve', 'broca']
  },
  forehead: {
    lobe: 'Frontal Lobe',
    lobeId: 'frontal',
    color: '#4DD0E1',
    glowColor: 'rgba(77, 208, 225, 0.6)',
    description: 'Responsible for reasoning, planning, and decision making',
    position: { x: 0, y: 1.55, z: 0.08 },
    category: 'thinking',
    nervePath: ['forehead', 'frontal']
  }
};

// Define nerve pathway waypoints for realistic neural transmission animation
export const NERVE_PATHWAYS = {
  // Right hand to left motor cortex
  right_hand: [
    { x: 0.35, y: -0.35, z: 0 },     // Hand
    { x: 0.3, y: -0.15, z: 0 },      // Wrist
    { x: 0.25, y: 0.05, z: 0 },      // Forearm
    { x: 0.2, y: 0.25, z: 0 },       // Elbow
    { x: 0.15, y: 0.45, z: 0 },      // Upper arm
    { x: 0.1, y: 0.65, z: 0 },       // Shoulder
    { x: 0.05, y: 0.85, z: 0 },      // Spinal C5
    { x: 0.02, y: 1.05, z: 0 },      // Spinal C3
    { x: 0, y: 1.25, z: 0 },         // Brainstem
    { x: -0.04, y: 1.35, z: 0 },     // Thalamus
    { x: -0.08, y: 1.52, z: 0 }      // Left Motor Cortex
  ],
  // Left hand to right motor cortex
  left_hand: [
    { x: -0.35, y: -0.35, z: 0 },    // Hand
    { x: -0.3, y: -0.15, z: 0 },     // Wrist
    { x: -0.25, y: 0.05, z: 0 },     // Forearm
    { x: -0.2, y: 0.25, z: 0 },      // Elbow
    { x: -0.15, y: 0.45, z: 0 },     // Upper arm
    { x: -0.1, y: 0.65, z: 0 },      // Shoulder
    { x: -0.05, y: 0.85, z: 0 },     // Spinal C5
    { x: -0.02, y: 1.05, z: 0 },     // Spinal C3
    { x: 0, y: 1.25, z: 0 },         // Brainstem
    { x: 0.04, y: 1.35, z: 0 },      // Thalamus
    { x: 0.08, y: 1.52, z: 0 }       // Right Motor Cortex
  ],
  // Eye to occipital lobe
  eye: [
    { x: 0, y: 1.75, z: 0.15 },      // Eye
    { x: 0, y: 1.7, z: 0.1 },        // Optic nerve entry
    { x: 0, y: 1.6, z: 0.05 },       // Optic chiasm
    { x: 0, y: 1.5, z: 0 },          // Lateral geniculate nucleus
    { x: 0, y: 1.47, z: -0.08 }      // Occipital lobe
  ],
  // Ear to temporal lobe
  ear: [
    { x: -0.15, y: 1.7, z: 0 },      // Ear
    { x: -0.12, y: 1.65, z: 0 },     // Auditory nerve
    { x: -0.09, y: 1.55, z: 0 },     // Cochlear nucleus
    { x: -0.09, y: 1.48, z: 0 }      // Temporal lobe
  ],
  // Mouth to Broca's area
  mouth: [
    { x: 0, y: 1.65, z: 0.12 },      // Mouth
    { x: -0.03, y: 1.62, z: 0.1 },   // Trigeminal nerve
    { x: -0.05, y: 1.55, z: 0.07 },  // Pons
    { x: -0.07, y: 1.51, z: 0.05 }   // Broca's area
  ],
  // Forehead to frontal lobe
  forehead: [
    { x: 0, y: 1.85, z: 0.1 },       // Forehead
    { x: 0, y: 1.7, z: 0.09 },       // Skin nerve endings
    { x: 0, y: 1.55, z: 0.08 }       // Frontal lobe
  ]
};

// Sensor start positions (actual body positions)
export const SENSOR_POSITIONS = {
  right_hand: { x: 0.35, y: -0.35, z: 0 },
  left_hand: { x: -0.35, y: -0.35, z: 0 },
  eye: { x: 0, y: 1.75, z: 0.15 },
  ear: { x: -0.15, y: 1.7, z: 0 },
  mouth: { x: 0, y: 1.65, z: 0.12 },
  forehead: { x: 0, y: 1.85, z: 0.1 }
};

const useStore = create((set, get) => ({
  // Connection state
  isConnected: false,
  connectionStatus: 'disconnected', // 'disconnected', 'connecting', 'connected'
  
  // Active sensor and lobe
  activeSensor: null,
  activeLobe: null,
  activeColor: null,
  
  // Activation history
  activationHistory: [],
  
  // Neural impulses (replaces particles for realistic nerve animation)
  neuralImpulses: [],
  
  // Sound enabled
  soundEnabled: true,
  
  // Info popup
  showInfo: false,
  infoContent: null,
  
  // Medical visualization toggles
  xrayMode: false,
  nervousSystemView: true,
  showSkeleton: false,
  
  // Anatomical labels
  showLabels: false,
  
  // Actions
  setConnectionStatus: (status) => set({ 
    connectionStatus: status,
    isConnected: status === 'connected'
  }),
  
  activateSensor: (sensorData) => {
    const { sensor, lobe, color, description, intensity } = sensorData;
    const mapping = BRAIN_MAPPING[sensor];
    
    if (!mapping) return;
    
    // Get the nerve pathway for this sensor
    const pathway = NERVE_PATHWAYS[sensor] || [];
    
    // Create neural impulse animation along the nerve pathway
    const impulse = {
      id: `${Date.now()}-impulse`,
      sensor: sensor,
      pathway: pathway,
      color: mapping.color,
      glowColor: mapping.glowColor,
      startTime: Date.now(),
      duration: 1500, // 1.5 seconds to travel
      delay: 300, // 300ms neural transmission delay
      intensity: intensity || 1.0
    };
    
    set((state) => ({
      activeSensor: sensor,
      activeLobe: mapping.lobeId,
      activeColor: mapping.color,
      neuralImpulses: [...state.neuralImpulses, impulse],
      showInfo: true,
      infoContent: {
        lobe: mapping.lobe,
        description: mapping.description,
        color: mapping.color,
        sensor: sensor,
        pathwayLength: pathway.length
      },
      activationHistory: [
        { sensor, lobe: mapping.lobe, timestamp: new Date(), color: mapping.color },
        ...state.activationHistory.slice(0, 9)
      ]
    }));
    
    // Clear active state after animation completes
    setTimeout(() => {
      set((state) => {
        if (state.activeSensor === sensor) {
          return {
            activeSensor: null,
            activeLobe: null,
            activeColor: null,
            showInfo: false,
            infoContent: null
          };
        }
        return {};
      });
    }, 3500);
    
    // Clean up completed impulses
    setTimeout(() => {
      set((state) => ({
        neuralImpulses: state.neuralImpulses.filter(i => i.id !== impulse.id)
      }));
    }, 2500);
  },
  
  clearImpulses: () => set({ neuralImpulses: [] }),
  
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  
  toggleXrayMode: () => set((state) => ({ xrayMode: !state.xrayMode })),
  
  toggleNervousSystem: () => set((state) => ({ nervousSystemView: !state.nervousSystemView })),
  
  toggleSkeleton: () => set((state) => ({ showSkeleton: !state.showSkeleton })),
  
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  
  hideInfo: () => set({ showInfo: false, infoContent: null })
}));

export default useStore;
