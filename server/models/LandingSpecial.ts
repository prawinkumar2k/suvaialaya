import mongoose from "mongoose";

const landingSpecialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    desc: { type: String, required: true },
    tag: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const LandingSpecial = (mongoose.models.LandingSpecial as any) || mongoose.model("LandingSpecial", landingSpecialSchema);
