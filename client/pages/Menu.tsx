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
    "Suvaialaya Briyani": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=1200",
    "Special Combo": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=1200",
    "Meals": "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?q=80&w=1200",
    "Mutton Starters": "https://images.unsplash.com/photo-1631452180519-c014fe946bc0?q=80&w=1200",
    "Chicken Starters": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1200",
    "Seafood Starters": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1200",
    "Tawa Breads": "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1200",
    "Parotta": "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?q=80&w=1200",
    "Non-veg Tiffin": "https://images.unsplash.com/photo-1610192244261-3f33de7155e2?q=80&w=1200",
    "Desserts": "https://images.unsplash.com/photo-1605197136006-25f0fcb7e416?q=80&w=1200"
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-accent/30 relative">
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none" />
      
      {/* Top Header */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary/70 hover:text-primary transition-colors">
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <BrandMark />
          </div>
          <div className="w-16"></div> {/* Spacer for perfect centering */}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 lg:py-20 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center flex flex-col items-center">
          <UtensilsCrossed size={40} className="text-accent mb-6" />
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary">The Official Menu</p>
          <h1 className="font-display mt-6 text-5xl font-bold leading-[1.1] sm:text-6xl text-primary">
            A feast curated <br className="hidden sm:block" /> for the soul.
          </h1>
          <p className="mt-6 text-lg text-foreground/80 max-w-xl text-center leading-relaxed">
            Prepared fresh daily, served hot on a banana leaf. Experience authentic Madurai flavors crafted from generations-old recipes.
          </p>
          <OrnamentalDivider />
        </motion.div>

        <div className="mt-8 space-y-20">
          {categories.map((category) => (
            <motion.div key={category} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
              
              {categoryImages[category as keyof typeof categoryImages] ? (
                <div className="mb-8 overflow-hidden rounded-2xl shadow-xl border-4 border-primary/10 h-48 sm:h-64 w-full relative group">
                  <img src={categoryImages[category as keyof typeof categoryImages]} alt={category} className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-white drop-shadow-md">{category}</h2>
                    <div className="h-0.5 w-16 bg-accent mt-3 rounded-full" />
                  </div>
                </div>
              ) : (
                <div className="text-center mb-10">
                  <h2 className="font-display text-4xl font-bold text-accent">{category}</h2>
                  <div className="h-0.5 w-16 bg-accent/40 mx-auto mt-4 rounded-full" />
                </div>
              )}
              <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {menuHighlights.filter(item => item.category === category).map((dish) => (
                  <motion.div 
                    key={dish.name} 
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="group flex flex-col justify-between rounded-xl border border-primary/20 bg-background p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-accent/10 hover:border-accent/40 relative overflow-hidden"
                  >
                    <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-20 group-hover:rotate-12 transition-all duration-500">
                      <Leaf size={100} className="text-accent" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="font-display font-bold text-2xl text-primary group-hover:text-accent transition-colors">{dish.name}</h3>
                      <p className="mt-3 text-sm text-foreground/75 leading-relaxed font-medium">{dish.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <OrnamentalDivider />
             <div className="text-center mb-10">
                <h2 className="font-display text-3xl font-bold text-primary">Welcome Experience</h2>
                <p className="text-sm text-foreground/70 mt-3 max-w-md mx-auto">Traditional Tamil hospitality greets every guest before the feast begins.</p>
             </div>
             <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
               {welcomeItems.map(item => (
                 <div key={item.name} className="text-center p-6 bg-background rounded-xl border border-primary/20 shadow-sm transition-transform hover:-translate-y-1">
                    <p className="font-display font-bold text-xl text-primary">{item.name}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-accent mt-3">{item.detail}</p>
                 </div>
               ))}
             </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
             <div className="text-center mb-10 mt-20">
                <h2 className="font-display text-3xl font-bold text-primary">Return Gift</h2>
                <p className="text-sm text-foreground/70 mt-3 max-w-md mx-auto">A small token of gratitude for joining our table.</p>
             </div>
             <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
               {returnGifts.map(item => (
                 <div key={item.name} className="text-center p-6 bg-background rounded-xl border border-primary/20 shadow-sm transition-transform hover:-translate-y-1">
                    <p className="font-display font-bold text-xl text-primary">{item.name}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-accent mt-3">{item.detail}</p>
                 </div>
               ))}
             </div>
          </motion.div>
          
          <div className="pt-16 pb-8 text-center">
            <Link to="/slots" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-10 py-5 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-xl transition-all hover:bg-primary/90 hover:scale-105">
              Book Your Seat
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
