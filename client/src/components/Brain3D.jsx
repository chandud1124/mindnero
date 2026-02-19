import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import useStore, { BRAIN_MAPPING, SENSOR_POSITIONS } from '../store/useStore';

// Human body component (transparent with nervous system)
const HumanBody = ({ activeSensor }) => {
  const bodyRef = useRef();
  const nervousSystemRef = useRef();
  
  useFrame((state) => {
    if (bodyRef.current) {
      // Subtle breathing animation
      const breathe = Math.sin(state.clock.elapsedTime * 1.5) * 0.01;
      bodyRef.current.scale.y = 1 + breathe;
    }
  });
  
  // Body parts positions (scaled for better view)
  const bodyParts = {
    head: { position: [0, 1.5, 0], radius: 0.18 },
    neck: { position: [0, 1.2, 0], size: [0.08, 0.15, 0.08] },
    torso: { position: [0, 0.6, 0], size: [0.25, 0.5, 0.12] },
    leftArm: { position: [-0.35, 0.8, 0], size: [0.06, 0.4, 0.06] },
    rightArm: { position: [0.35, 0.8, 0], size: [0.06, 0.4, 0.06] },
    leftForearm: { position: [-0.35, 0.25, 0], size: [0.05, 0.35, 0.05] },
    rightForearm: { position: [0.35, 0.25, 0], size: [0.05, 0.35, 0.05] },
    leftHand: { position: [-0.35, -0.15, 0], radius: 0.06 },
    rightHand: { position: [0.35, -0.15, 0], radius: 0.06 },
    leftLeg: { position: [-0.1, -0.15, 0], size: [0.08, 0.5, 0.08] },
    rightLeg: { position: [0.1, -0.15, 0], size: [0.08, 0.5, 0.08] },
    leftShin: { position: [-0.1, -0.8, 0], size: [0.06, 0.4, 0.06] },
    rightShin: { position: [0.1, -0.8, 0], size: [0.06, 0.4, 0.06] },
  };
  
  return (
    <group ref={bodyRef} position={[0, -0.2, 0]}>
      {/* Head */}
      <mesh position={bodyParts.head.position}>
        <sphereGeometry args={[bodyParts.head.radius, 32, 32]} />
        <meshStandardMaterial
          color="#1a3a5f"
          transparent
          opacity={0.15}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Neck */}
      <mesh position={bodyParts.neck.position}>
        <boxGeometry args={bodyParts.neck.size} />
        <meshStandardMaterial
          color="#1a3a5f"
          transparent
          opacity={0.15}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Torso */}
      <mesh position={bodyParts.torso.position}>
        <boxGeometry args={bodyParts.torso.size} />
        <meshStandardMaterial
          color="#1a3a5f"
          transparent
          opacity={0.15}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Arms */}
      <mesh position={bodyParts.leftArm.position}>
        <boxGeometry args={bodyParts.leftArm.size} />
        <meshStandardMaterial
          color="#1a3a5f"
          transparent
          opacity={0.15}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      <mesh position={bodyParts.rightArm.position}>
        <boxGeometry args={bodyParts.rightArm.size} />
        <meshStandardMaterial
          color="#1a3a5f"
          transparent
          opacity={0.15}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Forearms */}
      <mesh position={bodyParts.leftForearm.position}>
        <boxGeometry args={bodyParts.leftForearm.size} />
        <meshStandardMaterial
          color="#1a3a5f"
          transparent
          opacity={0.15}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      <mesh position={bodyParts.rightForearm.position}>
        <boxGeometry args={bodyParts.rightForearm.size} />
        <meshStandardMaterial
          color="#1a3a5f"
          transparent
          opacity={0.15}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Hands */}
      <mesh position={bodyParts.leftHand.position}>
        <sphereGeometry args={[bodyParts.leftHand.radius, 16, 16]} />
        <meshStandardMaterial
          color={activeSensor === 'left_hand' ? '#3B82F6' : '#1a3a5f'}
          transparent
          opacity={activeSensor === 'left_hand' ? 0.6 : 0.2}
          emissive={activeSensor === 'left_hand' ? '#3B82F6' : '#000000'}
          emissiveIntensity={activeSensor === 'left_hand' ? 0.5 : 0}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      <mesh position={bodyParts.rightHand.position}>
        <sphereGeometry args={[bodyParts.rightHand.radius, 16, 16]} />
        <meshStandardMaterial
          color={activeSensor === 'right_hand' ? '#3B82F6' : '#1a3a5f'}
          transparent
          opacity={activeSensor === 'right_hand' ? 0.6 : 0.2}
          emissive={activeSensor === 'right_hand' ? '#3B82F6' : '#000000'}
          emissiveIntensity={activeSensor === 'right_hand' ? 0.5 : 0}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Legs */}
      <mesh position={bodyParts.leftLeg.position}>
        <boxGeometry args={bodyParts.leftLeg.size} />
        <meshStandardMaterial
          color="#1a3a5f"
          transparent
          opacity={0.15}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      <mesh position={bodyParts.rightLeg.position}>
        <boxGeometry args={bodyParts.rightLeg.size} />
        <meshStandardMaterial
          color="#1a3a5f"
          transparent
          opacity={0.15}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Shins */}
      <mesh position={bodyParts.leftShin.position}>
        <boxGeometry args={bodyParts.leftShin.size} />
        <meshStandardMaterial
          color="#1a3a5f"
          transparent
          opacity={0.15}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      <mesh position={bodyParts.rightShin.position}>
        <boxGeometry args={bodyParts.rightShin.size} />
        <meshStandardMaterial
          color="#1a3a5f"
          transparent
          opacity={0.15}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Nervous System - Spinal cord */}
      <mesh position={[0, 0.3, -0.05]}>
        <cylinderGeometry args={[0.015, 0.015, 1.8, 8]} />
        <meshStandardMaterial
          color="#60A5FA"
          transparent
          opacity={0.4}
          emissive="#60A5FA"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Neural pathways from hands to spine */}
      <NeuralPathway
        start={[-0.35, -0.15, 0]}
        end={[-0.15, 0.3, 0]}
        active={activeSensor === 'left_hand'}
        color="#3B82F6"
      />
      <NeuralPathway
        start={[0.35, -0.15, 0]}
        end={[0.15, 0.3, 0]}
        active={activeSensor === 'right_hand'}
        color="#3B82F6"
      />
      
      {/* Neural pathways from face */}
      <NeuralPathway
        start={[0, 1.55, 0.15]}
        end={[0, 1.2, 0]}
        active={activeSensor === 'eye'}
        color="#A855F7"
      />
      <NeuralPathway
        start={[-0.15, 1.5, 0]}
        end={[0, 1.2, 0]}
        active={activeSensor === 'ear'}
        color="#22C55E"
      />
      <NeuralPathway
        start={[0, 1.45, 0.12]}
        end={[0, 1.2, 0]}
        active={activeSensor === 'mouth'}
        color="#F97316"
      />
      <NeuralPathway
        start={[0, 1.65, 0.1]}
        end={[0, 1.2, 0]}
        active={activeSensor === 'forehead'}
        color="#06B6D4"
      />
    </group>
  );
};

