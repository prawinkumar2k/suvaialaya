import mongoose from "mongoose";

// ─── Subscription Plans ───────────────────────────────────────────────────────
// Starter → Professional → Enterprise → Custom (white-label)
export const SUBSCRIPTION_PLANS = ["starter", "professional", "enterprise", "custom"] as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export const PLAN_LIMITS: Record<SubscriptionPlan, {
  maxEvents: number;
  maxBookingsPerMonth: number;
  maxGuests: number;
  maxAdmins: number;
  storageGB: number;
  apiRequestsPerDay: number;
  features: string[];
}> = {
  starter: {
    maxEvents: 2,
    maxBookingsPerMonth: 500,
    maxGuests: 1000,
    maxAdmins: 2,
    storageGB: 5,
    apiRequestsPerDay: 5000,
    features: ["booking", "qr", "email"],
  },
  professional: {
    maxEvents: 10,
    maxBookingsPerMonth: 5000,
    maxGuests: 10000,
    maxAdmins: 10,
    storageGB: 50,
    apiRequestsPerDay: 50000,
    features: ["booking", "qr", "email", "sms", "waitlist", "analytics", "kitchen", "reception"],
  },
  enterprise: {
    maxEvents: 100,
    maxBookingsPerMonth: 50000,
    maxGuests: 100000,
    maxAdmins: 50,
    storageGB: 500,
    apiRequestsPerDay: 500000,
    features: ["*"], // All features
  },
  custom: {
    maxEvents: 9999,
    maxBookingsPerMonth: 9999999,
    maxGuests: 9999999,
    maxAdmins: 9999,
    storageGB: 9999,
    apiRequestsPerDay: 9999999,
    features: ["*"],
  },
};

// ─── Tenant Schema ─────────────────────────────────────────────────────────────
// Each restaurant is a separate tenant. This is the foundation of multi-tenancy.
const tenantSchema = new mongoose.Schema(
  {
    // ─── Identity ────────────────────────────────────────────────────────────
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    domain: { type: String, unique: true, sparse: true }, // custom domain support
    logo: { type: String },
    primaryColor: { type: String, default: "#0F3B28" },

    // ─── Contact ─────────────────────────────────────────────────────────────
    ownerEmail: { type: String, required: true },
    ownerPhone: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String, default: "India" },
    gstin: { type: String }, // GST for billing

    // ─── License / Subscription ───────────────────────────────────────────────
    plan: {
      type: String,
      enum: SUBSCRIPTION_PLANS,
      default: "starter",
      index: true,
    },
    licenseKey: { type: String, unique: true, sparse: true },
    licenseStatus: {
      type: String,
      enum: ["active", "trial", "suspended", "expired", "cancelled"],
      default: "trial",
      index: true,
    },
    trialEndsAt: { type: Date },
    subscriptionStartsAt: { type: Date },
    subscriptionEndsAt: { type: Date, index: true },
    // Annual/monthly billing
    billingCycle: { type: String, enum: ["monthly", "annual"], default: "monthly" },
    billingAmount: { type: Number }, // INR per cycle

    // ─── Usage Tracking ───────────────────────────────────────────────────────
    usage: {
      bookingsThisMonth: { type: Number, default: 0 },
      apiRequestsToday: { type: Number, default: 0 },
      storageUsedGB: { type: Number, default: 0 },
      lastUsageResetAt: { type: Date, default: Date.now },
    },

    // ─── Status ───────────────────────────────────────────────────────────────
    isActive: { type: Boolean, default: true, index: true },
    suspendedAt: { type: Date },
    suspendReason: { type: String },

    // ─── Meta ─────────────────────────────────────────────────────────────────
    timezone: { type: String, default: "Asia/Kolkata" },
    currency: { type: String, default: "INR" },
    locale: { type: String, default: "en-IN" },
  },
  { timestamps: true }
);

// Plan limits virtual
tenantSchema.virtual("planLimits").get(function () {
  return PLAN_LIMITS[this.plan as SubscriptionPlan];
});

// Check if subscription is valid
tenantSchema.methods.isLicenseValid = function (): boolean {
  if (this.licenseStatus === "suspended" || this.licenseStatus === "cancelled") return false;
  if (this.licenseStatus === "expired") return false;
  if (this.licenseStatus === "trial" && this.trialEndsAt && this.trialEndsAt < new Date()) return false;
  if (this.subscriptionEndsAt && this.subscriptionEndsAt < new Date()) return false;
  return true;
};

export const Tenant = (mongoose.models.Tenant as any) || mongoose.model("Tenant", tenantSchema);
