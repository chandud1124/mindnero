import React from 'react';
import { BRAIN_MAPPING } from '../store/useStore';

const BrainLegend = () => (
  <div className="fixed z-20" style={{ bottom: '3.5rem', left: '1.25rem' }}>
    <div className="med-panel px-3 py-2 rounded">
      <div className="text-[9px] uppercase tracking-wider mb-1.5" style={{ color: '#9CA3AF' }}>
        Mapping
      </div>
      <div className="flex flex-col gap-0.5">
        {Object.entries(BRAIN_MAPPING).map(([sensor, m]) => (
          <div key={sensor} className="flex items-center gap-1.5 text-[10px]" style={{ color: '#6B7280' }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
            <span className="truncate">{m.name}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default BrainLegend;
