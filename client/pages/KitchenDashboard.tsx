import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChefHat, RefreshCw, Loader2, Utensils, UtensilsCrossed, Star, Leaf, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";
import { toast } from "sonner";
import axios from "axios";

export default function KitchenDashboard() {
  const [stats, setStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [currentDate, setCurrentDate] = useState("");
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchStats = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setIsRefreshing(true);
    
    try {
      const response = await axios.get("/api/kitchen/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setStats(response.data.data);
        setCurrentDate(response.data.date);
        setLastUpdated(new Date());
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Unauthorized access to kitchen dashboard.");
        navigate("/");
      } else {
        toast.error("Failed to load kitchen statistics.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!token || !["kitchen_staff", "admin", "owner"].includes(user.role)) {
      toast.error("Unauthorized access.");
      navigate("/");
      return;
    }
    fetchStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    toast.success("Logged out successfully");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center relative">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative selection:bg-accent/30">
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary z-10" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-primary/20 bg-background/95 backdrop-blur-md shadow-sm p-4 mt-1.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-primary/70 hover:text-primary transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-full border border-primary/30 text-primary">
                <ChefHat size={24} />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-primary uppercase tracking-widest">Kitchen Command</h1>
                <p className="text-[10px] text-primary/60 uppercase tracking-widest">Real-time Order Aggregation</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase tracking-widest text-primary/60">Last Updated</div>
              <div className="text-sm font-bold text-primary">{lastUpdated.toLocaleTimeString()}</div>
            </div>
            <button 
              onClick={() => fetchStats(true)} 
              disabled={isRefreshing}
              className="bg-primary/10 hover:bg-primary/20 border border-primary/30 p-3 rounded-full text-primary transition-colors disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
            </button>
            <div className="h-8 w-px bg-primary/20 hidden sm:block"></div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-destructive border-2 border-destructive/20 hover:bg-destructive/10 px-3 py-2 rounded-md transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:block">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 relative z-10">
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold text-primary mb-2">
            {currentDate === new Date().toISOString().split("T")[0] 
              ? "Today's Service Schedule" 
              : `Upcoming Service: ${new Date(currentDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
          </h2>
          <p className="text-primary/70">Live breakdown of meal preparations per timeslot based on confirmed bookings.</p>
        </div>

        {stats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-primary/20 rounded-xl bg-primary/5">
            <ChefHat className="h-16 w-16 text-primary/30 mb-4" />
            <p className="font-display text-2xl font-bold text-primary">No Upcoming Bookings</p>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary/60 mt-2">The kitchen is currently idle.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((slot, index) => (
              <motion.div 
                key={slot.slotTime}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-background border border-primary/20 rounded-xl overflow-hidden shadow-lg relative z-10"
              >
                <div className="bg-primary/10 p-4 border-b border-primary/20 flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold text-primary">{slot.slotTime}</h3>
                  <div className="bg-primary/20 text-primary px-3 py-1 rounded font-bold tracking-widest text-sm border border-primary/30">
                    {slot.totalGuests} PAX
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 flex flex-col items-center text-center shadow-sm">
                      <Leaf size={24} className="text-emerald-700 mb-2" />
                      <div className="text-[10px] uppercase tracking-widest text-primary/60 mb-1">Vegetarian</div>
                      <div className="text-3xl font-display font-bold text-emerald-800">{slot.veg}</div>
                    </div>
                    
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 flex flex-col items-center text-center shadow-sm">
                      <UtensilsCrossed size={24} className="text-orange-700 mb-2" />
                      <div className="text-[10px] uppercase tracking-widest text-primary/60 mb-1">Non-Veg</div>
                      <div className="text-3xl font-display font-bold text-orange-800">{slot.nonVeg}</div>
                    </div>
                  </div>
                  
                  {slot.vip > 0 && (
                    <div className="bg-accent/10 border border-accent/20 p-3 rounded-lg flex items-center justify-center gap-3">
                      <Star size={18} className="text-accent" />
                      <span className="text-sm font-bold text-accent uppercase tracking-widest">{slot.vip} VIP Guests</span>
                    </div>
                  )}
                </div>
                
                <div className="bg-primary/5 p-3 text-center text-[10px] uppercase tracking-widest text-primary/50 border-t border-primary/10">
                  Slot #{index + 1}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
