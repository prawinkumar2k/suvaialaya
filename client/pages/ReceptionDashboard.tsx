import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from "sonner";

export default function ReceptionDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);

  // We could fetch a fresh list on mount, but for a true fallback, we search on demand.
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // In a real production app, we would have a dedicated search endpoint.
      // Here we will use the admin booking list and filter it locally if no search endpoint exists,
      // or rely on a new search API if we build one.
      const res = await axios.get('/api/bookings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const allBookings = res.data.data || [];
      const query = searchQuery.toLowerCase();
      
      const filtered = allBookings.filter((b: any) => 
        b._id.toLowerCase().includes(query) || 
        b.guestDetails?.fullName?.toLowerCase().includes(query) ||
        b.guestDetails?.phone?.includes(query) ||
        b.user?.name?.toLowerCase().includes(query)
      );
      
      setSearchResults(filtered);
      if (filtered.length === 0) {
        toast.error("No bookings found matching that search.");
      }
    } catch (err) {
      toast.error("Failed to search bookings.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualCheckIn = async (bookingId: string) => {
    try {
      const res = await axios.put(`/api/bookings/${bookingId}/check-in`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success) {
        toast.success("Guest successfully checked in!");
        // Update local state to reflect check-in
        setSearchResults(prev => prev.map(b => b._id === bookingId ? { ...b, bookingStatus: 'Attended' } : b));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to check in guest.");
    }
  };

  return (
    <main className="min-h-screen bg-white text-[#1a3d2b] font-sans relative selection:bg-[#c9841a]/30 pb-24">
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none" />
      
      <div className="h-2 w-full bg-gradient-to-r from-[#1a3d2b] via-[#c9841a] to-[#1a3d2b]" />
      
      <header className="sticky top-0 z-50 border-b border-[#1a3d2b]/10 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-[#1a3d2b] hover:text-[#c9841a] transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-display text-xl font-bold text-[#1a3d2b] uppercase tracking-widest">
              Reception Desk <span className="text-[#c9841a] ml-2 text-sm">Fall-back Mode</span>
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 sm:px-8 pt-10 relative z-10" style={{ perspective: "1000px" }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          className="mb-8"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#1a3d2b]/70 mb-2">Emergency Override</p>
          <h2 className="font-display text-3xl font-bold text-[#1a3d2b] mb-4">Manual Guest Search</h2>
          <p className="text-sm font-medium text-[#1a3d2b]/70 max-w-2xl leading-relaxed">
            Use this dashboard if the QR scanner hardware fails or if a customer's phone battery dies. Search by Name, Phone Number, or exact Booking ID.
          </p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-10"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a3d2b]/50" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, phone, or ID..."
              className="w-full h-14 pl-12 pr-4 bg-white border border-[#1a3d2b]/20 shadow-sm rounded-lg text-[#1a3d2b] font-medium focus:outline-none focus:ring-2 focus:ring-[#c9841a] focus:border-transparent transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
            type="submit" 
            disabled={isSearching}
            className="h-14 px-8 bg-[#1a3d2b] text-white font-bold uppercase tracking-widest rounded-lg hover:bg-[#1a3d2b]/90 transition-colors shadow-md disabled:opacity-50 flex items-center justify-center min-w-[140px]"
          >
            {isSearching ? <Loader2 className="animate-spin" size={20} /> : "Search"}
          </motion.button>
        </motion.form>

        {searchResults.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            whileHover={{ scale: 1.01, rotateX: 1, rotateY: -1 }}
            className="bg-white rounded-xl border border-[#1a3d2b]/10 shadow-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#1a3d2b]/5 border-b border-[#1a3d2b]/10">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#1a3d2b]/70 uppercase tracking-widest">Guest Info</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#1a3d2b]/70 uppercase tracking-widest">Slot</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#1a3d2b]/70 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#1a3d2b]/70 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a3d2b]/10">
                  {searchResults.map((booking: any) => (
                    <tr key={booking._id} className="hover:bg-[#1a3d2b]/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-display font-bold text-lg text-[#1a3d2b]">{booking.guestDetails?.fullName || booking.user?.name || "Guest"}</div>
                        <div className="text-xs text-[#1a3d2b]/70 font-semibold mt-1">{booking.guestDetails?.phone || "No Phone"}</div>
                        <div className="text-[10px] text-[#1a3d2b]/50 uppercase tracking-widest mt-1">ID: {booking._id.substring(booking._id.length - 8)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-[#1a3d2b]">{new Date(booking.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                        <div className="text-xs text-[#1a3d2b]/70 mt-1">{booking.slotTime} • {booking.numberOfGuests} Pax</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest border shadow-sm
                          ${booking.bookingStatus === 'Attended' ? 'bg-green-50 text-green-700 border-green-200' : 
                            booking.bookingStatus === 'Confirmed' ? 'bg-[#c9841a]/10 text-[#c9841a] border-[#c9841a]/30' : 
                            'bg-[#1a3d2b]/5 text-[#1a3d2b]/60 border-[#1a3d2b]/20'}`}>
                          {booking.bookingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {booking.bookingStatus === 'Confirmed' ? (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleManualCheckIn(booking._id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#c9841a] text-white rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-[#c9841a]/90 transition-colors shadow-md"
                          >
                            <CheckCircle size={14} /> Check In
                          </motion.button>
                        ) : (
                          <button disabled className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a3d2b]/5 text-[#1a3d2b]/40 rounded-md text-[10px] font-bold uppercase tracking-widest cursor-not-allowed">
                            {booking.bookingStatus}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
