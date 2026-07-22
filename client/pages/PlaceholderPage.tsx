import { ArrowLeft, Sparkles, Leaf } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";

export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  const title = (segments[segments.length - 1] ?? "Page").replace(/-/g, " ");

  return (
    <main className="min-h-screen bg-white px-6 py-6 text-[#1a3d2b] sm:px-10 relative overflow-hidden">
      {/* ── BACKGROUND ACCENTS ── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <BrandMark />
      
      <section className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center text-center relative z-10" style={{ perspective: 1000 }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ rotateX: 2, rotateY: -2, scale: 1.01 }}
          className="bg-white p-12 rounded-3xl border border-[#1a3d2b]/10 shadow-2xl flex flex-col items-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
            <Leaf size={120} className="text-[#1a3d2b]" />
          </div>

          <span className="mb-6 grid size-16 place-items-center rounded-2xl bg-[#c9841a]/10 border border-[#c9841a]/20 text-[#c9841a] shadow-sm">
            <Sparkles size={28} />
          </span>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">Coming soon</p>
          <h1 className="text-4xl font-display font-bold capitalize tracking-tight sm:text-5xl text-[#1a3d2b] mb-4">{title}</h1>
          <p className="mt-2 text-sm font-medium leading-relaxed text-[#1a3d2b]/70 max-w-sm">
            This culinary experience is currently being prepared. Check back soon for updates.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#1a3d2b] px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-white shadow-lg hover:bg-[#1a3d2b]/90 transition-colors">
              <ArrowLeft size={16} /> Return to Home
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
