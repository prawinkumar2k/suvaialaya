import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Instagram, Twitter, Linkedin } from "lucide-react";
import { BrandMark } from "@/components/landing/BrandMark";

interface Organizer {
  _id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export default function Organizers() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [pageSettings, setPageSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("/api/organizers"),
      axios.get("/api/settings")
    ])
      .then(([orgRes, setRes]) => {
        if (orgRes.data.success) {
          setOrganizers(orgRes.data.data);
        }
        if (setRes.data.success && setRes.data.data.organizersPage) {
          setPageSettings(setRes.data.data.organizersPage);
        }
      })
      .catch((err) => console.error("Failed to load organizers page data:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-[#1a3d2b] flex items-center justify-center relative">
        <Loader2 className="w-12 h-12 text-[#1a3d2b] animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#1a3d2b] relative overflow-hidden pb-32">
      {/* ── BACKGROUND ACCENTS ── */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1a3d2b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      
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

      <div className="mx-auto max-w-6xl px-5 pt-20 sm:px-8 lg:pt-28 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9841a]">{pageSettings?.heroEyebrow || "The Visionaries"}</p>
            <h1 className="font-display mt-4 text-4xl font-bold leading-tight sm:text-6xl text-[#1a3d2b] whitespace-pre-line">
              {pageSettings?.heroTitle || "Meet the Culinary Artists"}
            </h1>
            <p className="mt-6 text-lg text-[#1a3d2b]/70 leading-relaxed whitespace-pre-line">
              {pageSettings?.heroDescription || "Our master chefs and event curators bring decades of generational knowledge, uniting traditional Madurai recipes with world-class hospitality."}
            </p>
          </motion.div>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {organizers.map((organizer, index) => (
            <motion.div
              key={organizer._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.7, ease: "easeOut" }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100 mb-6">
                <img
                  src={organizer.imageUrl}
                  alt={organizer.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {organizer.socialLinks && (
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    {organizer.socialLinks.instagram && (
                      <a href={organizer.socialLinks.instagram} target="_blank" rel="noreferrer" className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white hover:text-[#1a3d2b] transition-colors">
                        <Instagram size={18} />
                      </a>
                    )}
                    {organizer.socialLinks.twitter && (
                      <a href={organizer.socialLinks.twitter} target="_blank" rel="noreferrer" className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white hover:text-[#1a3d2b] transition-colors">
                        <Twitter size={18} />
                      </a>
                    )}
                    {organizer.socialLinks.linkedin && (
                      <a href={organizer.socialLinks.linkedin} target="_blank" rel="noreferrer" className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white hover:text-[#1a3d2b] transition-colors">
                        <Linkedin size={18} />
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="text-center px-4">
                <h3 className="font-display text-2xl font-bold text-[#1a3d2b]">{organizer.name}</h3>
                <p className="text-sm font-semibold uppercase tracking-widest text-[#c9841a] mt-2 mb-4">{organizer.role}</p>
                <p className="text-[#1a3d2b]/70 text-sm leading-relaxed line-clamp-3">
                  {organizer.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
