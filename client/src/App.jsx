import React, { Suspense, lazy } from 'react';
import BackgroundEffects from './components/BackgroundEffects';
import Header from './components/Header';
import MedicalControls from './components/MedicalControls';
import ControlPanel from './components/ControlPanel';
import InfoPopup from './components/InfoPopup';
import BrainLegend from './components/BrainLegend';
import ActivityHistory from './components/ActivityHistory';
import HeartbeatWaveform from './components/HeartbeatWaveform';
import useWebSocket from './hooks/useWebSocket';

const Brain3D = lazy(() => import('./components/Brain3D'));

const LoadingFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#F5F7FA' }}>
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#E5E7EB', borderTopColor: '#1F6FEB' }} />
      <span className="text-xs tracking-wider" style={{ color: '#6B7280' }}>Loading neural simulation…</span>
    </div>
  </div>
);

const App = () => {
  useWebSocket();

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#F5F7FA' }}>
      <BackgroundEffects />

      <Suspense fallback={<LoadingFallback />}>
        <Brain3D />
      </Suspense>

      {/* Overlay UI */}
      <Header />
      <ControlPanel />
      <InfoPopup />
      <BrainLegend />
      <ActivityHistory />
      <HeartbeatWaveform />
      <MedicalControls />
    </div>
  );
};

export default App;
