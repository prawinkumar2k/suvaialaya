import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Ticket, Settings, Bell, LogOut, Download, Calendar, Clock, CreditCard, Leaf, Loader2, CalendarRange } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Dialog State
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

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

  const handleCancelBooking = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelDialogOpen(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;
    
    try {
      const response = await axios.put(`/api/bookings/${bookingToCancel}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success("Booking cancelled successfully");
        setBookings(bookings.map(b => b._id === bookingToCancel ? { ...b, bookingStatus: "Cancelled" } : b));
        setCancelDialogOpen(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to cancel booking");
      setCancelDialogOpen(false);
    }
  };

  const handleDownloadTicket = async (booking: any) => {
    if (booking.ticketPdfUrl) {
      // Create a temporary link to download the base64 PDF directly
      const link = document.createElement("a");
      link.href = booking.ticketPdfUrl;
      link.download = `Suvaialaya-Ticket-${booking._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    // Fallback: Generate it on the fly if not found in DB
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
    <main className="min-h-screen bg-white text-[#1a3d2b] flex flex-col relative overflow-hidden">
      {/* ── BACKGROUND ACCENTS ── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none fixed" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none fixed" />
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10 relative">
          <BrandMark />
          <div className="flex items-center gap-6 relative z-10">
            <button className="text-[#1a3d2b]/60 hover:text-[#1a3d2b] transition-colors">
              <Bell size={20} />
            </button>
            <div className="h-10 w-10 rounded-full bg-[#1a3d2b]/5 border-2 border-[#1a3d2b]/10 flex items-center justify-center font-display font-bold text-[#1a3d2b] shadow-inner">
              {userInitials}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-16 flex-1 flex flex-col lg:flex-row gap-12 relative z-10">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="mb-8 hidden lg:block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/40">Welcome back</p>
            <h2 className="font-display text-2xl font-bold text-[#1a3d2b] mt-1">{user?.name}</h2>
          </div>

          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 scrollbar-hide" style={{ perspective: 1000 }}>
            {[
              { id: "bookings", icon: Ticket, label: "My Bookings" },
              { id: "profile", icon: User, label: "Profile Settings" },
              { id: "billing", icon: CreditCard, label: "Billing & Invoices" },
              { id: "preferences", icon: Settings, label: "Preferences" },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all whitespace-nowrap lg:whitespace-normal font-semibold text-[11px] uppercase tracking-widest
                  ${activeTab === tab.id ? 'bg-[#1a3d2b] text-white shadow-[0_4px_15px_rgb(0,0,0,0.08)]' : 'text-[#1a3d2b]/60 hover:bg-gray-50 hover:text-[#1a3d2b] border border-transparent hover:border-gray-100'}`}
              >
                <tab.icon size={16} />
                {tab.label}
              </motion.button>
            ))}
            
            <div className="hidden lg:block my-6 border-t border-gray-100" />
            
            <Link to="/" className="flex items-center gap-4 px-5 py-4 rounded-xl text-[#1a3d2b]/60 hover:bg-gray-50 hover:text-[#1a3d2b] transition-colors font-semibold text-[11px] uppercase tracking-widest">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-4 px-5 py-4 rounded-xl text-red-500 hover:bg-red-50 hover:border-red-100 border border-transparent transition-colors text-left w-full font-semibold text-[11px] uppercase tracking-widest">
              <LogOut size={16} /> Sign Out
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
            <div className="space-y-8" style={{ perspective: 1000 }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-4xl font-bold text-[#1a3d2b]">My Bookings</h1>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">Your event reservations</p>
                </div>
                <Link to="/slots">
                  <motion.button whileHover={{ scale: 1.02 }} className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white bg-[#1a3d2b] hover:bg-[#2d6a4f] transition-all shadow-[0_4px_15px_rgb(0,0,0,0.1)] flex items-center gap-2">
                    <Ticket size={16} /> Book New Table
                  </motion.button>
                </Link>
              </div>
              
              <div className="grid gap-6">
                {bookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50">
                    <Ticket className="h-12 w-12 text-[#1a3d2b]/20 mb-4" />
                    <p className="font-display text-xl font-bold text-[#1a3d2b]">No bookings found</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/40 mt-2">You haven't made any reservations yet.</p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <motion.div 
                      key={booking._id} 
                      whileHover={{ scale: 1.01, rotateX: 1, rotateY: -1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="bg-white border border-gray-100 rounded-2xl p-8 shadow-[0_4px_15px_rgb(0,0,0,0.02)] overflow-hidden relative group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-gray-200 transition-all"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
                        <Leaf size={100} className="text-[#1a3d2b]" />
                      </div>
                      <div className={`absolute top-0 left-0 w-2 h-full ${booking.bookingStatus === 'Confirmed' ? 'bg-[#c9841a]' : 'bg-gray-200'}`} />
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <span className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest
                              ${booking.bookingStatus === 'Confirmed' ? 'bg-[#c9841a]/10 text-[#c9841a] border-[#c9841a]/20' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                              {booking.bookingStatus}
                            </span>
                            {booking.isRescheduled && (
                              <span className="px-3 py-1 bg-[#1a3d2b]/5 text-[#1a3d2b] border border-[#1a3d2b]/10 rounded-full text-[9px] font-bold uppercase tracking-widest">
                                Rescheduled
                              </span>
                            )}
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#1a3d2b]/40">ID: {booking._id}</span>
                          </div>
                          <h3 className="font-display text-2xl font-bold text-[#1a3d2b]">{booking.event?.title || "Madurai Kari Virunthu"}</h3>
                          
                          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-[10px] font-bold text-[#1a3d2b]/60 uppercase tracking-widest">
                            <span className="flex items-center gap-2">
                              <Calendar size={14} className="text-[#c9841a]" /> 
                              {new Date(booking.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock size={14} className="text-[#c9841a]" /> {booking.slotTime}
                            </span>
                            <span className="flex items-center gap-2">
                              <User size={14} className="text-[#c9841a]" /> {booking.numberOfGuests} Guest(s)
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-4 md:items-end border-t border-gray-100 pt-6 md:border-t-0 md:pt-0">
                          <div className="text-3xl font-display font-bold text-[#1a3d2b]">₹{booking.totalAmount.toLocaleString("en-IN")}</div>
                          {booking.bookingStatus === 'Confirmed' && (
                            <div className="flex gap-2">
                              <Link to={`/slots?reschedule=${booking._id}`}>
                                <button className="flex items-center justify-center gap-2 rounded-xl bg-[#c9841a]/10 text-[#c9841a] border border-[#c9841a]/20 px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest hover:bg-[#c9841a] hover:text-white transition-all">
                                  <CalendarRange size={14} /> Reschedule
                                </button>
                              </Link>
                              <button 
                                onClick={() => handleCancelBooking(booking._id)}
                                className="flex items-center justify-center gap-2 rounded-xl bg-red-50 text-red-500 border border-red-100 px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => handleDownloadTicket(booking)}
                                className="flex items-center justify-center gap-2 rounded-xl bg-[#1a3d2b]/5 text-[#1a3d2b] border border-[#1a3d2b]/10 px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest hover:bg-[#1a3d2b] hover:text-white transition-all"
                              >
                                <Download size={14} /> E-Ticket
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-8" style={{ perspective: 1000 }}>
              <div>
                <h1 className="font-display text-4xl font-bold text-[#1a3d2b]">Profile Settings</h1>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">Manage your personal information</p>
              </div>
              
              <motion.div 
                whileHover={{ rotateX: 1, rotateY: -1, scale: 1.01 }}
                className="bg-white border border-gray-100 rounded-2xl p-8 sm:p-10 shadow-[0_4px_15px_rgb(0,0,0,0.02)] relative overflow-hidden"
              >
                <div className="absolute bottom-0 right-0 p-8 opacity-[0.02]">
                  <User size={150} className="text-[#1a3d2b]" />
                </div>
                <form className="space-y-8 relative z-10" onSubmit={handleUpdateProfile}>
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-[#1a3d2b] font-bold uppercase tracking-widest text-[10px]">Full Name</Label>
                      <Input id="name" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#c9841a] rounded-xl" />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-[#1a3d2b] font-bold uppercase tracking-widest text-[10px]">Email Address</Label>
                      <Input id="email" type="email" value={user?.email || ""} disabled className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#c9841a] opacity-50 cursor-not-allowed rounded-xl" />
                    </div>
                    <div className="space-y-3 sm:col-span-2">
                      <Label htmlFor="phone" className="text-[#1a3d2b] font-bold uppercase tracking-widest text-[10px]">Phone Number</Label>
                      <Input id="phone" type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#c9841a] rounded-xl" />
                    </div>
                  </div>
                  
                  <div className="pt-8 border-t border-gray-100 flex justify-end gap-4">
                    <button type="submit" disabled={isUpdating} className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white bg-[#1a3d2b] hover:bg-[#2d6a4f] transition-colors shadow-md flex items-center disabled:opacity-50">
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-8" style={{ perspective: 1000 }}>
              <div>
                <h1 className="font-display text-4xl font-bold text-[#1a3d2b]">Billing & Invoices</h1>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">Manage your payment history</p>
              </div>
              
              <motion.div 
                whileHover={{ rotateX: 1, rotateY: -1, scale: 1.01 }}
                className="bg-white border border-gray-100 rounded-2xl p-8 shadow-[0_4px_15px_rgb(0,0,0,0.02)]"
              >
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-[#1a3d2b]">Payment History</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mt-1">Receipts for your event bookings</p>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[9px] text-[#1a3d2b]/50 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-bold rounded-tl-xl">Invoice ID</th>
                        <th className="px-6 py-4 font-bold">Date Paid</th>
                        <th className="px-6 py-4 font-bold">Event</th>
                        <th className="px-6 py-4 font-bold">Amount</th>
                        <th className="px-6 py-4 font-bold text-right rounded-tr-xl">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-[#1a3d2b]/40 font-bold uppercase tracking-widest text-[10px]">
                            No billing history found
                          </td>
                        </tr>
                      ) : (
                        bookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-5 font-bold text-[#1a3d2b]">INV-{booking._id.substring(booking._id.length - 6).toUpperCase()}</td>
                            <td className="px-6 py-5 text-[#1a3d2b]/60 font-medium text-xs">{new Date(booking.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                            <td className="px-6 py-5 text-[#1a3d2b]/80 font-bold text-xs">{booking.event?.title || "Event Booking"}</td>
                            <td className="px-6 py-5 font-bold text-[#1a3d2b]">₹{booking.totalAmount.toLocaleString("en-IN")}</td>
                            <td className="px-6 py-5 text-right">
                              <button className="text-[9px] font-bold uppercase tracking-widest text-[#c9841a] hover:text-[#1a3d2b] transition-colors flex items-center justify-end gap-1 ml-auto bg-[#c9841a]/10 px-3 py-1.5 rounded-full hover:bg-gray-100">
                                <Download size={12} /> PDF
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-8" style={{ perspective: 1000 }}>
              <div>
                <h1 className="font-display text-4xl font-bold text-[#1a3d2b]">Preferences</h1>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">Customize your platform experience</p>
              </div>
              
              <motion.div 
                whileHover={{ rotateX: 1, rotateY: -1, scale: 1.01 }}
                className="bg-white border border-gray-100 rounded-2xl p-8 shadow-[0_4px_15px_rgb(0,0,0,0.02)]"
              >
                <h2 className="font-display text-2xl font-bold text-[#1a3d2b] mb-6">Notifications</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-5 border border-gray-100 rounded-xl bg-gray-50">
                    <div>
                      <h4 className="font-bold text-[#1a3d2b]">Email Notifications</h4>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[#1a3d2b]/40 mt-1">Receive booking confirmations and updates via email.</p>
                    </div>
                    <div 
                      onClick={() => setPrefs(prev => ({ ...prev, notifications: !prev.notifications }))}
                      className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${prefs.notifications ? 'bg-[#c9841a]' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all ${prefs.notifications ? 'right-1' : 'left-1'}`} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-5 border border-gray-100 rounded-xl bg-gray-50">
                    <div>
                      <h4 className="font-bold text-[#1a3d2b]">Marketing Emails</h4>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[#1a3d2b]/40 mt-1">Receive news about upcoming events and special offers.</p>
                    </div>
                    <div 
                      onClick={() => setPrefs(prev => ({ ...prev, marketingEmails: !prev.marketingEmails }))}
                      className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${prefs.marketingEmails ? 'bg-[#c9841a]' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all ${prefs.marketingEmails ? 'right-1' : 'left-1'}`} />
                    </div>
                  </div>
                </div>
                
                <h2 className="font-display text-2xl font-bold text-[#1a3d2b] mt-12 mb-6">Dietary Requirements</h2>
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-4">Set your default dietary preferences for future bookings.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {["Vegetarian", "Vegan", "Gluten-Free", "Nut-Free"].map((diet) => (
                      <label key={diet} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${prefs.dietary.includes(diet) ? 'border-[#c9841a] bg-[#c9841a]/5' : 'border-gray-100 bg-white hover:bg-gray-50'}`}>
                        <input 
                          type="checkbox" 
                          className="accent-[#c9841a] w-4 h-4" 
                          checked={prefs.dietary.includes(diet)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPrefs(prev => ({ ...prev, dietary: [...prev.dietary, diet] }));
                            } else {
                              setPrefs(prev => ({ ...prev, dietary: prev.dietary.filter(d => d !== diet) }));
                            }
                          }}
                        />
                        <span className="text-xs font-bold text-[#1a3d2b]">{diet}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="pt-8 mt-8 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={handleUpdatePreferences}
                    disabled={isUpdating}
                    className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white bg-[#1a3d2b] hover:bg-[#2d6a4f] transition-colors shadow-md flex items-center disabled:opacity-50"
                  >
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Preferences
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Cancel Booking Alert Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? Refunds may take 5-7 business days to process depending on your bank.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelBooking} className="bg-red-500 text-white hover:bg-red-600">Yes, Cancel Booking</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
