import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// A simple jasmine flower SVG
const JasmineFlower = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10 C60 30, 80 40, 90 50 C80 60, 60 70, 50 90 C40 70, 20 60, 10 50 C20 40, 40 30, 50 10 Z" />
    <circle cx="50" cy="50" r="10" fill="#d4af37" />
  </svg>
);

export function CulturalParticles() {
  const [particles, setParticles] = useState<{ id: number; x: number; delay: number; size: number; duration: number }[]>([]);

  useEffect(() => {
    // Generate 15 floating particles
    const generated = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // random x position (percentage)
      delay: Math.random() * 5, // random start delay
      size: Math.random() * 15 + 10, // size between 10 and 25
      duration: Math.random() * 10 + 15, // float duration between 15 and 25 seconds
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute text-background drop-shadow-md opacity-40"
          style={{ left: `${p.x}%`, bottom: "-50px" }}
          animate={{
            y: [0, -window.innerHeight - 100],
            x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        >
          <JasmineFlower className="text-white/80" style={{ width: p.size, height: p.size }} />
        </motion.div>
      ))}
      
      {/* Toran (Mango Leaves & Marigold) Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-12 md:h-16 flex justify-around overflow-hidden opacity-90 drop-shadow-md z-50 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={`toran-${i}`} className="flex flex-col items-center -mt-2">
            {/* Mango Leaf */}
            <svg viewBox="0 0 20 40" className="w-6 h-10 md:w-8 md:h-14 text-[#2E7D32]" fill="currentColor">
              <path d="M10 0 C0 10, 0 30, 10 40 C20 30, 20 10, 10 0 Z" />
              <path d="M10 0 L10 40" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            </svg>
            {/* Marigold Flower */}
            <div className="w-3 h-3 md:w-4 md:h-4 bg-orange-500 rounded-full -mt-2 shadow-[0_0_8px_rgba(249,115,22,0.8)] border border-orange-400" />
            <div className="w-2 h-2 md:w-3 md:h-3 bg-yellow-400 rounded-full -mt-2 shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
          </div>
        ))}
      </div>
      
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl mix-blend-screen animate-pulse duration-[10000ms]" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl mix-blend-multiply" />
    </div>
  );
}