// Neural pathway component
const NeuralPathway = ({ start, end, active, color }) => {
  const lineRef = useRef();
  
  useFrame((state) => {
    if (lineRef.current && active) {
      const pulse = Math.sin(state.clock.elapsedTime * 10) * 0.3 + 0.7;
      lineRef.current.material.opacity = pulse * 0.8;
    }
  });
  
  const points = [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ];
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={active ? 0.8 : 0.2}
        linewidth={2}
      />
    </line>
  );
};

// Realistic Brain Component
const RealisticBrain = ({ activeLobe, activeColor }) => {
  const brainRef = useRef();
  const leftHemisphereRef = useRef();
  const rightHemisphereRef = useRef();
  
  useFrame((state) => {
    if (brainRef.current) {
      const breathe = Math.sin(state.clock.elapsedTime * 1) * 0.02;
      brainRef.current.scale.setScalar(1 + breathe);
    }
  });
  
  // Brain lobe positions (more anatomically correct)
  const lobePositions = {
    frontal: { left: [-0.06, 0.05, 0.08], right: [0.06, 0.05, 0.08] },
    motor_left: { position: [-0.08, 0.02, 0] },
    motor_right: { position: [0.08, 0.02, 0] },
    occipital: { position: [0, -0.03, -0.08] },
    temporal: { left: [-0.09, -0.02, 0], right: [0.09, -0.02, 0] },
    broca: { position: [-0.07, 0.01, 0.05] }
  };
  
  return (
    <group ref={brainRef} position={[0, 1.5, 0]} scale={1.2}>
      {/* Left Hemisphere */}
      <mesh ref={leftHemisphereRef} position={[-0.05, 0, 0]}>
        <sphereGeometry args={[0.12, 32, 32, 0, Math.PI]} />
        <meshStandardMaterial
          color="#2d4a6f"
          transparent
          opacity={0.4}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* Right Hemisphere */}
      <mesh ref={rightHemisphereRef} position={[0.05, 0, 0]} rotation={[0, Math.PI, 0]}>
        <sphereGeometry args={[0.12, 32, 32, 0, Math.PI]} />
        <meshStandardMaterial
          color="#2d4a6f"
          transparent
          opacity={0.4}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* Brain Lobes - More detailed */}
      <BrainLobe
        position={lobePositions.motor_left.position}
        isActive={activeLobe === 'motor_left'}
        activeColor={activeColor}
        size={0.04}
      />
      <BrainLobe
        position={lobePositions.motor_right.position}
        isActive={activeLobe === 'motor_right'}
        activeColor={activeColor}
        size={0.04}
      />
      <BrainLobe
        position={lobePositions.occipital.position}
        isActive={activeLobe === 'occipital'}
        activeColor={activeColor}
        size={0.045}
      />
      <BrainLobe
        position={lobePositions.temporal.left}
        isActive={activeLobe === 'temporal'}
        activeColor={activeColor}
        size={0.04}
      />
      <BrainLobe
        position={lobePositions.broca.position}
        isActive={activeLobe === 'broca'}
        activeColor={activeColor}
        size={0.035}
      />
      <BrainLobe
        position={lobePositions.frontal.left}
        isActive={activeLobe === 'frontal'}
        activeColor={activeColor}
        size={0.05}
      />
      
      {/* Corpus Callosum (connection between hemispheres) */}
      <mesh position={[0, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
        <meshStandardMaterial
          color="#60A5FA"
          transparent
          opacity={0.3}
          emissive="#60A5FA"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Neural network inside brain */}
      <NeuralNetwork activeLobe={activeLobe} activeColor={activeColor} />
    </group>
  );
};

