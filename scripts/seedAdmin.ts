import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../server/models/User";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/suvaialaya");
    
    // Check if admin exists
    const adminExists = await User.findOne({ email: "admin@suvaialaya.com" });
    if (!adminExists) {
      await User.create({
        name: "Super Admin",
        email: "admin@suvaialaya.com",
        phone: "9999999999",
        password: "admin123",
        role: "admin",
      });
      console.log("Admin user created.");
    } else {
      console.log("Admin user already exists.");
    }

    const kitchenExists = await User.findOne({ email: "kitchen@suvaialaya.com" });
    if (!kitchenExists) {
      await User.create({
        name: "Head Chef",
        email: "kitchen@suvaialaya.com",
        phone: "8888888888",
        password: "admin123",
        role: "kitchen_staff",
      });
      console.log("Kitchen user created.");
    }

    const johnExists = await User.findOne({ email: "john@example.com" });
    if (!johnExists) {
      await User.create({
        name: "John Doe",
        email: "john@example.com",
        phone: "7777777777",
        password: "password123",
        role: "user",
      });
      console.log("User John created.");
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
