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

  const handleLandingArrayChange = (field: string, index: number, key: string, value: string, section: string = "landing") => {
    setSettings((prev: any) => {
      const newArray = [...(prev[section]?.[field] || [])];
      newArray[index] = { ...newArray[index], [key]: value };
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray
        }
      };
    });
  };

  const addLandingArrayItem = (field: string, defaultItem: any, section: string = "landing") => {
    setSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...(prev[section]?.[field] || []), defaultItem]
      }
    }));
  };

  const removeLandingArrayItem = (field: string, index: number, section: string = "landing") => {
    setSettings((prev: any) => {
      const newArray = [...(prev[section]?.[field] || [])];
      newArray.splice(index, 1);
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray
        }
      };
    });
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
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Event Dates</label>
          <input 
            type="text" 
            value={settings.festival?.dates || ""} 
            onChange={(e) => handleChange("festival", "dates", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
            placeholder="e.g. August 7, 8 & 9, 2026"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Event Hours</label>
          <input 
            type="text" 
            value={settings.festival?.hours || ""} 
            onChange={(e) => handleChange("festival", "hours", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
            placeholder="e.g. 11 AM - 11 PM"
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

      <div className="pt-8 mt-8 border-t border-gray-100">
        <h2 className="font-display text-2xl font-bold text-[#1a3d2b] mb-6">Landing Page Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Eyebrow (e.g. From Madurai · To Bangalore)</label>
            <input 
              type="text" 
              value={settings.landing?.heroEyebrow || ""} 
              onChange={(e) => handleChange("landing", "heroEyebrow", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Title (Use \n for new lines)</label>
            <textarea 
              value={settings.landing?.heroTitle || ""} 
              onChange={(e) => handleChange("landing", "heroTitle", e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs whitespace-pre-wrap" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Description</label>
            <textarea 
              value={settings.landing?.heroDescription || ""} 
              onChange={(e) => handleChange("landing", "heroDescription", e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
            />
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#1a3d2b] text-sm">Hero Statistics</h3>
            <button onClick={() => addLandingArrayItem("stats", { value: "", label: "" })} className="text-[10px] font-bold uppercase tracking-widest text-[#c9841a] hover:text-[#1a3d2b] transition-colors">
              + Add Stat
            </button>
          </div>
          <div className="space-y-3">
            {(settings.landing?.stats || []).map((stat: any, index: number) => (
              <div key={index} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <input 
                  type="text" placeholder="Value (e.g. 500+)" value={stat.value} onChange={(e) => handleLandingArrayChange("stats", index, "value", e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs" 
                />
                <input 
                  type="text" placeholder="Label (e.g. Guests Daily)" value={stat.label} onChange={(e) => handleLandingArrayChange("stats", index, "label", e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs" 
                />
                <button onClick={() => removeLandingArrayItem("stats", index)} className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 bg-red-50 rounded-md">Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#1a3d2b] text-sm">Special Combos / Best Value</h3>
            <button onClick={() => addLandingArrayItem("specials", { name: "", price: "", tag: "", desc: "" })} className="text-[10px] font-bold uppercase tracking-widest text-[#c9841a] hover:text-[#1a3d2b] transition-colors">
              + Add Special
            </button>
          </div>
          <div className="space-y-4">
            {(settings.landing?.specials || []).map((special: any, index: number) => (
              <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100">
                <input 
                  type="text" placeholder="Name" value={special.name} onChange={(e) => handleLandingArrayChange("specials", index, "name", e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs col-span-2 md:col-span-1" 
                />
                <input 
                  type="text" placeholder="Price (e.g. ₹399)" value={special.price} onChange={(e) => handleLandingArrayChange("specials", index, "price", e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs" 
                />
                <input 
                  type="text" placeholder="Tag (e.g. Signature)" value={special.tag} onChange={(e) => handleLandingArrayChange("specials", index, "tag", e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs" 
                />
                <textarea 
                  placeholder="Description" value={special.desc} onChange={(e) => handleLandingArrayChange("specials", index, "desc", e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs col-span-2 md:col-span-3" rows={2}
                />
                <div className="col-span-2 md:col-span-1 flex justify-end items-end h-full">
                  <button onClick={() => removeLandingArrayItem("specials", index)} className="text-red-500 hover:text-red-700 text-xs font-bold px-3 py-2 bg-red-50 rounded-md w-full">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-8 mt-8 border-t border-gray-100">
        <h2 className="font-display text-2xl font-bold text-[#1a3d2b] mb-6">Menu Page Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Eyebrow (e.g. The Official Menu)</label>
            <input 
              type="text" 
              value={settings.menuPage?.heroEyebrow || ""} 
              onChange={(e) => handleChange("menuPage", "heroEyebrow", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Title (Use \n for new lines)</label>
            <textarea 
              value={settings.menuPage?.heroTitle || ""} 
              onChange={(e) => handleChange("menuPage", "heroTitle", e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs whitespace-pre-wrap" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Description</label>
            <textarea 
              value={settings.menuPage?.heroDescription || ""} 
              onChange={(e) => handleChange("menuPage", "heroDescription", e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
            />
          </div>
        </div>

        {/* Welcome Items Array Editor */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#1a3d2b] text-sm">Welcome Experience Items</h3>
            <button 
              onClick={() => {
                setSettings((prev: any) => ({
                  ...prev,
                  welcomeItems: [...(prev.welcomeItems || []), { name: "", detail: "" }]
                }));
              }} 
              className="text-[10px] font-bold uppercase tracking-widest text-[#c9841a] hover:text-[#1a3d2b] transition-colors"
            >
              + Add Item
            </button>
          </div>
          <div className="space-y-3">
            {(settings.welcomeItems || []).map((item: any, index: number) => (
              <div key={index} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <input 
                  type="text" placeholder="Name (e.g. Vethalai Paaku)" value={item.name} 
                  onChange={(e) => {
                    const newArr = [...settings.welcomeItems];
                    newArr[index].name = e.target.value;
                    setSettings((prev: any) => ({ ...prev, welcomeItems: newArr }));
                  }}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs" 
                />
                <input 
                  type="text" placeholder="Detail (e.g. Traditional Welcome)" value={item.detail} 
                  onChange={(e) => {
                    const newArr = [...settings.welcomeItems];
                    newArr[index].detail = e.target.value;
                    setSettings((prev: any) => ({ ...prev, welcomeItems: newArr }));
                  }}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs" 
                />
                <button 
                  onClick={() => {
                    const newArr = [...settings.welcomeItems];
                    newArr.splice(index, 1);
                    setSettings((prev: any) => ({ ...prev, welcomeItems: newArr }));
                  }} 
                  className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 bg-red-50 rounded-md"
                >Remove</button>
              </div>
            ))}
          </div>
        </div>

        {/* Return Gifts Array Editor */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#1a3d2b] text-sm">Return Gifts</h3>
            <button 
              onClick={() => {
                setSettings((prev: any) => ({
                  ...prev,
                  returnGifts: [...(prev.returnGifts || []), { name: "", detail: "" }]
                }));
              }} 
              className="text-[10px] font-bold uppercase tracking-widest text-[#c9841a] hover:text-[#1a3d2b] transition-colors"
            >
              + Add Gift
            </button>
          </div>
          <div className="space-y-3">
            {(settings.returnGifts || []).map((item: any, index: number) => (
              <div key={index} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <input 
                  type="text" placeholder="Name" value={item.name} 
                  onChange={(e) => {
                    const newArr = [...settings.returnGifts];
                    newArr[index].name = e.target.value;
                    setSettings((prev: any) => ({ ...prev, returnGifts: newArr }));
                  }}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs" 
                />
                <input 
                  type="text" placeholder="Detail" value={item.detail} 
                  onChange={(e) => {
                    const newArr = [...settings.returnGifts];
                    newArr[index].detail = e.target.value;
                    setSettings((prev: any) => ({ ...prev, returnGifts: newArr }));
                  }}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs" 
                />
                <button 
                  onClick={() => {
                    const newArr = [...settings.returnGifts];
                    newArr.splice(index, 1);
                    setSettings((prev: any) => ({ ...prev, returnGifts: newArr }));
                  }} 
                  className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 bg-red-50 rounded-md"
                >Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-8 mt-8 border-t border-gray-100">
        <h2 className="font-display text-2xl font-bold text-[#1a3d2b] mb-6">Gallery Page Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Eyebrow (e.g. Gallery)</label>
            <input 
              type="text" 
              value={settings.galleryPage?.heroEyebrow || ""} 
              onChange={(e) => handleChange("galleryPage", "heroEyebrow", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Title</label>
            <textarea 
              value={settings.galleryPage?.heroTitle || ""} 
              onChange={(e) => handleChange("galleryPage", "heroTitle", e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Description</label>
            <textarea 
              value={settings.galleryPage?.heroDescription || ""} 
              onChange={(e) => handleChange("galleryPage", "heroDescription", e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
            />
          </div>
        </div>

        {/* Gallery Images Array Editor */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#1a3d2b] text-sm">Gallery Images</h3>
            <button 
              onClick={() => addLandingArrayItem("images", { src: "", alt: "", className: "col-span-1 row-span-1" }, "galleryPage")} 
              className="text-[10px] font-bold uppercase tracking-widest text-[#c9841a] hover:text-[#1a3d2b] transition-colors"
            >
              + Add Image
            </button>
          </div>
          <div className="space-y-4">
            {(settings.galleryPage?.images || []).map((img: any, index: number) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100">
                <input 
                  type="text" placeholder="Image URL (src)" value={img.src} 
                  onChange={(e) => handleLandingArrayChange("images", index, "src", e.target.value, "galleryPage")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs md:col-span-2" 
                />
                <input 
                  type="text" placeholder="Alt text" value={img.alt} 
                  onChange={(e) => handleLandingArrayChange("images", index, "alt", e.target.value, "galleryPage")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs" 
                />
                <select
                  value={img.className || "col-span-1 row-span-1"}
                  onChange={(e) => handleLandingArrayChange("images", index, "className", e.target.value, "galleryPage")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs"
                >
                  <option value="col-span-1 row-span-1">Small (1x1)</option>
                  <option value="col-span-2 row-span-1">Wide (2x1)</option>
                  <option value="col-span-1 row-span-2">Tall (1x2)</option>
                  <option value="col-span-2 row-span-2">Large (2x2)</option>
                </select>
                <div className="md:col-span-4 flex justify-end">
                  <button onClick={() => removeLandingArrayItem("images", index, "galleryPage")} className="text-red-500 hover:text-red-700 text-xs font-bold px-3 py-2 bg-red-50 rounded-md">Remove Image</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-8 mt-8 border-t border-gray-100">
        <h2 className="font-display text-2xl font-bold text-[#1a3d2b] mb-6">About Page Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Eyebrow (e.g. Our Story)</label>
            <input 
              type="text" 
              value={settings.aboutPage?.heroEyebrow || ""} 
              onChange={(e) => handleChange("aboutPage", "heroEyebrow", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Title</label>
            <textarea 
              value={settings.aboutPage?.heroTitle || ""} 
              onChange={(e) => handleChange("aboutPage", "heroTitle", e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Description Paragraph 1</label>
            <textarea 
              value={settings.aboutPage?.heroDescription1 || ""} 
              onChange={(e) => handleChange("aboutPage", "heroDescription1", e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Description Paragraph 2</label>
            <textarea 
              value={settings.aboutPage?.heroDescription2 || ""} 
              onChange={(e) => handleChange("aboutPage", "heroDescription2", e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
            />
          </div>
        </div>

        {/* About Features Array Editor */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#1a3d2b] text-sm">About Features</h3>
            <button 
              onClick={() => addLandingArrayItem("features", { iconName: "ChefHat", title: "", desc: "" }, "aboutPage")} 
              className="text-[10px] font-bold uppercase tracking-widest text-[#c9841a] hover:text-[#1a3d2b] transition-colors"
            >
              + Add Feature
            </button>
          </div>
          <div className="space-y-4">
            {(settings.aboutPage?.features || []).map((feature: any, index: number) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100">
                <select
                  value={feature.iconName || "ChefHat"}
                  onChange={(e) => handleLandingArrayChange("features", index, "iconName", e.target.value, "aboutPage")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs"
                >
                  <option value="ChefHat">ChefHat</option>
                  <option value="Leaf">Leaf</option>
                  <option value="Users">Users</option>
                  <option value="Heart">Heart</option>
                  <option value="MapPin">MapPin</option>
                </select>
                <input 
                  type="text" placeholder="Title" value={feature.title} 
                  onChange={(e) => handleLandingArrayChange("features", index, "title", e.target.value, "aboutPage")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs md:col-span-2" 
                />
                <textarea 
                  placeholder="Description" value={feature.desc} 
                  onChange={(e) => handleLandingArrayChange("features", index, "desc", e.target.value, "aboutPage")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs md:col-span-3" rows={2}
                />
                <div className="md:col-span-3 flex justify-end">
                  <button onClick={() => removeLandingArrayItem("features", index, "aboutPage")} className="text-red-500 hover:text-red-700 text-xs font-bold px-3 py-2 bg-red-50 rounded-md">Remove Feature</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-8 mt-8 border-t border-gray-100">
        <h2 className="font-display text-2xl font-bold text-[#1a3d2b] mb-6">FAQ Page Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Eyebrow</label>
            <input 
              type="text" 
              value={settings.faqPage?.heroEyebrow || ""} 
              onChange={(e) => handleChange("faqPage", "heroEyebrow", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Title</label>
            <textarea 
              value={settings.faqPage?.heroTitle || ""} 
              onChange={(e) => handleChange("faqPage", "heroTitle", e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
            />
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#1a3d2b] text-sm">FAQ Categories</h3>
            <button 
              onClick={() => addLandingArrayItem("categories", { name: "New Category", items: [] }, "faqPage")} 
              className="text-[10px] font-bold uppercase tracking-widest text-[#c9841a] hover:text-[#1a3d2b] transition-colors"
            >
              + Add Category
            </button>
          </div>
          <div className="space-y-6">
            {(settings.faqPage?.categories || []).map((cat: any, catIndex: number) => (
              <div key={catIndex} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <input 
                    type="text" placeholder="Category Name" value={cat.name} 
                    onChange={(e) => handleLandingArrayChange("categories", catIndex, "name", e.target.value, "faqPage")}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-[#1a3d2b]" 
                  />
                  <button onClick={() => removeLandingArrayItem("categories", catIndex, "faqPage")} className="text-red-500 hover:text-red-700 text-xs font-bold px-3 py-2 bg-red-50 rounded-md">Remove Category</button>
                </div>
                
                <div className="space-y-3 pl-4 border-l-2 border-gray-200 ml-2">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">Questions</p>
                    <button 
                      onClick={() => {
                        const newCats = [...settings.faqPage.categories];
                        if (!newCats[catIndex].items) newCats[catIndex].items = [];
                        newCats[catIndex].items.push({ q: "", a: "" });
                        setSettings((prev: any) => ({ ...prev, faqPage: { ...prev.faqPage, categories: newCats } }));
                      }} 
                      className="text-[10px] font-bold uppercase tracking-widest text-[#c9841a] hover:text-[#1a3d2b]"
                    >
                      + Add Question
                    </button>
                  </div>
                  
                  {(cat.items || []).map((item: any, qIndex: number) => (
                    <div key={qIndex} className="flex gap-4 items-start bg-white p-3 rounded-lg border border-gray-100">
                      <div className="flex-1 space-y-2">
                        <input 
                          type="text" placeholder="Question" value={item.q} 
                          onChange={(e) => {
                            const newCats = [...settings.faqPage.categories];
                            newCats[catIndex].items[qIndex].q = e.target.value;
                            setSettings((prev: any) => ({ ...prev, faqPage: { ...prev.faqPage, categories: newCats } }));
                          }}
                          className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs" 
                        />
                        <textarea 
                          placeholder="Answer" value={item.a} rows={2}
                          onChange={(e) => {
                            const newCats = [...settings.faqPage.categories];
                            newCats[catIndex].items[qIndex].a = e.target.value;
                            setSettings((prev: any) => ({ ...prev, faqPage: { ...prev.faqPage, categories: newCats } }));
                          }}
                          className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs" 
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const newCats = [...settings.faqPage.categories];
                          newCats[catIndex].items.splice(qIndex, 1);
                          setSettings((prev: any) => ({ ...prev, faqPage: { ...prev.faqPage, categories: newCats } }));
                        }} 
                        className="text-red-500 hover:text-red-700 text-xs px-2 py-1 bg-red-50 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-8 mt-8 border-t border-gray-100">
        <h2 className="font-display text-2xl font-bold text-[#1a3d2b] mb-6">Contact Page Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Eyebrow</label>
            <input 
              type="text" 
              value={settings.contactPage?.heroEyebrow || ""} 
              onChange={(e) => handleChange("contactPage", "heroEyebrow", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Title</label>
            <textarea 
              value={settings.contactPage?.heroTitle || ""} 
              onChange={(e) => handleChange("contactPage", "heroTitle", e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" 
            />
          </div>
        </div>
        
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#1a3d2b] text-sm">Contact Info Cards</h3>
            <button 
              onClick={() => addLandingArrayItem("info", { iconName: "Phone", label: "", value: "", sub: "" }, "contactPage")} 
              className="text-[10px] font-bold uppercase tracking-widest text-[#c9841a] hover:text-[#1a3d2b] transition-colors"
            >
              + Add Info
            </button>
          </div>
          <div className="space-y-4">
            {(settings.contactPage?.info || []).map((infoBlock: any, index: number) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100">
                <select
                  value={infoBlock.iconName || "Phone"}
                  onChange={(e) => handleLandingArrayChange("info", index, "iconName", e.target.value, "contactPage")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs"
                >
                  <option value="Phone">Phone</option>
                  <option value="Mail">Mail</option>
                  <option value="MapPin">MapPin</option>
                  <option value="Clock">Clock</option>
                </select>
                <input 
                  type="text" placeholder="Label (e.g. Phone)" value={infoBlock.label} 
                  onChange={(e) => handleLandingArrayChange("info", index, "label", e.target.value, "contactPage")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs" 
                />
                <input 
                  type="text" placeholder="Value (e.g. +91 98765 43210)" value={infoBlock.value} 
                  onChange={(e) => handleLandingArrayChange("info", index, "value", e.target.value, "contactPage")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs md:col-span-2" 
                />
                <input 
                  type="text" placeholder="Sub-text" value={infoBlock.sub} 
                  onChange={(e) => handleLandingArrayChange("info", index, "sub", e.target.value, "contactPage")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs md:col-span-4" 
                />
                <div className="md:col-span-1 flex justify-end items-end h-full">
                  <button onClick={() => removeLandingArrayItem("info", index, "contactPage")} className="text-red-500 hover:text-red-700 text-xs font-bold px-3 py-2 bg-red-50 rounded-md w-full">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-8 mt-8 border-t border-gray-100">
        <h2 className="font-display text-2xl font-bold text-[#1a3d2b] mb-6">Organizers Page Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Eyebrow</label>
            <input type="text" value={settings.organizersPage?.heroEyebrow || ""} onChange={(e) => handleChange("organizersPage", "heroEyebrow", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Title</label>
            <textarea value={settings.organizersPage?.heroTitle || ""} onChange={(e) => handleChange("organizersPage", "heroTitle", e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2">Hero Description</label>
            <textarea value={settings.organizersPage?.heroDescription || ""} onChange={(e) => handleChange("organizersPage", "heroDescription", e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" />
          </div>
        </div>
      </div>

      <div className="pt-8 mt-8 border-t border-gray-100">
        <h2 className="font-display text-2xl font-bold text-[#1a3d2b] mb-6">Legal Pages (Privacy & Terms)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-[#1a3d2b] text-sm mb-4">Privacy Policy Meta</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Hero Eyebrow" value={settings.privacyPage?.heroEyebrow || ""} onChange={(e) => handleChange("privacyPage", "heroEyebrow", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" />
              <textarea placeholder="Hero Title" value={settings.privacyPage?.heroTitle || ""} onChange={(e) => handleChange("privacyPage", "heroTitle", e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" />
              <textarea placeholder="Hero Description (e.g. Last updated...)" value={settings.privacyPage?.heroDescription || ""} onChange={(e) => handleChange("privacyPage", "heroDescription", e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-[#1a3d2b] text-sm mb-4">Terms & Conditions Meta</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Hero Eyebrow" value={settings.termsPage?.heroEyebrow || ""} onChange={(e) => handleChange("termsPage", "heroEyebrow", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" />
              <textarea placeholder="Hero Title" value={settings.termsPage?.heroTitle || ""} onChange={(e) => handleChange("termsPage", "heroTitle", e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" />
              <textarea placeholder="Hero Description (e.g. Last updated...)" value={settings.termsPage?.heroDescription || ""} onChange={(e) => handleChange("termsPage", "heroDescription", e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:border-[#c9841a] text-[#1a3d2b] font-bold text-xs" />
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-500 italic">* Note: Content sections for Legal pages are currently edited directly in the database to prevent accidental removal of critical legal clauses.</p>
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
