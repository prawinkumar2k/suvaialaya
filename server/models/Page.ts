import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true }, // 'landing', 'about', 'gallery', 'menu'
    title: { type: String },
    heroEyebrow: { type: String },
    heroTitle: { type: String },
    heroDescription: { type: String },
    heroDescription1: { type: String },
    heroDescription2: { type: String },
    preloaderText1: { type: String, default: "DIGITAL SOUL OF MADURAI" },
    preloaderText2: { type: String, default: "WELCOME TO SUVAIALAYA" },
    preloaderText3: { type: String, default: "THE CITY WHERE TRADITION IS SERVED WITH LOVE" },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Page = (mongoose.models.Page as any) || mongoose.model("Page", pageSchema);
