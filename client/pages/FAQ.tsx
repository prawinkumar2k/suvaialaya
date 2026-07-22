import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { BrandMark } from "@/components/landing/BrandMark";

const faqs = [
  {
    category: "Booking",
    items: [
      { q: "How do I book a seat?", a: "Select your preferred date and time slot on the Slots page, fill in your guest details, and complete the payment via Razorpay. You'll receive an e-ticket instantly by email." },
      { q: "Can I book for a group?", a: "Yes! You can book for up to the maximum seat capacity per slot. For large groups over 20 people, please contact us directly via the Contact page for a dedicated arrangement." },
      { q: "Is my booking confirmed immediately?", a: "Yes. Upon successful payment, your booking is instantly confirmed and an e-ticket PDF is available for download from your dashboard." },
      { q: "What if a slot is full?", a: "You'll be automatically added to the waitlist. If a seat opens up due to a cancellation, you'll be notified and given priority access." },
    ]
  },
  {
    category: "Payments & Refunds",
    items: [
      { q: "What payment methods are accepted?", a: "We accept all major UPI apps, credit/debit cards, and net banking via Razorpay — India's most trusted payment gateway." },
      { q: "How do I cancel and get a refund?", a: "You can cancel from your dashboard up to the day before your booking date. Refunds are processed within 5–7 business days back to your original payment method." },
      { q: "Can I reschedule instead of cancelling?", a: "Absolutely. From your dashboard, you can reschedule to any available slot without incurring an extra charge, subject to seat availability." },
    ]
  },
  {
    category: "The Experience",
    items: [
      { q: "What is included in the meal?", a: "A traditional Madurai Kari Virundhu feast: Seeraga Samba Briyani, Mutton/Chicken curries, freshly made Bun Parotta, Rasam, Curd, Desserts, and much more — served in authentic banana leaf style." },
      { q: "Are there vegetarian options?", a: "We cater to vegetarian guests with a curated set of dishes. Please contact us in advance to arrange a special vegetarian thali." },
      { q: "Is there parking at the venue?", a: "Yes, ample parking is available near the festival grounds. Detailed venue and parking instructions are included in your e-ticket." },
    ]
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left gap-4">
        <span className="font-bold text-sm text-[#1a3d2b]">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronDown size={18} className="text-[#1a3d2b]/50" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <p className="text-sm text-[#1a3d2b]/70 leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  return (
    <main className="min-h-screen bg-white text-[#1a3d2b] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a3d2b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center px-5 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3d2b]/60 hover:text-[#1a3d2b] transition-colors">
            <ArrowLeft size={16} /> Back to home
          </Link>
          <div className="ml-auto"><BrandMark /></div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9841a]">Frequently Asked Questions</p>
          <h1 className="font-display mt-4 text-4xl font-bold sm:text-5xl text-[#1a3d2b]">Everything you need to know.</h1>
          <p className="mt-4 text-[#1a3d2b]/70">Can't find your answer? <Link to="/contact" className="underline text-[#c9841a] hover:text-[#a66d15]">Contact us directly.</Link></p>
        </motion.div>

        <div className="space-y-10">
          {faqs.map((section, si) => (
            <motion.div key={si} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: si * 0.1 }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#c9841a] mb-3">{section.category}</p>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6">
                {section.items.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
