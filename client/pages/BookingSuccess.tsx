import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight, Download, Calendar, MapPin, Clock, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";
import { useAudio } from "@/contexts/AudioContext";
import { Button } from "@/components/ui/button";

export default function BookingSuccess() {
  const location = useLocation();
  const state = location.state as { bookingId?: string; date: string; slotTime: string; numberOfGuests: number; finalTotal: number } | null;
  const { playSoundEffect } = useAudio();

  const bookingDate = state ? new Date(state.date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : "Thu, Aug 6, 2026";
  const slotTime = state ? state.slotTime : "11:00 AM";
  
  // Custom Ticket ID Format: 03AUG11-XYZ
  const dateObj = state ? new Date(state.date) : new Date("2026-08-06");
  const dayStr = dateObj.getDate().toString().padStart(2, '0');
  const monthStr = dateObj.toLocaleString("default", { month: "short" }).toUpperCase();
  const slotHour = slotTime.split(":")[0].padStart(2, '0');
  const shortId = state?.bookingId ? state.bookingId.substring(state.bookingId.length - 4).toUpperCase() : Math.floor(Math.random() * 900 + 100).toString();
  const ticketId = `${dayStr}${monthStr}${slotHour}-${shortId}`;
  
  const numberOfGuests = state?.numberOfGuests || 2;
  const finalTotal = state?.finalTotal || 1799;

  useEffect(() => {
    playSoundEffect("nadaswaram");
  }, [playSoundEffect]);

  const handleDownloadTicket = async () => {
    const { generatePremiumTicket } = await import("@/lib/ticketGenerator");
    await generatePremiumTicket(state || {
        _id: bookingId,
        date: state?.date || new Date().toISOString(),
        slotTime: slotTime,
        numberOfGuests: numberOfGuests,
        finalTotal: finalTotal
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative selection:bg-accent/30">
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none" />
      
      {/* Top Header */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-center px-5 sm:px-8 lg:px-10">
          <BrandMark />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-5 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          transition={{ duration: 0.5, type: "spring" }}
          className="bg-background max-w-md w-full rounded-2xl border-2 border-primary p-8 text-center shadow-xl relative overflow-hidden"
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-0 left-0 p-3 opacity-20"><Leaf size={24} className="text-primary transform -scale-x-100" /></div>
          <div className="absolute top-0 right-0 p-3 opacity-20"><Leaf size={24} className="text-primary" /></div>
          
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-4 border-primary mb-6 shadow-inner">
            <Leaf className="h-10 w-10 text-primary" />
          </div>
          
          <div className="space-y-6 py-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent">THE MADURAI VIRUNDHU</h2>
            <div className="h-px w-8 bg-accent/40 mx-auto" />
            <h1 className="font-display text-3xl font-extrabold text-primary tracking-wider uppercase leading-snug">
              YOUR SEAT <br/> IS RESERVED.
            </h1>
            <div className="h-px w-16 bg-accent/40 mx-auto" />
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80 space-y-2">
              <p>TEMPLE BLESSINGS: <span className="text-accent">RECEIVED</span></p>
              <p>TRADITIONAL FEAST: <span className="text-accent">AWAITING YOU</span></p>
              <p className="text-temple-orange mt-2">SUVAIALAYA WELCOMES YOU.</p>
            </div>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest bg-primary/10 inline-block px-4 py-2 rounded-full text-primary border border-primary/20">Invitation ID: <span className="text-accent">{ticketId}</span></p>

          <div className="mt-8 bg-primary/5 rounded-xl p-6 text-left border border-primary/20 shadow-sm relative">
            <div className="flex items-center gap-4 mb-5">
              <Calendar className="text-accent" size={20} />
              <div>
                <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-1">Date</p>
                <p className="font-display font-bold text-lg text-primary">{bookingDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <Clock className="text-accent" size={20} />
              <div>
                <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-1">Time</p>
                <p className="font-display font-bold text-lg text-primary">{slotTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="text-accent" size={20} />
              <div>
                <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-1">Venue</p>
                <p className="font-display font-bold text-lg text-primary">Suvaialaya Restaurant</p>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <button className="w-full rounded-md bg-primary px-8 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg transition-all hover:bg-primary/90 flex items-center justify-center gap-2" onClick={handleDownloadTicket}>
              <Download className="h-4 w-4" /> Download e-Ticket
            </button>
            <Link to="/" className="block w-full">
              <button className="w-full rounded-md border-2 border-primary/20 bg-transparent px-8 py-4 text-xs font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/5 flex items-center justify-center gap-2">
                Return to Home <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
