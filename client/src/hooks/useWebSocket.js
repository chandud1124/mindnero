import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import useStore, { BRAIN_MAPPING } from '../store/useStore';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

const useWebSocket = () => {
  const socketRef = useRef(null);
  const { setConnectionStatus, activateSensor, soundEnabled } = useStore();

  const playNeuronSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch (_) {
      /* audio blocked */
    }
  }, [soundEnabled]);

  useEffect(() => {
    // Avoid double-connect in React StrictMode
    if (socketRef.current?.connected) return;

    setConnectionStatus('connecting');

    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[socket.io] connected', socket.id);
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('[socket.io] disconnected');
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('sensor_activation', (data) => {
      console.log('[sensor]', data);
      playNeuronSound();
      activateSensor(data);
    });

    // Also accept raw ESP32 format
    socket.on('message', (raw) => {
      try {
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (data.sensor && BRAIN_MAPPING[data.sensor]) {
          playNeuronSound();
          activateSensor({ sensor: data.sensor, intensity: data.intensity });
        }
      } catch (_) { /* ignore */ }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return socketRef;
};

export default useWebSocket;
