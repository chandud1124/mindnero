import React from 'react';
import ConnectionStatus from './ConnectionStatus';
import useStore from '../store/useStore';

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

const Header = () => {
  const darkMode = useStore((s) => s.darkMode);
  const toggleDarkMode = useStore((s) => s.toggleDarkMode);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-5 py-2 sm:py-2.5"
      style={{ background: 'var(--header-gradient)' }}
    >
      <div className="flex items-center gap-3">
        <h1
          className="text-xs sm:text-sm font-medium tracking-wide"
          style={{ color: 'var(--text-primary)', fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          MindNero{' '}
          <span className="font-light hidden sm:inline" style={{ color: 'var(--text-secondary)' }}>
            Neural Simulation
          </span>
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleDarkMode}
          className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
          style={{
            color: 'var(--text-secondary)',
            background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            border: '1px solid var(--border)',
          }}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </button>
        <ConnectionStatus />
      </div>
    </header>
  );
};

export default Header;
