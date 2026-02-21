import React from 'react';
import useStore from '../store/useStore';

const Toggle = ({ label, value, onChange, darkMode }) => (
  <button
    onClick={() => onChange(!value)}
    className="flex items-center gap-2 text-xs"
    style={{ color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}
  >
    <span
      className="toggle-track"
      style={{
        width: 30, height: 16, borderRadius: 8,
        background: value ? 'var(--accent)' : (darkMode ? '#374151' : '#D1D5DB'),
        display: 'inline-flex', alignItems: 'center', padding: 2,
        transition: 'background 0.2s',
        border: 'none',
      }}
    >
      <span
        className="toggle-thumb"
        style={{
          width: 12, height: 12, borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          transform: value ? 'translateX(14px)' : 'translateX(0)',
          transition: 'transform 0.2s',
        }}
      />
    </span>
    {label}
  </button>
);

const MedicalControls = () => {
  const {
    xrayMode, nervousSystemView, skinTransparency, neuralSpeed, darkMode,
    toggleXrayMode, toggleNervousSystem, setSkinTransparency, setNeuralSpeed, resetView,
  } = useStore();

  const sliderBg = (value, min, max) => {
    const pct = ((value - min) / (max - min)) * 100;
    return `linear-gradient(to right, var(--accent) ${pct}%, var(--slider-bg) ${pct}%)`;
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-3 sm:px-6 py-2 sm:py-2.5"
      style={{ background: 'var(--bottom-gradient)' }}
    >
      {/* Transparency slider */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Skin</span>
        <input
          type="range"
          min={0} max={1} step={0.01}
          value={skinTransparency}
          onChange={(e) => setSkinTransparency(Number(e.target.value))}
          className="w-16 sm:w-20 h-1 rounded-full cursor-pointer"
          style={{ background: sliderBg(skinTransparency, 0, 1) }}
        />
        <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-secondary)', minWidth: 28 }}>
          {Math.round(skinTransparency * 100)}%
        </span>
      </div>

      <div className="w-px h-5 hidden sm:block" style={{ background: 'var(--divider)' }} />

      <Toggle label="X-Ray" value={xrayMode} onChange={toggleXrayMode} darkMode={darkMode} />
      <Toggle label="Nerves" value={nervousSystemView} onChange={toggleNervousSystem} darkMode={darkMode} />

      <div className="w-px h-5 hidden sm:block" style={{ background: 'var(--divider)' }} />

      {/* Neural speed */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Speed</span>
        <input
          type="range"
          min={0.1} max={3} step={0.1}
          value={neuralSpeed}
          onChange={(e) => setNeuralSpeed(Number(e.target.value))}
          className="w-14 sm:w-16 h-1 rounded-full cursor-pointer"
          style={{ background: sliderBg(neuralSpeed, 0.1, 3) }}
        />
        <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-secondary)', minWidth: 24 }}>{neuralSpeed.toFixed(1)}x</span>
      </div>

      <div className="w-px h-5 hidden sm:block" style={{ background: 'var(--divider)' }} />

      <button
        onClick={resetView}
        className="text-[10px] uppercase tracking-wider py-1 px-3 rounded transition-colors"
        style={{ color: 'var(--text-secondary)', border: '1px solid var(--btn-border)', background: 'transparent' }}
        onMouseEnter={(e) => (e.target.style.color = 'var(--accent)')}
        onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}
      >
        Reset View
      </button>
    </div>
  );
};

export default MedicalControls;
