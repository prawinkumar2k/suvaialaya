import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Settings, XCircle, Loader2, User, Key, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function StaffCMS() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "receptionist"
  });

  const [newStaffCredentials, setNewStaffCredentials] = useState<any>(null);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/staff", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStaff(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load staff members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/staff", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Staff member created successfully");
        setStaff([res.data.data, ...staff]);
        setNewStaffCredentials(res.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create staff");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm("Are you sure you want to revoke access for this staff member?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Staff member removed");
      setStaff(staff.filter(s => s._id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to remove staff");
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#1a3d2b]" /></div>;
  }

  return (
    <div className="space-y-8" style={{ perspective: 1000 }}>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl font-bold text-[#1a3d2b]">Staff Management</h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">Manage internal team access</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: "", email: "", phone: "", role: "receptionist" });
            setNewStaffCredentials(null);
            setIsAddOpen(true);
          }}
          className="bg-[#1a3d2b] text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#2d6a4f] transition-all flex items-center gap-2 shadow-md"
        >
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {staff.map((member) => (
          <motion.div 
            key={member._id}
            whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_15px_rgb(0,0,0,0.02)] relative group"
          >
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => handleDeleteStaff(member._id)}
                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <XCircle size={18} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#1a3d2b]/5 flex items-center justify-center text-[#1a3d2b] font-display font-bold text-xl border border-[#1a3d2b]/10">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-[#1a3d2b] text-lg leading-none">{member.name}</h3>
                <span className={`inline-block mt-2 px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest ${
                  member.role === 'admin' || member.role === 'super_admin' ? 'bg-purple-50 text-purple-600' :
                  member.role === 'kitchen_staff' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {member.role.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 text-xs text-[#1a3d2b]/70 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2"><User size={14} /> {member.email}</div>
              <div className="flex items-center gap-2"><Key size={14} /> {member.phone}</div>
            </div>
          </motion.div>
        ))}
        {staff.length === 0 && (
          <div className="col-span-full text-center py-12 text-[#1a3d2b]/40 font-bold uppercase tracking-widest text-[10px]">
            No staff members found.
          </div>
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md bg-white border-gray-100">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-[#1a3d2b]">
              {newStaffCredentials ? "Staff Created Successfully" : "Add New Staff"}
            </DialogTitle>
          </DialogHeader>
          
          {newStaffCredentials ? (
            <div className="py-6 space-y-4">
              <div className="bg-green-50 border border-green-100 text-green-800 p-4 rounded-xl text-sm mb-6">
                Please copy these temporary credentials and send them securely to the staff member. 
                They will be required to change this password on their first login.
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">Login Email</Label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm">{newStaffCredentials.email}</div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">Temporary Password</Label>
                <div className="p-3 bg-[#c9841a]/10 border border-[#c9841a]/20 text-[#c9841a] rounded-lg font-mono font-bold text-lg text-center tracking-widest">
                  {newStaffCredentials.tempPassword}
                </div>
              </div>

              <button 
                onClick={() => setIsAddOpen(false)}
                className="w-full mt-4 bg-[#1a3d2b] text-white py-3 rounded-xl font-bold uppercase tracking-widest text-[10px]"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateStaff} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]">Full Name</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-gray-50 border-gray-200 focus-visible:ring-[#c9841a] h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]">Email</Label>
                <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-gray-50 border-gray-200 focus-visible:ring-[#c9841a] h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]">Phone</Label>
                <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-gray-50 border-gray-200 focus-visible:ring-[#c9841a] h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]">Role</Label>
                <select 
                  className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-[#c9841a] focus:ring-1 focus:ring-[#c9841a]"
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="receptionist">Receptionist</option>
                  <option value="kitchen_staff">Kitchen Staff</option>
                  <option value="scanner">Door Scanner</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#1a3d2b] hover:bg-[#2d6a4f] text-white h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Staff Account
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
