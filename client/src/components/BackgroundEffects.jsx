import React from 'react';
import useStore from '../store/useStore';

const BackgroundEffects = () => {
  const darkMode = useStore((s) => s.darkMode);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" style={{ background: darkMode ? '#0A0E17' : '#F5F7FA' }}>
      <div
        className="absolute inset-0"
        style={{
          background: darkMode
            ? 'linear-gradient(180deg, #0A0E17 0%, #0F1628 40%, #111B30 100%)'
            : 'linear-gradient(180deg, #F5F7FA 0%, #EBF0F7 40%, #E3EAF4 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: darkMode
            ? 'radial-gradient(ellipse 80% 60% at 50% 45%, rgba(59,130,246,0.04) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 80% 60% at 50% 45%, rgba(31,111,235,0.03) 0%, transparent 70%)',
        }}
      />
      <div className="medical-grid absolute inset-0" />
    </div>
  );
};

export default BackgroundEffects;
