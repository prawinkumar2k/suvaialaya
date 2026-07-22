import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Landmark, QrCode, ShieldCheck, Loader2, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";
import { toast } from "sonner";
import axios from "axios";

export default function Payment() {
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { eventId: string; eventTitle?: string; date: string; slotTime: string; numberOfGuests: number; totalAmount: number; guestDetails: any } | null;

  useEffect(() => {
    // Basic check for auth, if not logged in, prompt them
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to complete your booking.");
      // We could pass state to login to redirect back, but keeping it simple
      navigate("/login");
    }
  }, [navigate]);

  if (!state) {
    return <Navigate to="/slots" replace />;
  }

  const { eventId, eventTitle, numberOfGuests, totalAmount, date, slotTime, guestDetails } = state;
  // Calculate a mock tax breakdown
  const tax = Math.round(totalAmount * 0.18);
  const finalTotal = totalAmount + tax;

  const handlePay = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required");
      navigate("/login");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create the initial Booking (Payment Status: Pending)
      const bookingRes = await axios.post(
        "/api/bookings",
        {
          event: eventId,
          date,
          slotTime,
          guestDetails,
          numberOfGuests,
          totalAmount: finalTotal,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!bookingRes.data.success) {
        throw new Error("Failed to create booking");
      }

      const bookingId = bookingRes.data.data._id;

      // Check if we have Razorpay keys configured
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        // MOCK FLOW: If no keys are set, just instantly confirm it (like we were doing)
        toast.success("Mock Payment Successful!");
        navigate("/success", {
          state: { bookingId, date, slotTime, numberOfGuests, finalTotal }
        });
        return;
      }

      // REAL RAZORPAY FLOW
      // 2. Create Razorpay Order
      const orderRes = await axios.post(
        "/api/payments/create-order",
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orderData = orderRes.data.data;

      // 3. Load Razorpay Script Dynamically
      const loadRazorpay = () => {
        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error("Razorpay SDK failed to load");

      // 4. Initialize Razorpay Modal
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Suvaialaya",
        description: `${eventTitle || "Event"} Reservation`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // 5. Verify the payment signature on the backend
            const verifyRes = await axios.post(
              "/api/payments/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.success) {
              toast.success("Payment Verified!");
              navigate("/success", {
                state: { bookingId, date, slotTime, numberOfGuests, finalTotal }
              });
            }
          } catch (err) {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        prefill: {
          name: guestDetails.fullName,
          email: guestDetails.email,
          contact: guestDetails.phone,
        },
        theme: {
          color: "#0f3b28", // Suvaialaya Primary Green
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on("payment.failed", function (response: any) {
        toast.error(response.error.description || "Payment failed");
      });
      
      paymentObject.open();

    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message || "Payment process failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-[#1a3d2b] pb-24 relative overflow-hidden">
      {/* ── BACKGROUND ACCENTS ── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none fixed" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none fixed" />
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/slots" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 hover:text-[#1a3d2b] transition-colors">
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <BrandMark />
          </div>
          <div className="w-16"></div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 pt-16 sm:px-8 lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:gap-12 lg:items-start relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-display text-4xl font-bold tracking-tight text-[#1a3d2b] uppercase">Payment</h1>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#c9841a]" /> Secure Razorpay Gateway
          </p>

          <div className="mt-10 space-y-4" style={{ perspective: 1000 }}>
            <motion.div 
              onClick={() => setSelectedMethod("upi")}
              whileHover={{ scale: 1.01, rotateX: 2, rotateY: -2 }}
              className={`p-6 rounded-2xl border cursor-pointer transition-all flex items-center justify-between shadow-[0_4px_15px_rgb(0,0,0,0.02)]
                ${selectedMethod === 'upi' ? 'border-[#1a3d2b] bg-[#1a3d2b]/5' : 'bg-white border-gray-100 hover:border-gray-300'}`}
            >
              <div className="flex items-center gap-5">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${selectedMethod === 'upi' ? 'bg-[#1a3d2b] text-[#c9841a]' : 'bg-[#1a3d2b]/5 text-[#1a3d2b]'}`}>
                  <QrCode size={24} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-[#1a3d2b]">UPI / QR</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mt-1">GPay, PhonePe, Paytm</p>
                </div>
              </div>
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'upi' ? 'border-[#1a3d2b]' : 'border-gray-200'}`}>
                {selectedMethod === 'upi' && <div className="h-3 w-3 rounded-full bg-[#1a3d2b]" />}
              </div>
            </motion.div>

            <motion.div 
              onClick={() => setSelectedMethod("card")}
              whileHover={{ scale: 1.01, rotateX: 2, rotateY: -2 }}
              className={`p-6 rounded-2xl border cursor-pointer transition-all flex items-center justify-between shadow-[0_4px_15px_rgb(0,0,0,0.02)]
                ${selectedMethod === 'card' ? 'border-[#1a3d2b] bg-[#1a3d2b]/5' : 'bg-white border-gray-100 hover:border-gray-300'}`}
            >
              <div className="flex items-center gap-5">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${selectedMethod === 'card' ? 'bg-[#1a3d2b] text-[#c9841a]' : 'bg-[#1a3d2b]/5 text-[#1a3d2b]'}`}>
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-[#1a3d2b]">Credit / Debit Card</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mt-1">Visa, Mastercard, RuPay</p>
                </div>
              </div>
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'card' ? 'border-[#1a3d2b]' : 'border-gray-200'}`}>
                {selectedMethod === 'card' && <div className="h-3 w-3 rounded-full bg-[#1a3d2b]" />}
              </div>
            </motion.div>

            <motion.div 
              onClick={() => setSelectedMethod("netbanking")}
              whileHover={{ scale: 1.01, rotateX: 2, rotateY: -2 }}
              className={`p-6 rounded-2xl border cursor-pointer transition-all flex items-center justify-between shadow-[0_4px_15px_rgb(0,0,0,0.02)]
                ${selectedMethod === 'netbanking' ? 'border-[#1a3d2b] bg-[#1a3d2b]/5' : 'bg-white border-gray-100 hover:border-gray-300'}`}
            >
              <div className="flex items-center gap-5">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${selectedMethod === 'netbanking' ? 'bg-[#1a3d2b] text-[#c9841a]' : 'bg-[#1a3d2b]/5 text-[#1a3d2b]'}`}>
                  <Landmark size={24} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-[#1a3d2b]">Net Banking</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mt-1">All major Indian banks</p>
                </div>
              </div>
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'netbanking' ? 'border-[#1a3d2b]' : 'border-gray-200'}`}>
                {selectedMethod === 'netbanking' && <div className="h-3 w-3 rounded-full bg-[#1a3d2b]" />}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Payment Summary */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-12 lg:mt-0 sticky top-32" style={{ perspective: 1000 }}>
          <motion.div 
            whileHover={{ rotateX: 2, rotateY: -2, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white rounded-2xl border border-gray-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
               <Leaf size={100} className="text-[#1a3d2b]" />
            </div>
            
            <h2 className="font-display font-bold text-2xl text-[#1a3d2b] mb-2">Order Summary</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#c9841a] mb-8">{eventTitle || "Booking Event"}</p>
            
            <div className="space-y-6 text-sm relative z-10">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-[#1a3d2b]/60 font-bold uppercase tracking-widest text-[10px]">{numberOfGuests}x Guest Reservation</span>
                <span className="font-display font-bold text-lg text-[#1a3d2b]">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 text-[#1a3d2b]/60">
                <span className="font-bold uppercase tracking-widest text-[10px]">Taxes (18% GST)</span>
                <span className="font-bold">₹{tax.toLocaleString("en-IN")}</span>
              </div>
              
              <div className="pt-2 flex flex-col justify-between">
                <span className="text-[#1a3d2b]/60 font-bold uppercase tracking-widest text-[10px] mb-1">Final Amount</span>
                <span className="font-display font-bold text-4xl text-[#1a3d2b]">₹{finalTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button onClick={handlePay} disabled={isProcessing} className="w-full mt-10 rounded-xl bg-[#1a3d2b] px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#2d6a4f] hover:-translate-y-1 relative z-10 disabled:opacity-70 disabled:cursor-not-allowed">
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin text-[#c9841a]" /> Processing...
                </span>
              ) : (
                `Pay ₹${finalTotal.toLocaleString("en-IN")}`
              )}
            </button>
            
            <p className="text-[9px] font-bold uppercase tracking-widest text-center text-[#1a3d2b]/40 mt-6 relative z-10">
              By proceeding, you agree to our terms. Secure 128-bit SSL encrypted.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
