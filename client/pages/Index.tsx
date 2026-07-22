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

const BRAND_IMG = "/temple-bg.png";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12 + 0.5, duration: 0.6, ease: "easeOut" as const },
  }),
};

const PHONE = "90350 05335";

const MENU_HIGHLIGHTS = [
  {
    category: "Biryani",
    img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80",
    items: [
      { name: "Chicken Biryani — Seeraga Samba", price: "₹269" },
      { name: "Mutton Biryani — Seeraga Samba", price: "₹369" },
      { name: "Chicken Varuval Biryani", price: "₹269" },
      { name: "Mutton Varuval Biryani", price: "₹369" },
      { name: "Chicken 65 Biryani", price: "₹269" },
      { name: "Egg Biryani", price: "₹219" },
    ],
  },
  {
    category: "Meals",
    img: "https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=800&q=80",
    items: [
      { name: "Kongu Thokku Meals", price: "₹399", note: "4 Types of Thokku (Chicken, Kaadai, Prawns, Nethili Karuvada) · Fish Curry · Mutton Gravy · Rice · Day Spl Chicken 2pc · Egg · Poriyal · Rasam · Curd · Gulkand · Banana" },
      { name: "Chicken Meals", price: "₹295", note: "Ponni Rice · Parotta · Chicken Gravy · 2 Spl Starters · Egg · Rasam · Curd · Papad · Gulkand · Banana" },
      { name: "Mutton Meals", price: "₹395", note: "Ponni Rice · Bun Parotta · Mutton Gravy · Chicken/Mutton Starters · Egg · Rasam · Curd · Papad · Sweet" },
      { name: "Fish Meals", price: "₹385", note: "Ponni Rice · Chapathi · Fish Curry · Fish Fry · Prawn 65 · Sambar · Poriyal · Rasam · Curd · Papad · Sweet · Gulkand · Banana" },
      { name: "Veg Meals", price: "₹191", note: "Ponni Rice · Chapathi · Veg Gravy · Poriyal · Koottu · Sambar · Vatha Kulambu · Rasam · Curd · Papad · Sweet · Gulkand · Banana" },
      { name: "Dry Nuts Curds Rice", price: "₹139" },
      { name: "Jeera Rice", price: "₹149" },
    ],
  },
  {
    category: "Chicken Starters",
    img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80",
    items: [
      { name: "Day Special Starters", price: "₹259" },
      { name: "Chettinad Chicken Chukka", price: "₹259" },
      { name: "Chicken Milagu Varuval", price: "₹259" },
      { name: "Karaikudi Chicken Ghee Roast", price: "₹269" },
      { name: "Chicken 65 — Boneless", price: "₹219" },
      { name: "Chicken Lollipop (5 pc)", price: "₹249" },
      { name: "Chicken Manchurian", price: "₹249" },
      { name: "Chicken 555", price: "₹249" },
      { name: "Dragon Chicken", price: "₹249" },
      { name: "Japan Chicken", price: "₹259" },
      { name: "Lemon Chicken", price: "₹249" },
      { name: "Monica Chicken", price: "₹229" },
      { name: "Dynamite Chicken", price: "₹229" },
    ],
  },
  {
    category: "Mutton Starters",
    img: "https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=800&q=80",
    items: [
      { name: "Mutton Kola Urundai (1 pc)", price: "₹69" },
      { name: "Mutton Nei Chukka", price: "₹369" },
      { name: "Mutton Milagu Varuval", price: "₹369" },
      { name: "Karaikudi Mutton Ghee Roast", price: "₹369" },
      { name: "Mutton Boti Fry / Semi Gravy", price: "₹229" },
      { name: "Mutton Nalli Ghee Roast / Semi Gravy (2pc)", price: "₹359" },
    ],
  },
  {
    category: "Seafood",
    img: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80",
    items: [
      { name: "Tawa Vanjaram Fry", price: "₹229" },
      { name: "Meen Polichathu — Vanjaram", price: "₹259" },
      { name: "Prawn (65 / Pepper Dry / Manchurian)", price: "₹269/289/289" },
      { name: "Tawa Squid / Prawn", price: "₹399/299" },
      { name: "Butter Garlic Prawns / Squid", price: "₹329/399" },
      { name: "BBQ Fish", price: "SR" },
      { name: "Tandoori Fish", price: "SR" },
      { name: "Jambu Prawns", price: "SR" },
      { name: "Tiger Prawns", price: "SR" },
      { name: "Crab Roast", price: "SR" },
    ],
  },
  {
    category: "Tandoori",
    img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80",
    items: [
      { name: "Tandoori Chicken Platter", price: "₹1199" },
      { name: "Tandoori Chicken (Half/Full)", price: "₹349/649" },
      { name: "BBQ Chicken (Half/Full)", price: "₹349/649" },
      { name: "Al Faham Chicken (Half/Full)", price: "₹359/659" },
      { name: "Chicken Tikka", price: "₹299" },
      { name: "Hariyali Chicken Tikka", price: "₹319" },
      { name: "Malai Chicken Tikka", price: "₹319" },
      { name: "Kalmi Kabab (1 pc)", price: "₹99" },
      { name: "Tangdi Kabab (1 pc)", price: "₹99" },
    ],
  },
  {
    category: "Veg Starters",
    img: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80",
    items: [
      { name: "Panneer Tikka", price: "₹299" },
      { name: "Panneer (65 / Manchurian / Pepper Dry)", price: "₹229/249/249" },
      { name: "Mushroom (65 / Manchurian / Pepper Dry)", price: "₹219/239/239" },
      { name: "Gobi (65 / Manchurian / Pepper Dry)", price: "₹219/239/239" },
      { name: "Dragon Panneer", price: "₹249" },
      { name: "Butter Garlic Mushroom", price: "₹259" },
    ],
  },
  {
    category: "Curries",
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    items: [
      { name: "Chicken Butter Masala", price: "₹289" },
      { name: "Panner Butter Masala", price: "₹249" },
      { name: "Panner Tikka Masala", price: "₹359" },
      { name: "Chicken Tikka Masala", price: "₹389" },
      { name: "Kadai (Chicken/Panner/Mushroom)", price: "₹299/249/239" },
      { name: "Chicken Chettinad Masala", price: "₹269" },
      { name: "Mutton Thani Kulambu", price: "₹349" },
      { name: "Mutton Chettinad Masala", price: "₹359" },
      { name: "Mutton Pepper Masala", price: "₹369" },
      { name: "Mutton Vengaya Kari", price: "₹359" },
      { name: "Prawn Masala", price: "₹339" },
      { name: "Meen Kuzhambu", price: "₹269" },
    ],
  },
  {
    category: "Breads & Parotta",
    img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
    items: [
      { name: "Bun / Nool Parrota + Mutton Vengaya Curry", price: "₹449" },
      { name: "Bun / Nool Parrota + Mutton Nalli Semi Gravy", price: "₹449" },
      { name: "Bun / Nool Parrota + Mutton Boti Semi Gravy", price: "₹349" },
      { name: "Bun Parrota", price: "₹100" },
      { name: "Nool Parrota", price: "₹110" },
      { name: "Egg Parrota", price: "₹120" },
      { name: "Parotta", price: "₹80" },
      { name: "Chapathi", price: "₹80" },
      { name: "Roti (Plain/Butter)", price: "₹45/65" },
      { name: "Naan (Plain/Butter/Garlic)", price: "₹55/65/70" },
      { name: "Kulcha (Plain/Butter/Panner)", price: "₹49/59/99" },
    ],
  },
  {
    category: "Tiffin & Breakfast",
    img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80",
    items: [
      { name: "Idly (3 pc)", price: "₹70" },
      { name: "Ghee Masala Dosa", price: "₹139" },
      { name: "Ghee Kara Dosa", price: "₹129" },
      { name: "Ghee Roast", price: "₹119" },
      { name: "Ghee Podi Dosa", price: "₹129" },
      { name: "Plain Paper Roast", price: "₹119" },
      { name: "Uthappam (Plain/Ghee/Onion)", price: "₹89/119/109" },
      { name: "Idiyappam (Coconut Milk/Veg Kuruma)", price: "₹100" },
      { name: "Pazhaya Soru — Non-veg", price: "₹199", note: "2 types of Non-veg Thokku, Chinna Vengayam, Pachamilaga" },
      { name: "Non-Veg Mini Tiffin", price: "₹199", note: "Idly, Set Dosa, Parrota, Egg, Chicken Gravy, Mutton Gravy, Chutney" },
      { name: "Kari Dosa (Chicken/Mutton)", price: "₹229/299" },
      { name: "Kothu Idly (Chicken/Egg)", price: "₹189/169" },
      { name: "Kothu Idiyappam (Chicken/Egg)", price: "₹189/169" },
    ],
  },
  {
    category: "Desserts",
    img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80",
    items: [
      { name: "Madurai Jigarthanda", price: "₹139" },
      { name: "Elaneer Payasam", price: "₹129" },
      { name: "Gulab Jamun with Ice Cream", price: "₹120" },
      { name: "Rose Milk", price: "₹80" },
      { name: "Coconut Pudding", price: "₹99" },
      { name: "FS with Ice Cream", price: "₹139" },
      { name: "Fruit Mixer with Badam Milk", price: "₹109" },
    ],
  },
];

