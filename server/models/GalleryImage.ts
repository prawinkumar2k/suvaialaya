import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema(
  {
    src: { type: String, required: true },
    alt: { type: String, required: true },
    className: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const GalleryImage = (mongoose.models.GalleryImage as any) || mongoose.model("GalleryImage", galleryImageSchema);
