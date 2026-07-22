import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Download, Calendar, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";
import { useAudio } from "@/contexts/AudioContext";
import QRCode from "qrcode";
import axios from "axios";



/* ──────────────────────────────────────────────────────────────────────────
   Professional ornamental border — repeating lotus/diamond motif
────────────────────────────────────────────────────────────────────────── */
function OrnamentV({ className = "" }: { className?: string }) {
  // A single vertical strip that repeats using SVG pattern
  return (
    <svg
      className={className}
      width="20" height="100%" preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="vOrnament" x="0" y="0" width="20" height="30" patternUnits="userSpaceOnUse">
          {/* Diamond */}
          <polygon points="10,2 17,10 10,18 3,10" fill="none" stroke="#1a3d2b" strokeWidth="0.8"/>
          <polygon points="10,5 14,10 10,15 6,10" fill="#c9841a" opacity="0.25"/>
          <circle cx="10" cy="10" r="1.5" fill="#c9841a"/>
          {/* Connector dots */}
          <circle cx="10" cy="20" r="0.8" fill="#1a3d2b" opacity="0.4"/>
          <circle cx="10" cy="23" r="0.8" fill="#1a3d2b" opacity="0.4"/>
          <circle cx="10" cy="26" r="0.8" fill="#1a3d2b" opacity="0.4"/>
        </pattern>
      </defs>
      <rect width="20" height="100%" fill="url(#vOrnament)"/>
    </svg>
  );
}

