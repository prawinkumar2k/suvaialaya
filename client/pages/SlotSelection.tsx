import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const { playSoundEffect } = useAudio();

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const user = JSON.parse(userString);
      if (user.role === "admin" || user.role === "owner") {
        navigate("/admin");
        return;
      } else if (user.role === "kitchen_staff") {
        navigate("/kitchen");
        return;
      } else if (user.role === "scanner" || user.role === "receptionist") {
        navigate("/scanner");
        return;
      }
    }

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

  const handleContinue = () => {
    if (!localStorage.getItem("token")) {
      toast.error("Please login to continue booking.");
      navigate("/login");
      return;
    }
    if (selectedSlot && eventData) {
      playSoundEffect("conch");
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
    <main className="min-h-screen bg-background text-foreground pb-32 relative selection:bg-accent/30">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 fixed">
        <img src="https://images.unsplash.com/photo-1605282717013-118e47228800?q=80&w=2070&auto=format&fit=crop" alt="Banana Leaf Background" className="w-full h-full object-cover opacity-10 mix-blend-multiply sepia-[0.3]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background" />
      </div>
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none fixed" />
      
      {/* Top Header */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10 relative">
          <BrandMark />
          <div className="flex items-center gap-4 relative z-10">
            {localStorage.getItem("token") ? (
              <>
                <span className="text-xs font-bold text-primary mr-2 hidden sm:block">
                  {localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).name : ""}
                </span>
                <Link to={localStorage.getItem("user") && JSON.parse(localStorage.getItem("user")!).role === "admin" ? "/admin" : "/dashboard"} className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary border-2 border-primary/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-primary/5 transition-all">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary border-2 border-primary/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-primary/5 transition-all">
                  Sign In
                </Link>
                <Link to="/register" className="text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground border-2 border-primary px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-primary/90 transition-all">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 pt-16 sm:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-primary uppercase">{eventData.title}</h1>
          <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-primary/70">Reserve your table</p>
          <OrnamentalDivider />
        </motion.div>

        {/* Date Selection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="mt-12">
          <div className="flex justify-center items-center gap-3 mb-6 font-display font-bold text-2xl text-primary">
            <CalendarDays className="text-accent" size={24} />
            <h2>Choose Date</h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x justify-start sm:justify-center">
            {formattedDates.map((d: any) => {
              const isSelected = selectedDate === d.full;
              return (
                <button
                  key={d.full}
                  onClick={() => { setSelectedDate(d.full); setSelectedSlot(null); }}
                  className={`flex-shrink-0 snap-start w-24 flex flex-col items-center py-4 rounded-xl border-2 transition-all shadow-sm
                    ${isSelected ? 'border-primary bg-primary/10 scale-105 shadow-md' : 'bg-background border-primary/20 hover:border-primary/50 hover:bg-primary/5'}`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-primary' : 'text-primary/60'}`}>{d.day}</span>
                  <span className={`mt-2 font-display text-2xl font-bold ${isSelected ? 'text-primary' : 'text-foreground/80'}`}>{d.date}</span>
                  {isSelected && <Check size={14} className="text-accent mt-2" />}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Time Selection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="mt-16">
          <div className="flex justify-center items-center gap-3 mb-8 font-display font-bold text-2xl text-primary">
            <Clock className="text-accent" size={24} />
            <h2>Choose Slot</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {eventData.slots.map((slot: any) => {
              const remaining = slot.capacity - slot.booked;
              const isFull = remaining <= 0;
              const statusText = isFull ? "Sold Out" : remaining < 15 ? "Filling Fast" : "Available";
              const statusColor = isFull ? "text-destructive" : remaining < 15 ? "text-accent" : "text-primary/70";
              const isSelected = selectedSlot?.time === slot.time;
              
              const timeStories: Record<string, { tamil: string, sub: string }> = {
                "11:00 AM": { tamil: "மதிய விருந்து", sub: "Temple Blessings Await You" },
                "12:00 PM": { tamil: "அருசுவை அனுபவம்", sub: "Taste The Heritage Of Madurai" },
                "01:00 PM": { tamil: "சுவை திருவிழா", sub: "Celebrate Tradition Together" },
                "02:00 PM": { tamil: "விருந்து நேரம்", sub: "A Feast Beyond Food" }
              };
              
              const story = timeStories[slot.time] || { tamil: "விருந்து", sub: "Madurai Feast" };
              
              return (
                <button
                  key={slot.time}
                  disabled={isFull}
                  onClick={() => setSelectedSlot(slot)}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all overflow-hidden text-center
                    ${isFull ? 'opacity-50 cursor-not-allowed bg-primary/5 border-primary/10' : 
                      isSelected ? 'border-primary bg-primary/10 scale-105 shadow-md' : 'bg-background border-primary/20 hover:border-primary/50 shadow-sm'}`}
                >
                  {isSelected && <div className="absolute top-0 right-0 p-2"><Check size={16} className="text-accent" /></div>}
                  <span className={`font-tamil font-bold text-xl mb-1 ${isFull ? 'text-foreground/50' : 'text-temple-orange'}`}>{story.tamil}</span>
                  <span className={`font-display font-bold text-lg ${isFull ? 'text-foreground/50' : 'text-primary'}`}>{slot.time}</span>
                  <span className={`text-[10px] italic mt-1 ${isFull ? 'text-foreground/50' : 'text-foreground/70'}`}>{story.sub}</span>
                  <div className={`mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>
                    <Users size={12} />
                    <span>{statusText}</span>
                  </div>
                  {!isFull && <span className="absolute bottom-1 right-2 text-[9px] font-bold uppercase tracking-widest text-primary/40">{remaining} Seats left</span>}
                </button>
              );
            })}
          </div>

          {selectedSlot && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="mt-12 text-center p-8 border-2 border-dashed border-primary/20 rounded-2xl bg-primary/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Leaf size={100} className="text-primary" />
              </div>
              <p className="text-2xl sm:text-3xl font-display font-extrabold tracking-widest text-primary">
                ONLY <span className="text-accent">{selectedSlot.capacity - selectedSlot.booked}</span> SEATS REMAIN
              </p>
              <div className="h-[2px] w-12 bg-accent/30 mx-auto my-4" />
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-accent leading-relaxed">
                THE BANANA LEAVES ARE WAITING.
              </p>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-primary/75 mt-2">
                THE MADURAI THIRUVIZHA BEGINS SOON.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Floating Bottom Bar */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t-2 border-primary/20 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]"
        initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between p-5 sm:px-8">
          <div className="flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Reservation Details</p>
            <p className="font-display font-bold text-lg text-primary mt-1">
              {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "-"} 
              <span className="mx-2 text-accent">|</span> 
              {selectedSlot ? selectedSlot.time : "-"}
            </p>
          </div>
          <button 
            onClick={handleContinue} 
            disabled={!selectedSlot} 
            className="rounded-md bg-primary px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </main>
  );
}
