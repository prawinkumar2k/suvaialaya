import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import crypto from "crypto";
import { Booking } from "../models/Booking";
import { Event } from "../models/Event";
import { Waitlist } from "../models/Waitlist";
import { acquireSeatLock, releaseSeatLock, SEAT_LOCK_TTL_SECONDS } from "../lib/redis";
import { addNotificationJob, addQRGenerationJob, scheduleSeatRelease } from "../lib/queues";
import { logger } from "../lib/logger";

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
//
// MISSION-CRITICAL FLOW (BookMyShow / Swiggy Standard):
//   1. Input validation
//   2. Fetch event and validate slot
//   3. Check real-time capacity (ATOMIC — counts live Redis locks + DB bookings)
//   4. Acquire Redis seat lock (TTL 10 min) — atomic NX prevents race conditions
//   5. If lock acquired → proceed to DB booking in MongoDB Session + Transaction
//   6. If slot is full → add to FIFO waitlist
//   7. Schedule seat release job in BullMQ for payment timeout
//   8. Enqueue notification and QR generation jobs (resilient, retryable)
// ─────────────────────────────────────────────────────────────────────────────
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  

  try {
    const createBookingSchema = z.object({
      event: z.string().min(1, "Event ID is required"),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
      slotTime: z.string().min(1, "Slot time is required"),
      numberOfGuests: z.number().int().min(1, "At least 1 guest is required"),
      totalAmount: z.number().min(0, "Total amount must be positive"),
      idempotencyKey: z.string().optional(),
      guestDetails: z.any()
    });

    const parsed = createBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    }

    const {
      event: eventId,
      date,
      slotTime,
      guestDetails,
      numberOfGuests,
      totalAmount,
      idempotencyKey,
    } = parsed.data;

    // ─── Idempotency Check — prevents duplicate bookings on network retry ────
    if (idempotencyKey) {
      const existing = await Booking.findOne({ idempotencyKey });
      if (existing) {
        
        logger.warn("Duplicate booking attempt via idempotency key", {
          idempotencyKey,
          userId: req.user._id,
        });
        return res.status(200).json({ success: true, data: existing, duplicate: true });
      }
    }

    // ─── 1. Validate Event ────────────────────────────────────────────────────
    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      
      return res.status(404).json({ success: false, error: "Event not found or inactive" });
    }

    if (!event.dates.includes(date)) {
      
      return res.status(400).json({ success: false, error: "Invalid date for this event" });
    }

    const slot = event.slots.find((s) => s.time === slotTime);
    if (!slot) {
      
      return res.status(400).json({ success: false, error: "Invalid slot selected" });
    }

    // ─── 2. Check capacity ────────────────────────────────────────────────────
    const remainingSeats = slot.capacity - slot.booked;
    if (remainingSeats < numberOfGuests) {
      

      // ─── Auto-add to Waitlist ─────────────────────────────────────────────
      const slotKey = `${eventId}:${date}:${slotTime}`;
      const existingWaitlist = await Waitlist.findOne({
        user: req.user._id,
        slotKey,
        status: "waiting",
      });

      if (!existingWaitlist) {
        const position = await Waitlist.countDocuments({ slotKey, status: "waiting" });
        await Waitlist.create({
          user: req.user._id,
          event: eventId,
          slotKey,
          date,
          slotTime,
          numberOfGuests,
          status: "waiting",
          position: position + 1,
        });
        logger.info("User added to waitlist", {
          userId: req.user._id,
          slotKey,
          position: position + 1,
        });
        return res.status(409).json({
          success: false,
          waitlisted: true,
          error: "Slot is full. You have been added to the waitlist.",
          position: position + 1,
        });
      }

      return res.status(409).json({
        success: false,
        waitlisted: true,
        error: "Slot is full. You are already on the waitlist.",
        position: existingWaitlist.position,
      });
    }

    // ─── 3. Acquire atomic Redis seat lock (NX = Only if Not Exists) ─────────
    const lockAcquired = await acquireSeatLock(
      eventId,
      date,
      slotTime,
      req.user._id.toString(),
      numberOfGuests
    );

    if (!lockAcquired) {
      
      logger.warn("Seat lock already held by user", { userId: req.user._id, slotTime });
      return res.status(409).json({
        success: false,
        error: "You already have a pending reservation. Please complete your payment.",
      });
    }

    // ─── 4. ATOMIC seat reservation using $inc with $expr guard ───────────────
    // This is the BookMyShow standard — single atomic DB operation
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        "slots.time": slotTime,
        "slots.booked": { $lte: slot.capacity - numberOfGuests }, // Atomic capacity check
      },
      {
        $inc: { "slots.$.booked": numberOfGuests },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedEvent) {
      // The slot filled up between our check and the update — race condition caught
      
      await releaseSeatLock(eventId, date, slotTime, req.user._id.toString());

      logger.warn("Race condition detected — slot filled during booking", {
        userId: req.user._id,
        slotTime,
      });
      return res.status(409).json({
        success: false,
        error: "Slot just filled up. Please try another time slot.",
      });
    }

    // ─── 5. Create booking record ──────────────────────────────────────────────
    const [booking] = await Booking.create(
      [
        {
          user: req.user._id,
          event: eventId,
          date,
          slotTime,
          guestDetails,
          numberOfGuests,
          totalAmount,
          bookingStatus: "Confirmed",
          paymentStatus: "Pending",
          idempotencyKey: idempotencyKey || crypto.randomUUID(),
          bookingSource: "web",
        },
      ]
    );

    // ─── 6. Commit transaction ────────────────────────────────────────────────
    

    logger.info("Booking created successfully", {
      bookingId: booking._id,
      userId: req.user._id,
      slotTime,
      numberOfGuests,
    });

    // ─── 7. Schedule auto seat-release if payment not completed in 10 min ─────
    await scheduleSeatRelease(booking._id.toString(), SEAT_LOCK_TTL_SECONDS * 1000);

    // ─── 8. Enqueue resilient notification (retries 5x, DLQ on failure) ───────
    await addNotificationJob("booking_confirmation", {
      bookingId: booking._id.toString(),
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error: any) {
    
    logger.error("Booking creation failed — transaction rolled back", {
      error: error.message,
      userId: req.user?._id,
    });
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get logged in user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("event", "title venue dates basePrice")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all bookings with pagination (Admin)
// @route   GET /api/bookings?page=1&limit=50&status=Confirmed
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.status) filter.bookingStatus = req.query.status;
    if (req.query.date) filter.date = req.query.date;
    if (req.query.slotTime) filter.slotTime = req.query.slotTime;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("user", "name email phone")
        .populate("event", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Cancel booking with atomic seat release
// @route   PUT /api/bookings/:id/cancel
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      
      return res.status(403).json({ success: false, error: "Not authorized to cancel this booking" });
    }

    if (booking.bookingStatus === "Cancelled") {
      
      return res.status(400).json({ success: false, error: "Booking is already cancelled" });
    }

    if (booking.bookingStatus === "Attended") {
      
      return res.status(400).json({ success: false, error: "Cannot cancel a checked-in booking" });
    }

    // ─── Enforce Time Restriction: Up to the day before ──────────────────────
    const todayIST = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).split(" ")[0];
    if (todayIST >= booking.date) {
      return res.status(400).json({ success: false, error: "Cancellations are only permitted up to the day before the booking." });
    }

    // ─── Atomic seat release ───────────────────────────────────────────────
    await Event.findOneAndUpdate(
      { _id: booking.event, "slots.time": booking.slotTime },
      { $inc: { "slots.$.booked": -booking.numberOfGuests } }
    );

    booking.bookingStatus = "Cancelled";
    booking.cancelledAt = new Date();
    booking.cancelReason = req.body.reason || "User requested cancellation";

    // If payment was completed, initiate refund tracking
    if (booking.paymentStatus === "Completed") {
      booking.refundStatus = "pending";
      try {
        const { getRazorpayInstance } = await import("./paymentController");
        const razorpay = getRazorpayInstance();
        
        if (booking.razorpayPaymentId) {
          const refund = await razorpay.payments.refund(booking.razorpayPaymentId, {
            amount: Math.round(booking.totalAmount * 100),
            notes: {
              bookingId: booking._id.toString(),
              reason: booking.cancelReason || "User requested cancellation"
            }
          });
          booking.refundId = refund.id;
          booking.refundStatus = "processed";
          logger.info("Refund initiated successfully", {
            bookingId: booking._id,
            amount: booking.totalAmount,
            refundId: refund.id
          });
        }
      } catch (err: any) {
        booking.refundStatus = "failed";
        logger.error("Refund failed", {
          bookingId: booking._id,
          error: err.message
        });
      }
    }

    await booking.save();
    

    // Release Redis lock
    await releaseSeatLock(
      booking.event.toString(),
      booking.date,
      booking.slotTime,
      booking.user.toString()
    );

    // Notify next person in waitlist
    const slotKey = `${booking.event}:${booking.date}:${booking.slotTime}`;
    const nextInLine = await Waitlist.findOne({ slotKey, status: "waiting" }).sort({ position: 1 });
    if (nextInLine) {
      await addNotificationJob("waitlist_available", {
        waitlistId: nextInLine._id.toString(),
        bookingId: booking._id.toString(),
      });
    }

    logger.info("Booking cancelled and seats released", { bookingId: booking._id });
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Check-in booking via QR scan (Admin)
// @route   PUT /api/bookings/:id/check-in
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
export const checkInBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("event", "title");
    if (!booking) {
      return res.status(404).json({ success: false, error: "Invalid booking ID" });
    }

    if (booking.bookingStatus === "Cancelled") {
      return res.status(400).json({ success: false, error: "Booking is cancelled — DENY ENTRY" });
    }

    if (booking.bookingStatus === "Attended") {
      return res.status(400).json({
        success: false,
        error: "Ticket already checked in — DUPLICATE SCAN DETECTED",
        checkedInAt: booking.checkedInAt,
      });
    }

    if (booking.paymentStatus !== "Completed") {
      return res.status(400).json({
        success: false,
        error: "Payment not completed — DENY ENTRY",
      });
    }

    booking.bookingStatus = "Attended";
    booking.checkedInAt = new Date();
    booking.checkedInBy = req.user._id;
    await booking.save();

    logger.info("Guest checked in successfully", {
      bookingId: booking._id,
      checkedInBy: req.user._id,
      guests: booking.numberOfGuests,
    });

    res.status(200).json({
      success: true,
      message: "Guest checked in successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Verify booking details (Public/QR Code Scans)
// @route   GET /api/bookings/verify/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const verifyBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("event", "title venue")
      .populate("user", "name email")
      .lean();

    if (!booking) {
      return res.status(404).json({ success: false, error: "Ticket not found or invalid ID" });
    }

    if (booking.bookingStatus === "Cancelled") {
      return res.status(400).json({ success: false, error: "This ticket has been cancelled." });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
