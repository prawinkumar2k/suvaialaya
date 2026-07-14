import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    slotTime: {
      type: String,
      required: true,
    },
    guestDetails: {
      fullName: { type: String, required: true },
      age: { type: Number, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, required: true },
      emergency: { type: String, required: true },
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending",
    },
    bookingStatus: {
      type: String,
      enum: ["Confirmed", "Cancelled", "Attended"],
      default: "Confirmed",
    },
    qrCodeUrl: {
      type: String, // will be generated in Phase 6
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);
