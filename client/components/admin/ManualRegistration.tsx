import React, { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { UserPlus, Calendar, Clock, Users, IndianRupee, Mail, Phone, MapPin, CreditCard, Tag } from "lucide-react";

export const ManualRegistration = ({ events, token, onSuccess }: { events: any[], token: string, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    eventId: "",
    date: "",
    slotTime: "",
    fullName: "",
    email: "",
    phone: "",
    numberOfGuests: 1,
    totalAmount: "",
    amountPaid: "",
    paymentMode: "Cash",
    remarks: "",
    discount: "",
    discountType: "flat", // "flat" = ₹ | "percent" = %
    checkInNow: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedEvent = events.find((e) => e._id === formData.eventId);

  // ── Core price calculations ──────────────────────────────────────
  const baseTotal = selectedEvent ? selectedEvent.basePrice * Number(formData.numberOfGuests) : 0;

  const discountValue = formData.discount !== "" ? Number(formData.discount) : 0;
  const discountAmount =
    formData.discountType === "percent"
      ? Math.round((baseTotal * discountValue) / 100)
      : discountValue;

  const effectiveTotal =
    formData.totalAmount !== ""
      ? Number(formData.totalAmount)
      : Math.max(0, baseTotal - discountAmount);

  const amountPaidNum = formData.amountPaid !== "" ? Number(formData.amountPaid) : effectiveTotal;
  const balanceDue = Math.max(0, effectiveTotal - amountPaidNum);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.eventId || !formData.date || !formData.slotTime) {
      toast.error("Please select an event, date, and time slot.");
      return;
    }
    if (!formData.fullName || !formData.phone) {
      toast.error("Guest name and phone number are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        event: formData.eventId,
        date: formData.date,
        slotTime: formData.slotTime,
        numberOfGuests: Number(formData.numberOfGuests),
        totalAmount: effectiveTotal,
        amountPaid: amountPaidNum,
        balanceAmount: balanceDue,
        bookingSource: "admin",
        guestDetails: {
          fullName: formData.fullName,
          email: formData.email || "no-email@suvaialaya.com",
          phone: formData.phone,
          city: formData.remarks || "Walk-in"
        }
      };

      const response = await axios.post("/api/bookings", payload, { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.success) {
        const newBookingId = response.data.data._id;
        const finalPaymentStatus = balanceDue <= 0 ? "Completed" : amountPaidNum > 0 ? "Partial" : "Pending";

        await axios.put(`/api/bookings/${newBookingId}`, {
          paymentStatus: finalPaymentStatus,
          bookingStatus: formData.checkInNow ? "Attended" : "Confirmed",
          amountPaid: amountPaidNum,
          balanceAmount: balanceDue,
          guestDetails: { ...payload.guestDetails, paymentMode: formData.paymentMode }
        }, { headers: { Authorization: `Bearer ${token}` } });

        toast.success("Registration completed successfully!");
        setFormData({
          eventId: "", date: "", slotTime: "", fullName: "", email: "", phone: "",
          numberOfGuests: 1, totalAmount: "", amountPaid: "", paymentMode: "Cash",
          remarks: "", discount: "", discountType: "flat", checkInNow: true
        });
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to register booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold text-[#1a3d2b] flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-[#c9841a]" /> Manual Registration
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60">
          Direct Entry for Walk-ins and VIPs
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-[0_4px_15px_rgb(0,0,0,0.02)] relative overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">

          {/* Event Selection */}
          <div>
            <h3 className="text-lg font-bold text-[#1a3d2b] border-b border-gray-100 pb-2 mb-4">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Select Event</label>
                <div className="relative">
                  <select name="eventId" value={formData.eventId} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#c9841a] font-bold text-[#1a3d2b] appearance-none" required>
                    <option value="">-- Choose Event --</option>
                    {events.map((e) => (
                      <option key={e._id} value={e._id}>{e.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.eventId && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Calendar size={12}/> Date</label>
                    <select name="date" value={formData.date} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#c9841a] font-bold text-[#1a3d2b]" required>
                      <option value="">-- Date --</option>
                      {selectedEvent?.dates?.map((d: string) => (
                        <option key={d} value={d}>{new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Clock size={12}/> Slot Time</label>
                    <select name="slotTime" value={formData.slotTime} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#c9841a] font-bold text-[#1a3d2b]" required>
                      <option value="">-- Time --</option>
                      {selectedEvent?.slots?.map((s: any) => (
                        <option key={s.time} value={s.time}>{s.time} (Cap: {s.capacity})</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Guest Information */}
          <div>
            <h3 className="text-lg font-bold text-[#1a3d2b] border-b border-gray-100 pb-2 mb-4">Guest Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><UserPlus size={12}/> Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Guest Name" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#c9841a] font-bold text-[#1a3d2b]" required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Phone size={12}/> Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="e.g. 9876543210" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#c9841a] font-bold text-[#1a3d2b]" required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Mail size={12}/> Email (Optional)</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="e-ticket will be sent here" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#c9841a] font-bold text-[#1a3d2b]" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><MapPin size={12}/> City / Remarks</label>
                <input type="text" name="remarks" value={formData.remarks} onChange={handleInputChange} placeholder="Walk-in, VIP, etc." className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#c9841a] font-bold text-[#1a3d2b]" />
              </div>
            </div>
          </div>

          {/* Payment & Pax */}
          <div>
            <h3 className="text-lg font-bold text-[#1a3d2b] border-b border-gray-100 pb-2 mb-4">Pax & Payment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Users size={12}/> Guests</label>
                <input type="number" name="numberOfGuests" min="1" value={formData.numberOfGuests} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#c9841a] font-bold text-[#1a3d2b]" required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><IndianRupee size={12}/> Total Amount</label>
                <input type="number" name="totalAmount" min="0" value={formData.totalAmount} onChange={handleInputChange} placeholder={`Auto (₹${baseTotal})`} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#c9841a] font-bold text-[#1a3d2b]" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><IndianRupee size={12}/> Advance Paid</label>
                <input type="number" name="amountPaid" min="0" value={formData.amountPaid} onChange={handleInputChange} placeholder="Paid amount" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#c9841a] font-bold text-[#1a3d2b]" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><CreditCard size={12}/> Method</label>
                <select name="paymentMode" value={formData.paymentMode} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#c9841a] font-bold text-[#1a3d2b]">
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Card">Card</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>
            </div>

            {/* Discount Row */}
            <div className="mt-5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Tag size={12}/> Discount <span className="text-gray-400 normal-case font-normal tracking-normal">(optional)</span>
              </label>
              <div className="flex gap-3 items-center">
                <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, discountType: "flat" }))}
                    className={`px-4 py-2.5 transition-colors ${formData.discountType === "flat" ? "bg-[#1a3d2b] text-white" : "bg-gray-50 text-[#1a3d2b]/60 hover:bg-gray-100"}`}
                  >₹ Flat</button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, discountType: "percent" }))}
                    className={`px-4 py-2.5 transition-colors ${formData.discountType === "percent" ? "bg-[#1a3d2b] text-white" : "bg-gray-50 text-[#1a3d2b]/60 hover:bg-gray-100"}`}
                  >% Off</button>
                </div>
                <input
                  type="number"
                  name="discount"
                  min="0"
                  max={formData.discountType === "percent" ? "100" : undefined}
                  value={formData.discount}
                  onChange={handleInputChange}
                  placeholder={formData.discountType === "percent" ? "e.g. 10 for 10% off" : "e.g. 200 for ₹200 off"}
                  className="flex-1 p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#c9841a] font-bold text-[#1a3d2b]"
                />
                {discountAmount > 0 && (
                  <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-xl whitespace-nowrap">
                    −₹{discountAmount} saved
                  </span>
                )}
              </div>
            </div>

            {/* Summary Box */}
            <div className="mt-5 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div className="space-y-1 text-sm">
                  {baseTotal > 0 && (
                    <div className="text-[#1a3d2b]/60 font-medium">
                      Base: ₹{baseTotal.toLocaleString()}
                      {discountAmount > 0 && (
                        <span className="ml-2 text-green-600 font-bold">− ₹{discountAmount} discount</span>
                      )}
                    </div>
                  )}
                  <div className="font-bold text-[#1a3d2b]">
                    Payable: ₹{effectiveTotal.toLocaleString()}
                  </div>
                  {amountPaidNum > 0 && amountPaidNum < effectiveTotal && (
                    <div className="text-xs text-[#c9841a] font-bold">Advance paid: ₹{amountPaidNum}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-widest text-orange-600 font-bold">Balance Due</div>
                  <div className="font-display text-2xl text-orange-700 font-bold">₹{balanceDue}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <input
                type="checkbox"
                id="checkInNow"
                name="checkInNow"
                checked={formData.checkInNow}
                onChange={handleInputChange}
                className="w-5 h-5 text-[#1a3d2b] border-gray-300 rounded focus:ring-[#1a3d2b] focus:ring-2 accent-[#1a3d2b]"
              />
              <label htmlFor="checkInNow" className="text-sm font-bold text-[#1a3d2b] cursor-pointer">
                Guest is here right now (Mark as Attended immediately)
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#1a3d2b] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center gap-2 uppercase tracking-widest"
            >
              {isSubmitting ? "Registering..." : "Register Guest"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
