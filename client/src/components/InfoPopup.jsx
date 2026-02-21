import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useStore, { BRAIN_MAPPING } from '../store/useStore';

const InfoPopup = () => {
  const activeSensor = useStore((s) => s.activeSensor);
  const activeLobe = useStore((s) => s.activeLobe);
  const activeColor = useStore((s) => s.activeColor);

  const mapping = activeSensor ? BRAIN_MAPPING[activeSensor] : null;

  return (
    <AnimatePresence mode="wait">
      {mapping && (
        <motion.div
          key={activeSensor}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="fixed z-20"
          style={{ top: '5.5rem', right: '1.25rem', maxWidth: 220 }}
        >
          <div className="med-panel p-3 rounded" style={{ borderLeft: `2px solid ${activeColor || 'var(--text-muted)'}` }}>
            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              Active Region
            </div>
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              {mapping.name}
            </div>
            <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {mapping.description}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: activeColor || 'var(--text-muted)' }}
              />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Sensor: {activeSensor}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InfoPopup;
