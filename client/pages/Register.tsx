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
          Create account
        </h2>
        <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-primary/70">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:text-primary transition-colors">
            Sign in here
          </Link>
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-background py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border-2 border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Leaf size={100} className="text-primary" />
          </div>

          <form className="space-y-6 relative z-10" onSubmit={handleRegister}>
            <div className="space-y-3">
              <Label htmlFor="name" className="text-primary font-bold uppercase tracking-widest text-xs">Full name</Label>
              <div className="relative">
                <User className="absolute left-4 top-3 h-4 w-4 text-primary/60" />
                <Input id="name" name="name" type="text" autoComplete="name" required className="pl-11 h-12 bg-primary/5 border-primary/20 focus-visible:ring-accent rounded-md" placeholder="John Doe" />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-primary font-bold uppercase tracking-widest text-xs">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-3 h-4 w-4 text-primary/60" />
                <Input id="email" name="email" type="email" autoComplete="email" required className="pl-11 h-12 bg-primary/5 border-primary/20 focus-visible:ring-accent rounded-md" placeholder="you@example.com" />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="text-primary font-bold uppercase tracking-widest text-xs">Phone number</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-3 h-4 w-4 text-primary/60" />
                <Input id="phone" name="phone" type="tel" autoComplete="tel" required className="pl-11 h-12 bg-primary/5 border-primary/20 focus-visible:ring-accent rounded-md" placeholder="+91 98765 43210" />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-primary font-bold uppercase tracking-widest text-xs">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 h-4 w-4 text-primary/60" />
                <Input id="password" name="password" type="password" autoComplete="new-password" required className="pl-11 h-12 bg-primary/5 border-primary/20 focus-visible:ring-accent rounded-md" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" className="w-full mt-4 rounded-md bg-primary px-8 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg transition-all hover:bg-primary/90 flex items-center justify-center gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : "Create account"}
            </button>
          </form>

          <div className="mt-8 text-center text-[10px] font-bold text-primary/60 uppercase tracking-widest relative z-10">
            By registering, you agree to our <Link to="/terms" className="text-accent hover:text-primary transition-colors">Terms of Service</Link> and <Link to="/privacy" className="text-accent hover:text-primary transition-colors">Privacy Policy</Link>.
          </div>
        </div>
      </motion.div>
    </main>
  );
}
