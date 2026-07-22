import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, Lock, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleAutoFill = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await axios.post("/api/auth/login", data);

      if (response.data.success) {
        toast.success(`Welcome back, ${response.data.data.name}!`);
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        
        // Redirect based on role
        const role = response.data.data.role;
        if (role === "admin" || role === "owner") {
          navigate("/admin");

        } else if (role === "scanner" || role === "receptionist") {
          navigate("/scanner");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Login failed. Check your credentials.");
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
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 hover:text-[#1a3d2b] transition-colors">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="flex justify-center mb-6">
          <BrandMark />
        </div>
        <h2 className="mt-4 text-center font-display text-4xl font-bold tracking-tight text-[#1a3d2b]">
          Welcome back
        </h2>
        <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#c9841a] hover:text-[#1a3d2b] transition-colors">
            Register here
          </Link>
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
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
            <Leaf size={120} className="text-[#1a3d2b]" />
          </div>

          <form className="space-y-6 relative z-10" onSubmit={handleLogin}>
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[#1a3d2b]/70 font-bold uppercase tracking-widest text-[10px]">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-[#1a3d2b]/40" />
                <Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-11 h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#1a3d2b] focus-visible:border-[#1a3d2b] rounded-xl text-sm" placeholder="john@example.com" />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-[#1a3d2b]/70 font-bold uppercase tracking-widest text-[10px]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-[#1a3d2b]/40" />
                <Input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-11 h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#1a3d2b] focus-visible:border-[#1a3d2b] rounded-xl text-sm" placeholder="••••••••" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#1a3d2b] focus:ring-[#1a3d2b] cursor-pointer" />
                <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-[#1a3d2b]/70 cursor-pointer">
                  Remember me
                </label>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest">
                <Link to="/forgot-password" className="text-[#1a3d2b]/50 hover:text-[#c9841a] transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button type="submit" className="w-full mt-4 rounded-xl bg-[#1a3d2b] px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-[#2d6a4f] transition-all flex items-center justify-center gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in to Dashboard"}
            </button>
          </form>

          {/* Development Quick Login */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#1a3d2b]/40 mb-4 text-center">Quick Login (Dev)</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => handleAutoFill("admin@suvaialaya.com", "admin123")} className="text-[10px] font-bold uppercase tracking-widest py-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 text-[#1a3d2b]/70">Admin</button>
              <button type="button" onClick={() => handleAutoFill("scanner@suvaialaya.com", "scanner123")} className="text-[10px] font-bold uppercase tracking-widest py-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 text-[#1a3d2b]/70">Scanner</button>
              <button type="button" onClick={() => handleAutoFill("john@example.com", "password123")} className="text-[10px] font-bold uppercase tracking-widest py-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 text-[#1a3d2b]/70">Guest</button>
              <button type="button" onClick={() => handleAutoFill("reception@suvaialaya.com", "reception123")} className="text-[10px] font-bold uppercase tracking-widest py-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 text-[#1a3d2b]/70">Reception</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
