import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket, ArrowRight, MapPin, Clock, UtensilsCrossed,
  CalendarDays, Star, ChevronRight, Gift, Users, Sparkles
} from "lucide-react";
import { BrandMark } from "@/components/landing/BrandMark";
import { Link, useNavigate } from "react-router-dom";
import { MaduraiPreloader } from "@/components/landing/MaduraiPreloader";
import { SuvaiBot } from "@/components/landing/SuvaiBot";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PhoneCall, Copy } from "lucide-react";
import { toast } from "sonner";

const BRAND_IMG = "/temple-bg.png";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12 + 0.5, duration: 0.6, ease: "easeOut" as const },
  }),
};

const PHONE = "90350 05335";

import { MENU_HIGHLIGHTS, SPECIALS } from "@/data/menu";

import axios from "axios";

export default function Index() {
  const [done, setDone] = useState(false);
  const [activeMenu, setActiveMenu] = useState(0);
  const [basePrice, setBasePrice] = useState(1499);
  const [landingSettings, setLandingSettings] = useState<any>(null);
  const [festivalSettings, setFestivalSettings] = useState<any>(null);
  const [menuHighlights, setMenuHighlights] = useState<any[]>(MENU_HIGHLIGHTS); // Default to static, override with DB
  const [specials, setSpecials] = useState<any[]>(SPECIALS); // Default to static, override with DB
  const [showCallModal, setShowCallModal] = useState(false);
  const navigate = useNavigate();

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(PHONE);
    toast.success("Phone number copied to clipboard!");
  };

  React.useEffect(() => {
    // Fetch Event Data for dynamic pricing
    axios.get("/api/events")
      .then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          setBasePrice(res.data.data[0].basePrice);
        }
      })
      .catch((err) => console.error("Error fetching event:", err));

    // Fetch Settings
    axios.get("/api/settings")
      .then((res) => {
        if (res.data.success && res.data.data) {
          if (res.data.data.festival) {
            setFestivalSettings(res.data.data.festival);
          }
          if (res.data.data.landing) {
            setLandingSettings(res.data.data.landing);
            if (res.data.data.landing.specials && res.data.data.landing.specials.length > 0) {
              setSpecials(res.data.data.landing.specials);
            }
          }
        }
      })
      .catch((err) => console.error("Error fetching settings:", err));

    // Fetch Menu Items from Database
    axios.get("/api/menu")
      .then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          const dbMenu = res.data.data;
          
          // Group by category
          const categories = [...new Set(dbMenu.map((item: any) => item.category))];
          
          const dynamicMenu = categories.map(cat => {
            // Find existing image for this category if possible, or use a default
            const existingCat = MENU_HIGHLIGHTS.find(m => m.category.toLowerCase() === (cat as string).toLowerCase());
            const img = existingCat ? existingCat.img : "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80";
            
            return {
              category: cat,
              img,
              items: dbMenu.filter((item: any) => item.category === cat).map((item: any) => ({
                name: item.name,
                price: `₹${item.price}`,
                note: item.description
              }))
            };
          });

          setMenuHighlights(dynamicMenu);
        }
      })
      .catch((err) => console.error("Error fetching menu:", err));
  }, []);

  return (
    <main className="bg-white text-[#1a3d2b] font-sans min-h-screen overflow-x-hidden">
      <Dialog open={showCallModal} onOpenChange={setShowCallModal}>
        <DialogContent className="sm:max-w-md border-0 bg-white shadow-2xl p-0 overflow-hidden">
          <div className="bg-[#1a3d2b] p-6 text-center border-b border-[#c9841a]/30">
            <div className="mx-auto w-12 h-12 bg-[#c9841a] rounded-full flex items-center justify-center mb-4 shadow-lg ring-4 ring-[#c9841a]/20">
              <PhoneCall size={20} className="text-white" />
            </div>
            <DialogTitle className="text-2xl font-display font-bold text-white mb-1">Make a Reservation</DialogTitle>
            <DialogDescription className="text-white/80 text-sm">
              Contact our admin team to book your table.
            </DialogDescription>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center space-y-4 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#1a3d2b]/50">Direct Line</p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-display font-bold text-3xl text-[#1a3d2b] tracking-wide">{PHONE}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <a href="#" onClick={(e) => { e.preventDefault(); setShowCallModal(true); }} className="w-full flex items-center justify-center gap-2 bg-[#1a3d2b] hover:bg-[#2d6a4f] text-white font-bold py-3.5 rounded-xl transition-all shadow-md">
                <PhoneCall size={18} /> Open Phone Dialer
              </a>
              <button onClick={handleCopyPhone} className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border-2 border-[#1a3d2b]/10 text-[#1a3d2b] font-bold py-3.5 rounded-xl transition-all">
                <Copy size={18} /> Copy Phone Number
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {!done && <MaduraiPreloader onComplete={() => setDone(true)} />}
      </AnimatePresence>
      <SuvaiBot />

      {/* ── NAVBAR ── */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-[130] flex items-center justify-between px-8 md:px-16 py-4 bg-white/95 backdrop-blur-md border-b border-gray-100"
      >
        <BrandMark size="md" />
        <div className="hidden md:flex items-center gap-8">
          {[{ label: "Home", href: "/" }, { label: "Menu", href: "/menu" }, { label: "About", href: "/about" }, { label: "Staff Login", href: "/login" }].map(({ label, href }) => (
            <Link key={label} to={href} className="text-xs font-semibold tracking-widest uppercase text-[#1a3d2b]/60 hover:text-[#1a3d2b] transition-colors">{label}</Link>
          ))}
        </div>
        <a href="#" onClick={(e) => { e.preventDefault(); setShowCallModal(true); }} className="flex items-center gap-2 bg-[#1a3d2b] hover:bg-[#2d6a4f] text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-full transition-colors">
          <Ticket size={13} /> Call to Book
        </a>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen pt-20 flex flex-col lg:flex-row overflow-hidden">
        {/* Cinematic Background "Video" Slider */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence>
            <motion.div
              key={activeMenu} // We can repurpose activeMenu state or just create a new one, but let's just do a simple CSS animation loop instead to avoid complex state in the render for the background.
              className="absolute inset-0 w-full h-full"
            >
               {/* We will use a CSS keyframe animation for the Ken Burns effect */}
               <style>
                 {`
                   @keyframes kenBurns {
                     0% { transform: scale(1) translate(0, 0); opacity: 0; }
                     5% { opacity: 0.6; }
                     25% { opacity: 0.6; }
                     30% { opacity: 0; transform: scale(1.1) translate(-2%, -2%); }
                     100% { opacity: 0; }
                   }
                   .bg-slide-1 { animation: kenBurns 24s infinite; }
                   .bg-slide-2 { animation: kenBurns 24s infinite; animation-delay: 6s; }
                   .bg-slide-3 { animation: kenBurns 24s infinite; animation-delay: 12s; }
                   .bg-slide-4 { animation: kenBurns 24s infinite; animation-delay: 18s; }
                 `}
               </style>
               <div className="absolute inset-0 bg-slide-1 bg-cover bg-center opacity-0" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1600&q=80')` }} />
               <div className="absolute inset-0 bg-slide-2 bg-cover bg-center opacity-0" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=1600&q=80')` }} />
               <div className="absolute inset-0 bg-slide-3 bg-cover bg-center opacity-0" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1600&q=80')` }} />
               <div className="absolute inset-0 bg-slide-4 bg-cover bg-center opacity-0" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=1600&q=80')` }} />
               
               {/* Dark/Green Gradient Overlay to make text readable */}
               <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent z-10" />
               <div className="absolute inset-0 bg-[#1a3d2b]/10 z-10 mix-blend-overlay" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Left text */}
        <div className="relative z-20 flex-1 flex flex-col justify-center px-8 md:px-14 lg:px-20 py-16">
          <motion.div custom={0} variants={fade} initial="hidden" animate="show"
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#1a3d2b]/20 text-[#1a3d2b] text-[10px] font-bold tracking-[0.3em] uppercase px-4 py-2 rounded-full w-fit mb-6 shadow-sm">
            <Star size={10} fill="currentColor" /> {landingSettings?.heroEyebrow || "From Madurai · To Bangalore"}
          </motion.div>

          <motion.h1 custom={1} variants={fade} initial="hidden" animate="show"
            className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-4 text-[#1a3d2b] drop-shadow-sm whitespace-pre-line">
            {landingSettings?.heroTitle || "Authentic\nSouth Indian\nMulti Cuisine"}
          </motion.h1>

          <motion.p custom={2} variants={fade} initial="hidden" animate="show"
            className="text-[#1a3d2b]/80 font-medium text-base leading-relaxed max-w-md mb-6 drop-shadow-sm">
            {landingSettings?.heroDescription || "From the Heart of Madurai to the Soul of Bangalore — experience legendary Biryani, grand Kari Virundhu feasts, and the iconic Madurai Jigarthanda."}
          </motion.p>

          <motion.div custom={3} variants={fade} initial="hidden" animate="show" className="flex flex-wrap gap-3 mb-8">
            {[
              { icon: MapPin, text: festivalSettings?.venue || "Bommasandra, Bengaluru" },
              { icon: Clock, text: `Open: ${festivalSettings?.hours || "11 AM – 11 PM"}` },
              { icon: CalendarDays, text: festivalSettings?.dates || "August 7, 8 & 9, 2026" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-[#1a3d2b]/70 font-bold bg-white/70 backdrop-blur-md border border-[#1a3d2b]/10 px-3 py-1.5 rounded-full shadow-sm">
                <Icon size={12} className="text-[#c9841a]" /> {text}
              </div>
            ))}
          </motion.div>

          <motion.div custom={4} variants={fade} initial="hidden" animate="show" className="flex flex-col sm:flex-row gap-4 mb-12">
            <motion.a whileHover={{ scale: 1.05, rotateX: 2, rotateY: -2 }} style={{ perspective: 1000 }} href="#" onClick={(e) => { e.preventDefault(); setShowCallModal(true); }} className="group flex items-center justify-center gap-3 bg-[#1a3d2b] hover:bg-[#2d6a4f] text-white font-bold px-8 py-4 rounded-xl text-sm tracking-wide transition-colors shadow-lg">
              <Ticket size={16} /> Reserve via Call
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </motion.a>
            <motion.button whileHover={{ scale: 1.05, rotateX: 2, rotateY: -2 }} style={{ perspective: 1000 }} onClick={() => navigate("/menu")} className="group flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm border-2 border-[#1a3d2b]/30 hover:border-[#1a3d2b] text-[#1a3d2b] font-bold px-8 py-4 rounded-xl text-sm tracking-wide transition-colors shadow-sm">
              <UtensilsCrossed size={16} /> View Full Menu
            </motion.button>
          </motion.div>

          <motion.div custom={5} variants={fade} initial="hidden" animate="show" className="flex gap-10 border-t border-[#1a3d2b]/10 pt-8">
            {(landingSettings?.stats || [
              { value: "500+", label: "Guests Daily" },
              { value: "80+", label: "Menu Items" },
              { value: "10+", label: "Years of Service" }
            ]).map(({ value, label }: any) => (
              <div key={label}>
                <p className="text-3xl font-display font-extrabold text-[#1a3d2b] drop-shadow-sm">{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Feature Card */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.9, ease: "easeOut" }}
          className="relative z-20 w-full lg:w-[48%] flex-shrink-0 flex items-center justify-center p-8 lg:p-12"
          style={{ perspective: 1000 }}
        >
          <motion.div 
            whileHover={{ rotateX: 2, rotateY: -2, scale: 1.02 }}
            className="relative w-full max-w-[500px] rounded-2xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl"
          >
            <img src={BRAND_IMG} alt="Suvaialaya South Indian Cuisine Restaurant" className="w-full h-auto block opacity-90"
              onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-[#1a3d2b] font-bold text-sm">A Grand Event is Coming!</p>
                <p className="text-[#1a3d2b]/60 font-medium text-xs mt-0.5">Stay tuned for exclusive announcements</p>
              </div>
              <a href="#" onClick={(e) => { e.preventDefault(); setShowCallModal(true); }} className="flex items-center gap-1.5 bg-[#c9841a] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-[#a66d15] transition-colors shadow-md">
                Call Us <ChevronRight size={13} />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── GRAND EVENT BANNER ── */}
      <section className="bg-[#f5f0e8] border-y border-[#1a3d2b]/10 px-4 md:px-16 py-10 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-5xl mx-auto text-center">
          <div className="relative inline-block w-full max-w-4xl mx-auto">
            <img 
              src="/image.png" 
              alt="Madurai Kari Virundhu - Pandiyanaadu Fest" 
              className="w-full h-auto rounded-2xl shadow-[0_20px_50px_rgba(26,61,43,0.15)] border-[8px] border-white cursor-pointer hover:scale-[1.01] transition-transform duration-500"
              onClick={() => setShowCallModal(true)}
            />
            {/* Call to action overlay on mobile for better conversion */}
            <div className="md:hidden mt-6">
              <a href="#" onClick={(e) => { e.preventDefault(); setShowCallModal(true); }} className="inline-flex items-center justify-center w-full gap-2 bg-[#1a3d2b] text-white font-bold px-8 py-4 rounded-xl text-sm tracking-wide shadow-lg">
                <Ticket size={16} /> Book Your Table Now
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── MENU HIGHLIGHTS ── */}
      <section className="bg-white px-8 md:px-16 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-5xl mx-auto">
          <p className="text-center text-[10px] font-bold tracking-[0.4em] uppercase text-[#1a3d2b]/40 mb-2">Our Menu</p>
          <h2 className="text-center font-display text-3xl font-bold text-[#1a3d2b] mb-8">Menu Highlights</h2>

          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {menuHighlights.map((cat, i) => (
              <button key={cat.category} onClick={() => setActiveMenu(i)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${activeMenu === i ? "bg-[#1a3d2b] text-white" : "bg-gray-100 text-[#1a3d2b]/60 hover:bg-gray-200"}`}>
                {cat.category}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {menuHighlights.length > 0 && activeMenu < menuHighlights.length && (
              <motion.div key={activeMenu} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                className="flex flex-col bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Items */}
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                  }}
                  className="flex-1"
                >
                  {menuHighlights[activeMenu].items.map((item: any, i: number) => (
                    <motion.div 
                      key={item.name} 
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 }
                      }}
                      whileHover={{ x: 10, backgroundColor: "rgba(26, 61, 43, 0.03)" }}
                      className={`px-6 py-4 transition-all cursor-default ${i !== menuHighlights[activeMenu].items.length - 1 ? "border-b border-gray-200" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[#1a3d2b] font-bold text-sm md:text-base">{item.name}</p>
                        <p className="text-[#c9841a] font-extrabold text-sm md:text-base font-display ml-4 flex-shrink-0">{item.price}</p>
                      </div>
                      {item.note && <p className="text-[#1a3d2b]/60 text-xs mt-1.5 leading-relaxed">{item.note}</p>}
                    </motion.div>
                  ))}
                <div className="px-6 py-4 bg-white flex items-center justify-between border-t border-gray-200">
                  <p className="text-[#1a3d2b]/50 text-xs font-semibold uppercase tracking-wider">Highlights for {menuHighlights[activeMenu].category}</p>
                  <button onClick={() => navigate("/menu")} className="flex items-center gap-1 text-[#1a3d2b] text-xs font-bold hover:text-[#c9841a] transition-colors group">
                    Full Menu <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ── SPECIAL COMBOS ── */}
      <section className="bg-gray-50 border-t border-gray-100 px-8 md:px-16 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-5xl mx-auto">
          <p className="text-center text-[10px] font-bold tracking-[0.4em] uppercase text-[#1a3d2b]/40 mb-2">Best Value</p>
          <h2 className="text-center font-display text-3xl font-bold text-[#1a3d2b] mb-10">Suvaialaya Specials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ perspective: 1000 }}>
            {specials.map(({ name, price, desc, tag }, i) => (
              <motion.div key={name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                onClick={() => setShowCallModal(true)} className="group cursor-pointer bg-white border border-gray-200 hover:border-[#1a3d2b]/40 rounded-xl p-6 transition-all shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="inline-block bg-[#1a3d2b]/10 text-[#1a3d2b] text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-1">{tag}</span>
                    <h3 className="text-[#1a3d2b] font-bold text-sm leading-tight">{name}</h3>
                  </div>
                  <span className="text-[#1a3d2b] font-display font-extrabold text-xl ml-4 flex-shrink-0">{price}</span>
                </div>
                <p className="text-[#1a3d2b]/50 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── LOCATION & MAP ── */}
      <section className="bg-white border-t border-gray-100 px-8 md:px-16 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#1a3d2b]/40">Find Us</p>
            <h2 className="font-display text-3xl font-bold text-[#1a3d2b]">Our Location</h2>
            <a 
              href="https://www.google.com/maps/place/SUVAIALAYA+RESTAURANT/@12.8091759,77.6968595,1049m/data=!3m1!1e3!4m6!3m5!1s0x3bae6d1e664524af:0x38fc1d835ac3baad!8m2!3d12.808841!4d77.696655!16s%2Fg%2F11x85qd51h"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 p-6 bg-gray-50 hover:bg-[#1a3d2b]/5 rounded-2xl border border-gray-100 hover:border-[#1a3d2b]/20 shadow-sm transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-[#1a3d2b]/10 group-hover:bg-[#1a3d2b] transition-colors flex items-center justify-center flex-shrink-0 mt-1">
                <MapPin size={24} className="text-[#1a3d2b] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-[#1a3d2b] font-bold text-lg mb-2 flex items-center gap-2">
                  Suvaialaya Restaurant
                  <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#c9841a]" />
                </p>
                <p className="text-[#1a3d2b]/70 leading-relaxed font-medium group-hover:text-[#1a3d2b]/90 transition-colors">N, 256/B, nearby Narayana Hrudayalaya Hospital, Bommasandra Industrial Area, Bommasandra, Karnataka 560099</p>
                <p className="text-[#c9841a] text-xs font-bold uppercase tracking-wider mt-3">Open in Google Maps</p>
              </div>
            </a>
          </div>
          <div className="flex-1 w-full rounded-2xl overflow-hidden border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[350px]">
            <iframe 
              src="https://maps.google.com/maps?q=12.808841,77.696655&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-[#1a3d2b] px-8 md:px-16 py-14 text-center border-t-4 border-[#c9841a]">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#c9841a] text-xs tracking-[0.3em] uppercase mb-3 font-bold">Ready to Dine?</p>
          <h2 className="font-display text-4xl font-bold text-white mb-2">Book Your Table Today</h2>
          <p className="text-white/70 text-sm mb-6">From the Heart of Madurai · To the Soul of Bangalore</p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10">
            <a href="#" onClick={(e) => { e.preventDefault(); setShowCallModal(true); }} className="inline-flex items-center gap-3 bg-white text-[#1a3d2b] font-bold px-8 py-3.5 rounded-xl text-sm tracking-wide hover:bg-gray-100 transition-colors w-full md:w-auto justify-center">
              <Ticket size={16} /> Make a Reservation <ArrowRight size={14} />
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowCallModal(true); }} className="inline-flex items-center gap-3 bg-transparent border border-white/30 text-white font-bold px-8 py-3.5 rounded-xl text-sm tracking-wide hover:bg-white/10 transition-colors w-full md:w-auto justify-center">
              Order Now: {PHONE}
            </a>
          </div>

          <div className="pt-8 border-t border-white/10 max-w-2xl mx-auto flex flex-col md:flex-row justify-center items-center gap-4 md:gap-10 text-white/50 text-xs">
            <p>GST 5% + 5% Packing Charges Applicable</p>
            <p className="hidden md:block">•</p>
            <p>Food Preparation Time: 15 Minutes</p>
            <p className="hidden md:block">•</p>
            <p className="text-[#c9841a] font-semibold">Party Orders & Outdoor Catering Available</p>
          </div>
        </motion.div>
      </section>

      {/* ── FULL SITE FOOTER ── */}
      <footer className="bg-[#0f2419] text-white/60 px-8 md:px-16 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-10 border-b border-white/10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Suvaialaya" className="h-10 w-10 object-contain rounded-lg bg-white/10 p-1" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <div>
                  <p className="text-white font-display font-bold text-sm tracking-widest uppercase">Suvaialaya</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">South Indian Cuisine</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-white/50">
                Authentic Madurai flavors brought to your city. From legendary Biryani to grand Kari Virundhu feasts.
              </p>
              <a href="#" onClick={(e) => { e.preventDefault(); setShowCallModal(true); }} className="inline-flex items-center gap-2 mt-4 text-[#c9841a] text-xs font-bold hover:text-[#e8a030] transition-colors">
                📞 {PHONE}
              </a>
            </div>

            {/* Discover */}
            <div>
              <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-4">Discover</p>
              <ul className="space-y-3">
                {[
                  { label: "Home", href: "/" },
                  { label: "Menu", href: "/menu" },
                  { label: "About Us", href: "/about" },
                ].map(({ label, href }) => (
                  <li key={label}><Link to={href} className="text-xs hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-4">My Account</p>
              <ul className="space-y-3">
                {[
                  { label: "Book a Seat", href: "#", action: "call" },
                  { label: "My Bookings", href: "#", action: "call" },
                  { label: "Admin Portal", href: "/login" },
                ].map(({ label, href, action }) => (
                  <li key={label}>
                    {action === "call" ? (
                      <a href="#" onClick={(e) => { e.preventDefault(); setShowCallModal(true); }} className="text-xs hover:text-white transition-colors">{label}</a>
                    ) : (
                      <a href={href} className="text-xs hover:text-white transition-colors">{label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-4">Support</p>
              <ul className="space-y-3">
                {[
                  { label: "Contact Us", href: "/contact" },
                  { label: "FAQ", href: "/faq" },
                  { label: "Help Center", href: "/help" },
                  { label: "Terms & Conditions", href: "/terms" },
                  { label: "Privacy Policy", href: "/privacy" },
                ].map(({ label, href }) => (
                  <li key={label}><Link to={href} className="text-xs hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-white/30">© {new Date().getFullYear()} Suvaialaya. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="text-[10px] hover:text-white/60 transition-colors">Terms</Link>
              <Link to="/privacy" className="text-[10px] hover:text-white/60 transition-colors">Privacy</Link>
              <Link to="/contact" className="text-[10px] hover:text-white/60 transition-colors">Contact</Link>
            </div>
            <p className="text-[10px] text-white/20">Developed by <span className="text-[#c9841a] font-bold">Dealpost Private Limited</span></p>
          </div>
        </div>
      </footer>
    </main>
  );
}
