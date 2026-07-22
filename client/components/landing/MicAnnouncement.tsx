import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";

const announcements = [
  "WELCOME TO SUVAIALAYA FESTIVAL",
  "TODAY'S SPECIAL: MUTTON KARI VIRUNDHU",
  "11 AM - FOOD FESTIVAL OPENING",
  "3 PM - SPECIAL MEALS & DELICACIES",
  "7 PM - CULTURAL PROGRAMS START",
  "ONLY 15 SEATS LEFT FOR DINNER SLOT!"
];

export function MicAnnouncement() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % announcements.length);
    }, 5000); // changes every 5 seconds for visual impact
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-24 right-8 z-[90] pointer-events-none hidden md:flex items-center gap-3">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center overflow-hidden w-64 shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#C9841A] truncate w-full text-center"
          >
            {announcements[index]}
          </motion.div>
        </AnimatePresence>
      </div>
      <motion.div 
        animate={{ scale: [1, 1.2, 1] }} 
        transition={{ duration: 2, repeat: Infinity }}
        className="w-10 h-10 rounded-full bg-black/50 border border-[#C9841A]/50 flex items-center justify-center text-[#C9841A] backdrop-blur-md"
      >
        <Volume2 size={16} />
      </motion.div>
    </div>
  );
}