const SPECIALS = [
  {
    name: "Kongu Thokku Meals",
    price: "₹399",
    tag: "Signature",
    desc: "4 Types of Thokku (Chicken, Kaadai, Prawns, Nethili Karuvada) · Fish Curry · Mutton Gravy · Rice · Day Spl Chicken 2pc · Egg · Poriyal · Rasam · Curd · Gulkand · Banana",
  },
  {
    name: "Chicken 8 Meal Combo",
    price: "₹399",
    tag: "Best Value",
    desc: "Sweet · Mini Chicken Biryani · Bun Parotta · Chicken Gravy · 2 Chicken Starters · Boiled Egg · Onion Raita",
  },
  {
    name: "Mutton 8 Meal Combo",
    price: "₹499",
    tag: "Feast",
    desc: "Sweet · Mini Mutton Biryani · Bun Parotta · Mutton Gravy · Mutton Varuval · Chicken Starters · Boiled Egg · Onion Raita",
  },
  {
    name: "Tandoori Chicken Platter",
    price: "₹1199",
    tag: "Grand",
    desc: "Full Tandoori Chicken · BBQ Chicken · Al Faham Chicken · Chicken Tikka · Hariyali Tikka · Malai Tikka — the ultimate celebration feast",
  },
];

import axios from "axios";

