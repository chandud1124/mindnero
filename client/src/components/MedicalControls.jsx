import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

const MedicalControls = () => {
  const { 
    xrayMode, 
    nervousSystemView, 
    showSkeleton, 
    showLabels,
    toggleXrayMode, 
    toggleNervousSystem, 
    toggleSkeleton, 
    toggleLabels 
  } = useStore();
  
  const controls = [
    {
      id: 'xray',
      label: 'X-Ray Mode',
      icon: '🩻',
      active: xrayMode,
      toggle: toggleXrayMode,
      description: 'Toggle X-ray/transparency view'
    },
    {
      id: 'nervous',
      label: 'Nervous System',
      icon: '⚡',
      active: nervousSystemView,
      toggle: toggleNervousSystem,
      description: 'Show/hide neural pathways'
    },
    {
      id: 'skeleton',
      label: 'Skeleton',
      icon: '🦴',
      active: showSkeleton,
      toggle: toggleSkeleton,
      description: 'Show/hide skeletal structure'
    },
    {
      id: 'labels',
      label: 'Labels',
      icon: '🏷️',
      active: showLabels,
      toggle: toggleLabels,
      description: 'Show/hide anatomical labels'
    }
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="fixed left-6 top-24 z-40"
    >
      <div className="medical-panel rounded-lg p-4 w-56">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cyan-500/20">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-sm font-medium text-cyan-100 uppercase tracking-wider">
            Visualization Options
          </h3>
        </div>
        
        {/* Control Toggles */}
        <div className="space-y-2">
          {controls.map((control) => (
            <motion.button
              key={control.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={control.toggle}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg
                transition-all duration-200 group
                ${control.active 
                  ? 'bg-cyan-500/20 border border-cyan-400/50' 
                  : 'bg-slate-800/40 border border-slate-700/30 hover:bg-slate-700/40'
                }
              `}
              title={control.description}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{control.icon}</span>
                <span className={`text-xs font-medium ${control.active ? 'text-cyan-100' : 'text-gray-400'}`}>
                  {control.label}
                </span>
              </div>
              
              {/* Toggle Switch */}
              <div className={`
                w-10 h-5 rounded-full transition-colors duration-200
                ${control.active ? 'bg-cyan-500' : 'bg-slate-600'}
              `}>
                <motion.div
                  className="w-4 h-4 bg-white rounded-full mt-0.5"
                  animate={{ x: control.active ? 22 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </div>
            </motion.button>
          ))}
        </div>
        
        {/* Status Indicator */}
        <div className="mt-4 pt-3 border-t border-cyan-500/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">View Mode:</span>
            <span className="text-cyan-400 font-mono">
              {xrayMode ? 'X-RAY' : 'STANDARD'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MedicalControls;
