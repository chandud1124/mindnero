import React from 'react';
import ConnectionStatus from './ConnectionStatus';

const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-2.5"
    style={{ background: 'linear-gradient(180deg, rgba(245,247,250,0.95) 0%, rgba(245,247,250,0) 100%)' }}>
    <div className="flex items-center gap-3">
      <h1 className="text-sm font-medium tracking-wide" style={{ color: '#2E2E2E', fontFamily: "'Inter', system-ui, sans-serif" }}>
        MindNero <span className="font-light" style={{ color: '#6B7280' }}>Neural Simulation</span>
      </h1>
    </div>
    <ConnectionStatus />
  </header>
);

export default Header;
