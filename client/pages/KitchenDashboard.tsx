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
      <div className="min-h-screen bg-[#0B2D1F] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#B8860B] animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B2D1F] text-[#FAF9F6] selection:bg-[#B8860B]/30 font-sans">
      <header className="sticky top-0 z-50 border-b border-[#FAF9F6]/10 bg-[#0B2D1F]/95 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-[#B8860B] hover:text-[#FAF9F6] transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-widest text-[#B8860B] flex items-center gap-2">
              <ChefHat size={28} /> KITCHEN COMMAND
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#FAF9F6]/50">Operations Department</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#FAF9F6]">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="text-xs uppercase tracking-widest text-[#B8860B]">Live Sync Active</div>
        </div>
      </header>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#FAF9F6]/5 rounded-xl border border-[#B8860B]/30 p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Timer size={100} />
            </div>
            <h2 className="text-[#B8860B] text-sm font-bold uppercase tracking-widest mb-4">Current Slot Action</h2>
            <div className="text-5xl font-display font-bold text-[#FAF9F6] mb-2">{currentSlotName}</div>
            <div className="text-xl text-[#FAF9F6]/70 font-semibold mb-6">{currentSlot.total} GUESTS EXPECTED</div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{currentSlot.total}</div>
                <div className="text-[10px] uppercase tracking-widest text-blue-400/70">Arriving</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{currentSlot.checkedIn}</div>
                <div className="text-[10px] uppercase tracking-widest text-green-400/70">Seated</div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-400">{currentSlot.pending}</div>
                <div className="text-[10px] uppercase tracking-widest text-orange-400/70">Pending</div>
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#FAF9F6]/5 p-4 rounded-lg border border-[#FAF9F6]/10">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#FAF9F6]/50">VIP Tables</div>
                <div className="text-lg font-bold text-[#B8860B]">{currentSlot.vip}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-[#FAF9F6]/50">Special Requests</div>
                <div className="text-lg font-bold text-[#FAF9F6]">4</div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#FAF9F6]/5 rounded-xl border border-[#FAF9F6]/10 p-6">
            <h2 className="text-[#FAF9F6]/50 text-sm font-bold uppercase tracking-widest mb-4">Predictive Feed: Next Slot</h2>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-3xl font-display font-bold text-[#FAF9F6]">{nextSlotName}</div>
                <div className="text-sm text-[#FAF9F6]/70 mt-1">{nextSlot.total} GUESTS EXPECTED</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#B8860B] font-bold uppercase tracking-widest">Prep Start: NOW</div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#FAF9F6]/5 rounded-xl border border-[#FAF9F6]/10 p-6 flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[#B8860B] text-sm font-bold uppercase tracking-widest">Live Preparation Status</h2>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs font-bold uppercase tracking-widest">
                80% COMPLETED
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FAF9F6]/5 border border-green-500/30 rounded-lg p-4 flex justify-between items-center relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                <div>
                  <div className="font-bold text-lg text-[#FAF9F6]">Mutton Nenju Elumbu Soup</div>
                  <div className="text-xs text-[#FAF9F6]/50 uppercase tracking-widest mt-1">Batch 1 (100 Portions)</div>
                </div>
                <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1.5 rounded border border-green-500/20">
                  <CheckCircle2 size={16} /> <span className="text-xs font-bold uppercase tracking-widest">READY</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6]/5 border border-orange-500/30 rounded-lg p-4 flex justify-between items-center relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                <div>
                  <div className="font-bold text-lg text-[#FAF9F6]">Madurai Kari Dosa</div>
                  <div className="text-xs text-[#FAF9F6]/50 uppercase tracking-widest mt-1">Live Stations Active</div>
                </div>
                <div className="flex items-center gap-2 text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded border border-orange-500/20 animate-pulse">
                  <Utensils size={16} /> <span className="text-xs font-bold uppercase tracking-widest">PREPARING</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6]/5 border border-orange-500/30 rounded-lg p-4 flex justify-between items-center relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                <div>
                  <div className="font-bold text-lg text-[#FAF9F6]">Mutton Chukka</div>
                  <div className="text-xs text-[#FAF9F6]/50 uppercase tracking-widest mt-1">Tawa Roasting</div>
                </div>
                <div className="flex items-center gap-2 text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded border border-orange-500/20 animate-pulse">
                  <Utensils size={16} /> <span className="text-xs font-bold uppercase tracking-widest">PREPARING</span>
                </div>
              </div>

              <div className="bg-[#FAF9F6]/5 border border-green-500/30 rounded-lg p-4 flex justify-between items-center relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                <div>
                  <div className="font-bold text-lg text-[#FAF9F6]">Jigarthanda Base</div>
                  <div className="text-xs text-[#FAF9F6]/50 uppercase tracking-widest mt-1">Chilling</div>
                </div>
                <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1.5 rounded border border-green-500/20">
                  <CheckCircle2 size={16} /> <span className="text-xs font-bold uppercase tracking-widest">READY</span>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-400 uppercase tracking-widest font-bold">Estimated Serving Time</div>
                <div className="text-[#FAF9F6] font-display text-xl mt-1">Starts in 14 Mins</div>
              </div>
              <Timer className="text-blue-400" size={32} />
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-[#FAF9F6]/5 rounded-xl border border-[#FAF9F6]/10 p-6">
            <h2 className="text-[#FAF9F6]/50 text-sm font-bold uppercase tracking-widest mb-4">Total Production Required Today</h2>
            <div className="text-5xl font-display font-bold text-[#B8860B] mb-2">{totalGuests}</div>
            <div className="text-sm text-[#FAF9F6]/70 uppercase tracking-widest">Total Guests Booked</div>
            
            <div className="mt-6 pt-6 border-t border-[#FAF9F6]/10 grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-[#FAF9F6]">0</div>
                <div className="text-[10px] text-[#FAF9F6]/50 uppercase tracking-widest">No Shows</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#FAF9F6]">15</div>
                <div className="text-[10px] text-[#FAF9F6]/50 uppercase tracking-widest">Waitlist</div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-red-500/10 rounded-xl border border-red-500/20 p-6 flex-1">
            <h2 className="text-red-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle size={18} /> Urgent Alerts
            </h2>
            <ul className="space-y-4">
              <li className="bg-red-500/20 p-3 rounded border border-red-500/30 text-sm text-red-100">
                <span className="font-bold block mb-1">Dietary Alert (12 PM Slot)</span>
                2 Guests requested strict Jain Preparation. Ensure separate tawa is ready.
              </li>
              <li className="bg-orange-500/20 p-3 rounded border border-orange-500/30 text-sm text-orange-100">
                <span className="font-bold block mb-1">Capacity Warning (1 PM Slot)</span>
                Slot is at 100% capacity. Prep stations must be fully staffed by 12:30 PM.
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
