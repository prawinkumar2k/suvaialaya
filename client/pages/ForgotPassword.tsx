import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    
    try {
      import("axios").then(async (axios) => {
        const { toast } = await import("sonner");
        const response = await axios.default.post("/api/auth/forgot-password", { email });
        if (response.data.success) {
          toast.success(response.data.message);
          navigate("/verify-otp", { state: { email } });
        }
      });
    } catch (error: any) {
      import("sonner").then(({ toast }) => {
        toast.error(error.response?.data?.error || "Failed to send reset code");
      });
    } finally {
      setIsLoading(false);
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
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter your email and we'll send you a recovery link.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-xl shadow-border/10 sm:rounded-2xl sm:px-10 border border-border">
          <form className="space-y-5" onSubmit={handleReset}>
            <div>
              <Label htmlFor="email">Email address</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  required 
                  className="pl-10" 
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
            </Button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
