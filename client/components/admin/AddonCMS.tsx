import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Settings, Trash2, Loader2, Package, IndianRupee, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function AddonCMS() {
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "merchandise",
    stock: "",
    isActive: true
  });

  const fetchAddons = async () => {
    try {
      const res = await axios.get("/api/addons");
      if (res.data.success) {
        setAddons(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load add-ons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: formData.stock ? Number(formData.stock) : undefined
      };

      if (editId) {
        const res = await axios.put(`/api/addons/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          toast.success("Add-on updated successfully");
          setAddons(addons.map(a => a._id === editId ? res.data.data : a));
        }
      } else {
        const res = await axios.post("/api/addons", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          toast.success("Add-on created successfully");
          setAddons([res.data.data, ...addons]);
        }
      }
      setIsFormOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save add-on");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this add-on?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/addons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Add-on deleted");
      setAddons(addons.filter(a => a._id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete add-on");
    }
  };

  const openNewForm = () => {
    setFormData({ name: "", description: "", price: "", category: "merchandise", stock: "", isActive: true });
    setEditId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (addon: any) => {
    setFormData({
      name: addon.name,
      description: addon.description,
      price: addon.price.toString(),
      category: addon.category,
      stock: addon.stock ? addon.stock.toString() : "",
      isActive: addon.isActive
    });
    setEditId(addon._id);
    setIsFormOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#1a3d2b]" /></div>;
  }

  return (
    <div className="space-y-8" style={{ perspective: 1000 }}>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold text-[#1a3d2b]">E-Commerce Add-ons</h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">Manage products, experiences, and upsells</p>
        </div>
        <button 
          onClick={openNewForm}
          className="bg-[#1a3d2b] text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#2d6a4f] transition-all flex items-center gap-2 shadow-md"
        >
          <Plus size={16} /> New Add-on
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {addons.map((addon) => (
          <motion.div 
            key={addon._id}
            whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
            className={`bg-white p-6 rounded-2xl border ${addon.isActive ? 'border-gray-100' : 'border-red-100 bg-gray-50'} shadow-[0_4px_15px_rgb(0,0,0,0.02)] relative group`}
          >
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEditForm(addon)} className="text-[#c9841a] hover:bg-[#c9841a]/10 p-2 rounded-lg transition-colors"><Settings size={16} /></button>
              <button onClick={() => handleDelete(addon._id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
            </div>
            
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#c9841a]/10 flex items-center justify-center text-[#c9841a]">
                <Package size={24} />
              </div>
              <div className="pt-1">
                <h3 className="font-bold text-[#1a3d2b] text-lg leading-tight">{addon.name}</h3>
                <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold uppercase tracking-widest text-[#1a3d2b]/50">
                  <Tag size={10} /> {addon.category}
                </span>
              </div>
            </div>
            
            <p className="text-xs text-[#1a3d2b]/70 mb-4 line-clamp-2">{addon.description}</p>
            
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="flex items-center gap-1 font-display font-bold text-xl text-[#1a3d2b]">
                <IndianRupee size={16} className="text-[#c9841a]" /> {addon.price}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/50">
                Stock: {addon.stock !== undefined && addon.stock !== null ? addon.stock : '∞'}
              </div>
            </div>
            {!addon.isActive && (
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-100 text-red-600 text-[9px] font-bold uppercase tracking-widest rounded-full">
                 Inactive
               </div>
            )}
          </motion.div>
        ))}
        {addons.length === 0 && (
          <div className="col-span-full text-center py-12 text-[#1a3d2b]/40 font-bold uppercase tracking-widest text-[10px]">
            No add-ons created yet.
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md bg-white border-gray-100">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-[#1a3d2b]">
              {editId ? "Edit Add-on" : "Create Add-on"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]">Product Name</Label>
              <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-gray-50 border-gray-200 focus-visible:ring-[#c9841a] h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]">Description</Label>
              <textarea 
                required 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="w-full bg-gray-50 border-gray-200 focus-visible:ring-[#c9841a] rounded-xl p-3 text-sm outline-none border focus:border-[#c9841a]"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]">Price (₹)</Label>
                <Input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-gray-50 border-gray-200 focus-visible:ring-[#c9841a] h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]">Category</Label>
                <select 
                  className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-[#c9841a]"
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="food">Food & Beverage</option>
                  <option value="merchandise">Merchandise</option>
                  <option value="experience">Experience</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]">Stock (Leave empty for unlimited)</Label>
                <Input type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="bg-gray-50 border-gray-200 focus-visible:ring-[#c9841a] h-12 rounded-xl" />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 accent-[#c9841a]"
                />
                <Label htmlFor="isActive" className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]">Is Active (Visible)</Label>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-4 bg-[#1a3d2b] hover:bg-[#2d6a4f] text-white h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editId ? "Update Add-on" : "Create Add-on"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
