import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/User";
import { Event } from "./models/Event";
import { Booking } from "./models/Booking";

async function seedDatabase() {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/madurai-kari-virundhu";
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany();
    await Event.deleteMany();
    await Booking.deleteMany();
    console.log("Cleared existing collections.");

    // Create Admin User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);
    
    await User.create({
      name: "Admin User",
      email: "admin@suvaialaya.com",
      phone: "9876543210",
      password: hashedPassword, // explicitly hashing here since we might bypass save hooks in bulk ops, but create triggers it. Just to be safe.
      role: "admin",
    });

    // Create standard user
    const hashedUserPassword = await bcrypt.hash("password123", salt);
    await User.create({
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      password: hashedUserPassword,
      role: "customer",
    });
    console.log("Users seeded.");

    // Create Main Event
    await Event.create({
      title: "Madurai Kari Virunthu",
      description: "An authentic Madurai style non-veg feast showcasing our rich culinary heritage.",
      venue: "Suvaialaya Restaurant, Madurai",
      basePrice: 1499,
      dates: ["2026-08-06", "2026-08-07", "2026-08-08"],
      isActive: true,
      slots: [
        { time: "11:00 AM", capacity: 70, booked: 20 },
        { time: "01:00 PM", capacity: 70, booked: 65 }, // Filling fast simulation
        { time: "03:00 PM", capacity: 70, booked: 5 },
        { time: "05:00 PM", capacity: 70, booked: 70 }, // Sold out simulation
      ]
    });
    console.log("Events seeded.");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
