import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, CalendarDays, Clock3, MapPin, Menu, Minus, Plus, Star, Users, X, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandMark } from "@/components/landing/BrandMark";
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
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const navItems = [{ label: "The Experience", id: "experience" }, { label: "The Menu", id: "menu" }, { label: "Good to know", id: "faq" }];

  return (
    <main className="overflow-hidden bg-background text-foreground selection:bg-accent/30">
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
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-30 mix-blend-multiply" />
        <div className="absolute top-0 right-0 p-10 opacity-10">
           <Leaf size={300} className="text-primary" />
        </div>
        
        <div className="mx-auto max-w-7xl px-5 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <span className="size-2 rounded-full bg-accent" /> {festival.dates}
            </div>
            <h3 className="font-display mt-8 text-2xl sm:text-3xl font-bold tracking-widest text-accent uppercase">
              {festival.restaurantName}
            </h3>
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-primary/70 mt-2">
              {festival.tagline}
            </p>
            <div className="my-8 flex justify-center">
              <div className="h-0.5 w-24 bg-accent/40 rounded-full" />
            </div>
            
            <p className="italic text-primary/80 mb-4 font-display text-xl">Proudly Presents</p>
            <h1 className="font-display mx-auto max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl xl:text-[6rem] uppercase text-primary drop-shadow-sm">
              MADURAI <br/>KARI VIRUNTHU
            </h1>
            
            <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-foreground/80 sm:text-lg">
              Experience the Authentic Taste of Madurai. A luxury, premium dining experience that brings traditional flavors to a communal table.
            </p>

            <div className="mt-12 flex justify-center">
               <Countdown />
            </div>

            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row justify-center">
              <Link to="/slots" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-xl transition-all hover:bg-primary/90 hover:scale-105 border border-accent/20">
                Book Your Seat <ArrowRight size={16} />
              </Link>
              <button type="button" onClick={() => scrollTo("experience")} className="inline-flex items-center justify-center gap-2 rounded-md border border-primary/20 bg-transparent px-8 py-4 text-sm font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary/5">
                Discover the experience <ArrowDown size={16} />
              </button>
            </div>
            
            <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-bold uppercase tracking-widest text-primary/70">
              <span className="flex items-center gap-2"><CalendarDays size={16} className="text-accent" /> 9 Days Only</span>
              <span className="flex items-center gap-2"><Clock3 size={16} className="text-accent" /> 11 AM — 9 PM</span>
              <span className="flex items-center gap-2"><Users size={16} className="text-accent" /> 70 Guests / Slot</span>
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
          <SectionHeading light eyebrow="The menu" title="A feast worth waiting for." copy="Every dish is a love letter to the streets, homes, and kitchens of Madurai." />
          
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {menuHighlights.slice(0, 6).map((dish, index) => (
              <motion.article key={dish.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="group relative rounded-xl border border-accent/20 bg-primary-foreground/5 p-8 transition-all hover:bg-primary-foreground/10 hover:border-accent/40">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">{dish.category}</span>
                  <Leaf size={16} className="text-accent/50" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold leading-tight text-primary-foreground">{dish.name}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">{dish.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
          
          <div className="mt-16 flex justify-center">
            <Link to="/menu" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors pb-1 border-b border-accent/30 hover:border-accent">
              See the full menu <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Venue Section */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <div>
            <SectionHeading eyebrow="The venue" title="Somewhere special in Madurai." copy="The exact venue details will be shared with your booking confirmation. Think warm light, long tables, and the sound of good conversation." />
            <div className="mt-10 flex items-center justify-center gap-4 text-sm font-semibold border p-6 rounded-xl border-primary/20 bg-primary/5">
              <MapPin size={24} className="text-accent" />
              <div className="text-left">
                <p className="text-primary font-bold">Madurai, Tamil Nadu</p>
                <a href="https://share.google/lMg8g7DHS0wRBuZn0" target="_blank" rel="noopener noreferrer" className="text-xs text-primary/70 hover:text-primary transition-colors mt-1 block">View on Google Maps &rarr;</a>
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
