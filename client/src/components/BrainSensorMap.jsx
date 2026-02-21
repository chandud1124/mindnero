import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useStore, { BRAIN_MAPPING, LOBE_COLORS } from '../store/useStore';

/* ─── Sensor display metadata ─── */
const SENSOR_META = {
  right_hand: { icon: '🤚', label: 'Right Hand', group: 'limbs' },
  left_hand:  { icon: '✋', label: 'Left Hand',  group: 'limbs' },
  right_leg:  { icon: '🦵', label: 'Right Leg',  group: 'limbs' },
  left_leg:   { icon: '🦿', label: 'Left Leg',   group: 'limbs' },
  eye:        { icon: '👁', label: 'Vision',      group: 'head' },
  ear:        { icon: '👂', label: 'Hearing',     group: 'head' },
  nose:       { icon: '👃', label: 'Smell',       group: 'head' },
  mouth:      { icon: '👄', label: 'Speech',      group: 'head' },
  forehead:   { icon: '🧠', label: 'Forehead',    group: 'head' },
  skin:       { icon: '🖐', label: 'Skin',        group: 'body' },
};

/* ─── Lobe short labels ─── */
const LOBE_LABELS = {
  motor_left:  'Motor (L)',
  motor_right: 'Motor (R)',
  frontal:     'Frontal',
  parietal:    'Parietal',
  temporal:    'Temporal',
  occipital:   'Occipital',
  broca:       'Frontal',
};

const GROUPS = [
  { key: 'head', label: 'Head Sensors' },
  { key: 'limbs', label: 'Limb Sensors' },
  { key: 'body', label: 'Body Sensors' },
];

