import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const InfoPopup = () => {
  const { showInfo, infoContent, hideInfo } = useStore();
  
  if (!showInfo || !infoContent) return null;
  
  const sensorLabels = {
    right_hand: 'Right Hand - Tactile Receptor',
    left_hand: 'Left Hand - Tactile Receptor',
    eye: 'Retina - Photoreceptor',
    ear: 'Cochlea - Mechanoreceptor',
    mouth: 'Oral Cavity - Chemoreceptor',
    forehead: 'Frontal Region - Thermoreceptor'
  };
  
  const pathwayInfo = {
    right_hand: 'Ascending sensory pathway via median nerve → spinal cord (C5-T1) → thalamus → contralateral motor cortex',
    left_hand: 'Ascending sensory pathway via median nerve → spinal cord (C5-T1) → thalamus → contralateral motor cortex',
    eye: 'Optic nerve (CN II) → optic chiasm → lateral geniculate nucleus → primary visual cortex',
    ear: 'Vestibulocochlear nerve (CN VIII) → cochlear nucleus → superior olivary complex → primary auditory cortex',
    mouth: 'Trigeminal nerve (CN V) → pons → thalamus → gustatory cortex and motor speech area',
    forehead: 'Cutaneous afferents → trigeminal nerve → thalamus → somatosensory cortex'
  };
  
  return (
    <AnimatePresence>
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-full px-4"
        >
          <div 
            className="scientific-tooltip rounded-lg p-6 relative overflow-hidden"
            style={{
              boxShadow: `0 0 30px ${infoContent.color}20, 0 8px 40px rgba(0, 0, 0, 0.6)`
            }}
          >
            {/* Top accent line */}
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: `linear-gradient(90deg, transparent, ${infoContent.color}, transparent)`
              }}
            />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {/* Status indicator */}
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="mt-1"
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: infoContent.color,
                        boxShadow: `0 0 15px ${infoContent.color}80`
                      }}
                    />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 tracking-wide">
                      {infoContent.lobe}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-xs font-mono px-2 py-0.5 rounded"
                        style={{ 
                          backgroundColor: `${infoContent.color}15`,
                          color: infoContent.color,
                          border: `1px solid ${infoContent.color}30`
                        }}
                      >
                        {sensorLabels[infoContent.sensor]}
                      </span>
                      {infoContent.pathwayLength && (
                        <span className="text-xs text-gray-500">
                          {infoContent.pathwayLength} pathway nodes
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Close button */}
                <button
                  onClick={hideInfo}
                  className="text-gray-500 hover:text-white transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Function description */}
              <div className="mb-4 p-3 bg-black/20 rounded-lg border border-cyan-500/10">
                <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1 font-semibold">
                  Function
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {infoContent.description}
                </p>
              </div>
              
              {/* Neural pathway */}
              <div className="mb-4 p-3 bg-black/20 rounded-lg border border-cyan-500/10">
                <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1 font-semibold">
                  Neural Pathway
                </div>
                <p className="text-gray-400 text-xs leading-relaxed font-mono">
                  {pathwayInfo[infoContent.sensor]}
                </p>
              </div>
              
              {/* Neural transmission metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-2 bg-black/20 rounded border border-cyan-500/10">
                  <div className="text-xs text-gray-500 mb-1">Signal Speed</div>
                  <div className="text-sm font-mono font-bold" style={{ color: infoContent.color }}>
                    70-120 m/s
                  </div>
                </div>
                <div className="p-2 bg-black/20 rounded border border-cyan-500/10">
                  <div className="text-xs text-gray-500 mb-1">Latency</div>
                  <div className="text-sm font-mono font-bold" style={{ color: infoContent.color }}>
                    300-500 ms
                  </div>
                </div>
                <div className="p-2 bg-black/20 rounded border border-cyan-500/10">
                  <div className="text-xs text-gray-500 mb-1">Neurons</div>
                  <div className="text-sm font-mono font-bold" style={{ color: infoContent.color }}>
                    ~10⁶
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 font-mono">Neural Activity</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-3 rounded-full"
                        style={{ backgroundColor: infoContent.color }}
                        animate={{ opacity: [0.3, 1, 0.3], scaleY: [0.6, 1, 0.6] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: infoContent.color,
                      boxShadow: `0 0 10px ${infoContent.color}`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InfoPopup;
