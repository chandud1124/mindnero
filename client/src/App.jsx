import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import useWebSocket from './hooks/useWebSocket';
import useNeuralPulseSound from './hooks/useNeuralPulseSound';

// Components
import Brain3D from './components/Brain3D';
import ConnectionStatus from './components/ConnectionStatus';
import InfoPopup from './components/InfoPopup';
import BrainLegend from './components/BrainLegend';
import ActivityHistory from './components/ActivityHistory';
import ControlPanel from './components/ControlPanel';
import BackgroundEffects from './components/BackgroundEffects';
import Header from './components/Header';
import MedicalControls from './components/MedicalControls';
import HeartbeatWaveform from './components/HeartbeatWaveform';

// Loading fallback for 3D scene - Medical style
const LoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-20 h-20 border-4 border-medical-cyan/20 border-t-medical-cyan rounded-full mx-auto mb-4"
      />
      <div className="text-sm text-medical-cyan font-mono tracking-wider">
        INITIALIZING NEURAL VISUALIZATION...
      </div>
      <div className="mt-2 flex items-center justify-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-medical-cyan rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  </div>
);

function App() {
  // Initialize WebSocket connection
  useWebSocket();
  
  // Initialize neural pulse sound
  useNeuralPulseSound();
  
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-medical-dark">
      {/* Medical grid background */}
      <div className="fixed inset-0 medical-grid opacity-20" />
      
      {/* Scanning line effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="scan-line" />
      </div>
      
      {/* Background Effects - subtle for medical theme */}
      <div className="opacity-30">
        <BackgroundEffects />
      </div>
      
      {/* Header - Medical styled */}
      <Header />
      
      {/* Connection Status */}
      <ConnectionStatus />
      
      {/* Medical Visualization Controls */}
      <MedicalControls />
      
      {/* Brain Legend Panel */}
      <BrainLegend />
      
      {/* Activity History Panel */}
      <ActivityHistory />
      
      {/* Main 3D Medical Visualization */}
      <main className="fixed inset-0 z-10">
        <Suspense fallback={<LoadingFallback />}>
          <Brain3D />
        </Suspense>
      </main>
      
      {/* Scientific Info Popup */}
      <InfoPopup />
      
      {/* Control Panel */}
      <ControlPanel />
      
      {/* Heartbeat Waveform (ECG-style) */}
      <HeartbeatWaveform />
      
      {/* Medical Footer */}
      <footer className="fixed bottom-28 left-6 z-40">
        <div className="medical-panel px-4 py-2 rounded-lg">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-medical-green rounded-full animate-pulse" />
              <span className="text-gray-400 font-mono">
                SYSTEM READY
              </span>
            </div>
            <span className="text-gray-600">|</span>
            <span className="text-gray-500">
              Touch ESP32 sensor to visualize neural pathways
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