// Brain lobe component
const BrainLobe = ({ position, isActive, activeColor, size = 0.04 }) => {
  const meshRef = useRef();
  const glowRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.setScalar(1 + breathe);
      
      if (isActive && glowRef.current) {
        const pulse = Math.sin(state.clock.elapsedTime * 8) * 0.3 + 0.7;
        glowRef.current.material.opacity = pulse * 0.6;
      }
    }
  });
  
  const color = isActive ? activeColor : '#3a5a7f';
  
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isActive ? 0.9 : 0.5}
          emissive={isActive ? activeColor : '#000000'}
          emissiveIntensity={isActive ? 0.6 : 0}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      
      {isActive && (
        <mesh ref={glowRef} scale={2}>
          <sphereGeometry args={[size, 16, 16]} />
          <meshBasicMaterial
            color={activeColor}
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
};

// Neural network lines inside brain
const NeuralNetwork = ({ activeLobe, activeColor }) => {
  const linesRef = useRef();
  const pointsRef = useRef([]);
  
  // Generate neural network points
  const networkData = useMemo(() => {
    const nodes = [];
    const connections = [];
    
    // Generate random nodes inside brain shape
    for (let i = 0; i < 50; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.3 + Math.random() * 0.6;
      
      nodes.push({
        position: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta) * 0.8,
          r * Math.cos(phi)
        ),
        connections: []
      });
    }
    
    // Create connections between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = nodes[i].position.distanceTo(nodes[j].position);
        if (dist < 0.5 && Math.random() > 0.6) {
          connections.push([nodes[i].position, nodes[j].position]);
        }
      }
    }
    
    return { nodes, connections };
  }, []);
  
  useFrame((state) => {
    if (linesRef.current) {
      // Animate line opacity
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.2;
      linesRef.current.material.opacity = activeLobe ? pulse + 0.3 : pulse;
    }
  });
  
  return (
    <group>
      {networkData.connections.map((connection, i) => (
        <line key={i} ref={i === 0 ? linesRef : null}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                connection[0].x, connection[0].y, connection[0].z,
                connection[1].x, connection[1].y, connection[1].z
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={activeColor || '#3B82F6'}
            transparent
            opacity={0.2}
            linewidth={1}
          />
        </line>
      ))}
      
      {/* Neural nodes */}
      {networkData.nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial
            color={activeColor || '#60A5FA'}
            transparent
            opacity={activeLobe ? 0.8 : 0.3}
          />
        </mesh>
      ))}
    </group>
  );
};

