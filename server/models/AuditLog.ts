import mongoose from "mongoose";

// ─── Audit Log Schema ─────────────────────────────────────────────────────────
// Immutable append-only event trail for every significant action in the system.
// Think: PCI-DSS compliant audit trail, forensic investigation capability.

const auditLogSchema = new mongoose.Schema(
  {
    // ─── Who ─────────────────────────────────────────────────────────────────
    actor: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String },
      adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // If admin acted on behalf
    },

    // ─── What ────────────────────────────────────────────────────────────────
    action: {
      type: String,
      required: true,
      enum: [
        // Authentication
        "auth.login.success",
        "auth.login.failed",
        "auth.register",
        "auth.logout",
        "auth.token.refresh",
        // Booking
        "booking.created",
        "booking.cancelled",
        "booking.checkin",
        "booking.no_show",
        "booking.waitlist.joined",
        "booking.waitlist.promoted",
        // Payment
        "payment.order.created",
        "payment.success",
        "payment.failed",
        "payment.refund.initiated",
        "payment.refund.success",
        "payment.refund.failed",
        "payment.webhook.received",
        // QR / Ticket
        "qr.generated",
        "qr.scanned",
        "qr.scan.duplicate",
        "qr.scan.failed",
        "pdf.downloaded",
        // Admin
        "admin.event.created",
        "admin.event.updated",
        "admin.booking.cancelled",
        "admin.user.role.changed",
        "admin.reports.exported",
        // System
        "system.backup.started",
        "system.backup.success",
        "system.backup.failed",
        "system.health.degraded",
        "system.alert.fired",
      ],
      index: true,
    },

    // ─── Target ───────────────────────────────────────────────────────────────
    resource: {
      type: { type: String }, // "booking", "payment", "user", "event"
      id: { type: String },
    },

    // ─── Result ───────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["success", "failure", "warning"],
      default: "success",
      index: true,
    },
    errorMessage: { type: String },

    // ─── Request context ─────────────────────────────────────────────────────
    request: {
      ip: { type: String },
      userAgent: { type: String },
      method: { type: String },
      path: { type: String },
      duration: { type: Number }, // ms
    },

    // ─── Payload snapshot (partial — no PII/secrets) ──────────────────────────
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
    // Immutable — no updates allowed
    strict: true,
  }
);

// ─── Indexes for forensic queries ─────────────────────────────────────────────
auditLogSchema.index({ "actor.userId": 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ "resource.id": 1, createdAt: -1 });
auditLogSchema.index({ status: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 }); // TTL: auto-expire after 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 3600 });

export const AuditLog = (mongoose.models.AuditLog as any) || mongoose.model("AuditLog", auditLogSchema);
