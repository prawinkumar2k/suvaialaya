import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChefHat, Heart, Leaf, MapPin, Users } from "lucide-react";
import { BrandMark } from "@/components/landing/BrandMark";

export default function About() {
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

      <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 lg:py-28 relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9841a]">Our Story</p>
          <h1 className="font-display mt-4 text-4xl font-bold leading-tight sm:text-5xl text-[#1a3d2b]">
            A celebration of Madurai's <br className="hidden md:block"/> rich culinary heritage.
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-12 space-y-8 text-lg leading-relaxed text-[#1a3d2b]/70 max-w-2xl mx-auto">
          <p>
            Madurai Kari Virundhu was born from a simple idea: to bring the authentic, unfiltered flavors of Madurai to a communal table. We believe that food is more than sustenance; it is a story, a memory, and a bridge between generations.
          </p>
          <p>
            For nine days, we transform a beautiful venue into a haven of hospitality. Our chefs are not just cooks; they are custodians of recipes passed down through families, utilizing traditional cooking methods that are rarely seen in modern kitchens.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2" style={{ perspective: 1000 }}>
          {[
            { icon: ChefHat, title: "Master Chefs", desc: "Local culinary legends bringing decades of experience." },
            { icon: Leaf, title: "Fresh Ingredients", desc: "Sourced daily from the local markets of Madurai." },
            { icon: Users, title: "Communal Dining", desc: "Long tables designed for shared experiences and new friends." },
            { icon: Heart, title: "Made with Love", desc: "Every dish is prepared with the utmost care and passion." }
          ].map((feature, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              whileHover={{ rotateX: 2, rotateY: -2, scale: 1.02 }}
              viewport={{ once: true }} 
              transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 300, damping: 20 }} 
              className="rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-full bg-[#1a3d2b]/5 flex items-center justify-center mb-6 group-hover:bg-[#1a3d2b]/10 transition-colors">
                <feature.icon className="h-8 w-8 text-[#1a3d2b]" />
              </div>
              <h3 className="font-display text-2xl font-bold text-[#1a3d2b]">{feature.title}</h3>
              <p className="mt-3 text-sm text-[#1a3d2b]/60 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
