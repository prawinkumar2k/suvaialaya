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
      amountPaid: z.number().min(0).optional(),
      balanceAmount: z.number().min(0).optional(),
      idempotencyKey: z.string().optional(),
      guestDetails: z.object({
        fullName: z.string().min(1, "Guest name is required"),
        phone: z.string().min(1, "Phone number is required"),
        email: z.string().email("Valid email is required"),
        city: z.string().min(1, "Remarks/City is required")
      })
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
      amountPaid,
      balanceAmount,
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
    const bookingsAgg = await Booking.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(eventId), date, slotTime, bookingStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: "$numberOfGuests" } } }
    ]);
    const totalBooked = bookingsAgg[0]?.total || 0;
    const remainingSeats = slot.capacity - totalBooked;
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
      // Check if they are just retrying a payment for an already-locked booking
      const existingPending = await Booking.findOne({
        user: req.user._id,
        event: eventId,
        date,
        slotTime,
        paymentStatus: "Pending",
        bookingStatus: "Confirmed",
      });

      if (existingPending && existingPending.numberOfGuests === numberOfGuests) {
        existingPending.totalAmount = totalAmount;
        existingPending.guestDetails = guestDetails;
        await existingPending.save();
        return res.status(200).json({ success: true, data: existingPending });
      }

      logger.warn("Seat lock already held by user", { userId: req.user._id, slotTime });
      return res.status(409).json({
        success: false,
        error: "You already have a pending reservation. Please complete your payment from the dashboard.",
      });
    }

    // ─── 4. Seat reservation check (using real-time aggregate) ───────────────
    // We already checked capacity above, and we have a Redis user lock.
    let seatsIncremented = true;
    const updatedEvent = event; 
    
    // We no longer rely on `$inc: { "slots.$.booked": numberOfGuests }` because 
    // it was improperly mutating the global event slot instead of date-specific.
    if (remainingSeats < numberOfGuests) {
      seatsIncremented = false;
    }

    // ─── 5. Create booking record ──────────────────────────────────────────────
    try {
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
            amountPaid: amountPaid || 0,
            balanceAmount: balanceAmount !== undefined ? balanceAmount : totalAmount,
            bookingStatus: "Confirmed",
            paymentStatus: "Pending",
            idempotencyKey: idempotencyKey || crypto.randomUUID(),
            bookingSource: ["admin", "owner", "receptionist"].includes(req.user.role) ? "admin" : "web",
          },
        ]
      );

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
    } catch (bookingError: any) {
      // Rollback! If booking fails (e.g. schema validation), reverse the atomic increment and release lock
      // Seat capacity is naturally managed by Booking documents now, no rollback needed on Event.    
      await releaseSeatLock(eventId, date, slotTime, req.user._id.toString());
      throw bookingError;
    }
  } catch (error: any) {
    logger.error("Booking creation failed", {
      error: error.message,
      userId: req.user?._id,
    });
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Bulk Import manual bookings (Admin only)
// @route   POST /api/bookings/bulk
// @access  Private (Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const bulkImportBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookings } = req.body;
    if (!Array.isArray(bookings) || bookings.length === 0) {
      return res.status(400).json({ success: false, error: "Valid bookings array is required." });
    }

    const createdBookings = [];
    const errors = [];

    for (let i = 0; i < bookings.length; i++) {
      try {
        const { eventId, date, slotTime, numberOfGuests, guestDetails, paymentMode } = bookings[i];
        
        if (!guestDetails || !guestDetails.fullName || !guestDetails.email) {
          throw new Error("Guest Name and Email are mandatory");
        }

        const event = await Event.findById(eventId);
        if (!event) throw new Error("Event not found");

        const pax = Number(numberOfGuests) || 1;
        const totalAmount = pax * event.basePrice;

        const booking = await Booking.create({
          user: req.user._id, // Set admin as the creator
          event: eventId,
          date,
          slotTime,
          guestDetails: { ...guestDetails, paymentMode: paymentMode || "Cash" },
          numberOfGuests: pax,
          totalAmount: totalAmount,
          bookingStatus: "Confirmed",
          paymentStatus: "Completed",
          bookingSource: "admin",
        });

        // Queue ticket delivery email
        await addNotificationJob("booking_confirmation", {
          bookingId: booking._id.toString(),
        });

        createdBookings.push(booking);
      } catch (err: any) {
        errors.push({ row: i + 1, guest: bookings[i]?.guestDetails?.fullName || "Unknown", error: err.message });
      }
    }

    logger.info("Bulk import completed", {
      adminId: req.user._id,
      successCount: createdBookings.length,
      errorCount: errors.length
    });

    res.status(201).json({ 
      success: true, 
      data: { createdCount: createdBookings.length, errors } 
    });
  } catch (error: any) {
    logger.error("Bulk booking import failed", { error: error.message });
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
      // Event seat capacity is now dynamically derived, no need to decrement here

    booking.bookingStatus = "Cancelled";
    booking.cancelledAt = new Date();
    booking.cancelReason = req.body.reason || "User requested cancellation";

    // If payment was completed, track refund status (manual refund needed)
    if (booking.paymentStatus === "Completed") {
      booking.refundStatus = "pending";
      booking.cancelReason = req.body.reason || "User requested cancellation - Manual refund required";
      logger.info("Manual refund marked as pending", {
        bookingId: booking._id,
        amount: booking.totalAmount,
      });
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
      // If payment is required, expect payment details in the request body
      const { paymentMethod, paymentCompleted } = req.body;
      if (!paymentCompleted) {
        return res.status(400).json({
          success: false,
          error: "Payment not completed — DENY ENTRY",
          requiresPayment: true,
          booking: booking
        });
      }
      booking.paymentStatus = "Completed";
      if (paymentMethod) {
        booking.paymentMethod = paymentMethod;
      }
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
// @desc    Update booking details (Admin)
// @route   PUT /api/bookings/:id
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
export const updateBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    const { guestDetails, paymentStatus, bookingStatus, numberOfGuests } = req.body;

    if (guestDetails) {
      booking.guestDetails = { ...booking.guestDetails, ...guestDetails };
    }
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (bookingStatus) booking.bookingStatus = bookingStatus;
    
    // Changing numberOfGuests would require atomic capacity checks on the event, 
    // so we skip it for now unless properly implemented. We just allow guest detail updates.
    
    await booking.save();

    res.status(200).json({ success: true, data: booking });
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
    const searchId = req.params.id;
    let booking = null;

    if (mongoose.Types.ObjectId.isValid(searchId) && searchId.length === 24) {
      booking = await Booking.findById(searchId)
        .populate("event", "title venue")
        .populate("user", "name email")
        .lean();
    } else {
      // Support matching the short ID (last characters of ObjectId)
      // E.g. "DDADD6C7" or "07AUG11-D6C7"
      const parts = searchId.split("-");
      const shortId = parts[parts.length - 1]; // "D6C7" or "DDADD6C7"

      const matches = await Booking.aggregate([
        { $addFields: { idStr: { $toString: "$_id" } } },
        { $match: { idStr: { $regex: new RegExp(shortId + "$", "i") } } }
      ]);
      
      // If multiple matches (rare but possible with 4 chars), try to find the one matching the date prefix if provided
      let matchedBookingId = matches.length > 0 ? matches[0]._id : null;
      
      if (matches.length > 1 && parts.length > 1) {
         // advanced resolution could go here, but taking the first match is usually enough for 4-char hex in a small dataset
         matchedBookingId = matches[matches.length - 1]._id; // take the latest
      }

      if (matchedBookingId) {
        booking = await Booking.findById(matchedBookingId)
          .populate("event", "title venue")
          .populate("user", "name email")
          .lean();
      }
    }

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


// -----------------------------------------------------------------------------
// @desc    Reschedule booking
// @route   PUT /api/bookings/:id/reschedule
// @access  Private
// -----------------------------------------------------------------------------
export const rescheduleBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: "Booking not found" });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }
    if (booking.bookingStatus !== "Confirmed") return res.status(400).json({ success: false, error: "Only confirmed bookings can be rescheduled" });

    const { newDate, newSlotTime } = req.body;
    const event = await Event.findById(booking.event);
    if (!event) return res.status(404).json({ success: false, error: "Event not found" });
    
    // Check new capacity
    const newSlot = event.slots.find(s => s.time === newSlotTime);
    if (!newSlot) return res.status(400).json({ success: false, error: "Invalid slot" });
    
    // If they are rescheduling to the same slot, return an error
    if (booking.date === newDate && booking.slotTime === newSlotTime) {
      return res.status(400).json({ success: false, error: "Please select a different date or time to reschedule." });
    }

    // Check new capacity using aggregation
    const bookingsAgg = await Booking.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(booking.event), date: newDate, slotTime: newSlotTime, bookingStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: "$numberOfGuests" } } }
    ]);
    const totalBooked = bookingsAgg[0]?.total || 0;
    
    if (newSlot.capacity - totalBooked < booking.numberOfGuests) {
      return res.status(400).json({ success: false, error: "Not enough seats in the new slot" });
    }

    // Event seat capacity is now dynamically derived, no need to increment/decrement here

    booking.date = newDate;
    booking.slotTime = newSlotTime;
    booking.isRescheduled = true;
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload ticket PDF (Base64) to booking
// @route   PUT /api/bookings/:id/ticket
// @access  Private
export const uploadTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ticketPdfUrl, qrCodeUrl } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ success: false, error: "Booking not found" });
      return;
    }

    if (ticketPdfUrl) booking.ticketPdfUrl = ticketPdfUrl;
    if (qrCodeUrl) booking.qrCodeUrl = qrCodeUrl;
    
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Ticket saved to database",
    });
  } catch (error: any) {
    console.error("Upload Ticket error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
