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
  const categoryOrder = ["Welcome", "Sweet", "Soups", "Starters", "Main Course", "Dessert"];
  const categories = Array.from(new Set(menuHighlights.map(item => item.category)))
    .sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));

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

      <div className="mx-auto max-w-4xl px-5 py-24 sm:px-8 lg:py-32 relative z-10">
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

        <div className="mt-16 space-y-24">
          {categories.map((category) => (
            <motion.div key={category} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
              <div className="text-center mb-10">
                <h2 className="font-display text-4xl font-bold text-accent">{category}</h2>
                <div className="h-0.5 w-16 bg-accent/40 mx-auto mt-4 rounded-full" />
              </div>
              <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {menuHighlights.filter(item => item.category === category).map((dish) => (
                  <div key={dish.name} className="group flex flex-col justify-between rounded-xl border border-primary/10 bg-primary/5 p-6 transition-all hover:bg-primary/10 hover:border-primary/30 relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Leaf size={100} className="text-primary" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="font-display font-bold text-2xl text-primary">{dish.name}</h3>
                      <p className="mt-3 text-sm text-foreground/75 leading-relaxed">{dish.description}</p>
                    </div>
                  </div>
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
