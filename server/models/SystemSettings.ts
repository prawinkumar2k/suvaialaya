import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema(
  {
    festival: {
      name: { type: String, default: "Suvaialaya Grand Launch" },
      restaurantName: { type: String, default: "SUVAIALAYA" },
      tagline: { type: String, default: "Authentic South Indian Cuisine" },
      eyebrow: { type: String, default: "Something Grand is Coming Soon" },
      dates: { type: String, default: "Coming Soon" },
      hours: { type: String, default: "11:00 AM — 11:00 PM" },
      venue: { type: String, default: "Bangalore" },
      description: { type: String, default: "Experience the grand opening..." }
    },
    landing: {
      heroEyebrow: { type: String, default: "From Madurai · To Bangalore" },
      heroTitle: { type: String, default: "Authentic\nSouth Indian\nMulti Cuisine" },
      heroDescription: { type: String, default: "From the Heart of Madurai to the Soul of Bangalore — experience legendary Biryani, grand Kari Virundhu feasts, and the iconic Madurai Jigarthanda." },
      stats: { type: [{ value: String, label: String }], default: [{ value: "500+", label: "Guests Daily" }, { value: "80+", label: "Menu Items" }, { value: "10+", label: "Years of Service" }] },
      specials: { type: [{ name: String, price: String, desc: String, tag: String }], default: [
        { name: "Kongu Thokku Meals", price: "₹399", tag: "Signature", desc: "4 Types of Thokku (Chicken, Kaadai, Prawns, Nethili Karuvada) · Fish Curry · Mutton Gravy · Rice · Day Spl Chicken 2pc · Egg · Poriyal · Rasam · Curd · Gulkand · Banana" },
        { name: "Chicken 8 Meal Combo", price: "₹399", tag: "Best Value", desc: "Sweet · Mini Chicken Biryani · Bun Parotta · Chicken Gravy · 2 Chicken Starters · Boiled Egg · Onion Raita" },
        { name: "Mutton 8 Meal Combo", price: "₹499", tag: "Feast", desc: "Sweet · Mini Mutton Biryani · Bun Parotta · Mutton Gravy · Mutton Varuval · Chicken Starters · Boiled Egg · Onion Raita" },
        { name: "Tandoori Chicken Platter", price: "₹1199", tag: "Grand", desc: "Full Tandoori Chicken · BBQ Chicken · Al Faham Chicken · Chicken Tikka · Hariyali Tikka · Malai Tikka — the ultimate celebration feast" }
      ]}
    },
    menuPage: {
      heroEyebrow: { type: String, default: "The Official Menu" },
      heroTitle: { type: String, default: "A feast curated\nfor the soul." },
      heroDescription: { type: String, default: "Prepared fresh daily, served hot on a banana leaf. Experience authentic Madurai flavors crafted from generations-old recipes." }
    },
    galleryPage: {
      heroEyebrow: { type: String, default: "Gallery" },
      heroTitle: { type: String, default: "A glimpse into the feast." },
      heroDescription: { type: String, default: "The sights, colors, and textures of Madurai Kari Virundhu." },
      images: { type: [{ src: String, alt: String, className: String }], default: [
        { src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop", alt: "Food preparation", className: "col-span-2 row-span-2" },
        { src: "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?q=80&w=400&auto=format&fit=crop", alt: "Spices", className: "col-span-1 row-span-1" },
        { src: "https://images.unsplash.com/photo-1626804475297-41609ea0d4eb?q=80&w=400&auto=format&fit=crop", alt: "Cooking", className: "col-span-1 row-span-1" },
        { src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop", alt: "Feast", className: "col-span-2 row-span-1" },
        { src: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=400&auto=format&fit=crop", alt: "Curry", className: "col-span-1 row-span-2" },
        { src: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400&auto=format&fit=crop", alt: "Sweets", className: "col-span-1 row-span-1" },
        { src: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=400&auto=format&fit=crop", alt: "Biryani", className: "col-span-1 row-span-1" },
      ]}
    },
    aboutPage: {
      heroEyebrow: { type: String, default: "Our Story" },
      heroTitle: { type: String, default: "A celebration of Madurai's\nrich culinary heritage." },
      heroDescription1: { type: String, default: "Madurai Kari Virundhu was born from a simple idea: to bring the authentic, unfiltered flavors of Madurai to a communal table. We believe that food is more than sustenance; it is a story, a memory, and a bridge between generations." },
      heroDescription2: { type: String, default: "For nine days, we transform a beautiful venue into a haven of hospitality. Our chefs are not just cooks; they are custodians of recipes passed down through families, utilizing traditional cooking methods that are rarely seen in modern kitchens." },
      features: { type: [{ iconName: String, title: String, desc: String }], default: [
        { iconName: "ChefHat", title: "Master Chefs", desc: "Local culinary legends bringing decades of experience." },
        { iconName: "Leaf", title: "Fresh Ingredients", desc: "Sourced daily from the local markets of Madurai." },
        { iconName: "Users", title: "Communal Dining", desc: "Long tables designed for shared experiences and new friends." },
        { iconName: "Heart", title: "Made with Love", desc: "Every dish is prepared with the utmost care and passion." }
      ]}
    },
    welcomeItems: [
      { name: String, detail: String }
    ],
    returnGifts: [
      { name: String, detail: String }
    ],
    testimonials: [
      { quote: String, name: String, role: String }
    ],
    contactPhone: { type: String, default: "90350 05335" },
    faqPage: {
      heroEyebrow: { type: String, default: "Frequently Asked Questions" },
      heroTitle: { type: String, default: "Everything you need to know." },
      heroDescription: { type: String, default: "Can't find your answer? Contact us directly." },
      categories: {
        type: [{
          name: String,
          items: [{ q: String, a: String }]
        }],
        default: [
          {
            name: "Booking",
            items: [
              { q: "How do I book a seat?", a: "Select your preferred date and time slot on the Slots page, fill in your guest details, and complete the payment via Razorpay. You'll receive an e-ticket instantly by email." },
              { q: "Can I book for a group?", a: "Yes! You can book for up to the maximum seat capacity per slot. For large groups over 20 people, please contact us directly via the Contact page for a dedicated arrangement." },
              { q: "Is my booking confirmed immediately?", a: "Yes. Upon successful payment, your booking is instantly confirmed and an e-ticket PDF is available for download from your dashboard." },
              { q: "What if a slot is full?", a: "You'll be automatically added to the waitlist. If a seat opens up due to a cancellation, you'll be notified and given priority access." },
            ]
          },
          {
            name: "Payments & Refunds",
            items: [
              { q: "What payment methods are accepted?", a: "We accept all major UPI apps, credit/debit cards, and net banking via Razorpay — India's most trusted payment gateway." },
              { q: "How do I cancel and get a refund?", a: "You can cancel from your dashboard up to the day before your booking date. Refunds are processed within 5–7 business days back to your original payment method." },
              { q: "Can I reschedule instead of cancelling?", a: "Absolutely. From your dashboard, you can reschedule to any available slot without incurring an extra charge, subject to seat availability." },
            ]
          },
          {
            name: "The Experience",
            items: [
              { q: "What is included in the meal?", a: "A traditional Madurai Kari Virundhu feast: Seeraga Samba Briyani, Mutton/Chicken curries, freshly made Bun Parotta, Rasam, Curd, Desserts, and much more — served in authentic banana leaf style." },
              { q: "Are there vegetarian options?", a: "We cater to vegetarian guests with a curated set of dishes. Please contact us in advance to arrange a special vegetarian thali." },
              { q: "Is there parking at the venue?", a: "Yes, ample parking is available near the festival grounds. Detailed venue and parking instructions are included in your e-ticket." },
            ]
          },
        ]
      }
    },
    contactPage: {
      heroEyebrow: { type: String, default: "Get In Touch" },
      heroTitle: { type: String, default: "We'd love to hear from you." },
      heroDescription: { type: String, default: "Have questions about the festival, your booking, or the menu? Our team is ready to help." },
      info: {
        type: [{ iconName: String, label: String, value: String, sub: String }],
        default: [
          { iconName: "Phone", label: "Phone", value: "+91 90350 05335", sub: "Mon–Sun, 10 AM – 10 PM" },
          { iconName: "Mail", label: "Email", value: "hello@suvaialaya.com", sub: "We reply within 24 hours" },
          { iconName: "MapPin", label: "Venue", value: "Madurai, Tamil Nadu", sub: "Festival grounds, main entrance" },
          { iconName: "Clock", label: "Event Hours", value: "10 AM – 10 PM", sub: "All 9 days of the festival" },
        ]
      }
    },
    organizersPage: {
      heroEyebrow: { type: String, default: "The Visionaries" },
      heroTitle: { type: String, default: "Meet the Culinary Artists" },
      heroDescription: { type: String, default: "Our master chefs and event curators bring decades of generational knowledge, uniting traditional Madurai recipes with world-class hospitality." }
    },
    privacyPage: {
      heroEyebrow: { type: String, default: "Legal" },
      heroTitle: { type: String, default: "Privacy Policy" },
      heroDescription: { type: String, default: "Last updated: July 2026 · We take your privacy seriously." },
      sections: {
        type: [{ iconName: String, title: String, content: [String] }],
        default: [
          { iconName: "Database", title: "Information We Collect", content: ["Personal information you provide when registering or booking: name, email address, phone number, and city.", "Booking details including selected dates, time slots, number of guests, and payment transaction references.", "Usage data such as pages visited and features used, collected in aggregate to improve our service."] },
          { iconName: "Eye", title: "How We Use Your Information", content: ["To process and confirm your bookings, and to send you transactional emails such as booking confirmations and e-tickets.", "To manage your account, process refunds, and handle support requests.", "To send you important updates about the festival or changes to your booking. We do not send unsolicited marketing emails."] },
          { iconName: "Share2", title: "Sharing of Information", content: ["We do not sell, trade, or rent your personal information to third parties.", "We share payment information only with Razorpay, our secure payment gateway, which is PCI-DSS compliant. We do not store raw card details.", "We may disclose information to law enforcement if required by law or to protect the rights and safety of our guests and staff."] },
          { iconName: "Lock", title: "Data Security & Your Rights", content: ["We use industry-standard encryption (TLS/HTTPS) and secure MongoDB Atlas infrastructure to protect your data.", "You have the right to access, correct, or delete your personal information at any time by contacting us.", "You may request the deletion of your account and all associated data by sending an email to privacy@suvaialaya.com."] }
        ]
      }
    },
    termsPage: {
      heroEyebrow: { type: String, default: "Legal" },
      heroTitle: { type: String, default: "Terms & Conditions" },
      heroDescription: { type: String, default: "Last updated: July 2026 · Please read these terms carefully." },
      sections: {
        type: [{ iconName: String, title: String, content: [String] }],
        default: [
          { iconName: "FileText", title: "Booking and Payment", content: ["All bookings are subject to availability and confirmation upon successful payment.", "Prices are inclusive of applicable taxes unless stated otherwise.", "Payments are securely processed by Razorpay. Suvaialaya does not store credit card information."] },
          { iconName: "RefreshCcw", title: "Cancellations and Refunds", content: ["Cancellations made 24 hours prior to the booked slot are eligible for a full refund minus a 5% gateway processing fee.", "Refunds will be processed to the original payment method within 5-7 business days.", "No-shows or cancellations within 24 hours of the slot are non-refundable."] },
          { iconName: "ShieldAlert", title: "Code of Conduct", content: ["Guests are expected to behave respectfully towards staff and other guests.", "Management reserves the right to refuse service or remove individuals who violate the code of conduct, without refund.", "Outside food and beverages are strictly prohibited."] }
        ]
      }
    }
  },
  {
    timestamps: true,
  }
);

export const SystemSettings = (mongoose.models.SystemSettings as any) || mongoose.model("SystemSettings", systemSettingsSchema);
