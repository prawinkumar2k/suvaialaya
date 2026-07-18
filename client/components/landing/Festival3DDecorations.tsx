import { motion } from "framer-motion";

const FloatingElement = ({ children, delay, x, y, z, duration }: { children: React.ReactNode, delay: number, x: number | string, y: number | string, z: number | string, duration: number }) => (
  <motion.div
    className="absolute pointer-events-none drop-shadow-2xl z-20"
    style={{ left: x, top: y }}
    animate={{
      y: [0, -40, 0],
      rotateX: [0, 180, 360],
      rotateY: [0, 360, 0],
      rotateZ: [0, 90, 0],
      scale: [1, 1.2, 1],
      z: [0, z, 0] // True 3D depth movement
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }}
  >
    {children}
  </motion.div>
);

export function Festival3DDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden perspective-[2000px] transform-style-3d">
      <FloatingElement delay={0} x="10%" y="20%" z={200} duration={8}>
        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-temple-gold to-yellow-300 shadow-[0_0_50px_rgba(255,215,0,0.8)] border-4 border-white/40" />
      </FloatingElement>
      
      <FloatingElement delay={1} x="85%" y="15%" z={400} duration={12}>
        <div className="w-20 h-20 sm:w-32 sm:h-32 rotate-45 bg-gradient-to-br from-temple-orange to-red-500 shadow-[0_0_50px_rgba(255,122,0,0.8)] border-4 border-white/30" />
      </FloatingElement>
      
      <FloatingElement delay={2} x="20%" y="70%" z={150} duration={10}>
        <div className="w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-t from-temple-maroon to-pink-500 rounded-3xl shadow-[0_0_40px_rgba(230,0,92,0.8)] border-2 border-white/50" />
      </FloatingElement>
      
      <FloatingElement delay={0.5} x="75%" y="65%" z={300} duration={9}>
        <div className="w-24 h-24 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-teal-400 to-green-500 shadow-[0_0_60px_rgba(0,255,200,0.6)] border-8 border-white/20" />
      </FloatingElement>

      <FloatingElement delay={1.5} x="50%" y="85%" z={500} duration={14}>
        <div className="w-32 h-32 sm:w-48 sm:h-48 rotate-12 bg-gradient-to-bl from-purple-500 to-indigo-600 shadow-[0_0_80px_rgba(100,0,255,0.6)] border-4 border-white/30 rounded-full mix-blend-screen" />
      </FloatingElement>

      <FloatingElement delay={3} x="5%" y="45%" z={100} duration={11}>
        <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg rotate-45 shadow-[0_0_30px_rgba(0,200,255,0.8)] border-2 border-white/60" />
      </FloatingElement>
    </div>
  );
}
