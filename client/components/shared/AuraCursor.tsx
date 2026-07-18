import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function AuraCursor() {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth spring physics - slower and softer for the outer aura
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      // Offset by radius (16px for a w-8/h-8 container) to center it exactly on the mouse
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
      
      if (!isVisible) setIsVisible(true);
      
      // Check if hovering over clickable elements to trigger the magnetic spotlight effect
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
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

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none hidden sm:flex items-center justify-center w-8 h-8"
      style={{
        x: smoothX,
        y: smoothY,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Outer Aura Ring */}
      <motion.div
        animate={{
          scale: isHovering ? 2.5 : 1,
          backgroundColor: isHovering ? "rgba(212, 175, 55, 0.1)" : "rgba(212, 175, 55, 0)",
          borderWidth: isHovering ? "1px" : "2px",
          borderColor: isHovering ? "rgba(212, 175, 55, 0.4)" : "rgba(212, 175, 55, 0.8)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.3)]"
      />
      
      {/* Inner Glowing Core */}
      <motion.div
        animate={{
          scale: isHovering ? 0 : 1,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="w-1.5 h-1.5 bg-temple-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,1)]"
      />
    </motion.div>
  );
}
