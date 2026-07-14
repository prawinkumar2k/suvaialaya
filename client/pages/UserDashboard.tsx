import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Ticket, Settings, Bell, LogOut, Download, Calendar, Clock, CreditCard, Leaf, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || !user) {
      toast.error("Please login to access your dashboard.");
      navigate("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await axios.get("/api/bookings/my-bookings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setBookings(response.data.data);
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          handleLogout();
        } else {
          toast.error("Failed to load bookings");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    toast.success("Logged out successfully");
  };

  const handleDownloadTicket = async (booking: any) => {
    const bookingDate = new Date(booking.date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const { jsPDF } = await import("jspdf");
    
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [100, 180]
    });

    const primaryGreen = "#0f3b28";

    doc.setFillColor(249, 246, 240);
    doc.rect(0, 0, 100, 180, "F");

    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 90, 170);
    doc.rect(7, 7, 86, 166);

    doc.setTextColor(primaryGreen);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("SUVAIALAYA", 50, 20, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("SOUTH INDIAN CUISINE", 50, 25, { align: "center" });

    doc.setDrawColor(15, 59, 40);
    doc.setLineWidth(0.2);
    doc.line(20, 32, 80, 32);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(booking.event?.title?.toUpperCase() || "MADURAI KARI VIRUNTHU", 50, 42, { align: "center" });

    doc.setFillColor(15, 59, 40);
    doc.rect(10, 52, 80, 60, "F");

    doc.setTextColor(255, 255, 255);
    
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("DATE", 15, 62);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(bookingDate, 15, 68);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("TIME", 60, 62);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(booking.slotTime, 60, 68);

    doc.setDrawColor(255, 255, 255);
    doc.line(15, 75, 85, 75);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("GUESTS", 15, 85);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${booking.numberOfGuests} PAX`, 15, 91);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("PAID", 60, 85);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`INR ${booking.totalAmount}`, 60, 91);
    
    doc.line(15, 98, 85, 98);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("TICKET ID", 15, 107);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(booking._id, 50, 107, { align: "center" });

    doc.setTextColor(primaryGreen);
    doc.setFontSize(8);
    doc.text("VENUE", 50, 125, { align: "center" });
    doc.setFontSize(10);
    doc.text(booking.event?.venue || "Suvaialaya Restaurant", 50, 131, { align: "center" });

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(6);
    doc.text("Please present this E-Ticket at the entrance.", 50, 160, { align: "center" });

    doc.save(`Suvaialaya-Ticket-${booking._id.substring(booking._id.length - 8).toUpperCase()}.pdf`);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center relative">
        <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none" />
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </main>
    );
  }

  const userInitials = user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "US";

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative selection:bg-accent/30">
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none" />
      
      {/* Top Header */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10 relative">
          <BrandMark />
          <div className="flex items-center gap-6 relative z-10">
            <button className="text-primary/70 hover:text-primary transition-colors">
              <Bell size={20} />
            </button>
            <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center font-display font-bold text-primary shadow-inner">
              {userInitials}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-16 flex-1 flex flex-col lg:flex-row gap-12 relative z-10">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="mb-8 hidden lg:block">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/50">Welcome back</p>
            <h2 className="font-display text-2xl font-bold text-primary mt-1">{user?.name}</h2>
          </div>

          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {[
              { id: "bookings", icon: Ticket, label: "My Bookings" },
              { id: "profile", icon: User, label: "Profile Settings" },
              { id: "billing", icon: CreditCard, label: "Billing & Invoices" },
              { id: "preferences", icon: Settings, label: "Preferences" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 px-5 py-4 rounded-lg transition-all whitespace-nowrap lg:whitespace-normal font-semibold text-sm
                  ${activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]' : 'text-primary/70 hover:bg-primary/5 hover:text-primary'}`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
            
            <div className="hidden lg:block my-6 border-t border-primary/10" />
            
            <Link to="/" className="flex items-center gap-4 px-5 py-4 rounded-lg text-primary/70 hover:bg-primary/5 hover:text-primary transition-colors font-semibold text-sm">
              <ArrowLeft size={18} /> Back to Home
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-4 px-5 py-4 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-left w-full font-semibold text-sm">
              <LogOut size={18} /> Sign Out
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.4 }}
          className="flex-1 min-w-0"
        >
          {activeTab === "bookings" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-4xl font-bold text-primary">My Bookings</h1>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-primary/60">Your event reservations</p>
                </div>
                <Link to="/slots">
                  <button className="px-6 py-3 rounded-md text-xs font-bold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-md flex items-center gap-2">
                    <Ticket size={16} /> Book New Table
                  </button>
                </Link>
              </div>
              
              <div className="grid gap-6">
                {bookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-primary/20 rounded-xl bg-primary/5">
                    <Ticket className="h-12 w-12 text-primary/40 mb-4" />
                    <p className="font-display text-xl font-bold text-primary">No bookings found</p>
                    <p className="text-sm font-semibold uppercase tracking-widest text-primary/60 mt-2">You haven't made any reservations yet.</p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking._id} className="bg-background border border-primary/20 rounded-xl p-8 shadow-sm overflow-hidden relative group hover:border-primary/40 transition-colors">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Leaf size={60} className="text-primary" />
                      </div>
                      <div className={`absolute top-0 left-0 w-2 h-full ${booking.bookingStatus === 'Confirmed' ? 'bg-accent' : 'bg-primary/30'}`} />
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <span className={`px-3 py-1 rounded border text-[10px] font-bold uppercase tracking-widest
                              ${booking.bookingStatus === 'Confirmed' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-primary/5 text-primary/60 border-primary/10'}`}>
                              {booking.bookingStatus}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/50">ID: {booking._id}</span>
                          </div>
                          <h3 className="font-display text-2xl font-bold text-primary">{booking.event?.title || "Madurai Kari Virunthu"}</h3>
                          
                          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-semibold text-primary/70 uppercase tracking-widest">
                            <span className="flex items-center gap-2">
                              <Calendar size={14} className="text-accent" /> 
                              {new Date(booking.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock size={14} className="text-accent" /> {booking.slotTime}
                            </span>
                            <span className="flex items-center gap-2">
                              <User size={14} className="text-accent" /> {booking.numberOfGuests} Guest(s)
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-4 md:items-end border-t border-primary/10 pt-6 md:border-t-0 md:pt-0">
                          <div className="text-3xl font-display font-bold text-primary">₹{booking.totalAmount.toLocaleString("en-IN")}</div>
                          {booking.bookingStatus === 'Confirmed' && (
                            <button 
                              onClick={() => handleDownloadTicket(booking)}
                              className="flex items-center justify-center gap-2 rounded-md bg-primary/10 text-primary border border-primary/20 px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all"
                            >
                              <Download size={14} /> Download E-Ticket
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-8">
              <div>
                <h1 className="font-display text-4xl font-bold text-primary">Profile Settings</h1>
                <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-primary/60">Manage your personal information</p>
              </div>
              
              <div className="bg-background border border-primary/20 rounded-xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
                <div className="absolute bottom-0 right-0 p-8 opacity-5">
                  <User size={120} className="text-primary" />
                </div>
                <form className="space-y-8 relative z-10" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-primary font-bold uppercase tracking-widest text-xs">Full Name</Label>
                      <Input id="name" defaultValue={user?.name || ""} className="h-12 bg-primary/5 border-primary/20 focus-visible:ring-accent" />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-primary font-bold uppercase tracking-widest text-xs">Email Address</Label>
                      <Input id="email" type="email" defaultValue={user?.email || ""} className="h-12 bg-primary/5 border-primary/20 focus-visible:ring-accent" />
                    </div>
                    <div className="space-y-3 sm:col-span-2">
                      <Label htmlFor="phone" className="text-primary font-bold uppercase tracking-widest text-xs">Phone Number</Label>
                      <Input id="phone" type="tel" defaultValue={user?.phone || ""} className="h-12 bg-primary/5 border-primary/20 focus-visible:ring-accent" />
                    </div>
                  </div>
                  
                  <div className="pt-8 border-t border-primary/10 flex justify-end gap-4">
                    <button type="submit" className="px-6 py-3 rounded-md text-xs font-bold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 transition-colors shadow-md">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {["billing", "preferences"].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-primary/20 rounded-xl bg-primary/5">
              <Settings className="h-12 w-12 text-primary/40 mb-6" />
              <h3 className="font-display text-2xl font-bold text-primary">Under Construction</h3>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mt-3 max-w-sm">
                This enterprise feature will be unlocked in upcoming phases.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
