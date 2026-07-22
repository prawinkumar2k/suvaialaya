import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, Phone, Lock, User, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Account created successfully!");
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data));
        navigate("/dashboard");
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
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
          Create account
        </h2>
        <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">
          Already have an account?{" "}
          <Link to="/login" className="text-[#c9841a] hover:text-[#1a3d2b] transition-colors">
            Sign in here
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

          <form className="space-y-6 relative z-10" onSubmit={handleRegister}>
            <div className="space-y-3">
              <Label htmlFor="name" className="text-[#1a3d2b]/70 font-bold uppercase tracking-widest text-[10px]">Full name</Label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-4 w-4 text-[#1a3d2b]/40" />
                <Input id="name" name="name" type="text" autoComplete="name" required className="pl-11 h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#1a3d2b] focus-visible:border-[#1a3d2b] rounded-xl text-sm" placeholder="John Doe" />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-[#1a3d2b]/70 font-bold uppercase tracking-widest text-[10px]">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-[#1a3d2b]/40" />
                <Input id="email" name="email" type="email" autoComplete="email" required className="pl-11 h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#1a3d2b] focus-visible:border-[#1a3d2b] rounded-xl text-sm" placeholder="you@example.com" />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="text-[#1a3d2b]/70 font-bold uppercase tracking-widest text-[10px]">Phone number</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 h-4 w-4 text-[#1a3d2b]/40" />
                <Input id="phone" name="phone" type="tel" autoComplete="tel" required className="pl-11 h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#1a3d2b] focus-visible:border-[#1a3d2b] rounded-xl text-sm" placeholder="+91 98765 43210" />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-[#1a3d2b]/70 font-bold uppercase tracking-widest text-[10px]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-[#1a3d2b]/40" />
                <Input id="password" name="password" type="password" autoComplete="new-password" required className="pl-11 h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#1a3d2b] focus-visible:border-[#1a3d2b] rounded-xl text-sm" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" className="w-full mt-4 rounded-xl bg-[#1a3d2b] px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-[#2d6a4f] transition-all flex items-center justify-center gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
            </button>
          </form>

          <div className="mt-8 text-center text-[10px] font-bold text-[#1a3d2b]/50 uppercase tracking-widest relative z-10">
            By registering, you agree to our <Link to="/terms" className="text-[#c9841a] hover:text-[#1a3d2b] transition-colors">Terms of Service</Link> and <Link to="/privacy" className="text-[#c9841a] hover:text-[#1a3d2b] transition-colors">Privacy Policy</Link>.
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
