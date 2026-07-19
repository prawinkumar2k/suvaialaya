import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/suvaialaya";

async function resetPasswords() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const result = await mongoose.connection.collection("users").updateMany(
    {},
    { $set: { password: hashedPassword } }
  );

  console.log(`Reset ${result.modifiedCount} users to password 'password123'.`);
  
  const users = await mongoose.connection.collection("users").find({}).toArray();
  console.log("Available accounts:");
  users.forEach(u => console.log(`- Email: ${u.email}`));

  await mongoose.disconnect();
}

resetPasswords().catch(console.error);
