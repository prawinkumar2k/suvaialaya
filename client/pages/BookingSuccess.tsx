import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight, Download, Calendar, MapPin, Clock, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";
import { useAudio } from "@/contexts/AudioContext";
import { Button } from "@/components/ui/button";

export default function BookingSuccess() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const { playSoundEffect } = useAudio();

  const bookingId = searchParams.get('id') || "MKV-" + Math.random().toString(36).substr(2, 6).toUpperCase();
  const bookingDate = searchParams.get('date') || "Thu, Aug 6, 2026";
  const slotTime = searchParams.get('time') || "11:00 AM";
  const numberOfGuests = searchParams.get('guests') || "2";
  const finalTotal = searchParams.get('total') || "1799";

  useEffect(() => {
    playSoundEffect("nadaswaram");
  }, [playSoundEffect]);

  const handleDownloadTicket = async () => {
    // Dynamic import to keep bundle size small if not used
    const { jsPDF } = await import("jspdf");
    
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [100, 180] // Mobile ticket aspect ratio
    });

    // Brand Colors
    const primaryGreen = "#0f3b28";
    const accentGold = "#d4af37";

    // 1. Background (Cream)
    doc.setFillColor(249, 246, 240); // F9F6F0
    doc.rect(0, 0, 100, 180, "F");

    // 2. Ornate Border
    doc.setDrawColor(212, 175, 55); // Gold
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 90, 170);
    doc.rect(7, 7, 86, 166); // Double border

    // 3. Header Text
    doc.setTextColor(primaryGreen);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("YOUR INVITATION HAS ARRIVED", 50, 20, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(primaryGreen);
    doc.text("SCAN TO ENTER THE SUVAIYALAYA EXPERIENCE", 50, 25, { align: "center" });

    // Separator
    doc.setDrawColor(212, 175, 55); // Gold
    doc.setLineWidth(0.2);
    doc.line(15, 30, 85, 30);

    // 4. Event Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("MADURAI CHITHIRAI THIRUVIZHA", 50, 38, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("SUVAIALAYA SOUTH INDIAN CUISINE", 50, 44, { align: "center" });

    // 5. Booking Details Grid
    doc.setFillColor(15, 59, 40);
    doc.rect(10, 52, 80, 60, "F");

    doc.setTextColor(255, 255, 255);
    
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("DATE", 15, 62);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(bookingDate, 15, 68);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("TIME", 60, 62);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(slotTime, 60, 68);

    doc.setDrawColor(255, 255, 255);
    doc.line(15, 75, 85, 75);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("GUESTS", 15, 85);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${state?.numberOfGuests || 1} PAX`, 15, 91);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("PAID", 60, 85);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`INR ${state?.finalTotal || 1799}`, 60, 91);
    
    doc.line(15, 98, 85, 98);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("TICKET ID", 15, 107);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(bookingId, 50, 107, { align: "center" });

    // 6. QR Code / Barcode Area
    try {
      const QRCode = await import("qrcode");
      const verifyUrl = `${window.location.origin}/ticket/${bookingId}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        color: {
          dark: primaryGreen,
          light: "#00000000" // transparent
        },
        margin: 0
      });
      doc.addImage(qrDataUrl, "PNG", 35, 115, 30, 30);
    } catch (err) {
      console.error("QR Code generation failed", err);
    }

    doc.setTextColor(primaryGreen);
    doc.setFontSize(8);
    doc.text("TEMPLE BLESSINGS: RECEIVED", 50, 150, { align: "center" });
    doc.setFontSize(10);
    doc.text("Traditional Feast Awaiting You", 50, 156, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Madurai Welcomes You", 50, 161, { align: "center" });

    // Footer
    doc.setTextColor(15, 59, 40); // Green
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("DIGITAL SOUL OF MADURAI.", 50, 170, { align: "center" });

    // Save
    doc.save(`Suvaialaya-Ticket-${bookingId}.pdf`);
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative selection:bg-accent/30">
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none" />
      
      {/* Top Header */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-center px-5 sm:px-8 lg:px-10">
          <BrandMark />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-5 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          transition={{ duration: 0.5, type: "spring" }}
          className="bg-background max-w-md w-full rounded-2xl border-2 border-primary p-8 text-center shadow-xl relative overflow-hidden"
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-0 left-0 p-3 opacity-20"><Leaf size={24} className="text-primary transform -scale-x-100" /></div>
          <div className="absolute top-0 right-0 p-3 opacity-20"><Leaf size={24} className="text-primary" /></div>
          
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-4 border-primary mb-6 shadow-inner">
            <Leaf className="h-10 w-10 text-primary" />
          </div>
          
          <div className="space-y-6 py-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent">THE MADURAI VIRUNDHU</h2>
            <div className="h-px w-8 bg-accent/40 mx-auto" />
            <h1 className="font-display text-3xl font-extrabold text-primary tracking-wider uppercase leading-snug">
              YOUR SEAT <br/> IS RESERVED.
            </h1>
            <div className="h-px w-16 bg-accent/40 mx-auto" />
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80 space-y-2">
              <p>TEMPLE BLESSINGS: <span className="text-accent">RECEIVED</span></p>
              <p>TRADITIONAL FEAST: <span className="text-accent">AWAITING YOU</span></p>
              <p className="text-temple-orange mt-2">MADURAI WELCOMES YOU.</p>
            </div>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest bg-primary/10 inline-block px-4 py-2 rounded-full text-primary border border-primary/20">Invitation ID: <span className="text-accent">{bookingId}</span></p>

          <div className="mt-8 bg-primary/5 rounded-xl p-6 text-left border border-primary/20 shadow-sm relative">
            <div className="flex items-center gap-4 mb-5">
              <Calendar className="text-accent" size={20} />
              <div>
                <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-1">Date</p>
                <p className="font-display font-bold text-lg text-primary">{bookingDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <Clock className="text-accent" size={20} />
              <div>
                <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-1">Time</p>
                <p className="font-display font-bold text-lg text-primary">{slotTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="text-accent" size={20} />
              <div>
                <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-1">Venue</p>
                <p className="font-display font-bold text-lg text-primary">Suvaialaya Restaurant</p>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <button className="w-full rounded-md bg-primary px-8 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg transition-all hover:bg-primary/90 flex items-center justify-center gap-2" onClick={handleDownloadTicket}>
              <Download className="h-4 w-4" /> Download e-Ticket
            </button>
            <Link to="/" className="block w-full">
              <button className="w-full rounded-md border-2 border-primary/20 bg-transparent px-8 py-4 text-xs font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/5 flex items-center justify-center gap-2">
                Return to Home <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
