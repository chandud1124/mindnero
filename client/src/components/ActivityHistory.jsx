import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const ActivityHistory = () => {
  const { activationHistory } = useStore();
  
  if (activationHistory.length === 0) return null;
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 mt-16"
    >
      <div className="glass rounded-2xl p-4 w-56">
        <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
          Activity Log
        </h3>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {activationHistory.map((item, index) => (
              <motion.div
                key={`${item.timestamp.getTime()}-${index}`}
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', damping: 20 }}
                className="flex items-center gap-3 p-2 rounded-lg bg-white/5"
              >
                {/* Color dot */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-300 truncate">
                    {item.lobe}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTime(item.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityHistory;