function OrnamentH({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      height="20" width="100%" preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="hOrnament" x="0" y="0" width="30" height="20" patternUnits="userSpaceOnUse">
          <polygon points="2,10 10,3 18,10 10,17" fill="none" stroke="#1a3d2b" strokeWidth="0.8"/>
          <polygon points="5,10 10,5 15,10 10,15" fill="#c9841a" opacity="0.25"/>
          <circle cx="10" cy="10" r="1.5" fill="#c9841a"/>
          <circle cx="20" cy="10" r="0.8" fill="#1a3d2b" opacity="0.4"/>
          <circle cx="23" cy="10" r="0.8" fill="#1a3d2b" opacity="0.4"/>
          <circle cx="26" cy="10" r="0.8" fill="#1a3d2b" opacity="0.4"/>
        </pattern>
      </defs>
      <rect height="20" width="100%" fill="url(#hOrnament)"/>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Main page
────────────────────────────────────────────────────────────────────────── */
export default function BookingSuccess() {
  const location = useLocation();
  const state = location.state as {
    bookingId?: string; date: string; slotTime: string;
    numberOfGuests: number; finalTotal: number;
  } | null;
  const { playSoundEffect } = useAudio();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const bookingDate = state
    ? new Date(state.date).toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric", year: "numeric",
      })
    : "Thu, Aug 6, 2026";
  const slotTime = state?.slotTime ?? "11:00 AM";

  const dateObj  = state ? new Date(state.date) : new Date("2026-08-06");
  const dayStr   = dateObj.getDate().toString().padStart(2, "0");
  const monthStr = dateObj.toLocaleString("default", { month: "short" }).toUpperCase();
  const slotHour = slotTime.split(":")[0].padStart(2, "0");
  const shortId  = state?.bookingId
    ? state.bookingId.slice(-4).toUpperCase()
    : Math.floor(Math.random() * 900 + 100).toString();
  const ticketId = `${dayStr}${monthStr}${slotHour}-${shortId}`;

  const numberOfGuests = state?.numberOfGuests ?? 1;
  const finalTotal     = state?.finalTotal ?? 1799;

  useEffect(() => {
    playSoundEffect("success");
    
    const generateAndUploadTicket = async () => {
      try {
        const qrBase64 = await QRCode.toDataURL(ticketId, {
          width: 220, margin: 1,
          color: { dark: "#1a3d2b", light: "#ffffff" },
        });
        setQrCodeDataUrl(qrBase64);

        if (state?.bookingId) {
          // Generate PDF in background
          const { generatePremiumTicket } = await import("@/lib/ticketGenerator");
          const pdfBase64 = await generatePremiumTicket(state, null, { returnBase64: true });
          
          // Upload to database
          const token = localStorage.getItem("token");
          await axios.put(`/api/bookings/${state.bookingId}/ticket`, {
            qrCodeUrl: qrBase64,
            ticketPdfUrl: pdfBase64
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } catch (err) {
        console.error("Failed to generate/upload ticket", err);
      }
    };

    generateAndUploadTicket();
  }, [playSoundEffect, ticketId, state]);

  const handleDownload = async () => {
    const { generatePremiumTicket } = await import("@/lib/ticketGenerator");
    await generatePremiumTicket(state ?? {
      _id: "MOCK1234",
      date: new Date().toISOString(),
      slotTime, numberOfGuests, finalTotal,
    });
  };

  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#1a3d2b] flex flex-col font-sans">
      {/* ambient blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-[#1a3d2b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="fixed bottom-0 left-0  w-96 h-96 bg-[#c9841a]/5 rounded-full blur-3xl  translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-center px-5">
          <BrandMark />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 160, damping: 22 }}
          className="w-full max-w-sm"
        >
          {/* ══ Outer ornamental frame ════════════════════════════════ */}
          <div className="relative bg-white rounded-2xl shadow-[0_28px_72px_rgba(0,0,0,0.13)] border border-[#c9841a]/25 overflow-hidden">

            {/* Gold hairline inner border */}
            <div className="absolute inset-2 rounded-xl border border-[#c9841a]/15 pointer-events-none z-10" />

            {/* ── Ornamental borders ─────────────────────────────────── */}
            {/* LEFT */}
            <div className="absolute left-0 top-0 bottom-0 w-5 z-10 pointer-events-none">
              <OrnamentV className="w-full h-full" />
            </div>
            {/* RIGHT */}
            <div className="absolute right-0 top-0 bottom-0 w-5 z-10 pointer-events-none">
              <OrnamentV className="w-full h-full" />
            </div>
            {/* TOP */}
            <div className="absolute top-0 left-0 right-0 h-5 z-10 pointer-events-none">
              <OrnamentH className="w-full h-full" />
            </div>
            {/* BOTTOM */}
            <div className="absolute bottom-0 left-0 right-0 h-5 z-10 pointer-events-none">
              <OrnamentH className="w-full h-full" />
            </div>

            {/* Corner ornaments */}
            {[["top-0 left-0","0"],["top-0 right-0","90"],["bottom-0 right-0","180"],["bottom-0 left-0","270"]].map(([pos, deg]) => (
              <div key={deg} className={`absolute ${pos} w-8 h-8 z-20 pointer-events-none`}>
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
                     style={{ transform: `rotate(${deg}deg)` }}>
                  <path d="M2 2 Q16 2 16 16" stroke="#c9841a" strokeWidth="1.5" fill="none"/>
                  <path d="M2 2 Q2 16 16 16" stroke="#c9841a" strokeWidth="1.5" fill="none"/>
                  <circle cx="2" cy="2" r="2" fill="#c9841a"/>
                  <circle cx="16" cy="2" r="1" fill="#1a3d2b" opacity="0.4"/>
                  <circle cx="2" cy="16" r="1" fill="#1a3d2b" opacity="0.4"/>
                </svg>
              </div>
            ))}

            {/* ── Logo zone ────────────────────────────────────────── */}
            <div className="pt-9 pb-4 px-10 flex flex-col items-center text-center">
              <div className="mb-3">
                <img src="/suvaialaya-logo.png" alt="Suvaialaya Logo" className="w-20 h-20 object-contain" />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#c9841a] mb-1">
                The Madurai Virundhu
              </p>
              <div className="h-px w-14 bg-gradient-to-r from-transparent via-[#c9841a]/60 to-transparent mb-3" />
              <h1 className="text-4xl font-black text-[#1a3d2b] uppercase tracking-wide leading-tight"
                  style={{ fontFamily: "Georgia, serif" }}>
                Seat<br />Reserved
              </h1>
              <div className="mt-3 flex gap-5 text-[9px] font-bold uppercase tracking-widest">
                <span className="text-[#1a3d2b]/55">
                  Status: <span className="text-[#c9841a]">Confirmed</span>
                </span>
                <span className="text-[#1a3d2b]/55">
                  Guests: <span className="text-[#c9841a]">{numberOfGuests} Pax</span>
                </span>
              </div>
            </div>

            {/* ── Tear separator ────────────────────────────────────── */}
            <div className="relative mx-0 my-1">
              <div className="border-t border-dashed border-[#1a3d2b]/20" />
              <div className="absolute -left-2  top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#f5f2eb]" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#f5f2eb]" />
            </div>

            {/* ── Details ──────────────────────────────────────────── */}
            <div className="bg-[#fcfaf7] px-10 py-4 space-y-3">
              {[
                { Icon: Calendar, label: "Date",  value: bookingDate },
                { Icon: Clock,    label: "Time",  value: slotTime },
                { Icon: MapPin,   label: "Venue", value: "Suvaialaya Restaurant" },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#1a3d2b]/10 flex items-center justify-center shrink-0">
                    <Icon className="text-[#c9841a]" size={14} />
                  </div>
                  <div>
                    <p className="text-[8px] text-[#1a3d2b]/45 font-bold uppercase tracking-widest">{label}</p>
                    <p className="text-[13px] font-bold text-[#1a3d2b]">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Tear separator 2 ──────────────────────────────────── */}
            <div className="relative mx-0 my-1">
              <div className="border-t border-dashed border-[#1a3d2b]/20" />
              <div className="absolute -left-2  top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#f5f2eb]" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#f5f2eb]" />
            </div>

            {/* ── QR zone ──────────────────────────────────────────── */}
            <div className="px-10 py-6 flex flex-col items-center bg-white">
              {qrCodeDataUrl ? (
                <div className="p-2 border border-[#1a3d2b]/12 rounded-xl bg-white shadow-sm">
                  <img src={qrCodeDataUrl} alt="Ticket QR" className="w-36 h-36" />
                </div>
              ) : (
                <div className="w-36 h-36 border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400 animate-pulse">
                  Generating…
                </div>
              )}
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] bg-[#1a3d2b]/5 px-5 py-1.5 rounded-full border border-[#1a3d2b]/10">
                ID: <span className="text-[#c9841a]">{ticketId}</span>
              </p>
            </div>

            {/* ── Buttons ──────────────────────────────────────────── */}
            <div className="px-8 pb-9 pt-1 space-y-3">
              <button
                onClick={handleDownload}
                className="w-full rounded-full bg-[#1a3d2b] px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-white shadow-[0_8px_24px_rgba(26,61,43,0.35)] transition-all hover:bg-[#2d6a4f] hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" /> Download PDF Ticket
              </button>
              <Link to="/" className="block w-full">
                <button className="w-full rounded-full border border-gray-200 bg-gray-50 px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-[#1a3d2b] transition-all hover:bg-gray-100 flex items-center justify-center gap-2">
                  Return Home <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
