import { FeatureFlag, FlagKey, FLAG_KEYS } from "../models/FeatureFlag";
import { getRedisClient } from "./redis";
import { logger } from "./logger";

// ─── Feature Flag Service ─────────────────────────────────────────────────────
// Redis caching with 60-second TTL for ultra-low latency reads.
// On Redis miss: falls back to MongoDB. On MongoDB miss: defaults to enabled.
// This means even if Redis AND MongoDB are down, the app keeps running.

const FLAG_CACHE_TTL = 60; // seconds
const CACHE_PREFIX = "flag:";

// ─── Read a flag (with Redis cache) ──────────────────────────────────────────
export async function isEnabled(key: FlagKey, tenantId?: string): Promise<boolean> {
  const cacheKey = `${CACHE_PREFIX}${tenantId || "global"}:${key}`;
  try {
    const redis = getRedisClient();
    const cached = await redis.get(cacheKey);
    if (cached !== null) {
      return cached === "1";
    }
  } catch {
    // Redis down — fall through to DB
  }

  try {
    const flag = await FeatureFlag.findOne({
      key,
      $or: [{ tenantId: null }, { tenantId: tenantId || null }],
    })
      .sort({ tenantId: -1 }) // Tenant-specific overrides global
      .lean();

    const value = flag ? flag.enabled : true; // Default: enabled

    // Cache the result
    try {
      const redis = getRedisClient();
      await redis.setex(cacheKey, FLAG_CACHE_TTL, value ? "1" : "0");
    } catch {}

    return value;
  } catch (err: any) {
    logger.error("Feature flag read failed — defaulting to enabled", { key, error: err.message });
    return true; // Fail-open: never block core functionality due to flag service failure
  }
}

// ─── Get numeric flag value (e.g., canary %) ─────────────────────────────────
export async function getFlagValue(key: FlagKey): Promise<any> {
  try {
    const flag = await FeatureFlag.findOne({ key, tenantId: null }).lean();
    return flag?.value ?? null;
  } catch {
    return null;
  }
}

// ─── Set a flag (clears Redis cache) ─────────────────────────────────────────
export async function setFlag(
  key: FlagKey,
  enabled: boolean,
  value?: any,
  changedBy?: string,
  tenantId?: string
): Promise<void> {
  await FeatureFlag.findOneAndUpdate(
    { key, tenantId: tenantId || null },
    {
      enabled,
      value: value ?? null,
      lastChangedBy: changedBy,
      lastChangedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  // Bust the cache
  try {
    const redis = getRedisClient();
    await redis.del(`${CACHE_PREFIX}${tenantId || "global"}:${key}`);
  } catch {}

  logger.info("Feature flag updated", { key, enabled, value, changedBy });
}

// ─── Check maintenance mode (called on EVERY request) ────────────────────────
export async function isMaintenanceMode(): Promise<boolean> {
  return isEnabled("system.maintenance.mode");
}

// ─── Seed default flags (run on server start) ────────────────────────────────
export async function seedDefaultFlags(): Promise<void> {
  const defaults: { key: FlagKey; enabled: boolean; description: string; value?: any }[] = [
    { key: "payment.online.enabled", enabled: true, description: "Razorpay online payment" },
    { key: "payment.offline.enabled", enabled: false, description: "Manual / cash payment fallback" },
    { key: "notification.email.enabled", enabled: true, description: "Email confirmations via Resend" },
    { key: "notification.whatsapp.enabled", enabled: false, description: "WhatsApp notifications" },
    { key: "notification.sms.enabled", enabled: false, description: "SMS notifications" },
    { key: "ticket.qr.enabled", enabled: true, description: "QR code generation" },
    { key: "ticket.manual.entry.enabled", enabled: false, description: "Manual check-in by name (QR fallback)" },
    { key: "booking.waitlist.enabled", enabled: true, description: "Waitlist engine" },
    { key: "booking.cancellation.enabled", enabled: true, description: "Guest cancellations" },
    { key: "booking.public.enabled", enabled: true, description: "Accept new public bookings" },
    { key: "dashboard.kitchen.enabled", enabled: true, description: "Kitchen dashboard" },
    { key: "dashboard.reception.enabled", enabled: true, description: "Reception dashboard" },
    { key: "dashboard.analytics.enabled", enabled: true, description: "Analytics dashboard" },
    { key: "system.maintenance.mode", enabled: false, description: "🔴 Emergency: Block all traffic" },
    { key: "system.read.only.mode", enabled: false, description: "🟡 Block new bookings, allow reads" },
    { key: "system.debug.logging", enabled: false, description: "Verbose debug logging" },
    { key: "system.rate.limit.strict", enabled: false, description: "Tighten rate limits" },
    { key: "release.canary.enabled", enabled: false, description: "Canary release active" },
    { key: "release.canary.percentage", enabled: true, value: 0, description: "% of users on new version" },
  ];

  for (const flag of defaults) {
    await FeatureFlag.findOneAndUpdate(
      { key: flag.key, tenantId: null },
      { $setOnInsert: { enabled: flag.enabled, description: flag.description, value: flag.value ?? null } },
      { upsert: true }
    );
  }

  logger.info("Feature flags seeded", { count: defaults.length });
}
