import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, User, Phone, Mail, MapPin, Users, HeartPulse, Minus, Plus, Leaf, UtensilsCrossed, Package, IndianRupee } from "lucide-react";
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
  const [availableAddons, setAvailableAddons] = useState<any[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<{[key: string]: number}>({});

  useEffect(() => {
    axios.get("/api/addons")
      .then(res => {
        if (res.data.success) {
          setAvailableAddons(res.data.data.filter((a: any) => a.isActive));
        }
      })
      .catch(err => console.error("Failed to load add-ons", err));
  }, []);

  if (!state) {
    navigate("/slots");
    return null;
  }

  const { eventId, eventTitle, date, slotTime, basePrice } = state;
  const addonsTotal = Object.entries(selectedAddons).reduce((acc, [addonId, qty]) => {
    const addon = availableAddons.find(a => a._id === addonId);
    return acc + (addon ? addon.price * qty : 0);
  }, 0);

  const totalAmount = (basePrice * numberOfGuests) + addonsTotal;

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
        addons: Object.entries(selectedAddons)
          .filter(([_, qty]) => qty > 0)
          .map(([addonId, qty]) => {
             const addon = availableAddons.find(a => a._id === addonId);
             return {
               addonId,
               quantity: qty,
               priceAtBooking: addon?.price || 0
             };
          })
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
    <main className="min-h-screen bg-white text-[#1a3d2b] pb-24 relative overflow-hidden">
      {/* ── BACKGROUND ACCENTS ── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none fixed" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none fixed" />
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/slots" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 hover:text-[#1a3d2b] transition-colors">
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
          <h1 className="font-display text-4xl font-bold tracking-tight text-[#1a3d2b] uppercase">Guest Details</h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">For the primary contact</p>
          <div className="flex justify-start">
             <OrnamentalDivider />
          </div>

          <form id="booking-form" onSubmit={handleContinue} className="mt-8 space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
               <UtensilsCrossed size={120} className="text-[#1a3d2b]" />
            </div>

            <div className="grid gap-8 sm:grid-cols-2 relative z-10">
              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-[#1a3d2b]/70 font-bold uppercase tracking-widest text-[10px]">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-[#1a3d2b]/40" />
                  <Input id="fullName" name="fullName" required className="pl-11 h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#1a3d2b] focus-visible:border-[#1a3d2b] rounded-xl text-sm" placeholder="Enter full name" />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="gender" className="text-[#1a3d2b]/70 font-bold uppercase tracking-widest text-[10px]">Gender *</Label>
                <div className="relative">
                  <Users className="absolute left-4 top-3.5 h-4 w-4 text-[#1a3d2b]/40" />
                  <select id="gender" name="gender" required defaultValue="" className="pl-11 h-12 w-full bg-gray-50 border border-gray-200 focus-visible:ring-1 focus-visible:ring-[#1a3d2b] focus-visible:outline-none rounded-xl text-sm appearance-none">
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-[#1a3d2b]/70 font-bold uppercase tracking-widest text-[10px]">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 h-4 w-4 text-[#1a3d2b]/40" />
                  <Input id="phone" name="phone" type="tel" required className="pl-11 h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#1a3d2b] focus-visible:border-[#1a3d2b] rounded-xl text-sm" placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[#1a3d2b]/70 font-bold uppercase tracking-widest text-[10px]">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-[#1a3d2b]/40" />
                  <Input id="email" name="email" type="email" required className="pl-11 h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#1a3d2b] focus-visible:border-[#1a3d2b] rounded-xl text-sm" placeholder="you@example.com" />
                </div>
              </div>
              <div className="space-y-3 sm:col-span-1">
                <Label htmlFor="city" className="text-[#1a3d2b]/70 font-bold uppercase tracking-widest text-[10px]">City of Residence</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-[#1a3d2b]/40" />
                  <Input id="city" name="city" className="pl-11 h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#1a3d2b] focus-visible:border-[#1a3d2b] rounded-xl text-sm" placeholder="e.g. Madurai (Optional)" />
                </div>
              </div>
              <div className="space-y-3 sm:col-span-1">
                <Label htmlFor="emergency" className="text-[#1a3d2b]/70 font-bold uppercase tracking-widest text-[10px]">Emergency Contact</Label>
                <div className="relative">
                  <HeartPulse className="absolute left-4 top-3.5 h-4 w-4 text-[#1a3d2b]/40" />
                  <Input id="emergency" name="emergency" type="tel" className="pl-11 h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#1a3d2b] focus-visible:border-[#1a3d2b] rounded-xl text-sm" placeholder="Family / Friend (Optional)" />
                </div>
              </div>
            </div>

            {availableAddons.length > 0 && (
              <div className="pt-8 border-t border-gray-100 relative z-10">
                <div className="mb-6">
                  <h2 className="font-display font-bold text-2xl text-[#1a3d2b] flex items-center gap-2"><Package size={24} className="text-[#c9841a]" /> Enhance Your Experience</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mt-1">Optional Add-ons</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {availableAddons.map(addon => {
                    const qty = selectedAddons[addon._id] || 0;
                    return (
                      <div key={addon._id} className="border border-gray-100 rounded-xl p-4 bg-gray-50 flex flex-col justify-between hover:border-[#c9841a]/30 transition-colors">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-[#1a3d2b] text-sm">{addon.name}</h3>
                            <span className="font-bold text-[#c9841a] text-sm flex items-center"><IndianRupee size={12} />{addon.price}</span>
                          </div>
                          <p className="text-xs text-[#1a3d2b]/60 line-clamp-2 mb-4">{addon.description}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                           <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/50">Quantity</span>
                           <div className="flex items-center gap-3 bg-white rounded-lg p-1 border border-gray-100 shadow-sm">
                             <button 
                               type="button" 
                               className="h-6 w-6 flex items-center justify-center text-[#1a3d2b] hover:bg-gray-100 rounded transition-colors disabled:opacity-30" 
                               onClick={() => setSelectedAddons(prev => ({...prev, [addon._id]: Math.max(0, qty - 1)}))}
                               disabled={qty <= 0}
                             >
                               <Minus size={12} />
                             </button>
                             <span className="font-bold font-display text-sm w-4 text-center text-[#1a3d2b]">{qty}</span>
                             <button 
                               type="button" 
                               className="h-6 w-6 flex items-center justify-center text-[#1a3d2b] hover:bg-gray-100 rounded transition-colors disabled:opacity-30" 
                               onClick={() => setSelectedAddons(prev => ({...prev, [addon._id]: qty + 1}))}
                               disabled={addon.stock !== undefined && addon.stock !== null && qty >= addon.stock}
                             >
                               <Plus size={12} />
                             </button>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-gray-100 relative z-10">
              <div className="flex items-start space-x-4">
                <Checkbox id="terms" required className="mt-1 border-gray-300 data-[state=checked]:bg-[#1a3d2b] data-[state=checked]:border-[#1a3d2b] text-white" />
                <div className="grid gap-2 leading-none">
                  <label htmlFor="terms" className="text-sm font-bold text-[#1a3d2b] cursor-pointer">
                    Accept terms and conditions
                  </label>
                  <p className="text-[11px] text-[#1a3d2b]/60 leading-relaxed max-w-md">
                    I confirm that the details provided are accurate and I agree to the restaurant's cancellation policy. 
                  </p>
                </div>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Sidebar Summary */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-12 lg:mt-0 sticky top-32" style={{ perspective: 1000 }}>
          <motion.div 
            whileHover={{ rotateX: 2, rotateY: -2, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white rounded-2xl border border-gray-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
               <Leaf size={100} className="text-[#1a3d2b]" />
            </div>
            
            <h2 className="font-display font-bold text-2xl text-[#1a3d2b] mb-2">Booking Summary</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#c9841a] mb-8">{eventTitle || "Booking Event"}</p>
            
            <div className="space-y-6 text-sm relative z-10">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-[#1a3d2b]/60 font-bold uppercase tracking-widest text-[10px]">Date</span>
                <span className="font-display font-bold text-xl text-[#1a3d2b]">{new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-[#1a3d2b]/60 font-bold uppercase tracking-widest text-[10px]">Time Slot</span>
                <span className="font-display font-bold text-xl text-[#1a3d2b]">{slotTime}</span>
              </div>
              
              <div className="pt-2 pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                   <span className="text-[#1a3d2b]/60 font-bold uppercase tracking-widest text-[10px]">Number of Guests</span>
                   <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                     <button type="button" className="h-8 w-8 flex items-center justify-center text-[#1a3d2b] disabled:opacity-30 hover:bg-gray-200 rounded-md transition-colors" onClick={() => handleGuestChange(-1)} disabled={numberOfGuests <= 1}>
                       <Minus size={14} />
                     </button>
                     <span className="font-bold font-display text-xl w-6 text-center text-[#1a3d2b]">{numberOfGuests}</span>
                     <button type="button" className="h-8 w-8 flex items-center justify-center text-[#1a3d2b] disabled:opacity-30 hover:bg-gray-200 rounded-md transition-colors" onClick={() => handleGuestChange(1)} disabled={numberOfGuests >= 10}>
                       <Plus size={14} />
                     </button>
                   </div>
                </div>
                <p className="text-[10px] text-[#1a3d2b]/50 text-right mt-3 font-semibold">₹{basePrice.toLocaleString("en-IN")} per guest</p>
              </div>

              {addonsTotal > 0 && (
                <div className="pt-2 pb-4 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#1a3d2b]/60 font-bold uppercase tracking-widest text-[10px]">Add-ons</span>
                    <span className="font-display font-bold text-lg text-[#1a3d2b]">₹{addonsTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(selectedAddons).map(([addonId, qty]) => {
                      if (qty === 0) return null;
                      const addon = availableAddons.find(a => a._id === addonId);
                      if (!addon) return null;
                      return (
                        <div key={addonId} className="flex justify-between text-xs text-[#1a3d2b]/60">
                          <span>{qty}x {addon.name}</span>
                          <span>₹{(addon.price * qty).toLocaleString("en-IN")}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-col justify-between">
                <span className="text-[#1a3d2b]/60 font-bold uppercase tracking-widest text-[10px] mb-1">Total Amount</span>
                <span className="font-display font-bold text-4xl text-[#1a3d2b]">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button type="submit" form="booking-form" className="w-full mt-10 rounded-xl bg-[#1a3d2b] px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#2d6a4f] hover:-translate-y-1 relative z-10 flex items-center justify-center">
              Proceed to Payment
            </button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
