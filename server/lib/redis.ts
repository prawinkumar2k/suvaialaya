import IORedis from "ioredis";
import { logger } from "./logger";

// ─── Singleton Redis client ──────────────────────────────────────────────────
// BullMQ requires a specific connection config, so we export the options object
// for workers/queues AND a shared client for direct cache operations.

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

export const redisConnection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  // Prevent commands from hanging infinitely when Redis is offline
  enableOfflineQueue: false,
  retryStrategy: (times: number) => {
    // Exponential backoff to avoid spamming the CPU/memory when Redis is offline
    return Math.min(times * 1000, 10000);
  }
};

let redisClient: IORedis | null = null;

export function getRedisClient(): IORedis {
  if (!redisClient) {
    redisClient = new IORedis({
      ...redisConnection,
      maxRetriesPerRequest: null, // Required by BullMQ
      lazyConnect: true,
      enableReadyCheck: true,
      reconnectOnError: (err) => {
        logger.error("Redis reconnect triggered", { error: err.message });
        return true;
      },
    });

    redisClient.on("connect", () => {
      logger.info("Redis connected successfully");
    });

    redisClient.on("error", (err) => {
      if (err.message.includes("ECONNREFUSED")) return;
      logger.error("Redis client error", { error: err.message });
    });

    redisClient.on("close", () => {
      // Suppress spammy log
    });
  }
  return redisClient;
}

// ─── Seat Lock Operations ─────────────────────────────────────────────────────
// Locks N seats in a slot atomically using Redis SET NX EX.
// TTL: 600 seconds (10 minutes) — user must pay within this window.
// Key pattern: seat:lock:{eventId}:{date}:{slotTime}:{userId}

export const SEAT_LOCK_TTL_SECONDS = 600; // 10 minutes

export async function acquireSeatLock(
  eventId: string,
  date: string,
  slotTime: string,
  userId: string,
  numberOfGuests: number
): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const lockKey = `seat:lock:${eventId}:${date}:${slotTime}:${userId}`;
    const result = await redis.set(
      lockKey,
      JSON.stringify({ numberOfGuests, lockedAt: Date.now() }),
      "EX",
      SEAT_LOCK_TTL_SECONDS,
      "NX"
    );
    return result === "OK";
  } catch (e) {
    logger.warn("Redis unavailable, bypassed acquireSeatLock (allowing for local dev)");
    return true; // ALLOW booking when Redis is offline for local development/demo
  }
}

export async function releaseSeatLock(
  eventId: string,
  date: string,
  slotTime: string,
  userId: string
): Promise<void> {
  try {
    const redis = getRedisClient();
    const lockKey = `seat:lock:${eventId}:${date}:${slotTime}:${userId}`;
    await redis.del(lockKey);
  } catch (e) {
    logger.warn("Redis unavailable, bypassed releaseSeatLock");
  }
}

export async function getSeatLock(
  eventId: string,
  date: string,
  slotTime: string,
  userId: string
): Promise<{ numberOfGuests: number; lockedAt: number } | null> {
  try {
    const redis = getRedisClient();
    const lockKey = `seat:lock:${eventId}:${date}:${slotTime}:${userId}`;
    const data = await redis.get(lockKey);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    logger.warn("Redis unavailable, bypassed getSeatLock");
    return null;
  }
}
