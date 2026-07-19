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
            <Link to="/kitchen" className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary border-2 border-primary/20 px-4 py-2 rounded-md hover:bg-primary/5 transition-all">
              <ChefHat size={16} /> Open Kitchen
            </Link>
            <Link to="/reception" className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary border-2 border-primary/20 px-4 py-2 rounded-md hover:bg-primary/5 transition-all">
              <Users size={16} /> Open Reception
            </Link>
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
                          <th className="px-6 py-4 font-bold">Guest Details</th>
                          <th className="px-6 py-4 font-bold">Contact Info</th>
                          <th className="px-6 py-4 font-bold">Slot</th>
                          <th className="px-6 py-4 font-bold text-center">Pax</th>
                          <th className="px-6 py-4 font-bold">Status</th>
                          <th className="px-6 py-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary/10">
                        {bookings.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-primary/60 font-semibold uppercase tracking-widest text-xs">
                              No bookings found in database
                            </td>
                          </tr>
                        )}
                        {[...bookings].reverse().slice(0, 10).map((b) => (
                          <tr key={b._id} className="hover:bg-primary/5 transition-colors">
                            <td className="px-6 py-5 font-bold text-primary">{b._id.substring(b._id.length - 8).toUpperCase()}</td>
                            <td className="px-6 py-5 text-foreground/80 font-medium">
                              <div>{b.user?.name || b.guestDetails?.fullName || "Guest"}</div>
                              {b.guestDetails?.city && <div className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">{b.guestDetails.city}</div>}
                            </td>
                            <td className="px-6 py-5 text-primary/70 text-xs">
                              <div>{b.user?.email || b.guestDetails?.email || "N/A"}</div>
                              <div className="font-medium mt-0.5">{b.guestDetails?.phone || "N/A"}</div>
                            </td>
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
                            <td className="px-6 py-5 text-right relative">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="text-primary/50 hover:text-primary transition-colors p-2 outline-none">
                                    <MoreVertical size={18} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-background border-primary/20">
                                  <DropdownMenuLabel className="text-primary font-bold uppercase tracking-widest text-[10px]">Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-primary/10" />
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-xs font-semibold text-primary focus:bg-primary/10 focus:text-primary gap-2"
                                    onClick={() => handleUpdateBookingStatus(b._id, 'check-in')}
                                    disabled={b.bookingStatus === 'Checked In' || b.bookingStatus === 'Cancelled'}
                                  >
                                    <CheckSquare size={14} className="text-success" /> Mark Checked In
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-xs font-semibold text-destructive focus:bg-destructive/10 focus:text-destructive gap-2"
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
                </div>
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="space-y-8 max-w-7xl mx-auto">
                <div>
                  <h1 className="font-display text-4xl font-bold text-primary">All Bookings</h1>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-primary/60">Master Ledger</p>
                </div>
                <div className="bg-background border border-primary/20 rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-primary/10 flex justify-between items-center bg-primary/5">
                    <h2 className="font-display font-bold text-xl text-primary">Complete Ledger</h2>
                    <button onClick={handleExportCSV} className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded hover:bg-primary/20 transition-colors">
                      Export Full CSV
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[10px] text-primary/60 uppercase tracking-widest bg-primary/5 border-b border-primary/10">
                        <tr>
                          <th className="px-6 py-4 font-bold">Booking ID</th>
                          <th className="px-6 py-4 font-bold">Guest Details</th>
                          <th className="px-6 py-4 font-bold">Contact Info</th>
                          <th className="px-6 py-4 font-bold">Slot</th>
                          <th className="px-6 py-4 font-bold text-center">Pax</th>
                          <th className="px-6 py-4 font-bold">Status</th>
                          <th className="px-6 py-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary/10">
                        {bookings.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-primary/60 font-semibold uppercase tracking-widest text-xs">
                              No bookings found in database
                            </td>
                          </tr>
                        )}
                        {[...bookings].reverse().map((b) => (
                          <tr key={b._id} className="hover:bg-primary/5 transition-colors">
                            <td className="px-6 py-5 font-bold text-primary">{b._id.substring(b._id.length - 8).toUpperCase()}</td>
                            <td className="px-6 py-5 text-foreground/80 font-medium">
                              <div>{b.user?.name || b.guestDetails?.fullName || "Guest"}</div>
                              {b.guestDetails?.city && <div className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">{b.guestDetails.city}</div>}
                            </td>
                            <td className="px-6 py-5 text-primary/70 text-xs">
                              <div>{b.user?.email || b.guestDetails?.email || "N/A"}</div>
                              <div className="font-medium mt-0.5">{b.guestDetails?.phone || "N/A"}</div>
                            </td>
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
                            <td className="px-6 py-5 text-right relative">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="text-primary/50 hover:text-primary transition-colors p-2 outline-none">
                                    <MoreVertical size={18} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-background border-primary/20">
                                  <DropdownMenuLabel className="text-primary font-bold uppercase tracking-widest text-[10px]">Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-primary/10" />
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-xs font-semibold text-primary focus:bg-primary/10 focus:text-primary gap-2"
                                    onClick={() => handleUpdateBookingStatus(b._id, 'check-in')}
                                    disabled={b.bookingStatus === 'Checked In' || b.bookingStatus === 'Cancelled'}
                                  >
                                    <CheckSquare size={14} className="text-success" /> Mark Checked In
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="cursor-pointer text-xs font-semibold text-destructive focus:bg-destructive/10 focus:text-destructive gap-2"
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
                </div>
              </div>
            )}

            {activeTab === "events" && (
              <div className="space-y-8 max-w-7xl mx-auto">
                <div>
                  <h1 className="font-display text-4xl font-bold text-primary">Events & Slots</h1>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-primary/60">Manage your venue schedule</p>
                </div>
                <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                  {events.length === 0 ? (
                    <div className="col-span-full text-center py-20 border border-dashed border-primary/20 rounded-xl bg-primary/5">
                      <p className="text-primary/60 uppercase tracking-widest font-bold">No Events Found</p>
                    </div>
                  ) : (
                    events.map((event) => (
                      <div key={event._id} className="bg-background border border-primary/20 rounded-xl p-6 shadow-sm group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                          <CalendarDays size={80} className="text-primary" />
                        </div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div>
                            <h3 className="font-display text-xl font-bold text-primary">{event.title}</h3>
                            <p className="text-[10px] uppercase tracking-widest text-primary/60 mt-1">{event.venue}</p>
                          </div>
                          <span className="text-xs font-bold bg-accent/20 text-accent px-2 py-1 rounded">₹{event.basePrice}</span>
                        </div>
                        <div className="space-y-4 relative z-10">
                          <div className="flex justify-between items-center bg-primary/10 p-2 rounded-lg mb-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">Manage Schedule</span>
                            <div className="flex gap-2">
                              <button onClick={() => handleAddDate(event)} className="bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest hover:bg-primary/90 flex items-center gap-1">
                                <Plus size={12} /> Date
                              </button>
                              <button onClick={() => handleAddSlot(event)} className="bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest hover:bg-primary/90 flex items-center gap-1">
                                <Plus size={12} /> Slot
                              </button>
                            </div>
                          </div>
                          {event.dates?.map((dateObj: any, index: number) => (
                            <div key={index} className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                              <div className="font-bold text-primary mb-2 border-b border-primary/10 pb-2 flex justify-between items-center">
                                {new Date(dateObj).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                <button onClick={() => handleRemoveDate(event, dateObj)} className="text-xs text-destructive hover:bg-destructive/10 p-1 rounded transition-colors" title="Remove Date">
                                  <XCircle size={14} />
                                </button>
                              </div>
                              <div className="space-y-2">
                                {event.slots?.map((slot: any, slotIdx: number) => {
                                  const booked = slot.booked || 0;
                                  const total = slot.capacity;
                                  const percentage = Math.round((booked / total) * 100);
                                  return (
                                    <div key={slotIdx} className="flex justify-between items-center text-xs group/slot">
                                      <div className="flex items-center gap-2">
                                        <button onClick={() => handleRemoveSlot(event, slotIdx)} className="text-destructive/50 hover:text-destructive transition-colors opacity-0 group-hover/slot:opacity-100 p-0.5 rounded hover:bg-destructive/10">
                                          <XCircle size={12} />
                                        </button>
                                        <span className="text-primary/70">{slot.time}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-20 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                                          <div className="h-full bg-accent" style={{ width: `${percentage}%` }} />
                                        </div>
                                        <span className="font-bold text-primary w-12 text-right">{booked} / {total}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-8 max-w-4xl mx-auto">
                <div>
                  <h1 className="font-display text-4xl font-bold text-primary">Platform Settings</h1>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-primary/60">Configure your restaurant platform</p>
                </div>
                <div className="bg-background border border-primary/20 rounded-xl p-8 shadow-sm">
                  <h2 className="font-display text-2xl font-bold text-primary mb-6">General Information</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-primary/70 mb-2">Platform Name</label>
                      <input type="text" className="w-full border border-primary/20 rounded-md px-4 py-3 bg-primary/5 focus:outline-none focus:border-accent text-primary font-medium" defaultValue="Suvaialaya Event Management System" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-primary/70 mb-2">Admin Notification Email</label>
                      <input type="email" className="w-full border border-primary/20 rounded-md px-4 py-3 bg-primary/5 focus:outline-none focus:border-accent text-primary font-medium" defaultValue="admin@suvaialaya.com" />
                    </div>
                    <div className="pt-4 border-t border-primary/10">
                      <button className="bg-primary text-primary-foreground font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-md hover:bg-primary/90 transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analytics" && analytics && (
              <div className="space-y-8 max-w-7xl mx-auto">
                <div>
                  <h1 className="font-display text-4xl font-bold text-primary">Detailed Analytics</h1>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-primary/60">Comprehensive business intelligence</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Revenue Summary */}
                  <div className="bg-background border border-primary/20 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Net Revenue</h3>
                    <p className="font-display text-3xl font-bold text-primary">₹{(analytics.revenue.netRevenue || 0).toLocaleString("en-IN")}</p>
                    <p className="text-xs font-semibold text-primary/50 mt-2">Expected: ₹{(analytics.revenue.expected || 0).toLocaleString("en-IN")}</p>
                  </div>
                  
                  {/* Customer Intel */}
                  <div className="bg-background border border-primary/20 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Unique Customers</h3>
                    <p className="font-display text-3xl font-bold text-primary">{analytics.customers.unique || 0}</p>
                    <p className="text-xs font-semibold text-primary/50 mt-2">Repeat Rate: {analytics.customers.repeatRate || "0%"}</p>
                  </div>
                  
                  {/* Performance Rates */}
                  <div className="bg-background border border-primary/20 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Check-in Rate</h3>
                    <p className="font-display text-3xl font-bold text-primary">{analytics.rates.checkInRate || "0%"}</p>
                    <p className="text-xs font-semibold text-primary/50 mt-2">No-show: {analytics.rates.noShowRate || "0%"}</p>
                  </div>
                  
                  {/* Volume */}
                  <div className="bg-background border border-primary/20 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Total Guests</h3>
                    <p className="font-display text-3xl font-bold text-primary">{analytics.guests.total || 0}</p>
                    <p className="text-xs font-semibold text-primary/50 mt-2">Checked In: {analytics.guests.checkedIn || 0}</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Top Slots */}
                  <div className="bg-background border border-primary/20 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-primary/10 bg-primary/5">
                      <h2 className="font-display font-bold text-xl text-primary">Top Performing Slots</h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {(analytics.slotInsights.slots || []).slice(0, 5).map((slot: any, i: number) => (
                          <div key={i} className="flex items-center justify-between border-b border-primary/5 pb-2 last:border-0 last:pb-0">
                            <div>
                              <div className="font-bold text-primary">{slot._id}</div>
                              <div className="text-[10px] uppercase tracking-widest text-primary/60">{slot.bookings} Bookings</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-accent">₹{(slot.revenue || 0).toLocaleString("en-IN")}</div>
                              <div className="text-[10px] uppercase tracking-widest text-primary/60">{slot.totalGuests} Guests</div>
                            </div>
                          </div>
                        ))}
                        {(!analytics.slotInsights.slots || analytics.slotInsights.slots.length === 0) && (
                          <div className="text-center text-primary/50 py-4 text-xs font-bold uppercase tracking-widest">No slot data available</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Revenue Trend */}
                  <div className="bg-background border border-primary/20 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-primary/10 bg-primary/5">
                      <h2 className="font-display font-bold text-xl text-primary">Daily Revenue Trend</h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {(analytics.dailyTrend || []).slice(-5).map((day: any, i: number) => (
                          <div key={i} className="flex items-center justify-between border-b border-primary/5 pb-2 last:border-0 last:pb-0">
                            <div>
                              <div className="font-bold text-primary">{new Date(day._id).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                              <div className="text-[10px] uppercase tracking-widest text-primary/60">{day.bookings} Bookings</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-primary">₹{(day.revenue || 0).toLocaleString("en-IN")}</div>
                              <div className="text-[10px] uppercase tracking-widest text-primary/60">{day.guests} Guests</div>
                            </div>
                          </div>
                        ))}
                        {(!analytics.dailyTrend || analytics.dailyTrend.length === 0) && (
                          <div className="text-center text-primary/50 py-4 text-xs font-bold uppercase tracking-widest">No trend data available</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </main>
  );
}
