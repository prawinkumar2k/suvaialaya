import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function VerifyOTP() {
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(30);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || !email) return;
    
    setIsLoading(true);
    try {
      import("axios").then(async (axios) => {
        const { toast } = await import("sonner");
        const response = await axios.default.post("/api/auth/verify-otp", { email, otp });
        if (response.data.success) {
          toast.success("OTP verified successfully");
          navigate("/reset-password", { state: { resetToken: response.data.resetToken } });
        }
      });
    } catch (error: any) {
      import("sonner").then(({ toast }) => {
        toast.error(error.response?.data?.error || "Invalid OTP");
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setCountdown(30);
    try {
      import("axios").then(async (axios) => {
        const { toast } = await import("sonner");
        await axios.default.post("/api/auth/forgot-password", { email });
        toast.success("OTP resent successfully");
      });
    } catch (error) {
      // Ignore
    }
  };

  return (
    <main className="min-h-screen bg-white text-[#1a3d2b] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* ── BACKGROUND ACCENTS ── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/login" className="inline-flex items-center gap-2 mb-8 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 hover:text-[#1a3d2b] transition-colors">
          <ArrowLeft size={16} /> Back to login
        </Link>
        <div className="flex justify-center mb-6">
          <BrandMark />
        </div>
        <h2 className="mt-4 text-center font-display text-4xl font-bold tracking-tight text-[#1a3d2b]">
          Verify your account
        </h2>
        <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">
          We've sent a 6-digit code to your email.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: "easeOut" }} 
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        style={{ perspective: 1000 }}
      >
        <motion.div 
          whileHover={{ rotateX: 2, rotateY: -2, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-white py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sm:rounded-2xl sm:px-10 relative overflow-hidden flex flex-col items-center"
        >
          <form className="space-y-6 w-full flex flex-col items-center relative z-10" onSubmit={handleVerify}>
            <div className="w-full flex justify-center mt-2">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup className="gap-2">
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot 
                      key={i} 
                      index={i} 
                      className="w-10 h-12 bg-gray-50 border border-gray-200 focus-visible:ring-[#1a3d2b] focus-visible:border-[#1a3d2b] rounded-lg text-lg font-display text-[#1a3d2b]" 
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <button type="submit" className="w-full mt-4 rounded-xl bg-[#1a3d2b] px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-[#2d6a4f] transition-all flex items-center justify-center gap-2" disabled={isLoading || otp.length !== 6}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Code"}
            </button>
          </form>

          <div className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest relative z-10">
            {countdown > 0 ? (
              <span className="text-[#1a3d2b]/50">Resend code in {countdown}s</span>
            ) : (
              <button type="button" onClick={handleResend} className="text-[#c9841a] hover:text-[#1a3d2b] transition-colors">
                Resend code
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
