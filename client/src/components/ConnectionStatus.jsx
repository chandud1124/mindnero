import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const ConnectionStatus = () => {
  const { connectionStatus, isConnected } = useStore();
  
  const statusConfig = {
    connected: {
      color: 'bg-green-500',
      text: 'Connected',
      icon: '●',
      shadowColor: 'shadow-green-500/50'
    },
    connecting: {
      color: 'bg-yellow-500',
      text: 'Connecting...',
      icon: '◐',
      shadowColor: 'shadow-yellow-500/50'
    },
    disconnected: {
      color: 'bg-red-500',
      text: 'Disconnected',
      icon: '○',
      shadowColor: 'shadow-red-500/50'
    }
  };
  
  const config = statusConfig[connectionStatus] || statusConfig.disconnected;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-6 right-6 z-50"
    >
      <div className={`glass rounded-full px-4 py-2 flex items-center gap-3 ${config.shadowColor} shadow-lg`}>
        <motion.span
          animate={{
            scale: connectionStatus === 'connecting' ? [1, 1.2, 1] : 1,
            rotate: connectionStatus === 'connecting' ? [0, 180, 360] : 0
          }}
          transition={{
            duration: 1,
            repeat: connectionStatus === 'connecting' ? Infinity : 0
          }}
          className={`w-3 h-3 rounded-full ${config.color} ${isConnected ? 'animate-pulse' : ''}`}
        />
        <span className="text-sm font-medium text-gray-200">{config.text}</span>
        <span className="text-xs text-gray-400">ESP32</span>
      </div>
    </motion.div>
  );
};

export default ConnectionStatus;