const BrainSensorMap = () => {
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeSensor = useStore((s) => s.activeSensor);
  const activateSensor = useStore((s) => s.activateSensor);
  const darkMode = useStore((s) => s.darkMode);

  const handleActivate = useCallback((sensor) => {
    activateSensor({ sensor, intensity: 1.0 });
  }, [activateSensor]);

  const sensors = Object.keys(BRAIN_MAPPING);

  // Swap limb sensor display mapping for UI (vice versa)
  const LIMB_SWAP = {
    right_hand: 'left_hand',
    left_hand: 'right_hand',
    right_leg: 'left_leg',
    left_leg: 'right_leg',
  };

  const renderRow = (sensorKey) => {
    let meta = SENSOR_META[sensorKey];
    let mapping = BRAIN_MAPPING[sensorKey];
    // For limb sensors, swap the mapping for display
    if (meta && meta.group === 'limbs' && LIMB_SWAP[sensorKey]) {
      mapping = BRAIN_MAPPING[LIMB_SWAP[sensorKey]];
    }
    const isActive = sensorKey === activeSensor;
    if (!meta || !mapping) return null;

    return (
      <motion.button
        key={sensorKey}
        onClick={() => handleActivate(sensorKey)}
        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md transition-all text-left group"
        style={{
          background: isActive
            ? (darkMode ? 'rgba(59,130,246,0.12)' : 'rgba(31,111,235,0.06)')
            : 'transparent',
          border: `1px solid ${isActive
            ? (darkMode ? 'rgba(59,130,246,0.25)' : 'rgba(31,111,235,0.15)')
            : 'transparent'}`,
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Sensor side */}
        <span className="text-base leading-none flex-shrink-0 w-6 text-center">{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span
              className="text-[11px] font-medium truncate"
              style={{ color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}
            >
              {meta.label}
            </span>
            {/* Arrow */}
            <svg
              width="14" height="8" viewBox="0 0 14 8"
              className="flex-shrink-0 opacity-40 group-hover:opacity-70 transition-opacity"
            >
              <path
                d="M0 4h11M9 1l3 3-3 3"
                stroke={isActive ? mapping.color : 'var(--text-muted)'}
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: mapping.color, boxShadow: isActive ? `0 0 6px ${mapping.color}80` : 'none' }}
            />
            <span
              className="text-[10px] truncate"
              style={{ color: isActive ? mapping.color : 'var(--text-secondary)' }}
            >
              {mapping.name}
            </span>
            <span
              className="text-[9px] px-1 py-px rounded flex-shrink-0"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                color: 'var(--text-muted)',
              }}
            >
              {LOBE_LABELS[mapping.lobeId] || mapping.lobeId}
            </span>
          </div>
        </div>
      </motion.button>
    );
  };

  /* ─── Desktop Panel ─── */
  const desktopPanel = (
    <div className="fixed z-20 hidden sm:block" style={{ bottom: '1rem', left: '1.25rem', maxWidth: 230 }}>
      <div className="med-panel rounded overflow-hidden">
        {/* Header - always visible */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-3 py-2 transition-colors"
          style={{
            borderBottom: expanded ? `1px solid var(--border)` : 'none',
            background: 'transparent',
          }}
        >
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1C5 1 3 3.5 3 6c0 3 2.5 5 5 8 2.5-3 5-5 5-8 0-2.5-2-5-5-5z"
                stroke="var(--accent)"
                strokeWidth="1.2"
                fill="none"
              />
              <circle cx="8" cy="5.5" r="1.5" fill="var(--accent)" opacity="0.5" />
            </svg>
            <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
              Brain ↔ Sensor Map
            </span>
          </div>
          <motion.svg
            width="12" height="12" viewBox="0 0 12 12"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path d="M3 4.5L6 7.5L9 4.5" stroke="var(--text-muted)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </motion.svg>
        </button>

        {/* Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div
                className="px-2 py-2 flex flex-col gap-2 overflow-y-auto"
                style={{ maxHeight: 'calc(100vh - 16rem)', scrollbarWidth: 'thin' }}
              >
                {GROUPS.map((group) => {
                  const groupSensors = sensors.filter(
                    (s) => SENSOR_META[s]?.group === group.key,
                  );
                  if (groupSensors.length === 0) return null;
                  return (
                    <div key={group.key}>
                      <div
                        className="text-[9px] uppercase tracking-wider px-2 mb-1"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {group.label}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {groupSensors.map(renderRow)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  /* ─── Mobile: toggle button + bottom sheet ─── */
  const mobilePanel = (
    <div className="sm:hidden">
      {/* Toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed z-30 flex items-center justify-center rounded-full"
        style={{
          bottom: '6rem',
          right: '1rem',
          width: 40,
          height: 40,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <span className="text-lg">🧠</span>
      </button>

      {/* Bottom sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.3)' }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed z-50 left-0 right-0 bottom-0"
              style={{
                background: 'var(--bg-card)',
                borderTop: '1px solid var(--border)',
                borderRadius: '16px 16px 0 0',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
                maxHeight: '70vh',
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ background: 'var(--text-muted)', opacity: 0.3 }}
                />
              </div>

              {/* Title */}
              <div className="px-4 pb-2 flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Brain ↔ Sensor Map
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-xs px-2 py-1 rounded"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Close
                </button>
              </div>

              {/* Content */}
              <div
                className="px-3 pb-6 overflow-y-auto"
                style={{ maxHeight: 'calc(70vh - 60px)', WebkitOverflowScrolling: 'touch' }}
              >
                {GROUPS.map((group) => {
                  const groupSensors = sensors.filter(
                    (s) => SENSOR_META[s]?.group === group.key,
                  );
                  if (groupSensors.length === 0) return null;
                  return (
                    <div key={group.key} className="mb-3">
                      <div
                        className="text-[10px] uppercase tracking-wider px-2 mb-1.5"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {group.label}
                      </div>
                      <div className="flex flex-col gap-1">
                        {groupSensors.map(renderRow)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {desktopPanel}
      {mobilePanel}
    </>
  );
};

export default BrainSensorMap;
