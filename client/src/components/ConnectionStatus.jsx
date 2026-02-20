import React from 'react';
import useStore from '../store/useStore';

const STATUS = {
  connected: { label: 'ESP32 Online', color: '#16A34A', bg: 'rgba(22,163,74,0.08)' },
  connecting: { label: 'Connecting…', color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
  disconnected: { label: 'Offline', color: '#9CA3AF', bg: 'rgba(156,163,175,0.08)' },
  error: { label: 'Error', color: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
};

const ConnectionStatus = () => {
  const connectionStatus = useStore((s) => s.connectionStatus);
  const st = STATUS[connectionStatus] || STATUS.disconnected;

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
      style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}22` }}
    >
      <span className="block w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />
      {st.label}
    </div>
  );
};

export default ConnectionStatus;
