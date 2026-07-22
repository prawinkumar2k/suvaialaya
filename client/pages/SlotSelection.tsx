import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, Users, Leaf, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";
import { toast } from "sonner";
import axios from "axios";
import { useAudio } from "@/contexts/AudioContext";

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-6 opacity-70">
      <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary"></div>
      <Leaf size={14} className="text-accent" />
      <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary"></div>
    </div>
  );
}

export default function SlotSelection() {
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rescheduleBookingId = searchParams.get("reschedule");
  const [rescheduling, setRescheduling] = useState(false);
  const { playSoundEffect } = useAudio();

  useEffect(() => {
    // Allow anyone to view slots. Role-based redirects should only protect dashboards, not public pages.

    const fetchEvent = async () => {
      try {
        const res = await axios.get("/api/events");
        if (res.data.success && res.data.data.length > 0) {
          const mainEvent = res.data.data[0];
          setEventData(mainEvent);
          if (mainEvent.dates && mainEvent.dates.length > 0) {
            setSelectedDate(mainEvent.dates[0]);
          }
        } else {
          setError("No events found");
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, []);

  const handleContinue = async () => {
    if (!localStorage.getItem("token")) {
      toast.error("Please login to continue booking.");
      navigate("/login");
      return;
    }
    if (selectedSlot && eventData) {
      playSoundEffect("conch");
      
      if (rescheduleBookingId) {
        setRescheduling(true);
        try {
          const res = await axios.put(`/api/bookings/${rescheduleBookingId}/reschedule`, {
            newDate: selectedDate,
            newSlotTime: selectedSlot.time
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          
          if (res.data.success) {
            toast.success("Booking rescheduled successfully!");
            navigate("/dashboard");
          }
        } catch (err: any) {
          toast.error(err.response?.data?.error || "Failed to reschedule booking");
        } finally {
          setRescheduling(false);
        }
        return;
      }

      navigate("/booking-form", {
        state: {
          eventId: eventData._id,
          eventTitle: eventData.title,
          date: selectedDate,
          slotTime: selectedSlot.time,
          basePrice: eventData.basePrice,
        }
      });
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center relative">
        <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none" />
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </main>
    );
  }

  if (error || !eventData) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none" />
        <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Slots</h2>
        <p className="text-primary/70">{error || "Event data unavailable"}</p>
        <Link to="/" className="mt-6 text-primary hover:underline">Return to Home</Link>
      </main>
    );
  }

  const formattedDates = eventData.dates.map((dateStr: string) => {
    const d = new Date(dateStr);
    return {
      full: dateStr,
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).split(" ")[1],
    };
  });

  return (
    <main className="min-h-screen bg-white text-[#1a3d2b] pb-32 relative overflow-hidden">
      {/* ── BACKGROUND ACCENTS ── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none fixed" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none fixed" />
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10 relative">
          <BrandMark />
          <div className="flex items-center gap-4 relative z-10">
            {localStorage.getItem("token") ? (
              <>
                <span className="text-[10px] font-bold text-[#1a3d2b] mr-2 hidden sm:block uppercase tracking-widest">
                  {localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).name : ""}
                </span>
                <Link to={localStorage.getItem("user") && JSON.parse(localStorage.getItem("user")!).role === "admin" ? "/admin" : "/dashboard"} className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b] border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b] border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
                  Sign In
                </Link>
                <Link to="/register" className="text-[10px] font-bold uppercase tracking-widest bg-[#1a3d2b] text-white px-4 py-2 rounded-lg hover:bg-[#2d6a4f] transition-all shadow-md hover:shadow-lg">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 pt-16 pb-40 sm:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-[#1a3d2b] uppercase">{rescheduleBookingId ? "Reschedule Booking" : "SUVAIALAYA RESTAURANT"}</h1>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">{rescheduleBookingId ? "Select a new date and time for your reservation" : "Reserve your table"}</p>
          <OrnamentalDivider />
        </motion.div>

        {/* Date Selection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="mt-12">
          <div className="flex justify-center items-center gap-3 mb-6 font-display font-bold text-2xl text-[#1a3d2b]">
            <CalendarDays className="text-[#c9841a]" size={24} />
            <h2>Choose Date</h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x justify-center" style={{ perspective: 1000 }}>
            {formattedDates.map((d: any) => {
              const isSelected = selectedDate === d.full;
              return (
                <motion.button
                  key={d.full}
                  onClick={() => { setSelectedDate(d.full); setSelectedSlot(null); }}
                  whileHover={!isSelected ? { rotateX: 2, rotateY: -2, y: -2 } : {}}
                  className={`flex-shrink-0 snap-start w-28 flex flex-col items-center py-5 rounded-2xl transition-all shadow-[0_4px_15px_rgb(0,0,0,0.02)]
                    ${isSelected ? 'border-2 border-[#1a3d2b] bg-[#1a3d2b]/5 scale-105 shadow-md z-10' : 'bg-white border border-gray-100 hover:border-gray-300'}`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-[#1a3d2b]' : 'text-[#1a3d2b]/60'}`}>{d.day}</span>
                  <span className={`mt-2 font-display text-3xl font-bold ${isSelected ? 'text-[#1a3d2b]' : 'text-[#1a3d2b]/80'}`}>{d.date}</span>
                  {isSelected && <Check size={16} className="text-[#c9841a] mt-2" />}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Time Selection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="mt-16">
          <div className="flex justify-center items-center gap-3 mb-8 font-display font-bold text-2xl text-[#1a3d2b]">
            <Clock className="text-[#c9841a]" size={24} />
            <h2>Choose Slot</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5" style={{ perspective: 1000 }}>
            {eventData.slots.map((slot: any) => {
              const remaining = slot.capacity - slot.booked;
              const isFull = remaining <= 0;
              const statusText = isFull ? "Sold Out" : remaining < 15 ? "Filling Fast" : "Available";
              const statusColor = isFull ? "text-red-500" : remaining < 15 ? "text-[#c9841a]" : "text-[#1a3d2b]/60";
              const isSelected = selectedSlot?.time === slot.time;
              return (
                <motion.button
                  key={slot.time}
                  disabled={isFull}
                  onClick={() => setSelectedSlot(slot)}
                  whileHover={!isFull && !isSelected ? { rotateX: 2, rotateY: -2, y: -2, scale: 1.02 } : {}}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all overflow-hidden text-center shadow-[0_4px_15px_rgb(0,0,0,0.02)]
                    ${isFull ? 'opacity-50 cursor-not-allowed bg-gray-50 border border-gray-100' : 
                      isSelected ? 'border-2 border-[#1a3d2b] bg-[#1a3d2b]/5 scale-105 shadow-md z-10' : 'bg-white border border-gray-100 hover:border-gray-300'}`}
                >
                  {isSelected && <div className="absolute top-0 right-0 p-3"><Check size={18} className="text-[#c9841a]" /></div>}
                  <span className={`font-display font-bold text-3xl ${isFull ? 'text-[#1a3d2b]/50' : 'text-[#1a3d2b]'}`}>{slot.time}</span>
                  <div className={`mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>
                    <Users size={12} />
                    <span>{statusText}</span>
                  </div>
                  {!isFull && <span className="absolute bottom-2 right-3 text-[9px] font-bold uppercase tracking-widest text-[#1a3d2b]/40">{remaining} Seats left</span>}
                </motion.button>
              );
            })}
          </div>

          {selectedSlot && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="mt-12 text-center p-8 border border-gray-100 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Leaf size={100} className="text-[#1a3d2b]" />
              </div>
              <p className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#1a3d2b]">
                ONLY <span className="text-[#c9841a]">{selectedSlot.capacity - selectedSlot.booked}</span> SEATS REMAIN
              </p>
              <div className="h-1 w-16 bg-[#c9841a]/30 mx-auto my-5 rounded-full" />
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#c9841a] leading-relaxed">
                THE BANANA LEAVES ARE WAITING.
              </p>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-[#1a3d2b]/50 mt-2">
                THE SUVAIALAYA EXPERIENCE AWAITS.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Floating Bottom Bar */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]"
        initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between p-5 sm:px-8">
          <div className="flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">Reservation Details</p>
            <p className="font-display font-bold text-xl text-[#1a3d2b] mt-1">
              {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "-"} 
              <span className="mx-3 text-[#c9841a]">|</span> 
              {selectedSlot ? selectedSlot.time : "-"}
            </p>
          </div>
          <button 
            onClick={handleContinue} 
            disabled={!selectedSlot || rescheduling} 
            className="rounded-xl bg-[#1a3d2b] px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#2d6a4f] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:-translate-y-1"
          >
            {rescheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {rescheduleBookingId ? "Reschedule" : "Continue"}
          </button>
        </div>
      </motion.div>
    </main>
  );
}
