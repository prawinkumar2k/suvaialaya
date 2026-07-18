import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  time: {
    type: String,
    required: [true, "Slot time is required"],
  },
  capacity: {
    type: Number,
    required: [true, "Slot capacity is required"],
    default: 70,
  },
  booked: {
    type: Number,
    default: 0,
    min: 0,
  },
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
    },
    venue: {
      type: String,
      required: [true, "Event venue is required"],
    },
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
    },
    dates: {
      type: [String],
      required: [true, "At least one date is required"],
      index: true,
    },
    slots: [slotSchema],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // ─── Schema version for optimistic locking ──────────────────────────────
    __v: { type: Number, select: false },
  },
  {
    timestamps: true,
    optimisticConcurrency: true, // Mongoose OCC — adds __v version checking
  }
);

// ─── Full-text search index ─────────────────────────────────────────────────
eventSchema.index({ title: "text", description: "text" });

export const Event = (mongoose.models.Event as any) || mongoose.model("Event", eventSchema);