// Animated particles traveling from body part to brain
const NeuronParticle = ({ particle }) => {
  const meshRef = useRef();
  const startTime = useRef(Date.now());
  
  useFrame(() => {
    if (!meshRef.current) return;
    
    const elapsed = Date.now() - startTime.current - particle.delay;
    if (elapsed < 0) {
      meshRef.current.visible = false;
      return;
    }
    
    meshRef.current.visible = true;
    const progress = Math.min(elapsed / particle.duration, 1);
    
    // Eased progress
    const eased = 1 - Math.pow(1 - progress, 3);
    
    // Interpolate position
    const start = particle.startPosition;
    const end = particle.endPosition;
    
    const x = start.x + (end.x - start.x) * eased;
    const y = start.y + (end.y - start.y) * eased + Math.sin(eased * Math.PI) * 0.2;
    const z = start.z + (end.z - start.z) * eased;
    
    meshRef.current.position.set(x, y, z);
    
    // Fade out
    const opacity = progress > 0.8 ? (1 - progress) * 5 : 1;
    meshRef.current.material.opacity = opacity * 0.8;
    
    // Scale pulse
    const scale = 0.02 + Math.sin(progress * Math.PI * 6) * 0.01;
    meshRef.current.scale.setScalar(scale * 30);
  });
  
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshBasicMaterial
        color={particle.color}
        transparent
        opacity={1}
      />
    </mesh>
  );
};

// Scene setup with human body and brain
const Scene = () => {
  const { activeSensor, activeLobe, activeColor, neuralImpulses } = useStore();
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 3, 2]} intensity={0.6} color="#60A5FA" />
      <pointLight position={[-2, 2, -2]} intensity={0.4} color="#A855F7" />
      <pointLight position={[0, 4, 0]} intensity={0.5} color="#06B6D4" />
      <pointLight position={[0, -2, 2]} intensity={0.3} color="#3B82F6" />
      
      {/* Human Body with nervous system */}
      <HumanBody activeSensor={activeSensor} />
      
      {/* Realistic Brain */}
      <RealisticBrain activeLobe={activeLobe} activeColor={activeColor} />
      
      {/* Traveling particles */}
      {neuralImpulses && neuralImpulses.map((particle) => (
        <NeuronParticle key={particle.id} particle={particle} />
      ))}
      
      {/* Camera Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={1.5}
        maxDistance={4}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 4}
        target={[0, 0.5, 0]}
      />
    </>
  );
};

// Main Brain3D component
const Brain3D = () => {
  return (
    <div className="w-full h-full" style={{ position: 'fixed', inset: 0 }}>
      <Canvas
        camera={{ position: [0, 0.8, 2.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default Brain3D;
