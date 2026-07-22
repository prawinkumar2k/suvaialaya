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
    welcomeItems: [
      { name: String, detail: String }
    ],
    returnGifts: [
      { name: String, detail: String }
    ],
    testimonials: [
      { quote: String, name: String, role: String }
    ],
    faqs: [
      { question: String, answer: String }
    ],
    contactPhone: { type: String, default: "90350 05335" }
  },
  {
    timestamps: true,
  }
);

export const SystemSettings = (mongoose.models.SystemSettings as any) || mongoose.model("SystemSettings", systemSettingsSchema);
