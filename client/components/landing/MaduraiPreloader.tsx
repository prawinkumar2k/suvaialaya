import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/contexts/AudioContext";

export function MaduraiPreloader({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);
  const { toggleAudio, isPlaying, playSoundEffect } = useAudio();

  useEffect(() => {
    // Stage 0: Black screen, play sound, show lotus
    // Stage 1: "Digital Soul of Madurai"
    // Stage 2: "Welcome to Madurai"
    // Stage 3: "The city where tradition is served with love"
    // Stage 4: Fade out

    const sequence = async () => {
      await new Promise((r) => setTimeout(r, 1000));
      setStage(1);
      await new Promise((r) => setTimeout(r, 2500));
      setStage(2);
      await new Promise((r) => setTimeout(r, 2500));
      setStage(3);
      await new Promise((r) => setTimeout(r, 2500));
      setStage(4);
      setTimeout(onComplete, 1000);
    };

    sequence();
  }, [onComplete]);

  const handleEnter = () => {
    // This allows audio context to start
    playSoundEffect('bell');
    if (!isPlaying) toggleAudio();
  };

  return (
    <AnimatePresence>
      {stage < 4 && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-primary text-primary-foreground overflow-hidden"
          onClick={handleEnter}
        >
          {/* Animated Logo Background */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <img 
              src="/images/suvaialaya-logo.png" 
              alt="Suvaialaya Logo Background" 
              className="w-[800px] h-[800px] object-contain opacity-20 grayscale brightness-200 contrast-125 mix-blend-overlay"
            />
          </motion.div>

          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
            <AnimatePresence mode="wait">
              {stage === 0 && (
                <motion.div
                  key="stage0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 1 }}
                  className="flex flex-col items-center"
                >
                  <svg viewBox="0 0 100 100" className="w-16 h-16 text-temple-gold mb-6 animate-pulse" fill="currentColor">
                    <path d="M50 10 C60 30, 80 40, 90 50 C80 60, 60 70, 50 90 C40 70, 20 60, 10 50 C20 40, 40 30, 50 10 Z" />
                  </svg>
                  <p className="text-xs font-bold uppercase tracking-[0.4em] text-temple-gold/60">Tap anywhere to enter</p>
                </motion.div>
              )}

              {stage === 1 && (
                <motion.div
                  key="stage1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                  transition={{ duration: 1.5 }}
                >
                  <h1 className="font-display text-4xl md:text-6xl font-bold tracking-widest text-temple-gold uppercase">
                    SUVAIALAYA
                  </h1>
                  <p className="mt-4 text-sm font-bold uppercase tracking-[0.5em] text-primary-foreground/70">
                    Digital Soul Of Madurai
                  </p>
                </motion.div>
              )}

              {stage === 2 && (
                <motion.div
                  key="stage2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 1.5 }}
                >
                  <h2 className="font-display text-5xl md:text-7xl font-extrabold tracking-wider text-temple-orange uppercase leading-none drop-shadow-[0_0_30px_rgba(255,122,0,0.5)]">
                    Welcome to<br />Madurai Festival
                  </h2>
                </motion.div>
              )}

              {stage === 3 && (
                <motion.div
                  key="stage3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  className="max-w-xl"
                >
                  <p className="font-display text-3xl md:text-4xl italic text-temple-gold leading-relaxed">
                    "The city where tradition is served with love."
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
