import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, CalendarDays, Users, BarChart3, ScanLine, Settings, MoreVertical, CheckCircle2, TrendingUp, IndianRupee, Leaf, Loader2, CheckSquare, XCircle, Plus, ChefHat } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/landing/BrandMark";
import { toast } from "sonner";
import axios from "axios";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
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

    const fetchData = async () => {
      try {
        const [bookingsRes, analyticsRes, eventsRes] = await Promise.all([
          axios.get("/api/bookings", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/analytics/business", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/events")
        ]);
        if (bookingsRes.data.success) {
          setBookings(bookingsRes.data.data);
        }
        if (analyticsRes.data.success) {
          setAnalytics(analyticsRes.data.data);
        }
        if (eventsRes.data.success) {
          setEvents(eventsRes.data.data);
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

    fetchData();
  }, [navigate, token, userString]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    toast.success("Logged out successfully");
  };

  const handleUpdateBookingStatus = async (bookingId: string, action: 'check-in' | 'cancel') => {
    try {
      const endpoint = action === 'check-in' ? `/api/bookings/${bookingId}/check-in` : `/api/bookings/${bookingId}/cancel`;
      const response = await axios.put(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        toast.success(`Booking ${action === 'check-in' ? 'checked in' : 'cancelled'} successfully`);
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, bookingStatus: action === 'check-in' ? 'Checked In' : 'Cancelled' } : b));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to ${action} booking`);
    }
  };

  const handleUpdateEvent = async (eventId: string, updateData: any) => {
    try {
      const response = await axios.put(`/api/events/${eventId}`, updateData, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        toast.success("Event updated successfully");
        setEvents(events.map(e => e._id === eventId ? response.data.data : e));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update event");
    }
  };

  const handleRemoveDate = (event: any, dateToRemove: string) => {
    if (confirm(`Are you sure you want to remove ${dateToRemove}?`)) {
      const updatedDates = event.dates.filter((d: string) => d !== dateToRemove);
      handleUpdateEvent(event._id, { dates: updatedDates });
    }
  };

  const handleRemoveSlot = (event: any, slotIdx: number) => {
    if (confirm("Are you sure you want to remove this slot?")) {
      const updatedSlots = event.slots.filter((_: any, idx: number) => idx !== slotIdx);
      handleUpdateEvent(event._id, { slots: updatedSlots });
    }
  };

  const handleAddDate = (event: any) => {
    const newDate = prompt("Enter new date (YYYY-MM-DD):");
    if (newDate) {
      if (isNaN(new Date(newDate).getTime())) {
        toast.error("Invalid date format. Use YYYY-MM-DD");
        return;
      }
      handleUpdateEvent(event._id, { dates: [...(event.dates || []), newDate].sort() });
    }
  };

  const handleAddSlot = (event: any) => {
    const time = prompt("Enter slot time (e.g., 10:00 AM):");
    const capacityStr = prompt("Enter slot capacity (e.g., 70):", "70");
    if (time && capacityStr) {
      const capacity = parseInt(capacityStr);
      if (isNaN(capacity) || capacity <= 0) {
        toast.error("Invalid capacity");
        return;
      }
      handleUpdateEvent(event._id, { slots: [...(event.slots || []), { time, capacity }] });
    }
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
  const totalRevenue = analytics?.revenue?.netRevenue || 0;
  const totalBookings = analytics?.bookings?.total || bookings.length;
  const guestsExpected = analytics?.guests?.total || bookings.reduce((sum, b) => sum + (b.numberOfGuests || 0), 0);
  const confirmedBookings = analytics?.bookings?.confirmed || bookings.filter(b => b.bookingStatus === "Confirmed").length;

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
    <main className="min-h-screen bg-white text-[#1a3d2b] flex flex-col relative overflow-hidden">
      {/* ── BACKGROUND ACCENTS ── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none fixed" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none fixed" />
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="mx-auto flex h-20 items-center justify-between px-5 sm:px-8 relative z-10">
          <div className="flex items-center gap-6">
            <BrandMark />
            <span className="hidden md:inline-flex items-center rounded-sm bg-[#c9841a]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#c9841a] border border-[#c9841a]/20">
              SEMS Admin
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/kitchen" className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b] border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all">
              <ChefHat size={16} /> Open Kitchen
            </Link>
            <Link to="/reception" className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b] border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all">
              <Users size={16} /> Open Reception
            </Link>
            <Link to="/scanner" className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b] border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all">
              <ScanLine size={16} /> Open Scanner
            </Link>
            <div className="h-10 w-10 rounded-full bg-[#1a3d2b]/5 border-2 border-[#1a3d2b]/10 flex items-center justify-center font-display font-bold text-[#1a3d2b] shadow-inner">
              {adminInitials}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row relative z-10">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 border-r border-gray-100 bg-white/50 backdrop-blur-sm">
          <nav className="flex flex-row lg:flex-col gap-2 p-5 overflow-x-auto lg:overflow-y-auto scrollbar-hide" style={{ perspective: 1000 }}>
            {[
              { id: "overview", icon: LayoutDashboard, label: "Overview & Reports" },
              { id: "events", icon: CalendarDays, label: "Events & Slots" },
              { id: "bookings", icon: Users, label: "All Bookings" },
              { id: "analytics", icon: BarChart3, label: "Detailed Analytics" },
              { id: "settings", icon: Settings, label: "Platform Settings" },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all whitespace-nowrap lg:whitespace-normal text-[11px] font-bold uppercase tracking-widest
                  ${activeTab === tab.id ? 'bg-[#1a3d2b] text-white shadow-[0_4px_15px_rgb(0,0,0,0.08)]' : 'text-[#1a3d2b]/60 hover:bg-gray-50 hover:text-[#1a3d2b] border border-transparent hover:border-gray-100'}`}
              >
                <tab.icon size={16} />
                {tab.label}
              </motion.button>
            ))}
            
            <div className="hidden lg:block my-4 border-t border-gray-100" />
            
            <button onClick={handleLogout} className="flex items-center w-full gap-4 px-4 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
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
              <div className="space-y-8 max-w-7xl mx-auto" style={{ perspective: 1000 }}>
                <div>
                  <h1 className="font-display text-4xl font-bold text-[#1a3d2b]">Dashboard Overview</h1>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">Real-time metrics for Suvaialaya Events</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {dynamicStats.map((stat, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.02, rotateX: 1, rotateY: -1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_15px_rgb(0,0,0,0.02)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-gray-200 transition-all"
                    >
                      <div className="absolute -right-4 -top-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                        <Leaf size={80} className="text-[#1a3d2b]" />
                      </div>
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">{stat.label}</p>
                          <p className="font-display text-3xl font-bold text-[#1a3d2b] mt-2">{stat.value}</p>
                        </div>
                        <div className="p-3 bg-[#1a3d2b]/5 text-[#1a3d2b] rounded-xl border border-[#1a3d2b]/10">
                          <stat.icon size={20} />
                        </div>
                      </div>
                      <div className="mt-5 flex items-center text-[10px] font-bold uppercase tracking-widest text-[#c9841a] relative z-10">
                        <TrendingUp size={14} className="mr-2" /> {stat.increase} updates
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Bookings Table */}
                <motion.div 
                  whileHover={{ scale: 1.01, rotateX: 1, rotateY: -1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.02)] overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-display font-bold text-xl text-[#1a3d2b]">Recent Bookings</h2>
                    <div className="flex items-center gap-4">
                      <button onClick={handleExportCSV} className="text-[9px] font-bold uppercase tracking-widest text-[#1a3d2b] bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                        Export CSV
                      </button>
                      <button className="text-[9px] font-bold uppercase tracking-widest text-[#c9841a] hover:text-[#1a3d2b] transition-colors">View All &rarr;</button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[9px] text-[#1a3d2b]/50 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 font-bold rounded-tl-xl">Booking ID</th>
                          <th className="px-6 py-4 font-bold">Guest Details</th>
                          <th className="px-6 py-4 font-bold">Contact Info</th>
                          <th className="px-6 py-4 font-bold">Slot</th>
                          <th className="px-6 py-4 font-bold text-center">Pax</th>
                          <th className="px-6 py-4 font-bold">Status</th>
                          <th className="px-6 py-4 font-bold text-right rounded-tr-xl">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bookings.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-[#1a3d2b]/40 font-bold uppercase tracking-widest text-[10px]">
                              No bookings found in database
                            </td>
                          </tr>
                        )}
                        {[...bookings].reverse().slice(0, 10).map((b) => (
                          <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-5 font-bold text-[#1a3d2b]">{b._id.substring(b._id.length - 8).toUpperCase()}</td>
                            <td className="px-6 py-5 text-[#1a3d2b]/80 font-medium">
                              <div>{b.user?.name || b.guestDetails?.fullName || "Guest"}</div>
                              {b.guestDetails?.city && <div className="text-[9px] text-[#1a3d2b]/50 font-bold uppercase tracking-widest mt-0.5">{b.guestDetails.city}</div>}
                            </td>
                            <td className="px-6 py-5 text-[#1a3d2b]/70 text-xs">
                              <div>{b.user?.email || b.guestDetails?.email || "N/A"}</div>
                              <div className="font-bold mt-0.5">{b.guestDetails?.phone || "N/A"}</div>
                            </td>
                            <td className="px-6 py-5 text-[#1a3d2b]/70 text-xs font-bold">{new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {b.slotTime}</td>
                            <td className="px-6 py-5 text-center font-bold text-[#1a3d2b]">{b.numberOfGuests}</td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest
                                ${b.bookingStatus === 'Confirmed' ? 'bg-[#c9841a]/10 text-[#c9841a] border-[#c9841a]/20' : 
                                  b.bookingStatus === 'Pending' ? 'bg-orange-50 text-orange-500 border-orange-100' : 
                                  'bg-red-50 text-red-500 border-red-100'}`}>
                                {b.bookingStatus}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right relative">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="text-[#1a3d2b]/40 hover:text-[#1a3d2b] transition-colors p-2 outline-none">
                                    <MoreVertical size={18} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                                  <DropdownMenuLabel className="text-[#1a3d2b] font-bold uppercase tracking-widest text-[10px]">Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-gray-100" />
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b] focus:bg-gray-50 focus:text-[#1a3d2b] gap-2"
                                    onClick={() => handleUpdateBookingStatus(b._id, 'check-in')}
                                    disabled={b.bookingStatus === 'Checked In' || b.bookingStatus === 'Cancelled'}
                                  >
                                    <CheckSquare size={14} className="text-green-600" /> Mark Checked In
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-red-500 focus:bg-red-50 focus:text-red-600 gap-2"
                                    onClick={() => handleUpdateBookingStatus(b._id, 'cancel')}
                                    disabled={b.bookingStatus === 'Cancelled'}
                                  >
                                    <XCircle size={14} /> Cancel Booking
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="space-y-8 max-w-7xl mx-auto" style={{ perspective: 1000 }}>
                <div>
                  <h1 className="font-display text-4xl font-bold text-[#1a3d2b]">All Bookings</h1>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">Master Ledger</p>
                </div>
                <motion.div 
                  whileHover={{ rotateX: 1, rotateY: -1, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.02)] overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-display font-bold text-xl text-[#1a3d2b]">Complete Ledger</h2>
                    <button onClick={handleExportCSV} className="text-[9px] font-bold uppercase tracking-widest text-[#1a3d2b] bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                      Export Full CSV
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[9px] text-[#1a3d2b]/50 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 font-bold rounded-tl-xl">Booking ID</th>
                          <th className="px-6 py-4 font-bold">Guest Details</th>
                          <th className="px-6 py-4 font-bold">Contact Info</th>
                          <th className="px-6 py-4 font-bold">Slot</th>
                          <th className="px-6 py-4 font-bold text-center">Pax</th>
                          <th className="px-6 py-4 font-bold">Status</th>
                          <th className="px-6 py-4 font-bold text-right rounded-tr-xl">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bookings.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-[#1a3d2b]/40 font-bold uppercase tracking-widest text-[10px]">
                              No bookings found in database
                            </td>
                          </tr>
                        )}
                        {[...bookings].reverse().map((b) => (
                          <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-5 font-bold text-[#1a3d2b]">{b._id.substring(b._id.length - 8).toUpperCase()}</td>
                            <td className="px-6 py-5 text-[#1a3d2b]/80 font-medium">
                              <div>{b.user?.name || b.guestDetails?.fullName || "Guest"}</div>
                              {b.guestDetails?.city && <div className="text-[9px] text-[#1a3d2b]/50 font-bold uppercase tracking-widest mt-0.5">{b.guestDetails.city}</div>}
                            </td>
                            <td className="px-6 py-5 text-[#1a3d2b]/70 text-xs">
                              <div>{b.user?.email || b.guestDetails?.email || "N/A"}</div>
                              <div className="font-bold mt-0.5">{b.guestDetails?.phone || "N/A"}</div>
                            </td>
                            <td className="px-6 py-5 text-[#1a3d2b]/70 text-xs font-bold">{new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {b.slotTime}</td>
                            <td className="px-6 py-5 text-center font-bold text-[#1a3d2b]">{b.numberOfGuests}</td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest
                                ${b.bookingStatus === 'Confirmed' ? 'bg-[#c9841a]/10 text-[#c9841a] border-[#c9841a]/20' : 
                                  b.bookingStatus === 'Pending' ? 'bg-orange-50 text-orange-500 border-orange-100' : 
                                  'bg-red-50 text-red-500 border-red-100'}`}>
                                {b.bookingStatus}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right relative">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="text-[#1a3d2b]/40 hover:text-[#1a3d2b] transition-colors p-2 outline-none">
                                    <MoreVertical size={18} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white border-gray-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                                  <DropdownMenuLabel className="text-[#1a3d2b] font-bold uppercase tracking-widest text-[10px]">Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-gray-100" />
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b] focus:bg-gray-50 focus:text-[#1a3d2b] gap-2"
                                    onClick={() => handleUpdateBookingStatus(b._id, 'check-in')}
                                    disabled={b.bookingStatus === 'Checked In' || b.bookingStatus === 'Cancelled'}
                                  >
                                    <CheckSquare size={14} className="text-green-600" /> Mark Checked In
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-red-500 focus:bg-red-50 focus:text-red-600 gap-2"
                                    onClick={() => handleUpdateBookingStatus(b._id, 'cancel')}
                                    disabled={b.bookingStatus === 'Cancelled'}
                                  >
                                    <XCircle size={14} /> Cancel Booking
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === "events" && (
              <div className="space-y-8 max-w-7xl mx-auto" style={{ perspective: 1000 }}>
                <div>
                  <h1 className="font-display text-4xl font-bold text-[#1a3d2b]">Events & Slots</h1>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">Manage your venue schedule</p>
                </div>
                <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                  {events.length === 0 ? (
                    <div className="col-span-full text-center py-20 border border-dashed border-gray-200 rounded-2xl bg-gray-50">
                      <p className="text-[#1a3d2b]/40 uppercase tracking-widest font-bold text-[10px]">No Events Found</p>
                    </div>
                  ) : (
                    events.map((event) => (
                      <motion.div 
                        key={event._id} 
                        whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_15px_rgb(0,0,0,0.02)] group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                          <CalendarDays size={100} className="text-[#1a3d2b]" />
                        </div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div>
                            <h3 className="font-display text-xl font-bold text-[#1a3d2b]">{event.title}</h3>
                            <p className="text-[10px] uppercase tracking-widest text-[#1a3d2b]/60 mt-1 font-bold">{event.venue}</p>
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-widest bg-[#c9841a]/10 text-[#c9841a] px-3 py-1.5 rounded-full border border-[#c9841a]/20">₹{event.basePrice}</span>
                        </div>
                        <div className="space-y-4 relative z-10">
                          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#1a3d2b]">Manage Schedule</span>
                            <div className="flex gap-2">
                              <button onClick={() => handleAddDate(event)} className="bg-white border border-gray-200 text-[#1a3d2b] text-[9px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest hover:bg-gray-50 shadow-sm flex items-center gap-1">
                                <Plus size={10} /> Date
                              </button>
                              <button onClick={() => handleAddSlot(event)} className="bg-white border border-gray-200 text-[#1a3d2b] text-[9px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest hover:bg-gray-50 shadow-sm flex items-center gap-1">
                                <Plus size={10} /> Slot
                              </button>
                            </div>
                          </div>
                          {event.dates?.map((dateObj: any, index: number) => (
                            <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <div className="font-bold text-[#1a3d2b] text-xs uppercase tracking-widest mb-3 border-b border-gray-100 pb-2 flex justify-between items-center">
                                {new Date(dateObj).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                <button onClick={() => handleRemoveDate(event, dateObj)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors" title="Remove Date">
                                  <XCircle size={14} />
                                </button>
                              </div>
                              <div className="space-y-3">
                                {event.slots?.map((slot: any, slotIdx: number) => {
                                  const booked = slot.booked || 0;
                                  const total = slot.capacity;
                                  const percentage = Math.round((booked / total) * 100);
                                  return (
                                    <div key={slotIdx} className="flex justify-between items-center text-xs group/slot bg-gray-50 p-2 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <button onClick={() => handleRemoveSlot(event, slotIdx)} className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover/slot:opacity-100 p-1 rounded-md hover:bg-red-50">
                                          <XCircle size={12} />
                                        </button>
                                        <span className="font-bold text-[#1a3d2b]">{slot.time}</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                          <div className="h-full bg-[#c9841a]" style={{ width: `${percentage}%` }} />
                                        </div>
                                        <span className="font-bold text-[#1a3d2b] w-12 text-right text-[10px] uppercase tracking-widest">{booked} / {total}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-8 max-w-4xl mx-auto" style={{ perspective: 1000 }}>
                <div>
                  <h1 className="font-display text-4xl font-bold text-[#1a3d2b]">Platform Settings</h1>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">Configure your restaurant platform</p>
                </div>
                <motion.div 
                  whileHover={{ rotateX: 1, rotateY: -1, scale: 1.01 }}
                  className="bg-white border border-gray-100 rounded-2xl p-8 shadow-[0_4px_15px_rgb(0,0,0,0.02)]"
                >
                  <h2 className="font-display text-2xl font-bold text-[#1a3d2b] mb-6">General Information</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Platform Name</label>
                      <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" defaultValue="Suvaialaya Event Management System" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Admin Notification Email</label>
                      <input type="email" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" defaultValue="admin@suvaialaya.com" />
                    </div>
                    <div className="pt-6 border-t border-gray-100">
                      <button className="bg-[#1a3d2b] text-white font-bold uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl hover:bg-[#2d6a4f] transition-colors shadow-md">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === "analytics" && analytics && (
              <div className="space-y-8 max-w-7xl mx-auto" style={{ perspective: 1000 }}>
                <div>
                  <h1 className="font-display text-4xl font-bold text-[#1a3d2b]">Detailed Analytics</h1>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">Comprehensive business intelligence</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Revenue Summary */}
                  <motion.div whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Net Revenue</h3>
                    <p className="font-display text-3xl font-bold text-[#1a3d2b]">₹{(analytics.revenue.netRevenue || 0).toLocaleString("en-IN")}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#1a3d2b]/40 mt-2">Expected: ₹{(analytics.revenue.expected || 0).toLocaleString("en-IN")}</p>
                  </motion.div>
                  
                  {/* Customer Intel */}
                  <motion.div whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Unique Customers</h3>
                    <p className="font-display text-3xl font-bold text-[#1a3d2b]">{analytics.customers.unique || 0}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#1a3d2b]/40 mt-2">Repeat Rate: {analytics.customers.repeatRate || "0%"}</p>
                  </motion.div>
                  
                  {/* Performance Rates */}
                  <motion.div whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Check-in Rate</h3>
                    <p className="font-display text-3xl font-bold text-[#1a3d2b]">{analytics.rates.checkInRate || "0%"}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#1a3d2b]/40 mt-2">No-show: {analytics.rates.noShowRate || "0%"}</p>
                  </motion.div>
                  
                  {/* Volume */}
                  <motion.div whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Total Guests</h3>
                    <p className="font-display text-3xl font-bold text-[#1a3d2b]">{analytics.guests.total || 0}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#1a3d2b]/40 mt-2">Checked In: {analytics.guests.checkedIn || 0}</p>
                  </motion.div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Top Slots */}
                  <motion.div whileHover={{ scale: 1.01, rotateX: 1, rotateY: -1 }} className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.02)] overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                      <h2 className="font-display font-bold text-xl text-[#1a3d2b]">Top Performing Slots</h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {(analytics.slotInsights.slots || []).slice(0, 5).map((slot: any, i: number) => (
                          <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                            <div>
                              <div className="font-bold text-[#1a3d2b] text-xs">{slot._id}</div>
                              <div className="text-[9px] uppercase tracking-widest text-[#1a3d2b]/50 mt-1 font-bold">{slot.bookings} Bookings</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[#c9841a] text-sm">₹{(slot.revenue || 0).toLocaleString("en-IN")}</div>
                              <div className="text-[9px] uppercase tracking-widest text-[#1a3d2b]/50 mt-1 font-bold">{slot.totalGuests} Guests</div>
                            </div>
                          </div>
                        ))}
                        {(!analytics.slotInsights.slots || analytics.slotInsights.slots.length === 0) && (
                          <div className="text-center text-[#1a3d2b]/40 py-4 text-[10px] font-bold uppercase tracking-widest">No slot data available</div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Revenue Trend */}
                  <motion.div whileHover={{ scale: 1.01, rotateX: 1, rotateY: -1 }} className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.02)] overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                      <h2 className="font-display font-bold text-xl text-[#1a3d2b]">Daily Revenue Trend</h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {(analytics.dailyTrend || []).slice(-5).map((day: any, i: number) => (
                          <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                            <div>
                              <div className="font-bold text-[#1a3d2b] text-xs uppercase tracking-widest">{new Date(day._id).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                              <div className="text-[9px] uppercase tracking-widest text-[#1a3d2b]/50 mt-1 font-bold">{day.bookings} Bookings</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[#1a3d2b] text-sm">₹{(day.revenue || 0).toLocaleString("en-IN")}</div>
                              <div className="text-[9px] uppercase tracking-widest text-[#1a3d2b]/50 mt-1 font-bold">{day.guests} Guests</div>
                            </div>
                          </div>
                        ))}
                        {(!analytics.dailyTrend || analytics.dailyTrend.length === 0) && (
                          <div className="text-center text-[#1a3d2b]/40 py-4 text-[10px] font-bold uppercase tracking-widest">No trend data available</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </main>
  );
}
