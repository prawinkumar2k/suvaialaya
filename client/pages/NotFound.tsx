import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="grid min-h-screen place-items-center bg-white px-6 text-center text-[#1a3d2b] relative overflow-hidden">
      {/* ── BACKGROUND ACCENTS ── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
      
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <BrandMark />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        style={{ perspective: 1000 }}
        className="relative z-10"
      >
        <motion.div
          whileHover={{ rotateX: 2, rotateY: -2, scale: 1.01 }}
          className="bg-white p-12 rounded-3xl border border-[#1a3d2b]/10 shadow-2xl flex flex-col items-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#c9841a]">404 Error</p>
          <h1 className="mt-3 text-5xl font-display font-bold tracking-tight text-[#1a3d2b]">Page Not Found</h1>
          <p className="mt-4 text-sm font-medium text-[#1a3d2b]/60 max-w-sm leading-relaxed">Let's get you back to our curated culinary experiences.</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="mt-8 inline-flex rounded-xl bg-[#1a3d2b] px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-white shadow-lg hover:bg-[#1a3d2b]/90 transition-colors">
              Return Home
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
}
