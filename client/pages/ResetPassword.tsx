import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = location.state?.resetToken;

  useEffect(() => {
    if (!resetToken) {
      navigate("/forgot-password");
    }
  }, [resetToken, navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      import("sonner").then(({ toast }) => toast.error("Passwords do not match"));
      return;
    }
    if (newPassword.length < 8) {
      import("sonner").then(({ toast }) => toast.error("Password must be at least 8 characters"));
      return;
    }
    
    setIsLoading(true);
    
    try {
      import("axios").then(async (axios) => {
        const { toast } = await import("sonner");
        const response = await axios.default.post("/api/auth/reset-password", { 
          resetToken, 
          newPassword 
        });
        
        if (response.data.success) {
          toast.success("Password reset successfully. You can now log in.");
          navigate("/login");
        }
      });
    } catch (error: any) {
      import("sonner").then(({ toast }) => {
        toast.error(error.response?.data?.error || "Failed to reset password");
      });
    } finally {
      setIsLoading(false);
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
          Set New Password
        </h2>
        <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">
          Enter a strong, 8-character password.
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
          className="bg-white py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sm:rounded-2xl sm:px-10 relative overflow-hidden"
        >
          <form className="space-y-6 relative z-10" onSubmit={handleReset}>
            <div className="space-y-3">
              <Label htmlFor="newPassword" className="text-[#1a3d2b]/70 font-bold uppercase tracking-widest text-[10px]">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-[#1a3d2b]/40" />
                <Input 
                  id="newPassword" 
                  type="password" 
                  required 
                  className="pl-11 h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#1a3d2b] focus-visible:border-[#1a3d2b] rounded-xl text-sm" 
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-[#1a3d2b]/70 font-bold uppercase tracking-widest text-[10px]">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-[#1a3d2b]/40" />
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  required 
                  className="pl-11 h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#1a3d2b] focus-visible:border-[#1a3d2b] rounded-xl text-sm" 
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="w-full mt-4 rounded-xl bg-[#1a3d2b] px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-[#2d6a4f] transition-all flex items-center justify-center gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Password"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </main>
  );
}
