import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore, { BRAIN_MAPPING } from '../store/useStore';

const ControlPanel = () => {
  const { soundEnabled, toggleSound, activateSensor } = useStore();
  const [showTestPanel, setShowTestPanel] = useState(false);
  
  // Test function to simulate sensor activation
  const testSensor = async (sensor) => {
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensor })
      });
      
      if (!response.ok) {
        // If server not available, simulate locally
        const mapping = BRAIN_MAPPING[sensor];
        activateSensor({
          sensor,
          lobe: mapping.lobe,
          color: mapping.color,
          description: mapping.description
        });
      }
    } catch (error) {
      // Fallback to local simulation
      const mapping = BRAIN_MAPPING[sensor];
      activateSensor({
        sensor,
        lobe: mapping.lobe,
        color: mapping.color,
        description: mapping.description
      });
    }
  };
  
  const sensorButtons = [
    { sensor: 'right_hand', icon: '🖐️', label: 'Right Hand' },
    { sensor: 'left_hand', icon: '🤚', label: 'Left Hand' },
    { sensor: 'eye', icon: '👁️', label: 'Eye' },
    { sensor: 'ear', icon: '👂', label: 'Ear' },
    { sensor: 'mouth', icon: '👄', label: 'Mouth' },
    { sensor: 'forehead', icon: '🧠', label: 'Forehead' }
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="flex flex-col items-end gap-3">
        {/* Test Panel */}
        {showTestPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="glass rounded-xl p-4 mb-2"
          >
            <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
              Simulate Sensor
            </p>
            <div className="grid grid-cols-3 gap-2">
              {sensorButtons.map(({ sensor, icon, label }) => (
                <motion.button
                  key={sensor}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => testSensor(sensor)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  style={{
                    boxShadow: `0 0 0px ${BRAIN_MAPPING[sensor].color}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 15px ${BRAIN_MAPPING[sensor].color}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0px ${BRAIN_MAPPING[sensor].color}`;
                  }}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-xs text-gray-400">{label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Control Buttons */}
        <div className="flex gap-2">
          {/* Test Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTestPanel(!showTestPanel)}
            className={`glass rounded-full p-3 transition-colors ${
              showTestPanel ? 'bg-accent-cyan/20' : ''
            }`}
            title="Test Sensors"
          >
            <svg
              className="w-5 h-5 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </motion.button>
          
          {/* Sound Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSound}
            className={`glass rounded-full p-3 transition-colors ${
              soundEnabled ? 'bg-accent-blue/20' : ''
            }`}
            title={soundEnabled ? 'Sound On' : 'Sound Off'}
          >
            {soundEnabled ? (
              <svg
                className="w-5 h-5 text-accent-blue"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ControlPanel;
