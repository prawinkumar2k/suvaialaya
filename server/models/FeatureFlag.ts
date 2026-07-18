import mongoose from "mongoose";

// ─── Feature Flag Schema ──────────────────────────────────────────────────────
// Netflix/Uber standard: every feature can be disabled at runtime without
// a redeployment. This is the kill switch for the entire platform.

export const FLAG_KEYS = [
  // ── Payment Channels ────────────────────────────────────────────────────────
  "payment.online.enabled",        // Razorpay online payment
  "payment.offline.enabled",       // Manual / cash at desk
  "payment.partial.enabled",       // Allow partial advance payments

  // ── Notification Channels ───────────────────────────────────────────────────
  "notification.email.enabled",    // Send confirmation emails
  "notification.whatsapp.enabled", // WhatsApp notifications
  "notification.sms.enabled",      // SMS notifications
  "notification.telegram.enabled", // Telegram alerts to ops

  // ── Ticketing ───────────────────────────────────────────────────────────────
  "ticket.qr.enabled",             // QR code generation
  "ticket.pdf.enabled",            // PDF ticket generation
  "ticket.manual.entry.enabled",   // Fallback: manual name-based entry

  // ── Booking Features ────────────────────────────────────────────────────────
  "booking.waitlist.enabled",      // Waitlist engine
  "booking.cancellation.enabled",  // Allow guest cancellations
  "booking.public.enabled",        // Accept new public bookings

  // ── Ops Dashboards ──────────────────────────────────────────────────────────
  "dashboard.kitchen.enabled",
  "dashboard.reception.enabled",
  "dashboard.analytics.enabled",

  // ── System-level Emergency Controls ────────────────────────────────────────
  "system.maintenance.mode",       // 🔴 Blocks all traffic with maintenance page
  "system.read.only.mode",         // 🟡 Read-only: no new bookings or payments
  "system.debug.logging",          // Verbose logging for diagnostics
  "system.rate.limit.strict",      // Tighten rate limits on suspected attack

  // ── Deployment Controls ─────────────────────────────────────────────────────
  "release.canary.enabled",        // Route X% traffic to new version
  "release.canary.percentage",     // 0–100 — % of users on new version
] as const;

export type FlagKey = (typeof FLAG_KEYS)[number];

const featureFlagSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    enabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    // For numeric flags (e.g., canary percentage)
    value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // Who controls this flag — null = platform-wide
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
      index: true,
    },
    description: { type: String },
    // Who last changed it and when (for audit trail)
    lastChangedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastChangedAt: { type: Date },
    // Scheduled auto-enable/disable (maintenance window)
    scheduledEnableAt: { type: Date },
    scheduledDisableAt: { type: Date },
    // Tags for grouping
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export const FeatureFlag = (mongoose.models.FeatureFlag as any) || mongoose.model("FeatureFlag", featureFlagSchema);
