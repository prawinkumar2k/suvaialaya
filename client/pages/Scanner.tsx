import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ArrowLeft, CheckCircle2, XCircle, QrCode, IndianRupee, CreditCard, Banknote, Camera, User, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { BrandMark } from "@/components/landing/BrandMark";

export default function Scanner() {
  const [scanResult, setScanResult] = useState<any>(null); // Final success result
  const [error, setError] = useState<string>("");
  const [scannedBooking, setScannedBooking] = useState<any>(null); // Pending review booking
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCameraError, setHasCameraError] = useState(false);
  
  const [manualBookingId, setManualBookingId] = useState("");
  
  // Camera selection states
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");

  const html5QrCode = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();

  // Fetch cameras on mount
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Auto-select the first camera if none selected
          if (!selectedCameraId) {
            setSelectedCameraId(devices[0].id);
          }
        }
      })
      .catch((err) => {
        console.error("Error getting cameras", err);
      });
  }, []);

  useEffect(() => {
    if (isProcessing || scanResult || error || scannedBooking || !selectedCameraId) {
      if (html5QrCode.current && html5QrCode.current.getState && html5QrCode.current.getState() === 2) {
        try {
          html5QrCode.current.stop().catch(() => {});
        } catch (e) {
          // Ignore state transition errors
        }
      }
      return;
    }

    const startScanner = async () => {
      try {
        if (!html5QrCode.current) {
          html5QrCode.current = new Html5Qrcode("reader");
        }
        
        // If already scanning, stop it before restarting with new camera
        if (html5QrCode.current.getState && html5QrCode.current.getState() === 2) {
          try { await html5QrCode.current.stop(); } catch (e) {}
        }

        await html5QrCode.current.start(
          selectedCameraId, 
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            // Stop scanning immediately
            if (html5QrCode.current && html5QrCode.current.getState && html5QrCode.current.getState() === 2) {
              try { await html5QrCode.current.stop(); } catch (e) {}
            }
            
            setIsProcessing(true);
            try {
              let bookingIdToVerify = decodedText;
              try {
                 const payload = JSON.parse(decodedText);
                 if (payload.id) bookingIdToVerify = payload.id;
              } catch (e) {
                 // Not JSON, likely a plain ticket string like "07AUG11-D6C7"
              }

              if (!bookingIdToVerify) throw new Error("Invalid QR code format");

              // Fetch booking details first
              const response = await axios.get(`/api/bookings/verify/${bookingIdToVerify.trim()}`);
              
              if (response.data.success) {
                const booking = response.data.data;
                if (booking.bookingStatus === "Attended") {
                  setError("Ticket already checked in — DUPLICATE SCAN DETECTED");
                } else if (booking.bookingStatus === "Cancelled") {
                  setError("Ticket is cancelled — DENY ENTRY");
                } else {
                  setScannedBooking(booking);
                }
              }
            } catch (err: any) {
              setError(err.response?.data?.error || err.message || "Failed to fetch ticket details");
            }
            setIsProcessing(false);
          },
          (errorMessage) => {
            // Ignore scan failures
          }
        );
      } catch (err) {
        console.error("Camera start failed:", err);
        setHasCameraError(true);
      }
    };

    startScanner();

    return () => {
      if (html5QrCode.current && html5QrCode.current.getState && html5QrCode.current.getState() === 2) {
        try { html5QrCode.current.stop().catch(() => {}); } catch(e) {}
      }
    };
  }, [isProcessing, scanResult, error, scannedBooking, selectedCameraId, toast]);

  const handleManualVerify = async () => {
    if (!manualBookingId.trim()) return;
    
    setIsProcessing(true);
    try {
      const response = await axios.get(`/api/bookings/verify/${manualBookingId.trim()}`);
      
      if (response.data.success) {
        const booking = response.data.data;
        if (booking.bookingStatus === "Attended") {
          setError("Ticket already checked in — DUPLICATE SCAN DETECTED");
        } else if (booking.bookingStatus === "Cancelled") {
          setError("Ticket is cancelled — DENY ENTRY");
        } else {
          setScannedBooking(booking);
          setManualBookingId(""); // Clear input on success
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to fetch ticket details");
    }
    setIsProcessing(false);
  };

  const handleCompletePaymentAndCheckIn = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `/api/bookings/${scannedBooking._id}/check-in`,
        { paymentCompleted: true, paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setScannedBooking(null);
        setScanResult(response.data.data);
        toast({
          title: "Check-in Complete!",
          description: `Successfully processed guest entry.`,
          variant: "default",
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Check-in failed");
      setScannedBooking(null);
    }
    setIsProcessing(false);
  };

  const resetScanner = () => {
    setScanResult(null);
    setError("");
    setScannedBooking(null);
    setIsProcessing(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8 mt-4">
          <Link to="/admin" className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <BrandMark />
          <div className="w-6" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#1a3d2b]/5 rounded-full flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6 text-[#1a3d2b]" />
            </div>
            <h1 className="text-2xl font-display font-bold text-[#1a3d2b]">Scan Ticket</h1>
            <p className="text-sm text-gray-500 mt-1">Align the QR code within the frame to check in guests</p>
          </div>

          {!scanResult && !error && !scannedBooking && !isProcessing && (
            <div className="relative space-y-6">
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                {cameras.length > 1 && (
                  <div className="mb-4">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Select Camera</label>
                    <select 
                      value={selectedCameraId}
                      onChange={(e) => setSelectedCameraId(e.target.value)}
                      className="w-full text-sm border-gray-200 rounded-lg p-2 bg-gray-50 text-[#1a3d2b] focus:ring-[#1a3d2b] focus:border-[#1a3d2b]"
                    >
                      {cameras.map(c => (
                        <option key={c.id} value={c.id}>{c.label || `Camera ${c.id.substring(0,5)}`}</option>
                      ))}
                    </select>
                  </div>
                )}
                {hasCameraError ? (
                  <div className="w-full bg-red-50 p-6 rounded-xl border border-red-100 text-center">
                    <Camera className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <h3 className="text-red-700 font-bold mb-1">Camera Access Denied</h3>
                    <p className="text-sm text-red-600/80 mb-4">Please allow camera permissions in your browser to scan tickets.</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg">Try Again</button>
                  </div>
                ) : (
                  <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-dashed border-[#1a3d2b]/20 bg-white min-h-[250px]"></div>
                )}
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">Or enter manually</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter Booking ID..." 
                  value={manualBookingId}
                  onChange={(e) => setManualBookingId(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleManualVerify(); }}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] focus:ring-1 focus:ring-[#c9841a] text-[#1a3d2b] font-bold text-sm uppercase"
                />
                <button 
                  onClick={handleManualVerify}
                  disabled={!manualBookingId.trim()}
                  className="bg-[#1a3d2b] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#2d6a4f] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3d2b] mb-4"></div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Processing...</p>
            </div>
          )}

          {scannedBooking && (
            <div className="text-center py-2">
              <h2 className="text-xl font-display font-bold text-[#1a3d2b] mb-4">Review & Admit Guest</h2>
              
              <div className="bg-gray-50 rounded-xl p-5 text-left border border-gray-100 mb-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg border border-gray-200"><User size={16} className="text-[#1a3d2b]" /></div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Guest Name</p>
                    <p className="font-bold text-[#1a3d2b]">{scannedBooking.guestDetails?.fullName || scannedBooking.user?.name || "Guest"}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg border border-gray-200"><Users size={16} className="text-[#1a3d2b]" /></div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Guests</p>
                      <p className="font-bold text-[#1a3d2b]">{scannedBooking.numberOfGuests} Pax</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg border border-gray-200"><Calendar size={16} className="text-[#1a3d2b]" /></div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Time</p>
                      <p className="font-bold text-[#1a3d2b]">{scannedBooking.slotTime}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Total Amount</p>
                  <p className="font-bold text-2xl text-orange-600">₹{scannedBooking.totalAmount?.toLocaleString("en-IN") || 0}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-left text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Record Payment</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setPaymentMethod("Cash")} className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold transition-all ${paymentMethod === 'Cash' ? 'border-[#1a3d2b] bg-[#1a3d2b] text-white shadow-md' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <Banknote size={16} /> Cash Paid
                  </button>
                  <button onClick={() => setPaymentMethod("UPI/Card")} className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold transition-all ${paymentMethod === 'UPI/Card' ? 'border-[#1a3d2b] bg-[#1a3d2b] text-white shadow-md' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <CreditCard size={16} /> UPI / Card
                  </button>
                </div>
              </div>

              <button
                onClick={handleCompletePaymentAndCheckIn}
                className="w-full bg-[#1a3d2b] text-white rounded-xl py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#1a3d2b]/90 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} /> Submit & Allow Entry
              </button>
              
              <button
                onClick={resetScanner}
                className="mt-4 w-full bg-white border border-gray-200 text-gray-500 rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                Cancel / Reject Entry
              </button>
            </div>
          )}

          {(scanResult || error) && !scannedBooking && (
            <div className="text-center py-6">
              {error ? (
                <>
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 border-2 border-red-100 mb-4 shadow-inner">
                    <XCircle className="h-10 w-10 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
                  <p className="text-sm font-bold text-red-500 uppercase tracking-widest bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>
                </>
              ) : (
                <>
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 border-2 border-green-100 mb-4 shadow-inner">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-600 mb-1">Entry Granted</h2>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Checked In Successfully</p>
                  
                  <div className="bg-gray-50 rounded-xl p-4 text-left border border-gray-100 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Guest</p>
                        <p className="font-bold text-[#1a3d2b]">{scanResult.guestDetails?.fullName || scanResult.user?.name || "Guest"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Pax</p>
                        <p className="font-bold text-[#1a3d2b]">{scanResult.numberOfGuests}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={resetScanner}
                className="mt-8 w-full bg-[#1a3d2b] text-white rounded-xl py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#1a3d2b]/90 transition-all shadow-md"
              >
                Scan Next Ticket
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
