import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BrandMark } from "@/components/landing/BrandMark";

export default function Gallery() {
  const [gallerySettings, setGallerySettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/settings")
      .then(res => {
        if (res.data.success) {
          setGallerySettings(res.data.data.galleryPage || null);
        }
      })
      .catch(err => console.error("Failed to load settings:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-[#1a3d2b] flex items-center justify-center relative">
        <Loader2 className="w-12 h-12 text-[#1a3d2b] animate-spin" />
      </main>
    );
  }

  const images = gallerySettings?.images || [];

  return (
    <main className="min-h-screen bg-white text-[#1a3d2b] relative overflow-hidden">
      {/* ── BACKGROUND ACCENTS ── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center px-5 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 hover:text-[#1a3d2b] transition-colors">
            <ArrowLeft size={16} /> Back to home
          </Link>
          <div className="ml-auto">
            <BrandMark />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9841a]">{gallerySettings?.heroEyebrow || "Gallery"}</p>
          <h1 className="font-display mt-4 text-4xl font-bold leading-tight sm:text-5xl text-[#1a3d2b] whitespace-pre-line">
            {gallerySettings?.heroTitle || "A glimpse into the feast."}
          </h1>
          <p className="mt-4 text-[#1a3d2b]/70 whitespace-pre-line">{gallerySettings?.heroDescription || "The sights, colors, and textures of Madurai Kari Virundhu."}</p>
        </motion.div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 auto-rows-[250px]" style={{ perspective: 1000 }}>
          {images.map((img: any, i: number) => (
            <motion.div 
              key={img._id || i} 
              initial={{ opacity: 0, scale: 0.95 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              whileHover={{ rotateX: 2, rotateY: -2, scale: 1.02, zIndex: 10 }}
              viewport={{ once: true }} 
              transition={{ duration: 0.5, delay: i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
              className={`relative overflow-hidden rounded-2xl group shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-white ${img.className}`}
            >
              <div className="absolute inset-0 bg-[#1a3d2b]/10 group-hover:bg-transparent transition-colors z-10 duration-500" />
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
