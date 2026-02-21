import React from 'react';
import useStore, { BRAIN_MAPPING } from '../store/useStore';

const ActivityHistory = () => {
  const history = useStore((s) => s.activationHistory || []);
  if (history.length === 0) return null;

  const recent = history.slice(-5).reverse();

  return (
    <div className="fixed z-20 hidden sm:block" style={{ bottom: '3.5rem', right: '1.25rem' }}>
      <div className="med-panel px-3 py-2 rounded" style={{ maxWidth: 170 }}>
        <div className="text-[9px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Recent
        </div>
        <div className="flex flex-col gap-0.5">
          {recent.map((entry, i) => {
            const m = entry.sensor ? BRAIN_MAPPING[entry.sensor] : null;
            return (
              <div key={i} className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: m?.color || 'var(--text-muted)' }} />
                <span className="truncate">{m?.name || entry.sensor}</span>
                <span className="ml-auto text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  {new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivityHistory;
