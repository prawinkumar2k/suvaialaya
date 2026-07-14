import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  time: {
    type: String, // e.g., "11:00 AM"
    required: [true, "Slot time is required"],
  },
  capacity: {
    type: Number,
    required: [true, "Slot capacity is required"],
    default: 70, // 70 guests per slot as per requirement
  },
  booked: {
    type: Number,
    default: 0,
  },
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
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
      type: [String], // Storing as 'YYYY-MM-DD' for simplicity
      required: [true, "At least one date is required"],
    },
    slots: [slotSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
