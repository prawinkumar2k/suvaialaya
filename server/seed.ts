import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/User";
import { Event } from "./models/Event";
import { Booking } from "./models/Booking";

async function seedDatabase() {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/suvaialaya";
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany();
    await Event.deleteMany();
    await Booking.deleteMany();
    console.log("Cleared existing collections.");

    // Create Admin User
    await User.create({
      name: "Admin User",
      email: "admin@suvaialaya.com",
      phone: "9876543210",
      password: "admin123", // Mongoose 'pre-save' hook will hash this automatically
      role: "admin",
    });

    // Create Kitchen User
    await User.create({
      name: "Head Chef",
      email: "kitchen@suvaialaya.com",
      phone: "9876543211",
      password: "kitchen123",
      role: "kitchen_staff",
    });

    // Create Scanner User
    await User.create({
      name: "Security Guard",
      email: "scanner@suvaialaya.com",
      phone: "9876543212",
      password: "scanner123",
      role: "scanner",
    });

    // Create standard user
    const johnDoe = await User.create({
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      password: "password123", // Mongoose 'pre-save' hook will hash this automatically
      role: "customer",
    });
    console.log("Users seeded.");

    // Create Main Event
    const event = await Event.create({
      title: "Madurai Kari Virunthu",
      description: "An authentic Madurai style non-veg feast showcasing our rich culinary heritage.",
      venue: "Suvaialaya Restaurant, Madurai",
      basePrice: 1499,
      dates: [
        "2026-08-01", "2026-08-02", "2026-08-03", 
        "2026-08-04", "2026-08-05", "2026-08-06", 
        "2026-08-07", "2026-08-08", "2026-08-09"
      ],
      isActive: true,
      slots: [
        { time: "11:00 AM", capacity: 70, booked: 4 },
        { time: "01:00 PM", capacity: 70, booked: 6 },
        { time: "03:00 PM", capacity: 70, booked: 2 },
        { time: "05:00 PM", capacity: 70, booked: 8 },
        { time: "07:00 PM", capacity: 70, booked: 5 },
        { time: "09:00 PM", capacity: 70, booked: 2 },
      ]
    });
    console.log("Events seeded.");

    // Generate Mock Bookings for John Doe
    const mockBookings = [
      { date: "2026-08-01", slotTime: "01:00 PM", guests: 2, status: "Confirmed" },
      { date: "2026-08-02", slotTime: "07:00 PM", guests: 4, status: "Confirmed" },
      { date: "2026-08-04", slotTime: "01:00 PM", guests: 2, status: "Confirmed" },
      { date: "2026-08-05", slotTime: "05:00 PM", guests: 8, status: "Confirmed" },
      { date: "2026-08-06", slotTime: "11:00 AM", guests: 3, status: "Confirmed" },
      { date: "2026-08-08", slotTime: "09:00 PM", guests: 2, status: "Confirmed" },
      { date: "2026-08-09", slotTime: "03:00 PM", guests: 2, status: "Cancelled" },
    ];

    const bookingsToInsert = mockBookings.map((mb) => ({
      user: johnDoe._id,
      event: event._id,
      date: mb.date,
      slotTime: mb.slotTime,
      numberOfGuests: mb.guests,
      totalAmount: mb.guests * 1499,
      bookingStatus: mb.status,
      paymentStatus: mb.status === "Confirmed" ? "Completed" : "Pending",
      guestDetails: {
        fullName: "John Doe",
        age: 32,
        email: "john@example.com",
        phone: "1234567890",
        city: "Chennai",
        emergency: "9988776655"
      }
    }));

    await Booking.insertMany(bookingsToInsert);

    // Create another user so John Doe doesn't see everyone else's mock bookings
    const secondaryUser = await User.create({
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "0987654321",
      password: "password123", 
      role: "customer",
    });

    // Create some bookings for other random guests to fill up the ledger
    const guestNames = ["Priya Sharma", "Rahul Verma", "Arun Kumar", "Sneha Iyer", "Vikram Singh"];
    const otherBookings = guestNames.map((name, i) => ({
      user: secondaryUser._id, // linking to secondary user so John Doe's dashboard is clean
      event: event._id,
      date: `2026-08-0${i + 1}`,
      slotTime: i % 2 === 0 ? "07:00 PM" : "01:00 PM",
      numberOfGuests: (i % 3) + 2,
      totalAmount: ((i % 3) + 2) * 1499,
      bookingStatus: "Confirmed",
      paymentStatus: "Completed",
      guestDetails: {
        fullName: name,
        age: 25 + i * 2,
        email: `${name.split(" ")[0].toLowerCase()}@example.com`,
        phone: `987654321${i}`,
        city: "Madurai",
        emergency: `998877660${i}`
      }
    }));
    
    await Booking.insertMany(otherBookings);

    console.log("Mock Bookings seeded.");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
