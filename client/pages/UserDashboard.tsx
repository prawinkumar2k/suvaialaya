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
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const token = localStorage.getItem("token");

  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [prefs, setPrefs] = useState({
    notifications: user?.preferences?.notifications ?? true,
    marketingEmails: user?.preferences?.marketingEmails ?? false,
    dietary: user?.preferences?.dietary || []
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await axios.put("/api/auth/profile", { name: profileName, phone: profilePhone }, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        toast.success("Profile updated successfully");
        localStorage.setItem("user", JSON.stringify(response.data.data));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePreferences = async () => {
    setIsUpdating(true);
    try {
      const response = await axios.put("/api/auth/profile", { preferences: prefs }, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        toast.success("Preferences saved successfully");
        localStorage.setItem("user", JSON.stringify(response.data.data));
      }
    } catch (error: any) {
      toast.error("Failed to update preferences");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (!token || !user) {
      toast.error("Please login to access your dashboard.");
      navigate("/login");
      return;
    }

    if (user.role === "admin" || user.role === "owner") {
      navigate("/admin");
      return;
    } else if (user.role === "kitchen_staff") {
      navigate("/kitchen");
      return;
    } else if (user.role === "scanner" || user.role === "receptionist") {
      navigate("/scanner");
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

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking? Refunds may take 5-7 business days.")) return;
    
    try {
      const response = await axios.put(`/api/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success("Booking cancelled successfully");
        setBookings(bookings.map(b => b._id === bookingId ? { ...b, bookingStatus: "Cancelled" } : b));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to cancel booking");
    }
  };

  const handleDownloadTicket = async (booking: any) => {
    const { generatePremiumTicket } = await import("@/lib/ticketGenerator");
    await generatePremiumTicket(booking, user);
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
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleCancelBooking(booking._id)}
                                className="flex items-center justify-center gap-2 rounded-md bg-destructive/10 text-destructive border border-destructive/20 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-destructive hover:text-destructive-foreground transition-all"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => handleDownloadTicket(booking)}
                                className="flex items-center justify-center gap-2 rounded-md bg-primary/10 text-primary border border-primary/20 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all"
                              >
                                <Download size={14} /> E-Ticket
                              </button>
                            </div>
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
                <form className="space-y-8 relative z-10" onSubmit={handleUpdateProfile}>
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-primary font-bold uppercase tracking-widest text-xs">Full Name</Label>
                      <Input id="name" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="h-12 bg-primary/5 border-primary/20 focus-visible:ring-accent" />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-primary font-bold uppercase tracking-widest text-xs">Email Address</Label>
                      <Input id="email" type="email" value={user?.email || ""} disabled className="h-12 bg-primary/5 border-primary/20 focus-visible:ring-accent opacity-50 cursor-not-allowed" />
                    </div>
                    <div className="space-y-3 sm:col-span-2">
                      <Label htmlFor="phone" className="text-primary font-bold uppercase tracking-widest text-xs">Phone Number</Label>
                      <Input id="phone" type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="h-12 bg-primary/5 border-primary/20 focus-visible:ring-accent" />
                    </div>
                  </div>
                  
                  <div className="pt-8 border-t border-primary/10 flex justify-end gap-4">
                    <button type="submit" disabled={isUpdating} className="px-6 py-3 rounded-md text-xs font-bold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 transition-colors shadow-md flex items-center disabled:opacity-50">
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-8">
              <div>
                <h1 className="font-display text-4xl font-bold text-primary">Billing & Invoices</h1>
                <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-primary/60">Manage your payment history</p>
              </div>
              
              <div className="bg-background border border-primary/20 rounded-xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-primary/10">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-primary">Payment History</h2>
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mt-1">Receipts for your event bookings</p>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] text-primary/60 uppercase tracking-widest bg-primary/5 border-b border-primary/10">
                      <tr>
                        <th className="px-6 py-4 font-bold">Invoice ID</th>
                        <th className="px-6 py-4 font-bold">Date Paid</th>
                        <th className="px-6 py-4 font-bold">Event</th>
                        <th className="px-6 py-4 font-bold">Amount</th>
                        <th className="px-6 py-4 font-bold text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10">
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-primary/60 font-semibold uppercase tracking-widest text-xs">
                            No billing history found
                          </td>
                        </tr>
                      ) : (
                        bookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-primary/5 transition-colors">
                            <td className="px-6 py-5 font-bold text-primary">INV-{booking._id.substring(booking._id.length - 6).toUpperCase()}</td>
                            <td className="px-6 py-5 text-primary/70">{new Date(booking.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                            <td className="px-6 py-5 text-foreground/80 font-medium">{booking.event?.title || "Event Booking"}</td>
                            <td className="px-6 py-5 font-bold text-primary">₹{booking.totalAmount.toLocaleString("en-IN")}</td>
                            <td className="px-6 py-5 text-right">
                              <button className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-primary transition-colors flex items-center justify-end gap-1 ml-auto">
                                <Download size={14} /> PDF
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-8">
              <div>
                <h1 className="font-display text-4xl font-bold text-primary">Preferences</h1>
                <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-primary/60">Customize your platform experience</p>
              </div>
              
              <div className="bg-background border border-primary/20 rounded-xl p-8 shadow-sm">
                <h2 className="font-display text-2xl font-bold text-primary mb-6">Notifications</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-primary/10 rounded-lg bg-primary/5">
                    <div>
                      <h4 className="font-bold text-primary">Email Notifications</h4>
                      <p className="text-xs text-primary/70 mt-1">Receive booking confirmations and updates via email.</p>
                    </div>
                    <div 
                      onClick={() => setPrefs(prev => ({ ...prev, notifications: !prev.notifications }))}
                      className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${prefs.notifications ? 'bg-accent' : 'bg-primary/20 border border-primary/10'}`}
                    >
                      <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all ${prefs.notifications ? 'right-1' : 'left-1'}`} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-primary/10 rounded-lg bg-primary/5">
                    <div>
                      <h4 className="font-bold text-primary">Marketing Emails</h4>
                      <p className="text-xs text-primary/70 mt-1">Receive news about upcoming events and special offers.</p>
                    </div>
                    <div 
                      onClick={() => setPrefs(prev => ({ ...prev, marketingEmails: !prev.marketingEmails }))}
                      className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${prefs.marketingEmails ? 'bg-accent' : 'bg-primary/20 border border-primary/10'}`}
                    >
                      <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all ${prefs.marketingEmails ? 'right-1' : 'left-1'}`} />
                    </div>
                  </div>
                </div>
                
                <h2 className="font-display text-2xl font-bold text-primary mt-12 mb-6">Dietary Requirements</h2>
                <div className="space-y-4">
                  <p className="text-sm text-primary/70 mb-4">Set your default dietary preferences for future bookings.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {["Vegetarian", "Vegan", "Gluten-Free", "Nut-Free"].map((diet) => (
                      <label key={diet} className="flex items-center gap-3 p-3 border border-primary/10 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                        <input 
                          type="checkbox" 
                          className="accent-accent w-4 h-4" 
                          checked={prefs.dietary.includes(diet)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPrefs(prev => ({ ...prev, dietary: [...prev.dietary, diet] }));
                            } else {
                              setPrefs(prev => ({ ...prev, dietary: prev.dietary.filter(d => d !== diet) }));
                            }
                          }}
                        />
                        <span className="text-sm font-semibold text-primary">{diet}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="pt-8 mt-8 border-t border-primary/10 flex justify-end">
                  <button 
                    onClick={handleUpdatePreferences}
                    disabled={isUpdating}
                    className="px-6 py-3 rounded-md text-xs font-bold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 transition-colors shadow-md flex items-center disabled:opacity-50"
                  >
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
