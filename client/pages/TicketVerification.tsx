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
    <main className="min-h-screen bg-background text-foreground flex flex-col relative selection:bg-accent/30">
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none" />
      
      {/* Top Header */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-20 items-center justify-center px-5 relative z-10">
          <BrandMark />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-5 relative z-10 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          transition={{ duration: 0.5, type: "spring" }}
          className="bg-background max-w-md w-full rounded-2xl border-2 border-primary p-8 text-center shadow-xl relative overflow-hidden"
        >
          {error ? (
            <>
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <XCircle size={100} className="text-destructive" />
              </div>
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 border-4 border-destructive mb-6 shadow-inner">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
              <h1 className="font-display text-4xl font-bold text-destructive">Invalid Ticket</h1>
              <p className="mt-3 text-sm font-semibold text-destructive/70 uppercase tracking-widest">{error}</p>
            </>
          ) : (
            <>
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <CheckCircle2 size={100} className="text-success" />
              </div>
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-success/10 border-4 border-success mb-6 shadow-inner">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              
              <h1 className="font-display text-4xl font-bold text-success">Verified</h1>
              <p className="mt-3 text-[10px] font-bold text-success/70 uppercase tracking-widest">Valid Entry Ticket</p>
              
              <p className="mt-4 text-xs font-bold uppercase tracking-widest bg-primary/5 inline-block px-4 py-2 rounded-full text-primary border border-primary/20">
                ID: <span className="text-accent">{ticketData._id}</span>
              </p>

              <div className="mt-8 bg-primary/5 rounded-xl p-6 text-left border border-primary/20 shadow-sm relative">
                <div className="flex items-center gap-4 mb-4">
                  <Ticket className="text-accent" size={20} />
                  <div>
                    <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-1">Guest Name</p>
                    <p className="font-display font-bold text-xl text-primary">{ticketData.guestDetails?.fullName || ticketData.user?.name || "Guest"}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-primary/10">
                  <div>
                    <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-1">Date</p>
                    <p className="font-display font-bold text-lg text-primary">
                      {new Date(ticketData.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-1">Time</p>
                    <p className="font-display font-bold text-lg text-primary">{ticketData.slotTime}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-primary/10">
                  <div>
                    <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-1">Guests</p>
                    <p className="font-display font-bold text-lg text-primary">{ticketData.numberOfGuests} Pax</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-1">Status</p>
                    <span className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-widest
                      ${ticketData.bookingStatus === 'Confirmed' ? 'bg-accent/10 text-accent border-accent/20' : 
                        ticketData.bookingStatus === 'Checked In' ? 'bg-success/10 text-success border-success/20' :
                        'bg-primary/5 text-primary/60 border-primary/10'}`}>
                      {ticketData.bookingStatus}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="mt-10">
            <Link to="/" className="block w-full">
              <button className="w-full rounded-md border-2 border-primary/20 bg-transparent px-8 py-4 text-xs font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/5 flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Return to Home
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
