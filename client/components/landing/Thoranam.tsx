import React from "react";
import { motion } from "framer-motion";

export function Thoranam() {
  // Creating a vibrant flower garland look (Yellow, Orange, Green)
  const garlands = Array.from({ length: 8 }); // Large swags

  return (
    <div className="fixed top-0 left-0 w-full overflow-hidden pointer-events-none z-[100] h-32 sm:h-40">
      <div className="flex w-full items-start justify-around">
        {garlands.map((_, i) => (
          <motion.div
            key={i}
            initial={{ rotate: -2, y: -10 }}
            animate={{ rotate: [ -2, 2, -1, 2, -2 ], y: [-10, -5, -10] }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random()
            }}
            style={{ originX: 0.5, originY: 0 }}
            className="relative flex-1 flex justify-center"
          >
            {/* The curved garland swag */}
            <svg viewBox="0 0 100 50" className="w-full h-auto drop-shadow-xl" preserveAspectRatio="none">
              <path 
                d="M 0,0 Q 50,50 100,0" 
                fill="none" 
                stroke="url(#garland-grad)" 
                strokeWidth="8" 
                strokeLinecap="round" 
                strokeDasharray="2 4"
              />
              <path 
                d="M 0,0 Q 50,60 100,0" 
                fill="none" 
                stroke="#FF4500" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeDasharray="2 6"
                opacity="0.8"
              />
              <defs>
                <linearGradient id="garland-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="50%" stopColor="#FFA500" />
                  <stop offset="100%" stopColor="#FFD700" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Hanging piece in the middle of each swag */}
            <div className="absolute top-8 sm:top-12 flex flex-col items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-400 mb-0.5 shadow-md" />
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-orange-500 mb-0.5 shadow-md" />
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-400 mb-0.5 shadow-md" />
              <div className="w-4 h-6 sm:w-5 sm:h-8 bg-green-600 rounded-b-full rounded-tr-full shadow-md transform rotate-12" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
