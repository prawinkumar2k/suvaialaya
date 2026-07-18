import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { Booking } from "../models/Booking";
import { addNotificationJob, addQRGenerationJob } from "../lib/queues";
import { releaseSeatLock } from "../lib/redis";
import { logger } from "../lib/logger";

// ─── Razorpay Instance ────────────────────────────────────────────────────────
let razorpay: Razorpay;
export const getRazorpayInstance = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID) {
      logger.warn("RAZORPAY_KEY_ID is missing. Payment functionality will fail.");
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "dummy_key",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
    });
  }
  return razorpay;
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    if (booking.paymentStatus === "Completed") {
      return res.status(400).json({ success: false, error: "Payment already completed for this booking" });
    }

    const options = {
      amount: Math.round(booking.totalAmount * 100), // Paise — ensure integer
      currency: "INR",
      receipt: `rcpt_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        userId: req.user._id.toString(),
      },
    };

    const order = await getRazorpayInstance().orders.create(options);

    // Store Razorpay order ID for webhook verification
    booking.razorpayOrderId = order.id;
    await booking.save();

    logger.info("Razorpay order created", {
      orderId: order.id,
      bookingId,
      amount: options.amount,
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error: any) {
    logger.error("Razorpay order creation failed", { error: error.message });
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Verify Payment Signature (client-side confirmation)
// @route   POST /api/payments/verify
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // ─── Cryptographic signature verification ─────────────────────────────────
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    // Use timing-safe comparison to prevent timing attacks
    const isAuthentic = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(razorpay_signature, "hex")
    );

    if (!isAuthentic) {
      logger.warn("Invalid payment signature detected", {
        bookingId,
        orderId: razorpay_order_id,
        ip: req.ip,
      });
      return res.status(400).json({ success: false, error: "Invalid Payment Signature" });
    }

    await handlePaymentSuccess(bookingId, razorpay_payment_id, req);

    res.status(200).json({ success: true, message: "Payment verified successfully" });
  } catch (error: any) {
    logger.error("Payment verification failed", { error: error.message });
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Razorpay Webhook Handler (async, server-to-server — most reliable)
// @route   POST /api/payments/webhook
// @access  Public (verified via HMAC signature)
//
// MISSION CRITICAL: This runs INDEPENDENTLY of the browser.
// Even if the user's browser crashes after payment, this fires the ticket.
// ─────────────────────────────────────────────────────────────────────────────
export const razorpayWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return res.status(500).json({ error: "Webhook not configured" });
    }

    // ─── Verify webhook signature ─────────────────────────────────────────────
    const razorpaySignature = req.headers["x-razorpay-signature"] as string;
    const rawBody = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(razorpaySignature || "", "hex")
    );

    if (!isValid) {
      logger.warn("Invalid Razorpay webhook signature", { ip: req.ip });
      return res.status(400).json({ error: "Invalid signature" });
    }

    // ─── Always respond 200 immediately (Razorpay retries on non-200) ─────────
    res.status(200).json({ received: true });

    // ─── Process event asynchronously after responding ────────────────────────
    const { event, payload } = req.body;

    logger.info("Razorpay webhook received", { event });

    if (event === "payment.captured") {
      const payment = payload.payment.entity;
      const bookingId = payment.notes?.bookingId;

      if (bookingId) {
        await handlePaymentSuccess(bookingId, payment.id, req);
      }
    } else if (event === "payment.failed") {
      const payment = payload.payment.entity;
      const bookingId = payment.notes?.bookingId;

      if (bookingId) {
        await handlePaymentFailure(bookingId, payment.error_description);
      }
    }
  } catch (error: any) {
    logger.error("Webhook processing error", { error: error.message });
    // Don't call next(error) here — already responded 200 to Razorpay
  }
};

// ─── Shared payment success handler ──────────────────────────────────────────
async function handlePaymentSuccess(bookingId: string, paymentId: string, req: any) {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    logger.error("Booking not found during payment success", { bookingId });
    return;
  }

  if (booking.paymentStatus === "Completed") {
    logger.info("Payment already processed — skipping (idempotent)", { bookingId });
    return; // Idempotent — webhook may fire multiple times
  }

  booking.paymentStatus = "Completed";
  booking.bookingStatus = "Confirmed";
  booking.razorpayPaymentId = paymentId;
  await booking.save();

  // Release the Redis seat lock (payment completed — lock no longer needed)
  await releaseSeatLock(
    booking.event.toString(),
    booking.date,
    booking.slotTime,
    booking.user.toString()
  );

  // Enqueue QR generation (idempotent, retryable)
  await addQRGenerationJob(bookingId);

  // Enqueue email confirmation (idempotent, retryable via BullMQ)
  await addNotificationJob("booking_confirmation", { bookingId });

  logger.info("Payment processed successfully", { bookingId, paymentId });
}

// ─── Shared payment failure handler ──────────────────────────────────────────
async function handlePaymentFailure(bookingId: string, errorDescription: string) {
  const booking = await Booking.findById(bookingId);
  if (!booking) return;

  booking.paymentStatus = "Failed";
  await booking.save();

  await addNotificationJob("payment_failed", { bookingId, errorDescription });

  logger.warn("Payment failed", { bookingId, errorDescription });
}
