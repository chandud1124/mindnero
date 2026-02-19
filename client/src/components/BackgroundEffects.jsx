import React from 'react';
import { motion } from 'framer-motion';

const BackgroundEffects = () => {
  // Generate random particles for neural network background
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5
  }));
  
  // Generate connecting lines
  const lines = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x1: Math.random() * 100,
    y1: Math.random() * 100,
    x2: Math.random() * 100,
    y2: Math.random() * 100,
    duration: Math.random() * 8 + 8,
    delay: Math.random() * 4
  }));
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-neural-gradient" />
      
      {/* Heartbeat pulse effect */}
      <motion.div
        className="absolute inset-0 heartbeat-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
          <motion.div
            animate={{
              scale: [1, 1.1, 1, 1.05, 1],
              opacity: [0.03, 0.08, 0.03, 0.06, 0.03]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="w-full h-full rounded-full bg-accent-blue/10"
          />
        </div>
      </motion.div>
      
      {/* Floating particles */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="particleGradient">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Neural connection lines */}
        {lines.map((line) => (
          <motion.line
            key={`line-${line.id}`}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke="rgba(96, 165, 250, 0.1)"
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: line.duration,
              delay: line.delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}
        
        {/* Floating particles */}
        {particles.map((particle) => (
          <motion.circle
            key={`particle-${particle.id}`}
            cx={`${particle.x}%`}
            cy={`${particle.y}%`}
            r={particle.size}
            fill="url(#particleGradient)"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              cx: [`${particle.x}%`, `${particle.x + (Math.random() - 0.5) * 10}%`],
              cy: [`${particle.y}%`, `${particle.y - 10}%`]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}
      </svg>
      
      {/* Corner gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-accent-blue/5 to-transparent" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-accent-purple/5 to-transparent" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-gradient-radial from-accent-cyan/5 to-transparent" />
    </div>
  );
};

export default BackgroundEffects;
