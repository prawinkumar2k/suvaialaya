import mongoose from "mongoose";

const organizerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organizer name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Organizer role is required"], // e.g., "Head Chef", "Event Coordinator"
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    imageUrl: {
      type: String,
      default: "/images/placeholders/organizer.png",
    },
    order: {
      type: Number,
      default: 0, // Used for sorting on the frontend
    },
    socialLinks: {
      instagram: { type: String, trim: true },
      twitter: { type: String, trim: true },
      linkedin: { type: String, trim: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Organizer = (mongoose.models.Organizer as any) || mongoose.model("Organizer", organizerSchema);
