import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Check, X, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function MenuCMS() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const token = localStorage.getItem("token");

  const fetchMenu = async () => {
    try {
      const res = await axios.get("/api/menu");
      if (res.data.success) {
        setMenuItems(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await axios.delete(`/api/menu/${itemToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Menu item deleted");
      fetchMenu();
    } catch (err) {
      toast.error("Failed to delete item");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleSave = async (id: string) => {
    try {
      if (id === "new") {
        await axios.post("/api/menu", editForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Menu item created");
      } else {
        await axios.put(`/api/menu/${id}`, editForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Menu item updated");
      }
      setIsEditing(null);
      fetchMenu();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save item");
    }
  };

  const startEdit = (item: any) => {
    setIsEditing(item._id);
    setEditForm(item);
  };

  const addNew = () => {
    const newItem = {
      _id: "new",
      name: "",
      description: "",
      price: 0,
      category: "Meals",
      isVeg: false,
    };
    setMenuItems([newItem, ...menuItems]);
    startEdit(newItem);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a3d2b]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold font-display text-[#1a3d2b]">Menu Management</h2>
          <p className="text-xs text-[#1a3d2b]/60 mt-1">Add, edit, or remove items from the landing page menu.</p>
        </div>
        <button onClick={addNew} disabled={isEditing !== null} className="flex items-center gap-2 bg-[#c9841a] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#a66d15] transition-colors disabled:opacity-50">
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-[#1a3d2b]/50">Name</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-[#1a3d2b]/50">Category</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-[#1a3d2b]/50">Price</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-[#1a3d2b]/50 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                {isEditing === item._id ? (
                  <>
                    <td className="py-3 px-4">
                      <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border p-1 text-sm rounded" placeholder="Name" />
                    </td>
                    <td className="py-3 px-4">
                      <input type="text" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full border p-1 text-sm rounded" placeholder="Category" />
                    </td>
                    <td className="py-3 px-4">
                      <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: Number(e.target.value)})} className="w-24 border p-1 text-sm rounded" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => handleSave(item._id)} className="text-green-600 mr-3"><Check size={18} /></button>
                      <button onClick={() => { setIsEditing(null); if(item._id === 'new') fetchMenu(); }} className="text-red-600"><X size={18} /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-4">
                      <p className="text-sm font-bold text-[#1a3d2b]">{item.name}</p>
                      <p className="text-xs text-[#1a3d2b]/60 truncate max-w-[200px]">{item.description}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#1a3d2b]/80">{item.category}</td>
                    <td className="py-3 px-4 text-sm font-bold text-[#c9841a]">₹{item.price}</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => startEdit(item)} className="text-blue-600 hover:text-blue-800 mr-3 transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-800 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {menuItems.length === 0 && (
          <div className="text-center py-12 text-[#1a3d2b]/40 text-sm">No menu items found.</div>
        )}
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This will instantly remove it from the database and the landing page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 text-white hover:bg-red-600">Yes, Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
