import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export function SystemSettingsCMS() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("/api/settings")
      .then(res => {
        if (res.data.success) {
          setSettings(res.data.data);
        }
      })
      .catch(err => {
        toast.error("Failed to load settings");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put("/api/settings", settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Settings updated successfully");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section: string, field: string, value: string) => {
    if (section === "root") {
      setSettings((prev: any) => ({ ...prev, [field]: value }));
    } else {
      setSettings((prev: any) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a3d2b]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <h2 className="font-display text-2xl font-bold text-[#1a3d2b] mb-6">General Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Platform / Event Name</label>
          <input 
            type="text" 
            value={settings.festival?.name || ""} 
            onChange={(e) => handleChange("festival", "name", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Restaurant Name</label>
          <input 
            type="text" 
            value={settings.festival?.restaurantName || ""} 
            onChange={(e) => handleChange("festival", "restaurantName", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Tagline</label>
          <input 
            type="text" 
            value={settings.festival?.tagline || ""} 
            onChange={(e) => handleChange("festival", "tagline", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Eyebrow Text</label>
          <input 
            type="text" 
            value={settings.festival?.eyebrow || ""} 
            onChange={(e) => handleChange("festival", "eyebrow", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Description</label>
          <textarea 
            value={settings.festival?.description || ""} 
            onChange={(e) => handleChange("festival", "description", e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Venue Address</label>
          <input 
            type="text" 
            value={settings.festival?.venue || ""} 
            onChange={(e) => handleChange("festival", "venue", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Contact Phone</label>
          <input 
            type="text" 
            value={settings.contactPhone || ""} 
            onChange={(e) => handleChange("root", "contactPhone", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
          />
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1a3d2b] text-white font-bold uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl hover:bg-[#2d6a4f] transition-colors shadow-md flex items-center gap-2"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
