import React from 'react';
import useStore from '../store/useStore';

const Toggle = ({ label, value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className="flex items-center gap-2 text-xs"
    style={{ color: value ? '#2E2E2E' : '#9CA3AF' }}
  >
    <span
      className="toggle-track"
      style={{
        width: 30, height: 16, borderRadius: 8,
        background: value ? '#1F6FEB' : '#D1D5DB',
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
    xrayMode, nervousSystemView, skinTransparency, neuralSpeed,
    toggleXrayMode, toggleNervousSystem, setSkinTransparency, setNeuralSpeed, resetView,
  } = useStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-6 px-6 py-2.5"
      style={{
        background: 'linear-gradient(0deg, rgba(245,247,250,0.96) 0%, rgba(245,247,250,0) 100%)',
      }}
    >
      {/* Transparency slider */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: '#6B7280' }}>Skin</span>
        <input
          type="range"
          min={0} max={1} step={0.01}
          value={skinTransparency}
          onChange={(e) => setSkinTransparency(Number(e.target.value))}
          className="w-20 h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #1F6FEB ${skinTransparency * 100}%, #E5E7EB ${skinTransparency * 100}%)`,
          }}
        />
        <span className="text-[10px] tabular-nums" style={{ color: '#6B7280', minWidth: 28 }}>
          {Math.round(skinTransparency * 100)}%
        </span>
      </div>

      <div className="w-px h-5" style={{ background: '#E5E7EB' }} />

      <Toggle label="X-Ray" value={xrayMode} onChange={toggleXrayMode} />
      <Toggle label="Nerves" value={nervousSystemView} onChange={toggleNervousSystem} />

      <div className="w-px h-5" style={{ background: '#E5E7EB' }} />

      {/* Neural speed */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: '#6B7280' }}>Speed</span>
        <input
          type="range"
          min={0.1} max={3} step={0.1}
          value={neuralSpeed}
          onChange={(e) => setNeuralSpeed(Number(e.target.value))}
          className="w-16 h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #1F6FEB ${((neuralSpeed - 0.1) / 2.9) * 100}%, #E5E7EB ${((neuralSpeed - 0.1) / 2.9) * 100}%)`,
          }}
        />
        <span className="text-[10px] tabular-nums" style={{ color: '#6B7280', minWidth: 24 }}>{neuralSpeed.toFixed(1)}x</span>
      </div>

      <div className="w-px h-5" style={{ background: '#E5E7EB' }} />

      <button
        onClick={resetView}
        className="text-[10px] uppercase tracking-wider py-1 px-3 rounded transition-colors"
        style={{ color: '#6B7280', border: '1px solid #E5E7EB', background: 'transparent' }}
        onMouseEnter={(e) => (e.target.style.color = '#1F6FEB')}
        onMouseLeave={(e) => (e.target.style.color = '#6B7280')}
      >
        Reset View
      </button>
    </div>
  );
};

export default MedicalControls;
