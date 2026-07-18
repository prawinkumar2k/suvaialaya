import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function BananaCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth spring physics for that cinematic floating feel
  const springConfig = { damping: 28, stiffness: 400, mass: 0.2 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      // Offset by roughly half the size to center the "pointer" tip
      cursorX.set(e.clientX - 8);
      cursorY.set(e.clientY - 8);
      
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  // Hide the cursor on mobile/touch devices since they don't need custom cursors
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  if (isTouchDevice) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
      style={{
        x: smoothX,
        y: smoothY,
        opacity: isVisible ? 1 : 0,
      }}
    >
      <motion.div
        animate={{
          rotate: [-5, 10, -5],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-[#32CD32] drop-shadow-[0_0_12px_rgba(50,205,50,0.8)]"
      >
        {/* Custom Long Banana Leaf SVG */}
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: "rotate(-20deg)" }}
        >
          <path 
            d="M36.19 3.81C36.19 3.81 38.6 15.65 31.86 24.32C25.13 32.99 10 38.5 5 40C3.5 38 1.5 34.5 3.5 33.5C5.5 32.5 12.36 21.32 19.1 12.65C25.83 3.98 36.19 3.81 36.19 3.81Z" 
            fill="currentColor"
            className="opacity-90"
          />
          {/* Main Stem Line */}
          <path 
            d="M5 40C12 30 25 15 36.19 3.81" 
            stroke="#1a472a" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
          {/* Side Veins */}
          <path d="M12.5 30L20 28" stroke="#1a472a" strokeWidth="0.5" />
          <path d="M17.5 24L26 23" stroke="#1a472a" strokeWidth="0.5" />
          <path d="M24 16L32 16" stroke="#1a472a" strokeWidth="0.5" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
