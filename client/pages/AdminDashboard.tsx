import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, CalendarDays, Users, BarChart3, ScanLine, Settings, MoreVertical, CheckCircle2, TrendingUp, IndianRupee, Leaf, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";
import { toast } from "sonner";
import axios from "axios";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || !user || user.role !== "admin") {
      toast.error("Unauthorized access.");
      navigate("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await axios.get("/api/bookings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setBookings(response.data.data);
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          toast.error("Failed to load admin data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [navigate, token, user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    toast.success("Logged out successfully");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center relative">
        <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none" />
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </main>
    );
  }

  // Calculate dynamic stats
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalBookings = bookings.length;
  const guestsExpected = bookings.reduce((sum, b) => sum + (b.numberOfGuests || 0), 0);
  const confirmedBookings = bookings.filter(b => b.bookingStatus === "Confirmed").length;

  const dynamicStats = [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, increase: "+Live", icon: IndianRupee },
    { label: "Total Bookings", value: totalBookings.toString(), increase: "+Live", icon: CalendarDays },
    { label: "Guests Expected", value: guestsExpected.toString(), increase: "+Live", icon: Users },
    { label: "Confirmed", value: confirmedBookings.toString(), increase: "Active", icon: CheckCircle2 },
  ];  const handleExportCSV = () => {
    if (bookings.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Booking ID", "Guest Name", "Email", "Date", "Time", "Pax", "Amount (INR)", "Status"];
    
    const csvContent = [
      headers.join(","),
      ...bookings.map(b => {
        const id = b._id;
        const name = `"${b.user?.name || b.guestDetails?.fullName || "Guest"}"`;
        const email = `"${b.user?.email || b.guestDetails?.email || "N/A"}"`;
        const date = new Date(b.date).toLocaleDateString("en-US");
        const time = b.slotTime;
        const pax = b.numberOfGuests;
        const amount = b.totalAmount;
        const status = b.bookingStatus;
        return [id, name, email, date, time, pax, amount, status].join(",");
      })
    ].join("\\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Suvaialaya-Ledger-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Ledger exported successfully");
  };

  const adminInitials = user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "AD";

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative selection:bg-accent/30">
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none" />
      
      {/* Top Header */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-20 items-center justify-between px-5 sm:px-8 relative z-10">
          <div className="flex items-center gap-6">
            <BrandMark />
            <span className="hidden md:inline-flex items-center rounded-sm bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent border border-accent/20">
              SEMS Admin
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/scanner" className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary border-2 border-primary/20 px-4 py-2 rounded-md hover:bg-primary/5 transition-all">
              <ScanLine size={16} /> Open Scanner
            </Link>
            <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center font-display font-bold text-primary shadow-inner">
              {adminInitials}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row relative z-10">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 border-r border-primary/10 bg-background/50 backdrop-blur-sm">
          <nav className="flex flex-row lg:flex-col gap-2 p-5 overflow-x-auto lg:overflow-y-auto scrollbar-hide">
            {[
              { id: "overview", icon: LayoutDashboard, label: "Overview & Reports" },
              { id: "events", icon: CalendarDays, label: "Events & Slots" },
              { id: "bookings", icon: Users, label: "All Bookings" },
              { id: "analytics", icon: BarChart3, label: "Detailed Analytics" },
              { id: "settings", icon: Settings, label: "Platform Settings" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all whitespace-nowrap lg:whitespace-normal text-xs font-bold uppercase tracking-widest
                  ${activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-md' : 'text-primary/70 hover:bg-primary/5 hover:text-primary'}`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
            
            <div className="hidden lg:block my-4 border-t border-primary/10" />
            
            <button onClick={handleLogout} className="flex items-center w-full gap-4 px-4 py-3.5 rounded-lg text-xs font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-colors">
              <ArrowLeft size={16} /> Logout Admin
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 p-5 sm:p-8 overflow-y-auto min-w-0">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.4 }}
          >
            {activeTab === "overview" && (
              <div className="space-y-8 max-w-7xl mx-auto">
                <div>
                  <h1 className="font-display text-4xl font-bold text-primary">Dashboard Overview</h1>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-primary/60">Real-time metrics for Suvaialaya Events</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {dynamicStats.map((stat, i) => (
                    <div key={i} className="bg-background border border-primary/20 rounded-xl p-6 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
                      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Leaf size={80} className="text-primary" />
                      </div>
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{stat.label}</p>
                          <p className="font-display text-3xl font-bold text-primary mt-2">{stat.value}</p>
                        </div>
                        <div className="p-3 bg-primary/10 text-primary rounded-lg border border-primary/20">
                          <stat.icon size={20} />
                        </div>
                      </div>
                      <div className="mt-5 flex items-center text-[10px] font-bold uppercase tracking-widest text-accent relative z-10">
                        <TrendingUp size={14} className="mr-2" /> {stat.increase} updates
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Bookings Table */}
                <div className="bg-background border border-primary/20 rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-primary/10 flex justify-between items-center bg-primary/5">
                    <h2 className="font-display font-bold text-xl text-primary">Recent Bookings</h2>
                    <div className="flex items-center gap-4">
                      <button onClick={handleExportCSV} className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded hover:bg-primary/20 transition-colors">
                        Export CSV
                      </button>
                      <button className="text-xs font-bold uppercase tracking-widest text-primary hover:text-accent transition-colors">View All &rarr;</button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[10px] text-primary/60 uppercase tracking-widest bg-primary/5 border-b border-primary/10">
                        <tr>
                          <th className="px-6 py-4 font-bold">Booking ID</th>
                          <th className="px-6 py-4 font-bold">Guest Name</th>
                          <th className="px-6 py-4 font-bold">Slot</th>
                          <th className="px-6 py-4 font-bold text-center">Pax</th>
                          <th className="px-6 py-4 font-bold">Status</th>
                          <th className="px-6 py-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary/10">
                        {bookings.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-primary/60 font-semibold uppercase tracking-widest text-xs">
                              No bookings found in database
                            </td>
                          </tr>
                        )}
                        {[...bookings].reverse().slice(0, 10).map((b) => (
                          <tr key={b._id} className="hover:bg-primary/5 transition-colors">
                            <td className="px-6 py-5 font-bold text-primary">{b._id.substring(b._id.length - 8).toUpperCase()}</td>
                            <td className="px-6 py-5 text-foreground/80 font-medium">{b.user?.name || b.guestDetails?.fullName || "Guest"}</td>
                            <td className="px-6 py-5 text-primary/70">{new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {b.slotTime}</td>
                            <td className="px-6 py-5 text-center font-bold text-primary">{b.numberOfGuests}</td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1.5 rounded border text-[9px] font-bold uppercase tracking-widest
                                ${b.bookingStatus === 'Confirmed' ? 'bg-accent/10 text-accent border-accent/20' : 
                                  b.bookingStatus === 'Pending' ? 'bg-warning/10 text-warning border-warning/20' : 
                                  'bg-destructive/10 text-destructive border-destructive/20'}`}>
                                {b.bookingStatus}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <button className="text-primary/50 hover:text-primary transition-colors p-2">
                                <MoreVertical size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholders for other admin tabs */}
            {activeTab !== "overview" && (
              <div className="flex flex-col items-center justify-center py-40 text-center border-2 border-dashed border-primary/20 rounded-xl bg-primary/5">
                <Settings className="h-16 w-16 text-primary/30 mb-6" />
                <h3 className="font-display text-3xl font-bold text-primary">Module Under Construction</h3>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mt-4 max-w-md">
                  The {activeTab} management module will be wired up to MongoDB in subsequent phases.
                </p>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </main>
  );
}
