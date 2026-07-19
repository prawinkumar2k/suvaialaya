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
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-accent/30">
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="flex justify-center mb-6">
          <BrandMark />
        </div>
        <h2 className="mt-4 text-center font-display text-4xl font-bold tracking-tight text-primary">
          Welcome back
        </h2>
        <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-primary/70">
          Don't have an account?{" "}
          <Link to="/register" className="text-accent hover:text-primary transition-colors">
            Register here
          </Link>
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-background py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border-2 border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Leaf size={100} className="text-primary" />
          </div>

          <form className="space-y-6 relative z-10" onSubmit={handleLogin}>
            <div className="space-y-3">
              <Label htmlFor="email" className="text-primary font-bold uppercase tracking-widest text-xs">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-3 h-4 w-4 text-primary/60" />
                <Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-11 h-12 bg-primary/5 border-primary/20 focus-visible:ring-accent rounded-md" placeholder="john@example.com" />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-primary font-bold uppercase tracking-widest text-xs">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 h-4 w-4 text-primary/60" />
                <Input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-11 h-12 bg-primary/5 border-primary/20 focus-visible:ring-accent rounded-md" placeholder="••••••••" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-primary/40 text-primary focus:ring-accent bg-background cursor-pointer" />
                <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-primary cursor-pointer">
                  Remember me
                </label>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest">
                <Link to="/forgot-password" className="text-accent hover:text-primary transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button type="submit" className="w-full mt-4 rounded-md bg-primary px-8 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg transition-all hover:bg-primary/90 flex items-center justify-center gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : "Sign in to Dashboard"}
            </button>
          </form>

          <div className="mt-8 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary/20" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                <span className="bg-background px-4 text-primary/60">Test Credentials</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-widest">
              <button type="button" onClick={() => handleAutoFill('admin@suvaialaya.com', 'admin123')} className="bg-primary/5 hover:bg-primary/10 border border-primary/10 text-primary p-2 rounded transition-colors text-center">
                Fill Admin
              </button>

              <button type="button" onClick={() => handleAutoFill('scanner@suvaialaya.com', 'scanner123')} className="bg-primary/5 hover:bg-primary/10 border border-primary/10 text-primary p-2 rounded transition-colors text-center">
                Fill Scanner
              </button>
              <button type="button" onClick={() => handleAutoFill('john@example.com', 'password123')} className="bg-primary/5 hover:bg-primary/10 border border-primary/10 text-primary p-2 rounded transition-colors text-center">
                Fill Guest
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
