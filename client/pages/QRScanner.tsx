import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Maximize, CheckCircle2, XCircle, Search, Ticket, Leaf, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";

export default function QRScanner() {
  const [scanState, setScanState] = useState<"scanning" | "success" | "error" | "loading">("scanning");
  const [manualCode, setManualCode] = useState("");
  const [ticketData, setTicketData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!token || !user || user.role !== "admin") {
      toast.error("Unauthorized access.");
      navigate("/login");
    }
  }, [navigate, token, user]);

  const handleManualSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualCode.trim()) return;

    setScanState("loading");
    setErrorMessage("");

    try {
      const response = await axios.put(
        `/api/bookings/${manualCode}/check-in`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setTicketData(response.data.data);
        setScanState("success");
        toast.success("Ticket successfully checked in!");
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || "Invalid Booking ID");
      setScanState("error");
    }
  };

  const resetScanner = () => {
    setScanState("scanning");
    setManualCode("");
    setTicketData(null);
    setErrorMessage("");
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative selection:bg-accent/30">
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none" />
      
      {/* Top Header */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-20 items-center justify-between px-5 sm:px-8 relative z-10">
          <Link to="/admin" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/70 hover:text-primary transition-colors">
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Exit Scanner</span>
          </Link>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <BrandMark />
          </div>
          <div className="w-24"></div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center py-10 px-5 relative z-10 overflow-hidden">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold tracking-tight text-primary">Entry Scanner</h1>
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-primary/60">Scan guest QR codes or enter ID manually</p>
        </div>

        {/* Camera Viewfinder Mock */}
        <div className="relative w-full max-w-sm aspect-[3/4] bg-background border-4 border-primary rounded-[2rem] overflow-hidden shadow-2xl flex items-center justify-center">
          <AnimatePresence mode="wait">
            {scanState === "scanning" && (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-primary/5"
              >
                {/* Viewfinder brackets */}
                <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-accent rounded-tl-2xl" />
                <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-accent rounded-tr-2xl" />
                <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-accent rounded-bl-2xl" />
                <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-accent rounded-br-2xl" />
                
                {/* Scanning line animation */}
                <motion.div 
                  animate={{ y: ["0%", "300%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/4 left-8 right-8 h-1 bg-accent shadow-[0_0_20px_rgba(var(--accent),0.8)] z-10 rounded-full"
                />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-30 flex-col gap-4">
                  <Maximize className="text-primary w-32 h-32" strokeWidth={1} />
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/60">Camera Disabled in Dev</p>
                </div>
              </motion.div>
            )}

            {scanState === "loading" && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background flex flex-col items-center justify-center p-8 text-center"
              >
                <Loader2 className="w-16 h-16 animate-spin text-accent mb-4" />
                <h2 className="font-display text-2xl font-bold text-primary">Validating...</h2>
              </motion.div>
            )}

            {scanState === "success" && ticketData && (
              <motion.div 
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="absolute inset-0 bg-background flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Leaf size={100} className="text-primary" />
                </div>
                
                <div className="w-24 h-24 bg-success/10 border-4 border-success rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <CheckCircle2 className="w-12 h-12 text-success" />
                </div>
                <h2 className="font-display text-4xl font-bold text-success mb-1">Valid Ticket</h2>
                <p className="text-xs font-bold uppercase tracking-widest text-success/70 mb-8">Ready for entry</p>
                
                <div className="bg-primary/5 w-full p-6 rounded-xl border border-primary/20 text-left relative z-10 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">Guest Name</p>
                  <p className="font-display font-bold text-2xl text-primary mb-4">{ticketData.guestDetails?.fullName || "Guest"}</p>
                  <div className="flex justify-between border-t border-primary/10 pt-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">Party Size</p>
                      <p className="font-display font-bold text-xl text-primary">{ticketData.numberOfGuests} Pax</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">Slot</p>
                      <p className="font-display font-bold text-xl text-primary">{ticketData.slotTime}</p>
                    </div>
                  </div>
                </div>
                
                <button className="mt-8 w-full rounded-md bg-success px-8 py-4 text-xs font-bold uppercase tracking-widest text-success-foreground shadow-lg transition-all hover:bg-success/90 relative z-10" onClick={resetScanner}>
                  Scan Next Ticket
                </button>
              </motion.div>
            )}

            {scanState === "error" && (
              <motion.div 
                key="error"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="absolute inset-0 bg-background flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <XCircle size={100} className="text-destructive" />
                </div>
                
                <div className="w-24 h-24 bg-destructive/10 border-4 border-destructive rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <XCircle className="w-12 h-12 text-destructive" />
                </div>
                <h2 className="font-display text-3xl font-bold text-destructive mb-3">Invalid or Used</h2>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-destructive/70 mb-8 max-w-[200px] leading-relaxed">
                  {errorMessage || "This ticket has either expired, is invalid, or has already been checked in."}
                </p>
                
                <button className="mt-auto w-full rounded-md bg-destructive px-8 py-4 text-xs font-bold uppercase tracking-widest text-destructive-foreground shadow-lg transition-all hover:bg-destructive/90 relative z-10" onClick={resetScanner}>
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Manual Entry Form */}
        {(scanState === "scanning" || scanState === "error") && (
          <form onSubmit={handleManualSubmit} className="mt-10 w-full max-w-sm">
            <div className="relative flex items-center shadow-sm">
              <Ticket className="absolute left-4 text-primary/50 h-5 w-5" />
              <Input 
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter Booking ID manually" 
                className="pl-12 h-14 bg-background border-2 border-primary/20 rounded-l-xl rounded-r-none focus-visible:ring-accent border-r-0 font-bold text-primary placeholder:text-primary/40 uppercase"
              />
              <button type="submit" className="h-14 bg-primary text-primary-foreground px-6 rounded-r-xl border-2 border-primary hover:bg-primary/90 transition-colors flex items-center justify-center">
                <Search className="h-5 w-5" />
              </button>
            </div>
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-primary/50 mt-4">
              Enter the exact MongoDB _id to check-in a guest.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
