import React, { useState } from "react";
import { X, Plus, Save, Trash2, Calendar, Clock, ChevronLeft } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export const EventEditor = ({ event, token, onUpdate, onCancel }: { event: any, token: string, onUpdate: (newEvent: any) => void, onCancel: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: event.title || "",
    venue: event.venue || "",
    basePrice: event.basePrice || 0,
    isActive: event.isActive ?? true,
    description: event.description || ""
  });

  const [dates, setDates] = useState<string[]>(event.dates || []);
  const [slots, setSlots] = useState<{time: string, capacity: number}[]>(event.slots || []);

  const [newDate, setNewDate] = useState("");
  const [newSlotTime, setNewSlotTime] = useState("");
  const [newSlotCapacity, setNewSlotCapacity] = useState("70");

  const handleSaveBasicInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.put(`/api/events/${event._id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast.success("Event details updated!");
        onUpdate(res.data.data);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDate = async () => {
    if (!newDate) return;
    if (dates.includes(newDate)) {
      toast.error("Date already exists");
      return;
    }
    const updatedDates = [...dates, newDate].sort();
    try {
      const res = await axios.put(`/api/events/${event._id}`, { dates: updatedDates }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setDates(updatedDates);
        setNewDate("");
        toast.success("Date added");
        onUpdate(res.data.data);
      }
    } catch (e: any) {
      toast.error("Failed to add date");
    }
  };

  const handleRemoveDate = async (dateToRemove: string) => {
    const updatedDates = dates.filter(d => d !== dateToRemove);
    try {
      const res = await axios.put(`/api/events/${event._id}`, { dates: updatedDates }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setDates(updatedDates);
        toast.success("Date removed");
        onUpdate(res.data.data);
      }
    } catch (e: any) {
      toast.error("Failed to remove date");
    }
  };

  const handleAddSlot = async () => {
    if (!newSlotTime || !newSlotCapacity) return;
    const capacity = parseInt(newSlotCapacity);
    if (isNaN(capacity) || capacity <= 0) {
      toast.error("Invalid capacity");
      return;
    }
    const updatedSlots = [...slots, { time: newSlotTime, capacity }];
    try {
      const res = await axios.put(`/api/events/${event._id}`, { slots: updatedSlots }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setSlots(updatedSlots);
        setNewSlotTime("");
        toast.success("Slot added");
        onUpdate(res.data.data);
      }
    } catch (e: any) {
      toast.error("Failed to add slot");
    }
  };

  const handleRemoveSlot = async (index: number) => {
    const updatedSlots = slots.filter((_, i) => i !== index);
    try {
      const res = await axios.put(`/api/events/${event._id}`, { slots: updatedSlots }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setSlots(updatedSlots);
        toast.success("Slot removed");
        onUpdate(res.data.data);
      }
    } catch (e: any) {
      toast.error("Failed to remove slot");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full mx-auto">
      <div className="bg-[#1a3d2b] p-6 text-white flex justify-between items-center">
        <div>
          <button onClick={onCancel} className="text-white/70 hover:text-white flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mb-2 transition-colors">
            <ChevronLeft size={14} /> Back to Events List
          </button>
          <h2 className="font-display text-2xl font-bold">Edit Event: {event.title}</h2>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="font-bold text-[#1a3d2b] uppercase tracking-widest text-xs flex items-center gap-2">
              <Calendar size={14} /> Basic Details
            </h3>
            <button 
              onClick={handleSaveBasicInfo}
              disabled={loading}
              className="bg-[#c9841a] hover:bg-[#b07214] text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <Save size={14} /> {loading ? "Saving..." : "Save Details"}
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-[#1a3d2b]/60 uppercase tracking-widest mb-1 block">Event Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 rounded-xl border border-gray-100 text-sm font-bold text-[#1a3d2b] focus:outline-none focus:border-[#c9841a] bg-gray-50"/>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#1a3d2b]/60 uppercase tracking-widest mb-1 block">Venue</label>
              <input type="text" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} className="w-full p-3 rounded-xl border border-gray-100 text-sm font-bold text-[#1a3d2b] focus:outline-none focus:border-[#c9841a] bg-gray-50"/>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#1a3d2b]/60 uppercase tracking-widest mb-1 block">Base Price (₹)</label>
              <input type="number" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: parseInt(e.target.value) || 0})} className="w-full p-3 rounded-xl border border-gray-100 text-sm font-bold text-[#1a3d2b] focus:outline-none focus:border-[#c9841a] bg-gray-50"/>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-[#1a3d2b] uppercase tracking-widest text-xs flex items-center gap-2 border-b border-gray-100 pb-3 mb-5">
              <Calendar size={14} /> Available Dates
            </h3>
            <div className="flex gap-2 mb-5">
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="flex-1 min-w-0 p-3 rounded-xl border border-gray-100 text-sm font-bold text-[#1a3d2b] focus:outline-none focus:border-[#c9841a] shadow-sm"/>
              <button onClick={handleAddDate} className="shrink-0 whitespace-nowrap bg-[#1a3d2b] hover:bg-[#2d6a4f] text-white px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-md flex items-center gap-2">
                <Plus size={14} /> Add Date
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {dates.map((dateStr) => (
                <div key={dateStr} className="bg-white border border-gray-200 px-3 py-2 rounded-xl flex items-center gap-2 shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:border-[#c9841a] transition-all group">
                  <span className="text-xs font-bold text-[#1a3d2b]">{new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <button onClick={() => handleRemoveDate(dateStr)} className="text-red-400 hover:text-red-600 p-0.5 rounded-md hover:bg-red-50 transition-colors"><X size={12} /></button>
                </div>
              ))}
              {dates.length === 0 && <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">No dates added yet.</p>}
            </div>
          </div>

          <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-[#1a3d2b] uppercase tracking-widest text-xs flex items-center gap-2 border-b border-gray-100 pb-3 mb-5">
              <Clock size={14} /> Daily Time Slots
            </h3>
            <div className="flex gap-2 mb-5">
              <input type="text" placeholder="10:00 AM" value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} className="flex-[2] min-w-0 p-3 rounded-xl border border-gray-100 text-sm font-bold text-[#1a3d2b] focus:outline-none focus:border-[#c9841a] shadow-sm"/>
              <input type="number" placeholder="Cap" value={newSlotCapacity} onChange={e => setNewSlotCapacity(e.target.value)} className="flex-[1] min-w-0 p-3 rounded-xl border border-gray-100 text-sm font-bold text-[#1a3d2b] focus:outline-none focus:border-[#c9841a] shadow-sm"/>
              <button onClick={handleAddSlot} className="shrink-0 whitespace-nowrap bg-[#1a3d2b] hover:bg-[#2d6a4f] text-white px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-md flex items-center gap-2">
                <Plus size={14} /> Add Slot
              </button>
            </div>
            <div className="space-y-2">
              {slots.map((slot, idx) => (
                <div key={idx} className="bg-white border border-gray-100 px-4 py-3 rounded-xl flex items-center justify-between shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                  <span className="text-sm font-bold text-[#1a3d2b]">{slot.time}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">Cap: {slot.capacity}</span>
                    <button onClick={() => handleRemoveSlot(idx)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {slots.length === 0 && <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">No time slots added yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
