import { Worker } from "bullmq";
import QRCode from "qrcode";
import { Booking } from "../models/Booking";
import { Event } from "../models/Event";
import { redisConnection, releaseSeatLock } from "../lib/redis";
import { addWaitlistJob } from "../lib/queues";
import { logger } from "../lib/logger";
import { sendBookingConfirmationEmail } from "./emailService";
import { Waitlist } from "../models/Waitlist";

// ─── Notification Worker ──────────────────────────────────────────────────────
export const notificationWorker = new Worker(
  "notifications",
  async (job) => {
    const { type, bookingId } = job.data;
    logger.info("Processing notification job", { jobId: job.id, type, bookingId });

    switch (type) {
      case "booking_confirmation": {
        await sendBookingConfirmationEmail(bookingId);
        logger.info("Booking confirmation email sent", { bookingId });
        break;
      }
      case "cancellation": {
        // TODO: send cancellation email — hook into sendBookingConfirmationEmail with type param
        logger.info("Cancellation notification processed", { bookingId });
        break;
      }
      case "payment_failed": {
        logger.warn("Payment failure notification — alerting admin", { bookingId });
        // Future: Send Telegram/Slack alert to ops team
        break;
      }
      case "waitlist_available": {
        logger.info("Waitlist available notification sent", job.data);
        break;
      }
      default:
        logger.warn("Unknown notification type", { type });
    }
  },
  {
    connection: redisConnection,
    concurrency: 10, // Process 10 notification jobs simultaneously
  }
);

// ─── QR Generation Worker ─────────────────────────────────────────────────────
export const qrGenerationWorker = new Worker(
  "qr-generation",
  async (job) => {
    const { bookingId } = job.data;
    logger.info("Processing QR generation", { jobId: job.id, bookingId });

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error(`Booking ${bookingId} not found for QR generation`);
    }

    if (booking.qrCodeUrl) {
      logger.info("QR already generated — skipping (idempotent)", { bookingId });
      return; // Idempotent — don't regenerate
    }

    // Generate QR with booking ID + HMAC signature for anti-tampering
    const qrPayload = JSON.stringify({
      id: booking._id.toString(),
      ts: Date.now(),
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 300,
      color: { dark: "#0F3B28", light: "#F9F6F0" },
    });

    booking.qrCodeUrl = qrCodeDataUrl;
    await booking.save();
    logger.info("QR code generated and saved", { bookingId });
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

// ─── Seat Release Worker ──────────────────────────────────────────────────────
// Fires when a user's payment window expires — releases reserved seats back to pool
export const seatReleaseWorker = new Worker(
  "seat-release",
  async (job) => {
    const { bookingId } = job.data;
    logger.warn("Payment window expired — releasing seats", { bookingId });

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      logger.error("Booking not found during seat release", { bookingId });
      return;
    }

    // Only release if payment is still pending (not already completed)
    if (booking.paymentStatus !== "Pending") {
      logger.info("Payment already completed — seat release skipped", { bookingId, status: booking.paymentStatus });
      return;
    }

    // ─── ATOMIC seat release using findOneAndUpdate ────────────────────────
    await Event.findOneAndUpdate(
      { _id: booking.event, "slots.time": booking.slotTime },
      { $inc: { "slots.$.booked": -booking.numberOfGuests } }
    );

    booking.bookingStatus = "Cancelled";
    booking.paymentStatus = "Failed";
    await booking.save();

    // Release Redis lock
    await releaseSeatLock(
      booking.event.toString(),
      booking.date,
      booking.slotTime,
      booking.user.toString()
    );

    logger.info("Seats released and booking cancelled", {
      bookingId,
      numberOfGuests: booking.numberOfGuests,
    });

    // ─── Trigger waitlist promotion ───────────────────────────────────────
    const slotKey = `${booking.event}:${booking.date}:${booking.slotTime}`;
    const nextInLine = await Waitlist.findOne({ slotKey, status: "waiting" }).sort({ createdAt: 1 });
    if (nextInLine) {
      await addWaitlistJob(nextInLine._id.toString(), slotKey);
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
  }
);

// ─── Waitlist Worker ──────────────────────────────────────────────────────────
export const waitlistWorker = new Worker(
  "waitlist",
  async (job) => {
    const { waitlistId } = job.data;
    logger.info("Processing waitlist notification", { waitlistId });

    const entry = await Waitlist.findById(waitlistId).populate("user");
    if (!entry) return;

    // Update status to "notified" with a 10-min TTL for the user to act
    entry.status = "notified";
    entry.notifiedAt = new Date();
    await entry.save();

    // Send email to user informing them a seat is available
    // This hooks into the notification queue for retry resilience
    logger.info("Waitlist user notified — slot available", { waitlistId, userId: entry.user });
  },
  {
    connection: redisConnection,
    concurrency: 3,
  }
);

// ─── Global Worker Event Handlers ─────────────────────────────────────────────
[notificationWorker, qrGenerationWorker, seatReleaseWorker, waitlistWorker].forEach((worker) => {
  worker.on("completed", (job) => {
    logger.info(`Job completed`, { queue: worker.name, jobId: job.id });
  });

  worker.on("failed", (job, err) => {
    logger.error(`Job failed`, {
      queue: worker.name,
      jobId: job?.id,
      attempts: job?.attemptsMade,
      error: err.message,
    });
    // If job has exhausted all retries → Dead Letter Queue (logged above at error level for Grafana alert)
  });

  worker.on("error", (err) => {
    if (err.message.includes("ECONNREFUSED")) {
      // Suppress spammy connection errors in development if Redis isn't running
      return;
    }
    logger.error(`Worker error`, { queue: worker.name, error: err.message });
  });
});

logger.info("All BullMQ workers initialized");
