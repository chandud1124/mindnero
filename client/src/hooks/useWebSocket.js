import { useEffect, useRef, useCallback } from 'react';
import useStore from '../store/useStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

export const useWebSocket = () => {
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef(null);
  
  const { setConnectionStatus, activateSensor, soundEnabled } = useStore();

  // Play neuron fire sound
  const playNeuronSound = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create oscillator for "zap" effect
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      // Add a subtle "pop" effect
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.type = 'sine';
      oscillator2.frequency.setValueAtTime(1200, audioContext.currentTime + 0.05);
      oscillator2.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2);
      
      gainNode2.gain.setValueAtTime(0.15, audioContext.currentTime + 0.05);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator2.start(audioContext.currentTime + 0.05);
      oscillator2.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [soundEnabled]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    setConnectionStatus('connecting');
    console.log(`🔌 Connecting to WebSocket: ${WS_URL}`);
    
    try {
      wsRef.current = new WebSocket(WS_URL);
      
      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected');
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Received:', data);
          
          if (data.type === 'sensor_activation') {
            playNeuronSound();
            activateSensor(data);
          }
        } catch (e) {
          console.error('Failed to parse message:', e);
        }
      };
      
      wsRef.current.onclose = (event) => {
        console.log('❌ WebSocket disconnected');
        setConnectionStatus('disconnected');
        
        // Attempt reconnection
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current++;
          console.log(`🔄 Reconnecting... (attempt ${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`);
          
          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionStatus('disconnected');
    }
  }, [setConnectionStatus, activateSensor, playNeuronSound]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
  }, [setConnectionStatus]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  };
};

export default useWebSocket;
