import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

const HeartbeatWaveform = () => {
  const canvasRef = useRef(null);
  const { activeSensor, connectionStatus } = useStore();
  const [heartrate, setHeartrate] = useState(72); // Normal resting heart rate
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // ECG waveform points (PQRST complex)
    const generateECGWave = (x, amplitude = 1) => {
      const points = [];
      const baseY = height / 2;
      
      // P wave (atrial depolarization)
      if (x >= 0 && x < 20) {
        return baseY - Math.sin((x / 20) * Math.PI) * 8 * amplitude;
      }
      // PR segment (flat)
      if (x >= 20 && x < 40) {
        return baseY;
      }
      // Q wave (small downward)
      if (x >= 40 && x < 45) {
        return baseY + ((x - 40) / 5) * 6 * amplitude;
      }
      // R wave (sharp upward spike)
      if (x >= 45 && x < 55) {
        if (x < 50) {
          return baseY - ((x - 45) / 5) * 35 * amplitude;
        } else {
          return baseY - ((55 - x) / 5) * 35 * amplitude;
        }
      }
      // S wave (small downward)
      if (x >= 55 && x < 60) {
        return baseY + ((x - 55) / 5) * 8 * amplitude;
      }
      // ST segment (flat)
      if (x >= 60 && x < 75) {
        return baseY;
      }
      // T wave (ventricular repolarization)
      if (x >= 75 && x < 105) {
        return baseY - Math.sin(((x - 75) / 30) * Math.PI) * 12 * amplitude;
      }
      // Baseline
      return baseY;
    };
    
    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#0a1628';
      ctx.fillRect(0, 0, width, height);
      
      // Draw grid (like ECG paper)
      ctx.strokeStyle = '#1a3a5f';
      ctx.lineWidth = 0.5;
      
      // Vertical lines
      for (let x = 0; x < width; x += 10) {
        ctx.globalAlpha = x % 50 === 0 ? 0.4 : 0.2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y < height; y += 10) {
        ctx.globalAlpha = y % 50 === 0 ? 0.4 : 0.2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1;
      
      // Calculate waveform speed based on heartrate
      const cycleLength = 110; // Points in one heartbeat cycle
      const beatsPerSecond = heartrate / 60;
      const pixelsPerFrame = (width / (60 / beatsPerSecond)) / 60; // 60fps assumption
      
      // Draw ECG waveform
      ctx.strokeStyle = activeSensor ? '#4DD0E1' : '#66BB6A';
      ctx.lineWidth = 2;
      ctx.shadowBlur = activeSensor ? 10 : 6;
      ctx.shadowColor = activeSensor ? '#4DD0E1' : '#66BB6A';
      
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const waveX = (x - timeRef.current) % cycleLength;
        const amplitude = activeSensor ? 1.3 : 1.0; // Increase amplitude when sensor active
        const y = generateECGWave(waveX, amplitude);
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      
      // Draw moving scan line
      const scanX = (timeRef.current * 2) % width;
      ctx.strokeStyle = '#4DD0E1';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 15;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(scanX, 0);
      ctx.lineTo(scanX, height);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      
      // Update time
      timeRef.current += pixelsPerFrame * 2;
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [heartrate, activeSensor]);
  
  // Simulate heartrate increase when sensor is active
  useEffect(() => {
    if (activeSensor) {
      setHeartrate(95); // Increased heart rate when active
      const timeout = setTimeout(() => {
        setHeartrate(72); // Return to normal
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [activeSensor]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="fixed bottom-0 left-0 right-0 z-30"
    >
      <div className="medical-panel rounded-t-lg mx-4 mb-0">
        <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-500/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`} />
              <span className="text-xs font-mono text-gray-400 uppercase">
                {connectionStatus === 'connected' ? 'MONITORING' : 'STANDBY'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">HR:</span>
              <motion.span
                key={heartrate}
                initial={{ scale: 1.2, color: '#4DD0E1' }}
                animate={{ scale: 1, color: '#66BB6A' }}
                className="text-lg font-mono font-bold"
              >
                {heartrate}
              </motion.span>
              <span className="text-xs text-gray-500">BPM</span>
            </div>
            
            {activeSensor && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 px-2 py-1 rounded bg-cyan-500/20 border border-cyan-400/30"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs text-cyan-300 font-medium">
                  Neural Activity Detected
                </span>
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>ECG Lead II</span>
            <span className="font-mono">50mm/s</span>
            <span className="font-mono">10mm/mV</span>
          </div>
        </div>
        
        <canvas
          ref={canvasRef}
          width={1200}
          height={100}
          className="w-full h-24"
          style={{ imageRendering: 'crisp-edges' }}
        />
      </div>
    </motion.div>
  );
};

export default HeartbeatWaveform;
