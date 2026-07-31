import mongoose from "mongoose";

const landingStatSchema = new mongoose.Schema(
  {
    value: { type: String, required: true },
    label: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const LandingStat = (mongoose.models.LandingStat as any) || mongoose.model("LandingStat", landingStatSchema);
