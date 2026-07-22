import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Maximize, CheckCircle2, XCircle, Search, Ticket, Leaf, Loader2, LogOut } from "lucide-react";
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
    if (!token || !user || !["admin", "scanner", "receptionist", "owner"].includes(user.role)) {
      toast.error("Unauthorized access.");
      navigate("/login");
    }
  }, [navigate, token, user]);

  const handleManualSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualCode.trim()) return;

    // Extract ID if the scanned value is a URL
    let bookingId = manualCode.trim();
    if (bookingId.includes("/ticket/")) {
      bookingId = bookingId.split("/ticket/")[1].split("/")[0].split("?")[0];
    }

    setScanState("loading");
    setErrorMessage("");

    try {
      const response = await axios.put(
        `/api/bookings/${bookingId}/check-in`,
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    toast.success("Logged out successfully");
  };

  const resetScanner = () => {
    setScanState("scanning");
    setManualCode("");
    setTicketData(null);
    setErrorMessage("");
  };

  return (
    <main className="min-h-screen bg-white text-[#1a3d2b] flex flex-col relative selection:bg-[#c9841a]/30">
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none" />
      
      {/* Top Header */}
      <div className="h-2 w-full bg-gradient-to-r from-[#1a3d2b] via-[#c9841a] to-[#1a3d2b]" />
      <header className="sticky top-0 z-50 border-b border-[#1a3d2b]/10 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-20 items-center justify-between px-5 sm:px-8 relative z-10">
          <Link to="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1a3d2b]/70 hover:text-[#c9841a] transition-colors">
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Exit Scanner</span>
          </Link>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <BrandMark />
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-700 border border-red-200 hover:bg-red-50 hover:border-red-300 px-4 py-2 rounded-md transition-colors shadow-sm"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center py-10 px-5 relative z-10 overflow-hidden" style={{ perspective: "1000px" }}>
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold tracking-tight text-[#1a3d2b]">Entry Scanner</h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[#1a3d2b]/60">Scan guest QR codes or enter ID manually</p>
        </div>

        {/* Camera Viewfinder Mock */}
        <motion.div 
          whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
          className="relative w-full max-w-sm aspect-[3/4] bg-white border border-[#1a3d2b]/10 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            {scanState === "scanning" && (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#1a3d2b]/5"
              >
                {/* Viewfinder brackets */}
                <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-[#c9841a] rounded-tl-xl" />
                <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-[#c9841a] rounded-tr-xl" />
                <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-[#c9841a] rounded-bl-xl" />
                <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-[#c9841a] rounded-br-xl" />
                
                {/* Scanning line animation */}
                <motion.div 
                  animate={{ y: ["0%", "300%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/4 left-8 right-8 h-1 bg-[#c9841a] shadow-[0_0_20px_rgba(201,132,26,0.8)] z-10 rounded-full"
                />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-30 flex-col gap-4">
                  <Maximize className="text-[#1a3d2b]" size={80} strokeWidth={1} />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">Camera Disabled in Dev</p>
                </div>
              </motion.div>
            )}

            {scanState === "loading" && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 text-center"
              >
                <Loader2 className="w-16 h-16 animate-spin text-[#c9841a] mb-6" />
                <h2 className="font-display text-2xl font-bold text-[#1a3d2b]">Validating...</h2>
              </motion.div>
            )}

            {scanState === "success" && ticketData && (
              <motion.div 
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Leaf size={120} className="text-[#1a3d2b]" />
                </div>
                
                <div className="w-24 h-24 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mb-6 shadow-md">
                  <CheckCircle2 className="w-12 h-12 text-green-700" />
                </div>
                <h2 className="font-display text-3xl font-bold text-[#1a3d2b] mb-1">Valid Ticket</h2>
                <p className="text-xs font-bold uppercase tracking-widest text-green-700 mb-8">Ready for entry</p>
                
                <div className="bg-white w-full p-6 rounded-xl border border-[#1a3d2b]/10 text-left relative z-10 shadow-lg">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-1">Guest Name</p>
                  <p className="font-display font-bold text-2xl text-[#1a3d2b] mb-4">{ticketData.guestDetails?.fullName || "Guest"}</p>
                  <div className="flex justify-between border-t border-[#1a3d2b]/10 pt-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-1">Party Size</p>
                      <p className="font-display font-bold text-xl text-[#c9841a]">{ticketData.numberOfGuests} Pax</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-1">Slot</p>
                      <p className="font-display font-bold text-xl text-[#1a3d2b]">{ticketData.slotTime}</p>
                    </div>
                  </div>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-8 w-full rounded-md bg-[#1a3d2b] px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#1a3d2b]/90 relative z-10" 
                  onClick={resetScanner}
                >
                  Scan Next Ticket
                </motion.button>
              </motion.div>
            )}

            {scanState === "error" && (
              <motion.div 
                key="error"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <XCircle size={120} className="text-red-700" />
                </div>
                
                <div className="w-24 h-24 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mb-6 shadow-md">
                  <XCircle className="w-12 h-12 text-red-700" />
                </div>
                <h2 className="font-display text-3xl font-bold text-[#1a3d2b] mb-3">Invalid or Used</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-700 mb-8 max-w-[200px] leading-relaxed">
                  {errorMessage || "This ticket has either expired, is invalid, or has already been checked in."}
                </p>
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-auto w-full rounded-md bg-red-700 px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-red-800 relative z-10" 
                  onClick={resetScanner}
                >
                  Try Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Manual Entry Form */}
        {(scanState === "scanning" || scanState === "error") && (
          <motion.form 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            onSubmit={handleManualSubmit} className="mt-10 w-full max-w-sm"
          >
            <div className="relative flex items-center shadow-md rounded-xl overflow-hidden group border border-[#1a3d2b]/20 hover:border-[#c9841a] transition-colors">
              <Ticket className="absolute left-4 text-[#1a3d2b]/50 h-5 w-5 group-hover:text-[#c9841a] transition-colors" />
              <Input 
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter Booking ID manually" 
                className="pl-12 h-14 bg-white border-0 focus-visible:ring-0 font-bold text-[#1a3d2b] placeholder:text-[#1a3d2b]/40 uppercase shadow-none rounded-none"
              />
              <button type="submit" className="h-14 bg-[#1a3d2b] text-white px-6 hover:bg-[#1a3d2b]/90 transition-colors flex items-center justify-center min-w-[72px]">
                <Search className="h-5 w-5" />
              </button>
            </div>
            <p className="text-center text-[9px] font-bold uppercase tracking-widest text-[#1a3d2b]/50 mt-4">
              Enter the exact MongoDB _id to check-in a guest.
            </p>
          </motion.form>
        )}
      </div>
    </main>
  );
}
