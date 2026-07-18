import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Phone, Mail, MapPin, Users, HeartPulse, Minus, Plus, Leaf, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-6 opacity-70">
      <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary"></div>
      <Leaf size={14} className="text-accent" />
      <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary"></div>
    </div>
  );
}

export default function BookingForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { eventId: string; eventTitle: string; date: string; slotTime: string; basePrice: number } | null;

  const [numberOfGuests, setNumberOfGuests] = useState(1);

  if (!state) {
    navigate("/slots");
    return null;
  }

  const { eventId, eventTitle, date, slotTime, basePrice } = state;
  const totalAmount = basePrice * numberOfGuests;

  const handleContinue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const guestDetails = Object.fromEntries(formData.entries());

    navigate("/payment", {
      state: {
        eventId,
        eventTitle,
        date,
        slotTime,
        guestDetails,
        numberOfGuests,
        totalAmount,
      }
    });
  };

  const handleGuestChange = (change: number) => {
    const newCount = numberOfGuests + change;
    if (newCount >= 1 && newCount <= 10) {
      setNumberOfGuests(newCount);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-24 relative selection:bg-accent/30">
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none" />
      
      {/* Top Header */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/slots" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary/70 hover:text-primary transition-colors">
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Back to slots</span>
          </Link>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <BrandMark />
          </div>
          <div className="w-16"></div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 lg:grid lg:grid-cols-[1fr_420px] lg:gap-12 lg:items-start relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-display text-4xl font-bold tracking-tight text-primary uppercase">Guest Details</h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-primary/70">For the primary contact</p>
          <div className="flex justify-start">
             <OrnamentalDivider />
          </div>

          <form id="booking-form" onSubmit={handleContinue} className="mt-8 space-y-8 bg-background p-8 sm:p-10 rounded-xl border border-primary/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
               <UtensilsCrossed size={120} className="text-primary" />
            </div>

            <div className="grid gap-8 sm:grid-cols-2 relative z-10">
              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-primary font-bold uppercase tracking-widest text-xs">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-3 h-4 w-4 text-primary/60" />
                  <Input id="fullName" name="fullName" required className="pl-11 h-12 bg-primary/5 border-primary/20 focus-visible:ring-accent rounded-md" placeholder="Enter full name" />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="age" className="text-primary font-bold uppercase tracking-widest text-xs">Age</Label>
                <div className="relative">
                  <Users className="absolute left-4 top-3 h-4 w-4 text-primary/60" />
                  <Input id="age" name="age" type="number" required className="pl-11 h-12 bg-primary/5 border-primary/20 focus-visible:ring-accent rounded-md" placeholder="e.g. 28" min="18" />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="email" className="text-primary font-bold uppercase tracking-widest text-xs">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3 h-4 w-4 text-primary/60" />
                  <Input id="email" name="email" type="email" required className="pl-11 h-12 bg-primary/5 border-primary/20 focus-visible:ring-accent rounded-md" placeholder="you@example.com" />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-primary font-bold uppercase tracking-widest text-xs">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3 h-4 w-4 text-primary/60" />
                  <Input id="phone" name="phone" type="tel" required className="pl-11 h-12 bg-primary/5 border-primary/20 focus-visible:ring-accent rounded-md" placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="space-y-3 sm:col-span-1">
                <Label htmlFor="city" className="text-primary font-bold uppercase tracking-widest text-xs">City of Residence</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3 h-4 w-4 text-primary/60" />
                  <Input id="city" name="city" required className="pl-11 h-12 bg-primary/5 border-primary/20 focus-visible:ring-accent rounded-md" placeholder="e.g. Madurai" />
                </div>
              </div>
              <div className="space-y-3 sm:col-span-1">
                <Label htmlFor="emergency" className="text-primary font-bold uppercase tracking-widest text-xs">Emergency Contact</Label>
                <div className="relative">
                  <HeartPulse className="absolute left-4 top-3 h-4 w-4 text-primary/60" />
                  <Input id="emergency" name="emergency" type="tel" required className="pl-11 h-12 bg-primary/5 border-primary/20 focus-visible:ring-accent rounded-md" placeholder="Family / Friend phone" />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-primary/10 relative z-10">
              <div className="flex items-start space-x-4">
                <Checkbox id="terms" required className="mt-1 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                <div className="grid gap-2 leading-none">
                  <label htmlFor="terms" className="text-sm font-bold text-primary cursor-pointer">
                    Accept terms and conditions
                  </label>
                  <p className="text-xs text-foreground/70 leading-relaxed">
                    I confirm that the details provided are accurate and I agree to the restaurant's cancellation policy. 
                  </p>
                </div>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Sidebar Summary */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-12 lg:mt-0 sticky top-32">
          <div className="bg-background rounded-xl border border-primary/20 p-8 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
               <Leaf size={80} className="text-primary" />
            </div>
            
            <h2 className="font-display font-bold text-2xl text-primary mb-2">Booking Summary</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-8">{eventTitle || "Booking Event"}</p>
            
            <div className="space-y-6 text-sm relative z-10">
              <div className="flex justify-between items-center pb-4 border-b border-primary/10">
                <span className="text-primary/70 font-semibold uppercase tracking-widest text-xs">Date</span>
                <span className="font-display font-bold text-xl text-primary">{new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-primary/10">
                <span className="text-primary/70 font-semibold uppercase tracking-widest text-xs">Time Slot</span>
                <span className="font-display font-bold text-xl text-primary">{slotTime}</span>
              </div>
              
              <div className="pt-2 pb-4 border-b border-primary/10">
                <div className="flex justify-between items-center">
                   <span className="text-primary/70 font-semibold uppercase tracking-widest text-xs">Number of Guests</span>
                   <div className="flex items-center gap-3 bg-primary/5 rounded-md p-1 border border-primary/20">
                     <button type="button" className="h-8 w-8 flex items-center justify-center text-primary disabled:opacity-30 hover:bg-primary/10 rounded" onClick={() => handleGuestChange(-1)} disabled={numberOfGuests <= 1}>
                       <Minus size={16} />
                     </button>
                     <span className="font-bold font-display text-xl w-6 text-center text-primary">{numberOfGuests}</span>
                     <button type="button" className="h-8 w-8 flex items-center justify-center text-primary disabled:opacity-30 hover:bg-primary/10 rounded" onClick={() => handleGuestChange(1)} disabled={numberOfGuests >= 10}>
                       <Plus size={16} />
                     </button>
                   </div>
                </div>
                <p className="text-xs text-primary/60 text-right mt-2 font-semibold">₹{basePrice.toLocaleString("en-IN")} per guest</p>
              </div>

              <div className="pt-4 flex flex-col justify-between">
                <span className="text-primary/70 font-semibold uppercase tracking-widest text-xs mb-1">Total Amount</span>
                <span className="font-display font-bold text-4xl text-primary">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button type="submit" form="booking-form" className="w-full mt-10 rounded-md bg-primary px-8 py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:-translate-y-1 relative z-10">
              Proceed to Payment
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
