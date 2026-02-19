import React from 'react';
import { motion } from 'framer-motion';
import useStore, { BRAIN_MAPPING } from '../store/useStore';

const BrainLegend = () => {
  const { activeLobe } = useStore();
  
  const legendItems = Object.entries(BRAIN_MAPPING).map(([sensor, data]) => ({
    sensor,
    lobe: data.lobe,
    lobeId: data.lobeId,
    color: data.color,
    category: data.category
  }));
  
  const sensorIcons = {
    right_hand: '🖐️',
    left_hand: '🤚',
    eye: '👁️',
    ear: '👂',
    mouth: '👄',
    forehead: '🧠'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="fixed left-6 top-1/2 -translate-y-1/2 z-40"
    >
      <div className="glass rounded-2xl p-4 w-64">
        <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
          Brain Mapping
        </h3>
        
        <div className="space-y-3">
          {legendItems.map((item, index) => {
            const isActive = activeLobe === item.lobeId;
            
            return (
              <motion.div
                key={item.sensor}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                  isActive ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                {/* Color indicator */}
                <motion.div
                  animate={{
                    scale: isActive ? [1, 1.3, 1] : 1,
                    boxShadow: isActive 
                      ? `0 0 15px ${item.color}` 
                      : `0 0 0px ${item.color}`
                  }}
                  transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                
                {/* Icon */}
                <span className="text-lg flex-shrink-0">
                  {sensorIcons[item.sensor]}
                </span>
                
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    isActive ? 'text-white' : 'text-gray-300'
                  }`}>
                    {item.lobe}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {item.sensor.replace('_', ' ')}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default BrainLegend;
