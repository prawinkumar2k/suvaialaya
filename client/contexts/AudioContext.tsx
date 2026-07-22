import React, { createContext, useContext, useState, useRef } from "react";

export type SoundType = 'hover' | 'click' | 'success';

interface AudioContextType {
  isPlaying: boolean;
  hasInteracted: boolean;
  initAudio: () => void;
  toggleAudio: () => void;
  playSoundEffect: (type: SoundType) => void;
}

const AudioContext = createContext<AudioContextType>({
  isPlaying: false,
  hasInteracted: false,
  initAudio: () => {},
  toggleAudio: () => {},
  playSoundEffect: () => {},
});

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Use Web Audio API to bypass CSP restrictions on external media
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);

  const initAudio = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Setup ambient background drone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime); // Low soothing frequency
      
      // LFO for pulsing effect
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.2; // slow pulse
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 10;
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      gain.gain.value = 0; // start muted
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      lfo.start();
      
      droneOscRef.current = osc;
      droneGainRef.current = gain;
      
      // Auto-start ambient audio
      gain.gain.setTargetAtTime(0.05, ctx.currentTime, 2);
      setIsPlaying(true);
    }
  };

  const toggleAudio = () => {
    if (!audioCtxRef.current || !droneGainRef.current) return;
    
    const ctx = audioCtxRef.current;
    
    if (isPlaying) {
      // Fade out
      droneGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
      setIsPlaying(false);
    } else {
      // Fade in
      droneGainRef.current.gain.setTargetAtTime(0.05, ctx.currentTime, 0.5);
      setIsPlaying(true);
    }
  };

  const playSoundEffect = (type: SoundType) => {
    if (!hasInteracted || !audioCtxRef.current) return;
    
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'hover') {
      // Soft high ping
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
      
    } else if (type === 'click') {
      // Solid click
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'success') {
      // Pleasant chord
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(554.37, ctx.currentTime); // C#
      osc2.connect(gain);
      
      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(659.25, ctx.currentTime); // E
      osc3.connect(gain);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      
      osc.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc3.start(ctx.currentTime);
      
      osc.stop(ctx.currentTime + 1);
      osc2.stop(ctx.currentTime + 1);
      osc3.stop(ctx.currentTime + 1);
    }
  };

  return (
    <AudioContext.Provider value={{ isPlaying, hasInteracted, initAudio, toggleAudio, playSoundEffect }}>
      {children}
    </AudioContext.Provider>
  );
};
