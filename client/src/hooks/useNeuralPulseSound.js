import { useEffect, useRef } from 'react';
import useStore from '../store/useStore';

// Neural pulse sound generator using Web Audio API
const useNeuralPulseSound = () => {
  const audioContextRef = useRef(null);
  const { activeSensor, soundEnabled } = useStore();
  
  useEffect(() => {
    // Initialize Audio Context
    if (!audioContextRef.current && typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  useEffect(() => {
    if (!activeSensor || !soundEnabled || !audioContextRef.current) return;
    
    const audioContext = audioContextRef.current;
    const mapping = useStore.getState().activeSensor;
    
    // Create a realistic neural pulse sound
    const playNeuralPulse = () => {
      const now = audioContext.currentTime;
      
      // Create oscillators for complex neural sound
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const oscillator3 = audioContext.createOscillator();
      
      // Create gain nodes for volume control
      const gainNode = audioContext.createGain();
      const masterGain = audioContext.createGain();
      
      // Create filter for more organic sound
      const filter = audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 1;
      
      // Configure oscillators (harmonics for realistic neural sound)
      oscillator1.type = 'sine';
      oscillator1.frequency.setValueAtTime(400, now);
      oscillator1.frequency.exponentialRampToValueAtTime(200, now + 0.1);
      
      oscillator2.type = 'sine';
      oscillator2.frequency.setValueAtTime(800, now);
      oscillator2.frequency.exponentialRampToValueAtTime(400, now + 0.15);
      
      oscillator3.type = 'triangle';
      oscillator3.frequency.setValueAtTime(150, now);
      oscillator3.frequency.linearRampToValueAtTime(80, now + 0.2);
      
      // Volume envelope (ADSR-like)
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.01); // Attack
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.05); // Decay
      gainNode.gain.linearRampToValueAtTime(0.05, now + 0.15); // Sustain
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3); // Release
      
      masterGain.gain.value = 0.3;
      
      // Connect audio nodes
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      oscillator3.connect(gainNode);
      gainNode.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(audioContext.destination);
      
      // Start and stop oscillators
      oscillator1.start(now);
      oscillator2.start(now + 0.02);
      oscillator3.start(now + 0.04);
      
      oscillator1.stop(now + 0.3);
      oscillator2.stop(now + 0.35);
      oscillator3.stop(now + 0.4);
    };
    
    // Play pulse sequence (neural transmission timing)
    const pulseSequence = [0, 100, 200, 350, 500, 700]; // Realistic neural timing
    
    pulseSequence.forEach((delay, index) => {
      setTimeout(() => {
        playNeuralPulse();
      }, delay);
    });
    
  }, [activeSensor, soundEnabled]);
  
  return null; // This is a hook component
};

export default useNeuralPulseSound;
