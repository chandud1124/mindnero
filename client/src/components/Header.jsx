import React from 'react';
import { motion } from 'framer-motion';

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-40 p-6"
    >
      <div className="flex items-center justify-center">
        <div className="text-center">
          {/* Logo and Title */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-2"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Brain Icon */}
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                className="text-accent-cyan"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                  fill="currentColor"
                  fillOpacity="0.2"
                />
                <path
                  d="M12 4c-1.1 0-2 .9-2 2v.5c0 .28.22.5.5.5s.5-.22.5-.5V6c0-.55.45-1 1-1s1 .45 1 1v.5c0 .28.22.5.5.5s.5-.22.5-.5V6c0-1.1-.9-2-2-2z"
                  fill="currentColor"
                />
                <path
                  d="M9 8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1H9z"
                  fill="currentColor"
                />
                <path
                  d="M14 8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1h-1z"
                  fill="currentColor"
                />
                <path
                  d="M9 12c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1H9z"
                  fill="currentColor"
                />
              </svg>
              
              {/* Glow effect */}
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 blur-md bg-accent-cyan/30 rounded-full"
              />
            </motion.div>
            
            {/* Title */}
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-purple bg-clip-text text-transparent">
                MindNero
              </span>
            </h1>
          </motion.div>
          
          {/* Subtitle */}
          <p className="text-sm text-gray-400 tracking-widest uppercase">
            Neural Visualization System
          </p>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
