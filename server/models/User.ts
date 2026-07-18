import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ─── Role Hierarchy ───────────────────────────────────────────────────────────
// owner > super_admin > admin > manager > receptionist > kitchen_staff > scanner > finance > customer
export const USER_ROLES = [
  "customer",
  "scanner",        // Gate staff — can only scan QR codes
  "kitchen_staff",  // Kitchen — can only view kitchen dashboard
  "receptionist",   // Front desk — can view reception dashboard + check-in
  "finance",        // Finance team — can view revenue reports
  "manager",        // Ops manager — full operational access, no system config
  "admin",          // Full admin — can manage events and bookings
  "super_admin",    // IT admin — can manage users and view audit logs
  "owner",          // Restaurant owner — full access including analytics
] as const;

export type UserRole = (typeof USER_ROLES)[number];

// ─── RBAC Permission Map ──────────────────────────────────────────────────────
// Defines what each role can access — used by authorize() middleware
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  customer: ["booking:read:own", "payment:create", "profile:read:own", "waitlist:read:own"],
  scanner: ["booking:scan", "booking:checkin"],
  kitchen_staff: ["dashboard:kitchen"],
  receptionist: ["booking:checkin", "dashboard:reception", "booking:read:slot"],
  finance: ["analytics:revenue", "booking:read:all"],
  manager: ["booking:read:all", "booking:cancel", "dashboard:ops", "dashboard:kitchen", "dashboard:reception"],
  admin: ["booking:read:all", "booking:cancel", "booking:checkin", "event:manage", "analytics:ops"],
  super_admin: ["*:admin", "audit:read", "user:manage"],
  owner: ["*"], // Full access
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "customer",
      index: true,
    },

    // ─── Profile ─────────────────────────────────────────────────────────────
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },

    // ─── Security ─────────────────────────────────────────────────────────────
    lastLoginAt: { type: Date },
    lastLoginIP: { type: String },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date }, // Account lockout after too many failed logins
    otpCode: { type: String, select: false },
    otpExpiry: { type: Date, select: false },

    // ─── Preferences (for future personalization) ─────────────────────────────
    preferences: {
      notifications: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
      dietary: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

// ─── Password hashing ─────────────────────────────────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12); // Increased from 10 to 12 rounds
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Password comparison ─────────────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Account lockout check ────────────────────────────────────────────────────
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

export const User = (mongoose.models.User as any) || mongoose.model("User", userSchema);
