import mongoose from "mongoose";

// ─── Waitlist Schema ──────────────────────────────────────────────────────────
// Manages FIFO queue for users when a slot is at capacity.
// When a seat is released, the first "waiting" entry gets auto-promoted.

const waitlistSchema = new mongoose.Schema(
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
    // Composite key for fast lookup: "{eventId}:{date}:{slotTime}"
    slotKey: {
      type: String,
      required: true,
      index: true,
    },
    date: { type: String, required: true },
    slotTime: { type: String, required: true },
    numberOfGuests: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["waiting", "notified", "booked", "expired"],
      default: "waiting",
      index: true,
    },
    position: { type: Number, required: true },
    notifiedAt: { type: Date },
    // Auto-expire notified entries after 10 minutes if user doesn't book
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

// Compound index for efficient FIFO queue lookups
waitlistSchema.index({ slotKey: 1, status: 1, createdAt: 1 });
waitlistSchema.index({ user: 1, event: 1, status: 1 });

export const Waitlist = (mongoose.models.Waitlist as any) || mongoose.model("Waitlist", waitlistSchema);
