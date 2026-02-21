import React from 'react';
import useStore from '../store/useStore';

const HeartbeatWaveform = () => {
  const activeSensor = useStore((s) => s.activeSensor);
  const darkMode = useStore((s) => s.darkMode);

  return (
    <div
      className="fixed bottom-10 left-0 right-0 z-10 pointer-events-none overflow-hidden"
      style={{ height: 28 }}
    >
      <svg
        className="ecg-scroll"
        viewBox="0 0 600 40"
        preserveAspectRatio="none"
        style={{
          width: '200%',
          height: '100%',
          opacity: activeSensor ? 0.3 : 0.1,
          transition: 'opacity 0.5s',
        }}
      >
        <polyline
          fill="none"
          stroke={darkMode ? '#3B82F6' : '#1F6FEB'}
          strokeWidth="1"
          points="0,20 40,20 55,20 60,8 65,32 70,20 85,20 140,20 155,20 160,8 165,32 170,20 185,20 240,20 255,20 260,8 265,32 270,20 285,20 340,20 355,20 360,8 365,32 370,20 385,20 440,20 455,20 460,8 465,32 470,20 485,20 540,20 555,20 560,8 565,32 570,20 585,20 600,20"
        />
      </svg>
    </div>
  );
};

export default HeartbeatWaveform;
