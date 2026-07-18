import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, CalendarDays, Clock3, MapPin, Menu, Minus, Plus, Star, Users, X, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandMark } from "@/components/landing/BrandMark";
import { MaduraiPreloader } from "@/components/landing/MaduraiPreloader";
import { faqs, festival, menuHighlights, testimonials } from "@/data/madurai-festival";

function Countdown() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0 });
  useEffect(() => {
    const update = () => {
      const target = new Date("2026-08-01T11:00:00").getTime();
      const distance = Math.max(0, target - Date.now());
      setTime({
        days: Math.floor(distance / 86400000),
        hours: Math.floor(distance / 3600000) % 24,
        minutes: Math.floor(distance / 60000) % 60,
      });
    };
    update();
    const interval = window.setInterval(update, 60000);
    return () => window.clearInterval(interval);
  }, []);
  return (
    <div className="flex items-center gap-4 sm:gap-6">
      {Object.entries(time).map(([label, value]) => (
        <div key={label} className="text-center relative">
          <p className="font-display text-3xl font-bold text-primary sm:text-4xl">{String(value).padStart(2, "0")}</p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">{label}</p>
        </div>
      ))}
    </div>
  );
}

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-8 opacity-70">
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary"></div>
      <Leaf size={16} className="text-accent" />
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary"></div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, copy, light = false }: { eyebrow: string; title: string; copy?: string; light?: boolean }) {
  return (
    <div className={`text-center flex flex-col items-center ${light ? "text-primary-foreground" : "text-foreground"}`}>
      <p className={`text-sm font-bold uppercase tracking-[0.25em] ${light ? "text-accent" : "text-primary"}`}>{eyebrow}</p>
      <h2 className="font-display mt-4 max-w-2xl text-4xl font-bold leading-[1.1] sm:text-5xl">{title}</h2>
      {copy && <p className={`mt-5 max-w-xl text-center leading-relaxed ${light ? "text-primary-foreground/80" : "text-foreground/70"}`}>{copy}</p>}
      <OrnamentalDivider />
    </div>
  );
}

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [preloaderComplete, setPreloaderComplete] = useState(false);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const navItems = [{ label: "The Experience", id: "experience" }, { label: "The Menu", id: "menu" }, { label: "Good to know", id: "faq" }];

  return (
    <main className="overflow-hidden bg-background text-foreground selection:bg-accent/30">
      {!preloaderComplete && <MaduraiPreloader onComplete={() => setPreloaderComplete(true)} />}
      {/* Decorative Top Border */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />

      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <BrandMark />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <button key={item.id} type="button" onClick={() => scrollTo(item.id)} className="text-sm font-semibold tracking-wide text-primary/80 transition-colors hover:text-accent">
                {item.label}
              </button>
            ))}
          </nav>
          <div className="hidden items-center gap-5 md:flex">
            <Link to="/login" className="text-sm font-semibold tracking-wide text-primary/80 transition-colors hover:text-accent">
              Sign In
            </Link>
            <Link to="/slots" className="rounded-md border border-accent bg-primary px-6 py-2.5 text-sm font-bold tracking-wide text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg">
              Book Now
            </Link>
          </div>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-primary">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="border-t border-border/50 bg-background px-5 py-4 shadow-lg md:hidden">
            {navItems.map((item) => (
              <button key={item.id} type="button" onClick={() => { scrollTo(item.id); setMenuOpen(false); }} className="block w-full py-3 text-left text-sm font-bold text-primary">
                {item.label}
              </button>
            ))}
            <Link to="/login" className="block w-full py-3 text-left text-sm font-bold text-primary border-t border-border/50 mt-2 pt-4">
              Sign In
            </Link>
            <Link to="/slots" className="mt-4 block w-full rounded-md bg-primary py-3 text-center text-sm font-bold text-primary-foreground">
              Book Now
            </Link>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-24 lg:pb-32 min-h-[90vh] flex items-center justify-center">
        {/* Cinematic Background Image */}
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=2070&auto=format&fit=crop" alt="Temple Background" className="w-full h-full object-cover opacity-30 mix-blend-multiply sepia-[0.2]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
        </div>
        
        <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50 mix-blend-multiply pointer-events-none" />
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none blur-sm animate-pulse">
           <Leaf size={400} className="text-primary" />
        </div>
        
        <div className="mx-auto max-w-7xl px-5 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center justify-center font-display text-center relative z-10"
          >
            {/* Year Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.6, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-2xl font-bold tracking-[0.3em] text-accent mb-6"
            >
              2026
            </motion.div>
            
            {/* Golden thin line */}
            <div className="h-[2px] w-12 bg-accent/30 mb-8" />

            {/* Monumental Cinematic Titles */}
            <div className="space-y-4 md:space-y-6 mb-8 select-none">
              <motion.h1 
                initial={{ opacity: 0, letterSpacing: "0.4em" }}
                animate={{ opacity: 1, letterSpacing: "0.15em" }}
                transition={{ delay: 0.3, duration: 1.2 }}
                className="text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-extrabold uppercase text-primary leading-none"
              >
                SUVAIALAYA
              </motion.h1>
              <motion.h1 
                initial={{ opacity: 0, letterSpacing: "0.4em" }}
                animate={{ opacity: 1, letterSpacing: "0.15em" }}
                transition={{ delay: 0.5, duration: 1.2 }}
                className="text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-extrabold uppercase text-primary leading-none"
              >
                RESTAURANT
              </motion.h1>
              <motion.h1 
                initial={{ opacity: 0, letterSpacing: "0.4em" }}
                animate={{ opacity: 1, letterSpacing: "0.15em" }}
                transition={{ delay: 0.7, duration: 1.2 }}
                className="text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-extrabold uppercase text-primary leading-none"
              >
                BANGALORE
              </motion.h1>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="text-2xl sm:text-3xl italic text-accent font-semibold tracking-widest mb-12"
            >
              HAS ARRIVED.
            </motion.p>

            <div className="h-[2px] w-24 bg-accent/30 mb-12" />

            {/* Event Highlights Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl w-full mb-12 px-4"
            >
              <div className="border border-primary/20 bg-primary/5 backdrop-blur-sm px-6 py-5 rounded-xl flex flex-col items-center justify-center transition-all hover:border-primary/40 hover:bg-primary/10">
                <span className="text-accent text-2xl font-bold font-display mb-1">23</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Legendary Dishes</span>
              </div>
              <div className="border border-primary/20 bg-primary/5 backdrop-blur-sm px-6 py-5 rounded-xl flex flex-col items-center justify-center transition-all hover:border-primary/40 hover:bg-primary/10">
                <span className="text-accent text-2xl font-bold font-display mb-1">10</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Days Only</span>
              </div>
              <div className="border border-primary/20 bg-primary/5 backdrop-blur-sm px-6 py-5 rounded-xl flex flex-col items-center justify-center transition-all hover:border-primary/40 hover:bg-primary/10">
                <span className="text-accent text-2xl font-bold font-display mb-1">Limited</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Seats Daily</span>
              </div>
              <div className="border border-primary/20 bg-primary/5 backdrop-blur-sm px-6 py-5 rounded-xl flex flex-col items-center justify-center transition-all hover:border-primary/40 hover:bg-primary/10">
                <span className="text-accent text-2xl font-bold font-display mb-1">One Grand</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Experience</span>
              </div>
            </motion.div>

            <div className="h-[2px] w-12 bg-accent/30 mb-8" />

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-primary/80 mb-12"
            >
              Welcome to the Suvaialaya Experience.
            </motion.p>

            <div className="mt-4 flex justify-center mb-12">
               <Countdown />
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row justify-center w-full max-w-md">
              <Link to="/slots" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-xl transition-all hover:bg-primary/90 hover:scale-105 border border-accent/20">
                Book Your Seat <ArrowRight size={16} />
              </Link>
              <button type="button" onClick={() => scrollTo("experience")} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-primary/20 bg-transparent px-8 py-4 text-xs font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary/5">
                Discover the experience <ArrowDown size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="border-y border-primary/10 bg-primary/5 relative">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
          <SectionHeading eyebrow="Your table awaits" title="A simple invitation to a very good day." copy="Choose a date. Pick your hour. We'll take care of the rest." />
          <div className="grid gap-6 sm:grid-cols-3 mt-12">
            {[
              { number: "01", title: "Choose your day", text: "Nine days of shared tables." }, 
              { number: "02", title: "Pick a slot", text: "Ten relaxed hours each day." }, 
              { number: "03", title: "Come hungry", text: "We'll have your place ready." }
            ].map((step) => (
              <div key={step.number} className="relative overflow-hidden rounded-xl border border-primary/20 bg-background p-8 shadow-sm transition-all hover:shadow-md group">
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Leaf size={100} className="text-primary" />
                </div>
                <span className="font-display text-4xl font-bold text-accent">{step.number}</span>
                <h3 className="mt-6 font-display text-2xl font-bold text-primary">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/70">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-10 mix-blend-overlay" />
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10 relative z-10">
          <SectionHeading light eyebrow="The menu" title="Every dish tells a story." copy="We don't serve food. We serve a century of culture, spice, and heritage." />
          
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "MUTTON BRIYANI", subtitle: "Seeraga Samba", description: "Authentic Madurai style briyani cooked with aromatic seeraga samba rice and tender mutton.", image: "/images/food/mutton_elumbu_soup.png" },
              { name: "KARAIKUDI MUTTON ROAST", subtitle: "Signature Masterpiece", description: "Fiery Karaikudi spices blended with rich ghee roast.", image: "/images/food/chicken_kari_dosa.png" },
              { name: "BUN PAROTTA", subtitle: "Tawa Breads", description: "Madurai's famous fluffy, layered bun parotta, perfect for rich gravies.", image: "/images/food/madurai_halwa.png" },
              { name: "ELANEER PAYASAM", subtitle: "Silky Legend", description: "Tender coconut sweet pudding, built to soothe and delight.", image: "/images/food/madurai_jigarthanda.png" }
            ].map((dish, index) => (
              <motion.article 
                key={dish.name} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: index * 0.1, duration: 0.8 }} 
                className="group relative rounded-xl border border-accent/20 bg-primary-foreground/5 overflow-hidden transition-all hover:bg-primary-foreground/10 hover:border-accent/40 flex flex-col justify-between min-h-[350px] shadow-lg"
              >
                <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-70 transition-opacity duration-700">
                  <img src={dish.image} alt={dish.name} className="w-full h-full object-cover mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />
                </div>
                
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity z-10 pointer-events-none">
                  <Leaf size={60} className="text-accent" />
                </div>
                
                <div className="relative z-20 mt-auto p-6 bg-gradient-to-t from-primary to-transparent pt-12 flex flex-col justify-end h-full">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent/80 block mb-2 drop-shadow-md">{dish.subtitle}</span>
                  <h3 className="font-display text-2xl font-bold leading-snug text-primary-foreground tracking-wide drop-shadow-lg">{dish.name}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-primary-foreground/90 font-sans drop-shadow-md">{dish.description}</p>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Cinematic Tagline Banner */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mt-20 text-center py-16 px-6 border-y border-accent/20 bg-primary-foreground/[0.02] relative overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none font-display font-extrabold text-[8rem] md:text-[14rem] text-primary-foreground leading-none overflow-hidden">
              SUVAIALAYA
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-widest text-temple-gold uppercase leading-[1.2] relative z-10 drop-shadow-md">
              TRADITION IS NOT COOKED.
              <br />
              <span className="text-primary-foreground block mt-2">IT IS CELEBRATED.</span>
            </h2>
          </motion.div>
          
          <div className="mt-16 flex justify-center">
            <Link to="/menu" className="inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.2em] text-temple-gold hover:text-temple-gold/80 transition-all pb-1 border-b-2 border-temple-gold/50 hover:border-temple-gold drop-shadow-lg z-20 relative">
              See the full Suvaialaya Menu <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Venue Section */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <div>
            <SectionHeading eyebrow="The venue" title="Bommasandra, Bangalore." copy="Join us at our new flagship location. Think warm light, authentic Madurai aromas, and the sound of good conversation." />
            <div className="mt-10 flex items-center justify-center gap-4 text-sm font-semibold border p-6 rounded-xl border-primary/20 bg-primary/5">
              <MapPin size={32} className="text-accent flex-shrink-0" />
              <div className="text-left">
                <p className="text-primary font-bold">N, 256/B, nearby Narayana Hrudayalaya Hospital,</p>
                <p className="text-primary/80 text-xs mt-1">Bommasandra Industrial Area, Bommasandra, Karnataka 560099</p>
                <a href="https://share.google/lMg8g7DHS0wRBuZn0" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:text-accent transition-colors mt-2 block font-bold">View on Google Maps &rarr;</a>
              </div>
            </div>
          </div>
          <div className="relative min-h-[400px] overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 shadow-inner flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(hsl(var(--primary)/.3)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/.3)_1px,transparent_1px)] [background-size:40px_40px]" />
            <div className="relative z-10 text-center bg-background/90 p-8 rounded-xl border border-primary/20 shadow-lg backdrop-blur-sm">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary text-accent">
                <MapPin size={28} />
              </div>
              <p className="mt-6 font-display text-2xl font-bold text-primary">SUVAIALAYA</p>
              <p className="text-xs uppercase tracking-widest text-primary/70 mt-2">South Indian Cuisine</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-primary/10 bg-primary/5">
        <div className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8">
          <Leaf className="mx-auto text-accent" size={32} />
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-primary">From our guests</p>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {testimonials.map((item) => (
              <figure key={item.name} className="flex flex-col items-center">
                <div className="mb-6 flex justify-center gap-1 text-accent">
                  {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={14} fill="currentColor" />)}
                </div>
                <blockquote className="font-display text-2xl font-bold leading-snug text-primary flex-1">"{item.quote}"</blockquote>
                <figcaption className="mt-6 text-xs font-bold uppercase tracking-widest text-primary/60">
                  {item.name} <span className="mx-2 opacity-50">|</span> {item.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
        <SectionHeading eyebrow="Good to know" title="Questions, answered." />
        <div className="mt-12 border-t border-primary/20">
          {faqs.map((item, index) => (
            <div key={item.question} className="border-b border-primary/20">
              <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} className="flex w-full items-center justify-between py-6 text-left focus-visible:outline-none">
                <span className="font-display text-xl font-bold text-primary">{item.question}</span>
                {openFaq === index ? <Minus size={20} className="shrink-0 text-accent" /> : <Plus size={20} className="shrink-0 text-accent" />}
              </button>
              {openFaq === index && (
                <p className="max-w-2xl pb-8 pr-8 text-sm leading-relaxed text-foreground/80">{item.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-10 mix-blend-overlay" />
        <div className="mx-auto max-w-4xl px-5 py-24 text-center relative z-10">
          <Leaf className="mx-auto text-accent mb-6" size={40} />
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-6xl text-primary-foreground">
            The table is almost set.
          </h2>
          <p className="mt-6 text-lg text-primary-foreground/80">Save your seat at the feast.</p>
          <div className="mt-10">
            <Link to="/slots" className="inline-flex items-center justify-center gap-3 rounded-md bg-accent px-10 py-5 text-sm font-bold uppercase tracking-widest text-primary shadow-xl transition-all hover:bg-accent/90 hover:scale-105">
              Book for ₹1,499 <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background text-foreground pt-20 pb-10 border-t-4 border-accent">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col items-center justify-center text-center">
            <BrandMark />
            <p className="mt-6 max-w-md text-sm text-foreground/70 leading-relaxed">
              Experience the authentic taste of Madurai. Traditional hospitality, curated for the modern connoisseur.
            </p>
            <div className="mt-8 flex gap-6 text-sm font-semibold text-primary/80">
              <a href="tel:+919876543210" className="hover:text-accent transition-colors">+91 98765 43210</a>
              <span className="opacity-30">|</span>
              <a href="mailto:hello@suvaialaya.com" className="hover:text-accent transition-colors">hello@suvaialaya.com</a>
            </div>
          </div>
          <div className="mt-16 border-t border-primary/10 pt-8 flex flex-col items-center justify-between gap-4 text-xs font-semibold uppercase tracking-widest text-primary/50 sm:flex-row">
            <span>© 2026 Suvaialaya. All rights reserved.</span>
            <span className="flex items-center gap-2"><MapPin size={14} className="text-accent" /> Madurai, Tamil Nadu</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
