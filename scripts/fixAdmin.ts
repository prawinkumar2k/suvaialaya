import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../server/models/User";

dotenv.config();

const fixAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/suvaialaya");
    
    // Unlock the admin account and reset password
    const admin = await User.findOne({ email: "admin@suvaialaya.com" });
    if (admin) {
      admin.failedLoginAttempts = 0;
      admin.lockUntil = undefined;
      admin.isActive = true;
      admin.password = "admin123"; // This will be hashed by the pre-save hook
      await admin.save();
      console.log("Admin account unlocked and password reset to admin123");
    } else {
      console.log("Admin account not found");
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

fixAdmin();
