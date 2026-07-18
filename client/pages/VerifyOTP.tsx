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
    <main className="min-h-screen bg-secondary/30 text-foreground flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/login" className="inline-flex items-center gap-2 mb-6 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={16} /> Back to login
        </Link>
        <div className="flex justify-center mb-6">
          <BrandMark />
        </div>
        <h2 className="mt-2 text-center font-display text-3xl font-bold tracking-tight text-foreground">
          Verify your account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          We've sent a 6-digit code to your phone/email.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-xl shadow-border/10 sm:rounded-2xl sm:px-10 border border-border flex flex-col items-center">
          <form className="space-y-6 w-full flex flex-col items-center" onSubmit={handleVerify}>
            <div className="w-full flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify Code"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            {countdown > 0 ? (
              <span className="text-muted-foreground">Resend code in {countdown}s</span>
            ) : (
              <button type="button" onClick={handleResend} className="font-semibold text-primary hover:text-accent transition-colors">
                Resend code
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
