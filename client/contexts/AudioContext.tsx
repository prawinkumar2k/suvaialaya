import React, { createContext, useContext, useState } from "react";

export type SoundType = 'bell' | 'conch' | 'veena' | 'nadaswaram';

interface AudioContextType {
  isPlaying: boolean;
  toggleAudio: () => void;
  playSoundEffect: (type: SoundType) => void;
}

const AudioContext = createContext<AudioContextType>({
  isPlaying: false,
  toggleAudio: () => {},
  playSoundEffect: () => {},
});

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  // Audio playback is disabled in this environment to prevent CSP and network 404 errors.
  const isPlaying = false;
  const toggleAudio = () => {};
  const playSoundEffect = (type: SoundType) => {};

  return (
    <AudioContext.Provider value={{ isPlaying, toggleAudio, playSoundEffect }}>
      {children}
    </AudioContext.Provider>
  );
};
