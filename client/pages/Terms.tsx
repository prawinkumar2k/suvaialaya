import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Scale, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { BrandMark } from "@/components/landing/BrandMark";

const sections = [
  {
    icon: CheckCircle2,
    title: "Acceptance of Terms",
    content: [
      "By accessing or using the Suvaialaya event management platform, you agree to be bound by these Terms and Conditions.",
      "If you do not agree to these terms, you may not use our services. We reserve the right to modify these terms at any time, with changes effective upon posting.",
    ]
  },
  {
    icon: Scale,
    title: "Booking & Payment Policy",
    content: [
      "All bookings are subject to seat availability. A booking is only confirmed upon successful payment via the Razorpay payment gateway.",
      "Prices displayed include all applicable taxes. We accept UPI, net banking, credit, and debit cards.",
      "Bookings are non-transferable. The name on the booking must match a valid government-issued ID at the time of entry.",
    ]
  },
  {
    icon: AlertCircle,
    title: "Cancellation & Refund Policy",
    content: [
      "Cancellations made before the day of the booking are eligible for a full refund, which will be processed within 5–7 business days.",
      "No refunds will be issued for cancellations made on or after the booking date. No-shows will not be eligible for any refund.",
      "Suvaialaya reserves the right to cancel an event due to unforeseen circumstances. In such cases, a full refund will be issued to all affected guests.",
    ]
  },
  {
    icon: ShieldCheck,
    title: "User Responsibilities",
    content: [
      "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.",
      "You must provide accurate and complete information when creating a booking. Fraudulent bookings will be cancelled without a refund.",
      "You agree to treat all festival staff and guests with respect. Disruptive behavior may result in removal from the premises without a refund.",
    ]
  },
];

export default function Terms() {
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9841a]">Legal</p>
          <h1 className="font-display mt-4 text-4xl font-bold sm:text-5xl text-[#1a3d2b]">Terms & Conditions</h1>
          <p className="mt-4 text-sm text-[#1a3d2b]/60">Last updated: July 2026</p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((sec, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#1a3d2b]/5 flex items-center justify-center flex-shrink-0">
                  <sec.icon size={16} className="text-[#1a3d2b]" />
                </div>
                <h2 className="font-display font-bold text-lg text-[#1a3d2b]">{sec.title}</h2>
              </div>
              <ul className="space-y-3">
                {sec.content.map((p, pi) => (
                  <li key={pi} className="flex gap-3 text-sm text-[#1a3d2b]/70 leading-relaxed">
                    <span className="text-[#c9841a] mt-1 flex-shrink-0">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-sm text-[#1a3d2b]/60 text-center">
          Questions? <Link to="/contact" className="underline text-[#c9841a] hover:text-[#a66d15]">Contact us</Link>
        </p>
      </div>
    </main>
  );
}
