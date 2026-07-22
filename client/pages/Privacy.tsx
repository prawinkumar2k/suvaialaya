import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Eye, Database, Share2 } from "lucide-react";
import { BrandMark } from "@/components/landing/BrandMark";

const sections = [
  {
    icon: Database,
    title: "Information We Collect",
    content: [
      "Personal information you provide when registering or booking: name, email address, phone number, and city.",
      "Booking details including selected dates, time slots, number of guests, and payment transaction references.",
      "Usage data such as pages visited and features used, collected in aggregate to improve our service.",
    ]
  },
  {
    icon: Eye,
    title: "How We Use Your Information",
    content: [
      "To process and confirm your bookings, and to send you transactional emails such as booking confirmations and e-tickets.",
      "To manage your account, process refunds, and handle support requests.",
      "To send you important updates about the festival or changes to your booking. We do not send unsolicited marketing emails.",
    ]
  },
  {
    icon: Share2,
    title: "Sharing of Information",
    content: [
      "We do not sell, trade, or rent your personal information to third parties.",
      "We share payment information only with Razorpay, our secure payment gateway, which is PCI-DSS compliant. We do not store raw card details.",
      "We may disclose information to law enforcement if required by law or to protect the rights and safety of our guests and staff.",
    ]
  },
  {
    icon: Lock,
    title: "Data Security & Your Rights",
    content: [
      "We use industry-standard encryption (TLS/HTTPS) and secure MongoDB Atlas infrastructure to protect your data.",
      "You have the right to access, correct, or delete your personal information at any time by contacting us.",
      "You may request the deletion of your account and all associated data by sending an email to privacy@suvaialaya.com.",
    ]
  },
];

export default function Privacy() {
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
          <h1 className="font-display mt-4 text-4xl font-bold sm:text-5xl text-[#1a3d2b]">Privacy Policy</h1>
          <p className="mt-4 text-sm text-[#1a3d2b]/60">Last updated: July 2026 · We take your privacy seriously.</p>
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
          Questions about your data? <Link to="/contact" className="underline text-[#c9841a] hover:text-[#a66d15]">Email us</Link>
        </p>
      </div>
    </main>
  );
}
