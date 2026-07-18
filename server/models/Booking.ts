import mongoose from "mongoose";

const guestDetailSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    emergency: { type: String, required: false },
    // ─── Operations fields (Kitchen Dashboard, Reception) ───────────────────
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    isVIP: { type: Boolean, default: false },
    isReturningCustomer: { type: Boolean, default: false },
    // Dietary preferences for Kitchen Dashboard
    mealPreference: {
      type: String,
      enum: ["chicken", "mutton", "fish", "vegetarian", "mixed"],
      default: "mixed",
    },
    isChild: { type: Boolean, default: false },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    date: { type: String, required: true, index: true },
    slotTime: { type: String, required: true, index: true },
    guestDetails: guestDetailSchema,
    numberOfGuests: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true },

    // ─── Payment ────────────────────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending",
      index: true,
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },

    // ─── Booking Status ─────────────────────────────────────────────────────
    bookingStatus: {
      type: String,
      enum: ["Confirmed", "Cancelled", "Attended", "NoShow"],
      default: "Confirmed",
      index: true,
    },

    // ─── Ticketing ──────────────────────────────────────────────────────────
    qrCodeUrl: { type: String },
    ticketPdfUrl: { type: String },

    // ─── Idempotency key (prevents duplicate bookings on retry) ─────────────
    idempotencyKey: { type: String, unique: true, sparse: true },

    // ─── Cancellation & Refund ─────────────────────────────────────────────
    cancelledAt: { type: Date },
    cancelReason: { type: String },
    refundId: { type: String },
    refundStatus: {
      type: String,
      enum: ["none", "pending", "processed", "failed"],
      default: "none",
    },

    // ─── Check-in ──────────────────────────────────────────────────────────
    checkedInAt: { type: Date },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // ─── Source ────────────────────────────────────────────────────────────
    bookingSource: {
      type: String,
      enum: ["web", "admin", "api"],
      default: "web",
    },
  },
  { timestamps: true }
);

// ─── Compound indexes for operational dashboards ─────────────────────────────
bookingSchema.index({ event: 1, date: 1, slotTime: 1 });
bookingSchema.index({ event: 1, date: 1, bookingStatus: 1 });
bookingSchema.index({ event: 1, paymentStatus: 1 });
bookingSchema.index({ createdAt: -1 });

export const Booking = (mongoose.models.Booking as any) || mongoose.model("Booking", bookingSchema);
