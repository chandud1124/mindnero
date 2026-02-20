import React, { useCallback } from 'react';
import useStore, { BRAIN_MAPPING } from '../store/useStore';

const SENSORS = Object.keys(BRAIN_MAPPING);

const ControlPanel = () => {
  const activateSensor = useStore((s) => s.activateSensor);
  const activeSensor = useStore((s) => s.activeSensor);

  const handleClick = useCallback((sensor) => {
    activateSensor({ sensor, intensity: 1.0 });
  }, [activateSensor]);

  return (
    <div className="fixed z-20" style={{ top: '5.5rem', left: '1.25rem' }}>
      <div className="med-panel p-3 rounded" style={{ maxWidth: 160 }}>
        <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>
          Sensor Input
        </div>
        <div className="flex flex-col gap-1">
          {SENSORS.map((s) => {
            const m = BRAIN_MAPPING[s];
            const active = s === activeSensor;
            return (
              <button
                key={s}
                onClick={() => handleClick(s)}
                className="flex items-center gap-2 text-left text-[11px] px-2 py-1 rounded transition-colors"
                style={{
                  background: active ? 'rgba(31,111,235,0.08)' : 'transparent',
                  color: active ? '#1F6FEB' : '#6B7280',
                  border: `1px solid ${active ? 'rgba(31,111,235,0.2)' : 'transparent'}`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: active ? m.color : '#D1D5DB' }}
                />
                {m.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
