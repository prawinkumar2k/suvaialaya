import { Queue, Worker, QueueEvents } from "bullmq";
import { redisConnection, getRedisClient } from "./redis";
import { logger } from "./logger";

// ─── Queue Names ──────────────────────────────────────────────────────────────
export const QUEUE_NAMES = {
  NOTIFICATIONS: "notifications",
  QR_GENERATION: "qr-generation",
  SEAT_RELEASE: "seat-release",
  WAITLIST: "waitlist",
} as const;

// ─── Notification Queue ───────────────────────────────────────────────────────
export const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATIONS, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5, // Retry 5 times before DLQ
    backoff: {
      type: "exponential",
      delay: 3000, // Start at 3s, then 6s, 12s, 24s, 48s
    },
    removeOnComplete: { age: 24 * 3600, count: 1000 }, // Keep 24h of completed jobs
    removeOnFail: { age: 7 * 24 * 3600 }, // Keep 7 days of failed jobs (DLQ review)
  },
});

// ─── QR Generation Queue ─────────────────────────────────────────────────────
export const qrGenerationQueue = new Queue(QUEUE_NAMES.QR_GENERATION, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { age: 7 * 24 * 3600 },
  },
});

// ─── Waitlist Notification Queue ─────────────────────────────────────────────
export const waitlistQueue = new Queue(QUEUE_NAMES.WAITLIST, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "fixed", delay: 5000 },
    removeOnComplete: { count: 200 },
    removeOnFail: { age: 7 * 24 * 3600 },
  },
});

// ─── Seat Release Queue (for expired payment windows) ─────────────────────────
export const seatReleaseQueue = new Queue(QUEUE_NAMES.SEAT_RELEASE, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { count: 200 },
    removeOnFail: { age: 3 * 24 * 3600 },
  },
});

import { sendBookingConfirmationEmail } from "../services/emailService";

// ─── Helper: Add notification job ────────────────────────────────────────────
export async function addNotificationJob(type: string, payload: any) {
  try {
    const redis = getRedisClient();
    if (redis.status !== "ready") throw new Error("Redis offline");
    await notificationQueue.add(type, payload);
    logger.info("Notification job enqueued", { type });
  } catch (e) {
    logger.warn("BullMQ bypassed (Redis offline). Executing notification synchronously.", { type });
    if (type === "booking_confirmation") {
      sendBookingConfirmationEmail(payload.bookingId).catch(console.error);
    }
  }
}

// ─── Helper: Add QR generation job ───────────────────────────────────────────
export async function addQRGenerationJob(bookingId: string) {
  try {
    const redis = getRedisClient();
    if (redis.status !== "ready") throw new Error("Redis offline");
    await qrGenerationQueue.add("generate", { bookingId });
    logger.info("QR generation job enqueued", { bookingId });
  } catch (e) {
    logger.warn("Redis unavailable, skipped QR generation job");
  }
}

// ─── Helper: Schedule seat release on payment timeout ────────────────────────
export async function scheduleSeatRelease(
  bookingId: string,
  delayMs: number = 10 * 60 * 1000 // 10 minutes default
) {
  try {
    const redis = getRedisClient();
    if (redis.status !== "ready") throw new Error("Redis offline");
    await seatReleaseQueue.add("release", { bookingId }, { delay: delayMs, jobId: `seat-release:${bookingId}` });
    logger.info("Seat release scheduled", { bookingId, delayMs });
  } catch (e: any) {
    logger.warn("Redis unavailable, skipped seat release scheduling");
    throw e;
  }
}

// ─── Helper: Add waitlist notification ───────────────────────────────────────
export async function addWaitlistJob(waitlistId: string, slotKey: string) {
  try {
    await waitlistQueue.add("notify", { waitlistId, slotKey }, { jobId: `waitlist:${waitlistId}` });
    logger.info("Waitlist notification job enqueued", { waitlistId, slotKey });
  } catch (e) {
    logger.warn("Redis unavailable, skipped waitlist job");
  }
}

[notificationQueue, qrGenerationQueue, waitlistQueue, seatReleaseQueue].forEach((queue) => {
  queue.on("error", (err) => {
    if (err.message.includes("ECONNREFUSED")) return;
    logger.error(`Queue error`, { queue: queue.name, error: err.message });
  });
});

logger.info("BullMQ queues initialized", {
  queues: Object.values(QUEUE_NAMES),
});
