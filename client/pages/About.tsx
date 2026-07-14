import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChefHat, Heart, Leaf, MapPin, Users } from "lucide-react";
import { BrandMark } from "@/components/landing/BrandMark";

export default function About() {
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

      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Our Story</p>
          <h1 className="font-display mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            A celebration of Madurai's rich culinary heritage.
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-12 space-y-8 text-lg leading-relaxed text-muted-foreground">
          <p>
            Madurai Kari Virundhu was born from a simple idea: to bring the authentic, unfiltered flavors of Madurai to a communal table. We believe that food is more than sustenance; it is a story, a memory, and a bridge between generations.
          </p>
          <p>
            For nine days, we transform a beautiful venue into a haven of hospitality. Our chefs are not just cooks; they are custodians of recipes passed down through families, utilizing traditional cooking methods that are rarely seen in modern kitchens.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {[
            { icon: ChefHat, title: "Master Chefs", desc: "Local culinary legends bringing decades of experience." },
            { icon: Leaf, title: "Fresh Ingredients", desc: "Sourced daily from the local markets of Madurai." },
            { icon: Users, title: "Communal Dining", desc: "Long tables designed for shared experiences and new friends." },
            { icon: Heart, title: "Made with Love", desc: "Every dish is prepared with the utmost care and passion." }
          ].map((feature, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.1 }} className="rounded-2xl border border-border bg-card p-6">
              <feature.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
