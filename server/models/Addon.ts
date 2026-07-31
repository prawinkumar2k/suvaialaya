import mongoose from "mongoose";

const addonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Add-on name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Add-on description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    imageUrl: {
      type: String,
      default: "/images/placeholders/addon.png",
    },
    stock: {
      type: Number,
      default: -1, // -1 means unlimited
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Addon = (mongoose.models.Addon as any) || mongoose.model("Addon", addonSchema);