export default function Index() {
  const [done, setDone] = useState(false);
  const [activeMenu, setActiveMenu] = useState(0);
  const [basePrice, setBasePrice] = useState(1499);
  const [menuHighlights, setMenuHighlights] = useState<any[]>(MENU_HIGHLIGHTS); // Default to static, override with DB
  const navigate = useNavigate();

  React.useEffect(() => {
    // Fetch Event Data for dynamic pricing
    axios.get("/api/events")
      .then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          setBasePrice(res.data.data[0].basePrice);
        }
      })
      .catch((err) => console.error("Error fetching event:", err));

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
          {[{ label: "Home", href: "/" }, { label: "Menu", href: "/menu" }, { label: "Gallery", href: "/gallery" }, { label: "About", href: "/about" }].map(({ label, href }) => (
            <Link key={label} to={href} className="text-xs font-semibold tracking-widest uppercase text-[#1a3d2b]/60 hover:text-[#1a3d2b] transition-colors">{label}</Link>
          ))}
        </div>
        <button onClick={() => navigate("/slots")} className="flex items-center gap-2 bg-[#1a3d2b] hover:bg-[#2d6a4f] text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-full transition-colors">
          <Ticket size={13} /> Book Now
        </button>
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
            <Star size={10} fill="currentColor" /> From Madurai · To Bangalore
          </motion.div>

          <motion.h1 custom={1} variants={fade} initial="hidden" animate="show"
            className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-4 text-[#1a3d2b] drop-shadow-sm">
            Authentic<br />South Indian<br />Multi Cuisine
          </motion.h1>

          <motion.p custom={2} variants={fade} initial="hidden" animate="show"
            className="text-[#1a3d2b]/80 font-medium text-base leading-relaxed max-w-md mb-6 drop-shadow-sm">
            From the <strong className="text-[#1a3d2b] font-bold">Heart of Madurai</strong> to the <strong className="text-[#1a3d2b] font-bold">Soul of Bangalore</strong> —
            experience legendary Biryani, grand Kari Virundhu feasts, and the iconic Madurai Jigarthanda.
          </motion.p>

          <motion.div custom={3} variants={fade} initial="hidden" animate="show" className="flex flex-wrap gap-3 mb-8">
            {[
              { icon: MapPin, text: "Madurai & Bangalore" },
              { icon: Clock, text: "Open: 11 AM – 11 PM" },
              { icon: CalendarDays, text: "Grand Event Coming Soon" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-[#1a3d2b]/70 font-bold bg-white/70 backdrop-blur-md border border-[#1a3d2b]/10 px-3 py-1.5 rounded-full shadow-sm">
                <Icon size={12} className="text-[#c9841a]" /> {text}
              </div>
            ))}
          </motion.div>

          <motion.div custom={4} variants={fade} initial="hidden" animate="show" className="flex flex-col sm:flex-row gap-4 mb-12">
            <motion.button whileHover={{ scale: 1.05, rotateX: 2, rotateY: -2 }} style={{ perspective: 1000 }} onClick={() => navigate("/slots")} className="group flex items-center justify-center gap-3 bg-[#1a3d2b] hover:bg-[#2d6a4f] text-white font-bold px-8 py-4 rounded-xl text-sm tracking-wide transition-colors shadow-lg">
              <Ticket size={16} /> Reserve Your Seat
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, rotateX: 2, rotateY: -2 }} style={{ perspective: 1000 }} onClick={() => navigate("/menu")} className="group flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm border-2 border-[#1a3d2b]/30 hover:border-[#1a3d2b] text-[#1a3d2b] font-bold px-8 py-4 rounded-xl text-sm tracking-wide transition-colors shadow-sm">
              <UtensilsCrossed size={16} /> View Full Menu
            </motion.button>
          </motion.div>

          <motion.div custom={5} variants={fade} initial="hidden" animate="show" className="flex gap-10 border-t border-[#1a3d2b]/10 pt-8">
            {[{ value: "500+", label: "Guests Daily" }, { value: "80+", label: "Menu Items" }, { value: "10+", label: "Years of Service" }].map(({ value, label }) => (
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
              <button onClick={() => navigate("/slots")} className="flex items-center gap-1.5 bg-[#c9841a] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-[#a66d15] transition-colors shadow-md">
                Reserve <ChevronRight size={13} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── GRAND EVENT BANNER ── */}
      <section className="bg-[#f5f0e8] border-y border-[#1a3d2b]/10 px-8 md:px-16 py-14">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#1a3d2b]/50 mb-3">Announcement</p>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-[#1a3d2b] mb-2">Something <span className="italic">Grand</span></h2>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-[#c9841a] mb-6">Is Coming Soon</h3>
          <p className="text-[#1a3d2b]/60 text-sm mb-10 max-w-lg mx-auto">From the heart of Madurai to the soul of Bangalore — an exclusive dining event unlike anything before.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              { icon: CalendarDays, label: "Exclusive Event Announcement" },
              { icon: Sparkles, label: "Extraordinary Experiences" },
              { icon: Gift, label: "Surprises That Delight" },
              { icon: Users, label: "Memories That Last" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full border-2 border-[#1a3d2b]/20 bg-white flex items-center justify-center">
                  <Icon size={22} className="text-[#1a3d2b]" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/70 text-center leading-relaxed">{label}</p>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/slots")} className="inline-flex items-center gap-2 bg-[#1a3d2b] text-white font-bold px-8 py-3.5 rounded-full text-sm tracking-wide hover:bg-[#2d6a4f] transition-colors">
            Stay Tuned — Book Early Access <ArrowRight size={14} />
          </button>
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
                className="flex flex-col md:flex-row bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                {/* Food image */}
                <div className="md:w-48 flex-shrink-0">
                  <img src={menuHighlights[activeMenu].img} alt={menuHighlights[activeMenu].category}
                    className="w-full h-48 md:h-full object-cover" />
                </div>
                {/* Items */}
                <div className="flex-1">
                  {menuHighlights[activeMenu].items.map((item: any, i: number) => (
                    <div key={item.name} className={`px-5 py-3 ${i !== menuHighlights[activeMenu].items.length - 1 ? "border-b border-gray-200" : ""}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-[#1a3d2b] font-semibold text-sm">{item.name}</p>
                        <p className="text-[#1a3d2b] font-bold text-sm font-display ml-4 flex-shrink-0">{item.price}</p>
                      </div>
                      {item.note && <p className="text-[#1a3d2b]/45 text-[10px] mt-0.5 leading-relaxed">{item.note}</p>}
                    </div>
                  ))}
                <div className="px-5 py-3 bg-[#1a3d2b]/5 flex items-center justify-between">
                  <p className="text-[#1a3d2b]/60 text-xs">Showing highlights</p>
                  <button onClick={() => navigate("/menu")} className="flex items-center gap-1 text-[#1a3d2b] text-xs font-bold hover:underline">
                    Full Menu <ChevronRight size={11} />
                  </button>
                </div>
              </div>
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
            {SPECIALS.map(({ name, price, desc, tag }, i) => (
              <motion.div key={name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ rotateX: 2, rotateY: -2, scale: 1.02 }}
                onClick={() => navigate("/slots")} className="group cursor-pointer bg-white border border-gray-200 hover:border-[#1a3d2b]/40 rounded-xl p-6 transition-all shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
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

      {/* ── FOOTER CTA ── */}
      <section className="bg-[#1a3d2b] px-8 md:px-16 py-14 text-center border-t-4 border-[#c9841a]">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#c9841a] text-xs tracking-[0.3em] uppercase mb-3 font-bold">Ready to Dine?</p>
          <h2 className="font-display text-4xl font-bold text-white mb-2">Book Your Table Today</h2>
          <p className="text-white/70 text-sm mb-6">From the Heart of Madurai · To the Soul of Bangalore</p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10">
            <button onClick={() => navigate("/slots")} className="inline-flex items-center gap-3 bg-white text-[#1a3d2b] font-bold px-8 py-3.5 rounded-xl text-sm tracking-wide hover:bg-gray-100 transition-colors w-full md:w-auto justify-center">
              <Ticket size={16} /> Make a Reservation <ArrowRight size={14} />
            </button>
            <a href={`tel:${PHONE.replace(/\s+/g, '')}`} className="inline-flex items-center gap-3 bg-transparent border border-white/30 text-white font-bold px-8 py-3.5 rounded-xl text-sm tracking-wide hover:bg-white/10 transition-colors w-full md:w-auto justify-center">
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
                <img src="/suvaialaya-logo.png" alt="Suvaialaya" className="h-10 w-10 object-contain rounded-lg bg-white/10 p-1" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <div>
                  <p className="text-white font-display font-bold text-sm tracking-widest uppercase">Suvaialaya</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">South Indian Cuisine</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-white/50">
                Authentic Madurai flavors brought to your city. From legendary Biryani to grand Kari Virundhu feasts.
              </p>
              <a href={`tel:${PHONE.replace(/\s+/g, '')}`} className="inline-flex items-center gap-2 mt-4 text-[#c9841a] text-xs font-bold hover:text-[#e8a030] transition-colors">
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
                  { label: "Gallery", href: "/gallery" },
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
                  { label: "Book a Seat", href: "/slots" },
                  { label: "My Bookings", href: "/dashboard" },
                  { label: "Login", href: "/login" },
                  { label: "Register", href: "/register" },
                ].map(({ label, href }) => (
                  <li key={label}><Link to={href} className="text-xs hover:text-white transition-colors">{label}</Link></li>
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
            <p className="text-[10px] text-white/20">Developed by <span className="text-[#c9841a] font-bold">Shalini N</span></p>
          </div>
        </div>
      </footer>
    </main>
  );
}
