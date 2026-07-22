import "dotenv/config";
import mongoose from "mongoose";
import { MenuItem } from "./models/MenuItem";

// Import the hardcoded data to seed
const menuHighlights = [
  { name: "Mutton Briyani - Seeraga Samba", category: "Suvaialaya Briyani", description: "Authentic Madurai style briyani cooked with aromatic seeraga samba rice and tender mutton.", price: 369, isVeg: false },
  { name: "Chicken Briyani - Seeraga Samba", category: "Suvaialaya Briyani", description: "Classic chicken briyani with rich seeraga samba spices.", price: 269, isVeg: false },
  { name: "Mutton Kola Urundai", category: "Mutton Starters", description: "Crispy, hand-rolled spiced mutton meatballs.", price: 249, isVeg: false },
  { name: "Mutton Nei Chukka", category: "Mutton Starters", description: "Tender mutton chunks roasted in pure ghee and pepper.", price: 299, isVeg: false },
  { name: "Karaikudi Mutton Ghee Roast", category: "Mutton Starters", description: "Fiery Karaikudi spices blended with rich ghee roast.", price: 299, isVeg: false },
  { name: "Kongu Thokku Meals", category: "Meals", description: "4 Types of Thokku, Fish curry, Mutton gravy, Rice, Day spl chicken, egg, poriyal, rasam, curd, gulkand, banana.", price: 399, isVeg: false },
  { name: "Mutton Meals", category: "Meals", description: "Ponni Rice, Bun parotta, Mutton Gravy, chicken/mutton starters, egg, rasam, curd, sweet.", price: 395, isVeg: false },
  { name: "Chettinad Chicken Chukka", category: "Chicken Starters", description: "Authentic Chettinad spiced dry chicken roast.", price: 229, isVeg: false },
  { name: "Chicken 65 - Boneless", category: "Chicken Starters", description: "Classic spicy deep-fried chicken bites.", price: 199, isVeg: false },
  { name: "Dragon Chicken", category: "Chicken Starters", description: "Indo-Chinese fusion spicy chicken starter.", price: 229, isVeg: false },
  { name: "Meen Polichathu - Vanjaram", category: "Seafood Starters", description: "Vanjaram fish marinated in spices and roasted inside a banana leaf.", price: 349, isVeg: false },
  { name: "Tandoori Fish", category: "Seafood Starters", description: "Fresh fish marinated in tandoori spices and grilled.", price: 299, isVeg: false },
  { name: "Butter Garlic Prawns", category: "Seafood Starters", description: "Juicy prawns tossed in rich garlic butter.", price: 299, isVeg: false },
  { name: "Bun / Nool Parotta", category: "Tawa Breads", description: "Madurai's famous fluffy, layered bun parotta.", price: 49, isVeg: true },
  { name: "Kari Dosa (Chicken / Mutton)", category: "Non-veg Tiffin", description: "Soft dosa layered with rich minced meat curry.", price: 199, isVeg: false },
  { name: "Kothu Parotta", category: "Parotta", description: "Minced parotta tossed with spices, egg, and meat gravy.", price: 179, isVeg: false },
  { name: "Mutton 8 Meal Combo", category: "Special Combo", description: "Sweet, Mini Mutton Briyani, Bun Parrota, Mutton Gravy, Mutton Varuval, Chicken Starters, Boiled egg and Onion Raita.", price: 1499, isVeg: false },
  { name: "Madurai Jigarthanda", category: "Desserts", description: "The city's beloved cool, silky dessert to end the feast.", price: 119, isVeg: true },
  { name: "Elaneer Payasam", category: "Desserts", description: "Tender coconut sweet pudding.", price: 99, isVeg: true }
];

async function seedMenu() {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/suvaialaya";
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for menu seeding...");

    await MenuItem.deleteMany({});
    console.log("Cleared existing menu items.");

    await MenuItem.insertMany(menuHighlights);
    console.log("Menu Items seeded successfully!");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding menu:", error);
    process.exit(1);
  }
}

seedMenu();
