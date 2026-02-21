import React, { Suspense, lazy, useEffect, useState } from 'react';
import BackgroundEffects from './components/BackgroundEffects';
import Header from './components/Header';
import MedicalControls from './components/MedicalControls';
import ControlPanel from './components/ControlPanel';
import InfoPopup from './components/InfoPopup';
import BrainLegend from './components/BrainLegend';
import ActivityHistory from './components/ActivityHistory';
import HeartbeatWaveform from './components/HeartbeatWaveform';
import useWebSocket from './hooks/useWebSocket';
import useStore from './store/useStore';

const Brain3D = lazy(() => import('./components/Brain3D'));

const LoadingFallback = () => {
  const darkMode = useStore((s) => s.darkMode);
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: darkMode ? '#0A0E17' : '#F5F7FA' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: darkMode ? '#374151' : '#E5E7EB', borderTopColor: '#3B82F6' }} />
        <span className="text-xs tracking-wider" style={{ color: '#6B7280' }}>Loading neural simulation…</span>
      </div>
    </div>
  );
};

const PinchHint = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const isMobile = 'ontouchstart' in window && window.innerWidth <= 768;
    if (isMobile && !sessionStorage.getItem('pinchHintShown')) {
      setShow(true);
      sessionStorage.setItem('pinchHintShown', '1');
      const t = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(t);
    }
  }, []);
  if (!show) return null;
  return <div className="pinch-hint">Pinch to zoom &middot; Tap body to activate sensors</div>;
};

const App = () => {
  useWebSocket();
  const darkMode = useStore((s) => s.darkMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: darkMode ? '#0A0E17' : '#F5F7FA' }}>
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
      <PinchHint />
    </div>
  );
};

export default App;
