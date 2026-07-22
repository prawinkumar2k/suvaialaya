import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Leaf, UtensilsCrossed } from "lucide-react";
import { BrandMark } from "@/components/landing/BrandMark";
import { menuHighlights, welcomeItems, returnGifts } from "@/data/madurai-festival";

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-8 opacity-70">
      <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary"></div>
      <Leaf size={16} className="text-accent" />
      <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary"></div>
    </div>
  );
}

export default function Menu() {
  const categoryOrder = [
    "Suvaialaya Briyani",
    "Special Combo",
    "Meals",
    "Mutton Starters",
    "Chicken Starters",
    "Seafood Starters",
    "Tawa Breads",
    "Parotta",
    "Non-veg Tiffin",
    "Desserts"
  ];
  const categories = Array.from(new Set(menuHighlights.map(item => item.category)))
    .sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

  const categoryImages: Record<string, string> = {
    "Suvaialaya Briyani": "/images/food/mutton_briyani.png",
    "Special Combo": "/images/food/kongu_meals.png",
    "Meals": "/images/food/kongu_meals.png",
    "Mutton Starters": "/images/food/mutton_kola_urundai.png",
    "Chicken Starters": "/images/food/chettinad_chicken.png",
    "Seafood Starters": "/images/food/meen_polichathu.png",
    "Tawa Breads": "/images/food/bun_parotta.png",
    "Parotta": "/images/food/bun_parotta.png",
    "Non-veg Tiffin": "/images/food/karaikudi_mutton.png",
    "Desserts": "/images/food/elaneer_payasam.png"
  };

  return (
    <main className="min-h-screen bg-white text-[#1a3d2b] relative overflow-hidden">
      {/* ── BACKGROUND ACCENTS ── */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#1a3d2b]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#1a3d2b]/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 hover:text-[#1a3d2b] transition-colors">
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <BrandMark />
          </div>
          <div className="w-16"></div> {/* Spacer for perfect centering */}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:py-20 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center flex flex-col items-center">
          <UtensilsCrossed size={40} className="text-[#c9841a] mb-6" />
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#1a3d2b]/40">The Official Menu</p>
          <h1 className="font-display mt-6 text-5xl font-bold leading-[1.1] sm:text-6xl text-[#1a3d2b]">
            A feast curated <br className="hidden sm:block" /> for the soul.
          </h1>
          <p className="mt-6 text-lg text-[#1a3d2b]/70 max-w-xl text-center leading-relaxed">
            Prepared fresh daily, served hot on a banana leaf. Experience authentic Madurai flavors crafted from generations-old recipes.
          </p>
          <OrnamentalDivider />
        </motion.div>

        <div className="mt-8 space-y-24">
          {categories.map((category) => (
            <motion.div key={category} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
              
              {categoryImages[category as keyof typeof categoryImages] ? (
                <div className="mb-10 overflow-hidden rounded-3xl shadow-xl h-48 sm:h-[400px] w-full relative group">
                  <img src={categoryImages[category as keyof typeof categoryImages]} alt={category} className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-10 left-10 right-10">
                    <h2 className="font-display text-4xl sm:text-5xl font-bold text-white drop-shadow-md">{category}</h2>
                    <div className="h-1 w-20 bg-[#c9841a] mt-4 rounded-full" />
                  </div>
                </div>
              ) : (
                <div className="text-center mb-10">
                  <h2 className="font-display text-4xl font-bold text-[#1a3d2b]">{category}</h2>
                  <div className="h-0.5 w-16 bg-[#c9841a]/40 mx-auto mt-4 rounded-full" />
                </div>
              )}
              
              <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2" style={{ perspective: 1000 }}>
                {menuHighlights.filter(item => item.category === category).map((dish) => (
                  <motion.div 
                    key={dish.name} 
                    whileHover={{ y: -5, rotateX: 2, rotateY: -2, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all relative overflow-hidden"
                  >
                    <div className="absolute -right-6 -bottom-6 opacity-[0.02] group-hover:opacity-5 group-hover:rotate-12 transition-all duration-500">
                      <Leaf size={120} className="text-[#1a3d2b]" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="font-display font-bold text-2xl text-[#1a3d2b]">{dish.name}</h3>
                      <p className="mt-3 text-sm text-[#1a3d2b]/60 leading-relaxed">{dish.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <OrnamentalDivider />
             <div className="text-center mb-10 mt-20">
                <h2 className="font-display text-3xl font-bold text-[#1a3d2b]">Welcome Experience</h2>
                <p className="text-sm text-[#1a3d2b]/60 mt-3 max-w-md mx-auto">Traditional Tamil hospitality greets every guest before the feast begins.</p>
             </div>
             <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
               {welcomeItems.map(item => (
                 <motion.div whileHover={{ y: -5 }} key={item.name} className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100 transition-transform">
                    <p className="font-display font-bold text-xl text-[#1a3d2b]">{item.name}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#c9841a] mt-3">{item.detail}</p>
                 </motion.div>
               ))}
             </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
             <div className="text-center mb-10 mt-20">
                <h2 className="font-display text-3xl font-bold text-[#1a3d2b]">Return Gift</h2>
                <p className="text-sm text-[#1a3d2b]/60 mt-3 max-w-md mx-auto">A small token of gratitude for joining our table.</p>
             </div>
             <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
               {returnGifts.map(item => (
                 <motion.div whileHover={{ y: -5 }} key={item.name} className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100 transition-transform">
                    <p className="font-display font-bold text-xl text-[#1a3d2b]">{item.name}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#c9841a] mt-3">{item.detail}</p>
                 </motion.div>
               ))}
             </div>
          </motion.div>
          
          <div className="pt-20 pb-12 text-center">
            <Link to="/slots" className="inline-flex items-center justify-center gap-3 rounded-xl bg-[#1a3d2b] px-10 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-xl transition-all hover:bg-[#2d6a4f] hover:scale-105">
              Book Your Seat
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
