import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Ticket, Calendar, Clock, MapPin, Users, Leaf, Loader2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";
import axios from "axios";

export default function TicketVerification() {
  const { id } = useParams<{ id: string }>();
  const [ticketData, setTicketData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        // We need a public endpoint or admin-only endpoint?
        // Wait, if it's a public verification page, the backend needs to allow fetching by ID
        // Let's see if /api/bookings/:id is public or authenticated.
        // Actually, if we just use a generic fetch, we might need a specific endpoint.
        const response = await axios.get(`/api/bookings/verify/${id}`);
        if (response.data.success) {
          setTicketData(response.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Invalid or Expired Ticket");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTicketDetails();
    }
  }, [id]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center relative">
        <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none" />
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#1a3d2b] flex flex-col relative overflow-hidden">
      {/* ── BACKGROUND ACCENTS ── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none fixed" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none fixed" />
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="mx-auto flex h-20 items-center justify-center px-5 relative z-10">
          <BrandMark />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-5 relative z-10 py-12" style={{ perspective: 1000 }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          whileHover={{ rotateX: 2, rotateY: -2, scale: 1.01 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white max-w-md w-full rounded-2xl border border-gray-100 p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative overflow-hidden"
        >
          {error ? (
            <>
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                <XCircle size={100} className="text-red-500" />
              </div>
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-50 border-2 border-red-100 mb-6 shadow-inner">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h1 className="font-display text-4xl font-bold text-red-500">Invalid Ticket</h1>
              <p className="mt-3 text-sm font-semibold text-red-400 uppercase tracking-widest">{error}</p>
            </>
          ) : (
            <>
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                <CheckCircle2 size={100} className="text-green-600" />
              </div>
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-50 border-2 border-green-100 mb-6 shadow-inner">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              
              <h1 className="font-display text-4xl font-bold text-green-600">Verified</h1>
              <p className="mt-3 text-[10px] font-bold text-green-600/70 uppercase tracking-widest">Valid Entry Ticket</p>
              
              <p className="mt-4 text-[10px] font-bold uppercase tracking-widest bg-[#1a3d2b]/5 inline-block px-4 py-2 rounded-full text-[#1a3d2b] border border-[#1a3d2b]/10">
                ID: <span className="text-[#c9841a]">{ticketData._id}</span>
              </p>

              <div className="mt-8 bg-gray-50 rounded-xl p-6 text-left border border-gray-100 shadow-sm relative">
                <div className="flex items-center gap-4 mb-4">
                  <Ticket className="text-[#c9841a]" size={20} />
                  <div>
                    <p className="text-[10px] text-[#1a3d2b]/60 font-bold uppercase tracking-widest mb-1">Guest Name</p>
                    <p className="font-display font-bold text-xl text-[#1a3d2b]">{ticketData.guestDetails?.fullName || ticketData.user?.name || "Guest"}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-[10px] text-[#1a3d2b]/60 font-bold uppercase tracking-widest mb-1">Date</p>
                    <p className="font-display font-bold text-lg text-[#1a3d2b]">
                      {new Date(ticketData.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#1a3d2b]/60 font-bold uppercase tracking-widest mb-1">Time</p>
                    <p className="font-display font-bold text-lg text-[#1a3d2b]">{ticketData.slotTime}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-[10px] text-[#1a3d2b]/60 font-bold uppercase tracking-widest mb-1">Guests</p>
                    <p className="font-display font-bold text-lg text-[#1a3d2b]">{ticketData.numberOfGuests} Pax</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#1a3d2b]/60 font-bold uppercase tracking-widest mb-1">Status</p>
                    <span className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-widest
                      ${ticketData.bookingStatus === 'Confirmed' ? 'bg-[#c9841a]/10 text-[#c9841a] border-[#c9841a]/20' : 
                        ticketData.bookingStatus === 'Checked In' ? 'bg-green-100 text-green-700 border-green-200' :
                        'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      {ticketData.bookingStatus}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="mt-10">
            <Link to="/" className="block w-full">
              <button className="w-full rounded-xl border border-gray-200 bg-transparent px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-[#1a3d2b] transition-all hover:bg-gray-50 flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Return to Home
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
