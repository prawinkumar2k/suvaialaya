import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Royalty-free traditional Indian instrumental/Nadaswaram vibe
    const audio = new Audio("https://cdn.pixabay.com/download/audio/2022/10/25/audio_2d8b5a033a.mp3?filename=indian-meditation-122421.mp3");
    audio.loop = true;
    audio.volume = 0.3; // Soft ambient volume
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const playSoundEffect = (type: SoundType) => {
    // Map of sound URLs (using royalty free pixabay URLs for demo)
    const sounds = {
      bell: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_9b61d33190.mp3?filename=temple-bell-11814.mp3",
      conch: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_24a2c07ef5.mp3?filename=conch-shell-blow-96020.mp3",
      veena: "https://cdn.pixabay.com/download/audio/2022/10/24/audio_34b3f2ccab.mp3?filename=indian-flute-and-veena-121966.mp3",
      nadaswaram: "https://cdn.pixabay.com/download/audio/2022/11/24/audio_e40c660706.mp3?filename=indian-wedding-music-125950.mp3"
    };
    
    if (sounds[type]) {
      const effect = new Audio(sounds[type]);
      effect.volume = 0.5;
      effect.play().catch(e => console.log("Sound effect prevented:", e));
    }
  };

  const toggleAudio = () => {
    setHasInteracted(true);
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.log("Audio play prevented:", e));
      setIsPlaying(true);
    }
  };

  return (
    <AudioContext.Provider value={{ isPlaying, toggleAudio, playSoundEffect }}>
      {children}
      
      {/* Floating Audio Toggle */}
      <AnimatePresence>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleAudio}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-2xl ring-4 ring-accent/20 transition-all hover:bg-accent/90"
          aria-label={isPlaying ? "Mute ambient sounds" : "Play ambient sounds"}
        >
          {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
          
          {/* Subtle pulse ring when playing */}
          {isPlaying && (
            <div className="absolute inset-0 rounded-full border border-accent animate-ping opacity-50" />
          )}
        </motion.button>
      </AnimatePresence>
    </AudioContext.Provider>
  );
};
