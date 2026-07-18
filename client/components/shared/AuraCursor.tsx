import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue, useVelocity, useTransform } from "framer-motion";

export function AuraCursor() {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  // Calculate mouse velocity for 3D tilt
  const velocityX = useVelocity(smoothX);
  const velocityY = useVelocity(smoothY);

  // Transform velocity into 3D rotation angles
  const rotateY = useTransform(velocityX, [-1000, 1000], [-45, 45], { clamp: true });
  const rotateX = useTransform(velocityY, [-1000, 1000], [45, -45], { clamp: true });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 24); // Center a 48x48 container
      cursorY.set(e.clientY - 24);
      
      if (!isVisible) setIsVisible(true);
      
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
      className="fixed top-0 left-0 z-[9999] pointer-events-none hidden sm:flex items-center justify-center w-12 h-12"
      style={{
        x: smoothX,
        y: smoothY,
        opacity: isVisible ? 1 : 0,
        perspective: "1000px"
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative w-8 h-8 flex items-center justify-center"
      >
        {/* 3D Gold Coin Base */}
        <motion.div 
          animate={{ rotateZ: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-[3px] border-temple-gold shadow-[0_0_15px_rgba(212,175,55,0.8),inset_0_0_10px_rgba(212,175,55,0.5)] bg-gradient-to-tr from-temple-gold via-yellow-200 to-yellow-600 opacity-80"
          style={{ transform: "translateZ(0px)" }}
        />
        
        {/* 3D Depth Layer 1 (Stacking for 3D thickness) */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-temple-gold/40 border border-yellow-300"
          style={{ transform: "translateZ(-4px) scale(0.95)" }}
        />
        
        {/* 3D Inner Core */}
        <motion.div 
          className="w-3 h-3 bg-white rounded-full shadow-[0_0_20px_#fff]"
          style={{ transform: "translateZ(10px)" }}
        />
      </motion.div>
    </motion.div>
  );
}
