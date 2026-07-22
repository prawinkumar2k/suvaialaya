import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, Loader2 } from "lucide-react";
import { BrandMark } from "@/components/landing/BrandMark";
import { toast } from "sonner";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const info = [
    { icon: Phone, label: "Phone", value: "+91 98765 43210", sub: "Mon–Sun, 10 AM – 10 PM" },
    { icon: Mail, label: "Email", value: "hello@suvaialaya.com", sub: "We reply within 24 hours" },
    { icon: MapPin, label: "Venue", value: "Madurai, Tamil Nadu", sub: "Festival grounds, main entrance" },
    { icon: Clock, label: "Event Hours", value: "10 AM – 10 PM", sub: "All 9 days of the festival" },
  ];

  return (
    <main className="min-h-screen bg-white text-[#1a3d2b] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center px-5 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 hover:text-[#1a3d2b] transition-colors">
            <ArrowLeft size={16} /> Back to home
          </Link>
          <div className="ml-auto"><BrandMark /></div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9841a]">Get In Touch</p>
          <h1 className="font-display mt-4 text-4xl font-bold leading-tight sm:text-5xl text-[#1a3d2b]">We'd love to hear from you.</h1>
          <p className="mt-4 text-[#1a3d2b]/70 max-w-lg mx-auto">Have questions about the festival, your booking, or the menu? Our team is ready to help.</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Info Cards */}
          <div className="lg:col-span-2 space-y-4">
            {info.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.1 }}
                className="flex items-start gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-[#1a3d2b]/5 flex items-center justify-center flex-shrink-0">
                  <item.icon size={18} className="text-[#1a3d2b]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/50 mb-1">{item.label}</p>
                  <p className="font-bold text-sm text-[#1a3d2b]">{item.value}</p>
                  <p className="text-xs text-[#1a3d2b]/60 mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2 block">Your Name</label>
                  <input name="name" value={form.name} onChange={handleChange} required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm font-medium text-[#1a3d2b] focus:outline-none focus:border-[#1a3d2b] transition-colors"
                    placeholder="Arjun Kumar" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2 block">Email Address</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm font-medium text-[#1a3d2b] focus:outline-none focus:border-[#1a3d2b] transition-colors"
                    placeholder="arjun@email.com" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2 block">Subject</label>
                <select name="subject" value={form.subject} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm font-medium text-[#1a3d2b] focus:outline-none focus:border-[#1a3d2b] transition-colors">
                  <option value="">Select a topic...</option>
                  <option>Booking Enquiry</option>
                  <option>Cancellation & Refund</option>
                  <option>Festival Schedule</option>
                  <option>Dietary Requirements</option>
                  <option>Group Bookings</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 mb-2 block">Message</label>
                <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-sm font-medium text-[#1a3d2b] focus:outline-none focus:border-[#1a3d2b] transition-colors resize-none"
                  placeholder="Tell us how we can help..." />
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-[#1a3d2b] text-white rounded-xl py-4 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#2d6a4f] transition-colors disabled:opacity-60">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
