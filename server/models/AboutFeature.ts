import mongoose from "mongoose";

const aboutFeatureSchema = new mongoose.Schema(
  {
    iconName: { type: String, required: true },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const AboutFeature = (mongoose.models.AboutFeature as any) || mongoose.model("AboutFeature", aboutFeatureSchema);
