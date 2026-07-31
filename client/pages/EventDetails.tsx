import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Calendar, MapPin, IndianRupee, Users } from "lucide-react";
import { BrandMark } from "@/components/landing/BrandMark";

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) return;
    
    axios.get(`/api/events/${eventId}`)
      .then((res) => {
        if (res.data.success) {
          setEvent(res.data.data);
        } else {
          setError("Failed to load event");
        }
      })
      .catch((err) => {
        console.error("Failed to load event details:", err);
        setError("Event not found or server error");
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-[#1a3d2b] flex items-center justify-center relative">
        <Loader2 className="w-12 h-12 text-[#1a3d2b] animate-spin" />
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-white text-[#1a3d2b] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">{error}</h2>
        <Link to="/" className="text-[#c9841a] hover:underline">Return to Home</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1a3d2b] relative overflow-hidden pb-32">
      {/* ── BACKGROUND ACCENTS ── */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#c9841a]/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#1a3d2b]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center px-5 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 hover:text-[#1a3d2b] transition-colors">
            <ArrowLeft size={16} /> Back to home
          </Link>
          <div className="ml-auto">
            <BrandMark />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 pt-12 sm:px-8 lg:pt-20 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-block px-3 py-1 rounded-full bg-[#1a3d2b]/10 text-[#1a3d2b] text-xs font-bold uppercase tracking-widest mb-6">
                Culinary Experience
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight text-[#1a3d2b] mb-6">
                {event.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-[#1a3d2b]/70 mb-10 pb-10 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-[#c9841a]" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-[#c9841a]" />
                  <span>{event.dates.length} Days Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee size={18} className="text-[#c9841a]" />
                  <span>{event.basePrice} per person</span>
                </div>
              </div>

              <div className="prose prose-lg prose-p:text-[#1a3d2b]/70 prose-headings:text-[#1a3d2b] prose-headings:font-display">
                <h2 className="text-2xl font-bold mb-4">About this Event</h2>
                <p className="whitespace-pre-line leading-relaxed">
                  {event.description}
                </p>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 sticky top-32 border border-gray-100"
            >
              <h3 className="font-display text-2xl font-bold text-[#1a3d2b] mb-6">Reserve your table</h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-4 text-[#1a3d2b]/80">
                  <div className="w-10 h-10 rounded-full bg-[#c9841a]/10 flex items-center justify-center text-[#c9841a]">
                    <IndianRupee size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-[#1a3d2b]/60">Starting from</p>
                    <p className="font-bold">₹{event.basePrice}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-[#1a3d2b]/80">
                  <div className="w-10 h-10 rounded-full bg-[#c9841a]/10 flex items-center justify-center text-[#c9841a]">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-[#1a3d2b]/60">Availability</p>
                    <p className="font-bold">Limited seating</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/slots')}
                className="w-full bg-[#1a3d2b] hover:bg-[#25523b] text-white py-4 rounded-xl font-bold tracking-wide transition-colors duration-300 shadow-lg shadow-[#1a3d2b]/20 flex items-center justify-center gap-2"
              >
                View Available Slots
              </button>
              
              <p className="text-center text-xs text-[#1a3d2b]/50 mt-4">
                Secure checkout • Instant confirmation
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </main>
  );
}
