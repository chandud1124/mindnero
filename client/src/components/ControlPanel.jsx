import React, { useCallback } from 'react';
import useStore, { BRAIN_MAPPING } from '../store/useStore';

const SENSORS = Object.keys(BRAIN_MAPPING);

const ControlPanel = () => {
  const activateSensor = useStore((s) => s.activateSensor);
  const activeSensor = useStore((s) => s.activeSensor);
  const darkMode = useStore((s) => s.darkMode);

  const handleClick = useCallback((sensor) => {
    activateSensor({ sensor, intensity: 1.0 });
  }, [activateSensor]);

  const accent = 'var(--accent)';

  return (
    <>
      {/* Desktop: side panel */}
      <div className="fixed z-20 hidden sm:block" style={{ top: '5.5rem', left: '1.25rem' }}>
        <div className="med-panel p-3 rounded" style={{ maxWidth: 160 }}>
          <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
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
                    background: active ? (darkMode ? 'rgba(59,130,246,0.12)' : 'rgba(31,111,235,0.08)') : 'transparent',
                    color: active ? accent : 'var(--text-secondary)',
                    border: `1px solid ${active ? (darkMode ? 'rgba(59,130,246,0.25)' : 'rgba(31,111,235,0.2)') : 'transparent'}`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: active ? m.color : 'var(--sensor-inactive)' }}
                  />
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile: horizontal scroll bar at bottom */}
      <div
        className="fixed z-20 sm:hidden left-0 right-0"
        style={{ bottom: '3.2rem' }}
      >
        <div
          className="flex gap-2 px-3 py-2 overflow-x-auto"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
        >
          {SENSORS.map((s) => {
            const m = BRAIN_MAPPING[s];
            const active = s === activeSensor;
            return (
              <button
                key={s}
                onClick={() => handleClick(s)}
                className="mobile-btn flex items-center gap-1.5 text-left text-[12px] px-3 py-2 rounded-lg whitespace-nowrap flex-shrink-0 transition-colors"
                style={{
                  background: active ? (darkMode ? 'rgba(59,130,246,0.15)' : 'rgba(31,111,235,0.10)') : 'var(--bg-card)',
                  color: active ? accent : 'var(--text-secondary)',
                  border: `1px solid ${active ? (darkMode ? 'rgba(59,130,246,0.3)' : 'rgba(31,111,235,0.2)') : 'var(--border)'}`,
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: active ? m.color : 'var(--sensor-inactive)' }}
                />
                {m.name}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ControlPanel;
