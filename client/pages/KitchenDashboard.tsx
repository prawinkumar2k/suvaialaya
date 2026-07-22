import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Clock, Users, Utensils, AlertTriangle, ArrowLeft, CheckCircle2, Timer, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from "sonner";

export default function KitchenDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [prepStatus, setPrepStatus] = useState({
    soup: 'READY',
    mutton: 'PREPARING',
    dosa: 'PREPARING',
    dessert: 'PENDING'
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update time every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchTodayBookings();
  }, []);

  const fetchTodayBookings = async () => {
    try {
      const res = await axios.get('/api/bookings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = res.data.data.filter((b: any) => b.date.startsWith(today));
      setBookings(todayBookings);
    } catch (err) {
      toast.error("Failed to sync with front desk.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalGuests = bookings.reduce((sum, b) => sum + (b.numberOfGuests || 0), 0);
  
  const slotData = bookings.reduce((acc: any, booking) => {
    if (!acc[booking.slotTime]) {
      acc[booking.slotTime] = { total: 0, checkedIn: 0, pending: 0, vip: 0 };
    }
    acc[booking.slotTime].total += booking.numberOfGuests;
    
    if (booking.bookingStatus === 'Attended') {
      acc[booking.slotTime].checkedIn += booking.numberOfGuests;
    } else if (booking.bookingStatus === 'Confirmed') {
      acc[booking.slotTime].pending += booking.numberOfGuests;
    }
    
    if (booking.numberOfGuests >= 6) {
      acc[booking.slotTime].vip += 1;
    }
    
    return acc;
  }, {});

  const sortedSlots = Object.keys(slotData).sort((a, b) => {
    const timeA = new Date(`1970/01/01 ${a}`).getTime();
    const timeB = new Date(`1970/01/01 ${b}`).getTime();
    return timeA - timeB;
  });

  const currentSlotIndex = 0;
  const currentSlotName = sortedSlots[currentSlotIndex] || "No Slots";
  const currentSlot = slotData[currentSlotName] || { total: 0, checkedIn: 0, pending: 0, vip: 0 };
  
  const nextSlotName = sortedSlots[currentSlotIndex + 1] || "None";
  const nextSlot = slotData[nextSlotName] || { total: 0 };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#c9841a] animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#1a3d2b] font-sans selection:bg-[#c9841a]/30 relative">
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none" />
      
      <div className="h-2 w-full bg-gradient-to-r from-[#1a3d2b] via-[#c9841a] to-[#1a3d2b]" />

      <header className="sticky top-0 z-50 border-b border-[#1a3d2b]/10 bg-white/95 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-[#1a3d2b] hover:text-[#c9841a] transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-widest text-[#1a3d2b] flex items-center gap-2 uppercase">
              <ChefHat size={28} className="text-[#c9841a]" /> Kitchen Command
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#1a3d2b]/60">Operations Department</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-display font-bold text-[#1a3d2b]">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#c9841a]">Live Sync Active</div>
        </div>
      </header>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto relative z-10" style={{ perspective: "1000px" }}>
        
        {/* Left Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
            whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
            className="bg-white rounded-xl border border-[#1a3d2b]/10 p-6 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Timer size={120} className="text-[#1a3d2b]" />
            </div>
            <h2 className="text-[#c9841a] text-xs font-bold uppercase tracking-widest mb-4">Current Slot Action</h2>
            <div className="text-5xl font-display font-bold text-[#1a3d2b] mb-2">{currentSlotName}</div>
            <div className="text-sm font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-6">{currentSlot.total} Guests Expected</div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#1a3d2b]/5 border border-[#1a3d2b]/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-display font-bold text-[#1a3d2b]">{currentSlot.total}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mt-1">Arriving</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-display font-bold text-green-700">{currentSlot.checkedIn}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-green-700/60 mt-1">Seated</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-display font-bold text-orange-700">{currentSlot.pending}</div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-orange-700/60 mt-1">Pending</div>
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#1a3d2b]/5 p-4 rounded-lg border border-[#1a3d2b]/10">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">VIP Tables</div>
                <div className="text-xl font-display font-bold text-[#c9841a] mt-1">{currentSlot.vip}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">Special Requests</div>
                <div className="text-xl font-display font-bold text-[#1a3d2b] mt-1">4</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} 
            whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
            className="bg-white rounded-xl border border-[#1a3d2b]/10 p-6 shadow-xl"
          >
            <h2 className="text-[#1a3d2b]/50 text-xs font-bold uppercase tracking-widest mb-4">Predictive Feed: Next Slot</h2>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-3xl font-display font-bold text-[#1a3d2b]">{nextSlotName}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mt-1">{nextSlot.total} Guests Expected</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-white bg-[#c9841a] px-3 py-1 rounded-sm uppercase tracking-widest shadow-sm">Prep Start: NOW</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Center Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} 
            whileHover={{ scale: 1.01, rotateX: 1, rotateY: -1 }}
            className="bg-white rounded-xl border border-[#1a3d2b]/10 p-6 flex-1 shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[#1a3d2b] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Utensils size={16} className="text-[#c9841a]" /> Live Preparation Status
              </h2>
              <span className="px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-sm text-[9px] font-bold uppercase tracking-widest">
                80% Completed
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-[#1a3d2b]/10 shadow-sm rounded-lg p-4 flex justify-between items-center relative overflow-hidden group hover:border-green-300 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                <div>
                  <div className="font-display font-bold text-lg text-[#1a3d2b]">Mutton Nenju Elumbu Soup</div>
                  <div className="text-[10px] font-bold text-[#1a3d2b]/50 uppercase tracking-widest mt-1">Batch 1 (100 Portions)</div>
                </div>
                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded-sm border border-green-200 shadow-sm">
                  <CheckCircle2 size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Ready</span>
                </div>
              </div>

              <div className="bg-white border border-[#1a3d2b]/10 shadow-sm rounded-lg p-4 flex justify-between items-center relative overflow-hidden group hover:border-[#c9841a]/50 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#c9841a]"></div>
                <div>
                  <div className="font-display font-bold text-lg text-[#1a3d2b]">Madurai Kari Dosa</div>
                  <div className="text-[10px] font-bold text-[#1a3d2b]/50 uppercase tracking-widest mt-1">Live Stations Active</div>
                </div>
                <div className="flex items-center gap-2 text-white bg-[#c9841a] px-3 py-1.5 rounded-sm shadow-sm animate-pulse">
                  <Utensils size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Preparing</span>
                </div>
              </div>

              <div className="bg-white border border-[#1a3d2b]/10 shadow-sm rounded-lg p-4 flex justify-between items-center relative overflow-hidden group hover:border-[#c9841a]/50 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#c9841a]"></div>
                <div>
                  <div className="font-display font-bold text-lg text-[#1a3d2b]">Mutton Chukka</div>
                  <div className="text-[10px] font-bold text-[#1a3d2b]/50 uppercase tracking-widest mt-1">Tawa Roasting</div>
                </div>
                <div className="flex items-center gap-2 text-white bg-[#c9841a] px-3 py-1.5 rounded-sm shadow-sm animate-pulse">
                  <Utensils size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Preparing</span>
                </div>
              </div>

              <div className="bg-white border border-[#1a3d2b]/10 shadow-sm rounded-lg p-4 flex justify-between items-center relative overflow-hidden group hover:border-green-300 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                <div>
                  <div className="font-display font-bold text-lg text-[#1a3d2b]">Jigarthanda Base</div>
                  <div className="text-[10px] font-bold text-[#1a3d2b]/50 uppercase tracking-widest mt-1">Chilling</div>
                </div>
                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded-sm border border-green-200 shadow-sm">
                  <CheckCircle2 size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Ready</span>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-[#1a3d2b]/5 border border-[#1a3d2b]/10 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#1a3d2b]/60 uppercase tracking-widest font-bold">Estimated Serving Time</div>
                <div className="text-[#1a3d2b] font-display font-bold text-2xl mt-1">Starts in 14 Mins</div>
              </div>
              <Timer className="text-[#c9841a]" size={32} />
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} 
            whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
            className="bg-white rounded-xl border border-[#1a3d2b]/10 shadow-xl p-6 relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 opacity-5">
              <Users size={100} className="text-[#1a3d2b]" />
            </div>
            <h2 className="text-[#1a3d2b]/50 text-xs font-bold uppercase tracking-widest mb-4">Production Required</h2>
            <div className="text-5xl font-display font-bold text-[#c9841a] mb-2">{totalGuests}</div>
            <div className="text-[10px] font-bold text-[#1a3d2b]/70 uppercase tracking-widest">Total Guests Booked</div>
            
            <div className="mt-6 pt-6 border-t border-[#1a3d2b]/10 grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-display font-bold text-[#1a3d2b]">0</div>
                <div className="text-[9px] font-bold text-[#1a3d2b]/50 uppercase tracking-widest">No Shows</div>
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-[#1a3d2b]">15</div>
                <div className="text-[9px] font-bold text-[#1a3d2b]/50 uppercase tracking-widest">Waitlist</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} 
            whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
            className="bg-red-50 rounded-xl border border-red-200 shadow-xl p-6 flex-1"
          >
            <h2 className="text-red-700 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle size={16} /> Urgent Alerts
            </h2>
            <ul className="space-y-4">
              <li className="bg-white p-4 rounded-lg border border-red-100 shadow-sm text-sm text-[#1a3d2b]">
                <span className="font-bold text-red-700 block mb-1 text-[10px] uppercase tracking-widest">Dietary Alert (12 PM Slot)</span>
                <span className="font-medium text-sm">2 Guests requested strict Jain Preparation. Ensure separate tawa is ready.</span>
              </li>
              <li className="bg-white p-4 rounded-lg border border-orange-100 shadow-sm text-sm text-[#1a3d2b]">
                <span className="font-bold text-orange-700 block mb-1 text-[10px] uppercase tracking-widest">Capacity Warning (1 PM Slot)</span>
                <span className="font-medium text-sm">Slot is at 100% capacity. Prep stations must be fully staffed by 12:30 PM.</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
