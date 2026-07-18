import mongoose from "mongoose";

// ─── Priority Levels (PagerDuty / OpsGenie standard) ─────────────────────────
// P1 = Critical / Business down (respond in 15min)
// P2 = High / Major feature broken (respond in 1hr)
// P3 = Medium / Minor impact (respond in 4hr)
// P4 = Low / Cosmetic / No user impact (respond next business day)

export type IncidentPriority = "P1" | "P2" | "P3" | "P4";
export type IncidentStatus = "open" | "investigating" | "mitigated" | "resolved" | "post-mortem";

const timelineEventSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true, default: Date.now },
    actor: { type: String, default: "system" }, // "system" or userId
    action: { type: String, required: true },
    note: { type: String },
  },
  { _id: false }
);

const incidentSchema = new mongoose.Schema(
  {
    // ─── Identity ─────────────────────────────────────────────────────────────
    incidentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ─── Classification ───────────────────────────────────────────────────────
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: {
      type: String,
      enum: ["P1", "P2", "P3", "P4"],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        "database",        // MongoDB/Redis down
        "payment",         // Payment gateway failure
        "api",             // API service degraded
        "qr",              // QR generation failure
        "notification",    // Email/SMS/Telegram failure
        "deployment",      // Deployment failure
        "security",        // Security incident / breach attempt
        "backup",          // Backup failure
        "infrastructure",  // Docker/K8s/Nginx failure
        "unknown",
      ],
      default: "unknown",
    },

    // ─── Status Lifecycle ─────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["open", "investigating", "mitigated", "resolved", "post-mortem"],
      default: "open",
      index: true,
    },

    // ─── Tenant Scope ─────────────────────────────────────────────────────────
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", default: null },

    // ─── Impact ───────────────────────────────────────────────────────────────
    affectedUsers: { type: Number, default: 0 },
    affectedRevenue: { type: Number, default: 0 }, // Estimated revenue at risk (INR)
    affectedServices: [{ type: String }],

    // ─── Timeline (append-only event log) ────────────────────────────────────
    timeline: [timelineEventSchema],

    // ─── Resolution ───────────────────────────────────────────────────────────
    detectedAt: { type: Date, default: Date.now },
    acknowledgedAt: { type: Date },
    mitigatedAt: { type: Date },
    resolvedAt: { type: Date },
    resolutionNote: { type: String },
    rootCause: { type: String },
    preventionMeasures: { type: String },

    // ─── Alerts Sent ──────────────────────────────────────────────────────────
    alertsSent: {
      telegram: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
      slack: { type: Boolean, default: false },
    },

    // ─── Assignee ─────────────────────────────────────────────────────────────
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // ─── Metrics snapshot at time of incident ─────────────────────────────────
    diagnosticSnapshot: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

incidentSchema.index({ status: 1, priority: 1 });
incidentSchema.index({ detectedAt: -1 });
incidentSchema.index({ category: 1, status: 1 });

export const Incident = (mongoose.models.Incident as any) || mongoose.model("Incident", incidentSchema);
