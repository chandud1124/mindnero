import React from 'react';

const BackgroundEffects = () => (
  <div className="fixed inset-0 -z-10 pointer-events-none" style={{ background: '#F5F7FA' }}>
    {/* Clean white medical gradient */}
    <div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(180deg, #F5F7FA 0%, #EBF0F7 40%, #E3EAF4 100%)',
      }}
    />
    {/* Soft blue tint overlay */}
    <div
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 45%, rgba(31,111,235,0.03) 0%, transparent 70%)',
      }}
    />
    {/* Faint grid lines */}
    <div className="medical-grid absolute inset-0" />
  </div>
);

export default BackgroundEffects;
