import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/landing/BrandMark";

export default function Gallery() {
  // Mock image placeholders
  const images = [
    { id: 1, src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop", alt: "Food preparation", className: "col-span-2 row-span-2" },
    { id: 2, src: "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?q=80&w=400&auto=format&fit=crop", alt: "Spices", className: "col-span-1 row-span-1" },
    { id: 3, src: "https://images.unsplash.com/photo-1626804475297-41609ea0d4eb?q=80&w=400&auto=format&fit=crop", alt: "Cooking", className: "col-span-1 row-span-1" },
    { id: 4, src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop", alt: "Feast", className: "col-span-2 row-span-1" },
    { id: 5, src: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=400&auto=format&fit=crop", alt: "Curry", className: "col-span-1 row-span-2" },
    { id: 6, src: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400&auto=format&fit=crop", alt: "Sweets", className: "col-span-1 row-span-1" },
    { id: 7, src: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=400&auto=format&fit=crop", alt: "Biryani", className: "col-span-1 row-span-1" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center px-5 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={16} /> Back to home
          </Link>
          <div className="ml-auto">
            <BrandMark />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Gallery</p>
          <h1 className="font-display mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            A glimpse into the feast.
          </h1>
          <p className="mt-4 text-muted-foreground">The sights, colors, and textures of Madurai Kari Virundhu.</p>
        </motion.div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {images.map((img, i) => (
            <motion.div 
              key={img.id} 
              initial={{ opacity: 0, scale: 0.95 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true }} 
              transition={{ delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-xl group ${img.className}`}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
