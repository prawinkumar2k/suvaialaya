import mongoose from "mongoose";
import dotenv from "dotenv";
import { SystemSettings } from "./models/SystemSettings";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/event-ticket-hub";

const settingsData = {
  festival: {
    name: "Suvaialaya Grand Launch",
    restaurantName: "SUVAIALAYA",
    tagline: "Authentic South Indian Cuisine",
    eyebrow: "Something Grand is Coming Soon",
    dates: "Coming Soon",
    hours: "11:00 AM — 11:00 PM",
    venue: "N, 256/B, nearby Narayana Hrudayalaya Hospital, Bommasandra Industrial Area, Bommasandra, Karnataka 560099",
    description: "Experience the grand opening of Suvaialaya Restaurant in Bangalore. An exclusive event bringing the authentic flavors, culture, and hospitality of Madurai directly to your table."
  },
  welcomeItems: [
    { name: "Malli Flower", detail: "A fragrant welcome" },
    { name: "Sandhanam & Kungumam", detail: "A traditional blessing" },
    { name: "Panagam", detail: "Our welcome drink" },
  ],
  returnGifts: [
    { name: "Beeda", detail: "A perfect end" },
    { name: "Banana", detail: "Traditional offering" },
    { name: "Thank You Card", detail: "A note of gratitude" },
  ],
  testimonials: [
    { quote: "Finally, the authentic taste of Madurai has arrived in Bangalore.", name: "Karthikeyan S.", role: "Food Critic" },
    { quote: "The Mutton Kola Urundai and Bun Parotta transported me back home.", name: "Ananya R.", role: "Early Access Guest" },
    { quote: "A true South Indian fine dining experience. Every detail was perfect.", name: "Vishal V.", role: "Local Foodie" },
  ],
  faqs: [
    { question: "Where is the new restaurant located?", answer: "We are bringing the heart of Madurai to the soul of Bangalore. Stay tuned for our exact launch location!" },
    { question: "Is this for a special event or a restaurant reservation?", answer: "This platform allows you to pre-book your exclusive access to our Grand Opening Event in Bangalore." },
    { question: "Can I order a la carte?", answer: "During our grand launch, we highly recommend our exclusive Suvaialaya Special Combos (Chicken 8 Meal or Mutton 8 Meal) for the complete experience. A la carte is also available." },
    { question: "Can I book for a group?", answer: "Absolutely. You can reserve tables for your entire family to enjoy the grand feast together." },
  ],
  contactPhone: "90350 05335"
};

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    await SystemSettings.deleteMany({});
    console.log("Cleared existing settings");

    await SystemSettings.create(settingsData);
    console.log("System Settings seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding settings:", error);
    process.exit(1);
  }
};

seedDB();
