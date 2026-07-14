import { Request, Response, NextFunction } from "express";
import { Booking } from "../models/Booking";
import { Event } from "../models/Event";
import { sendBookingConfirmationEmail } from "../services/emailService";

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { event: eventId, date, slotTime, guestDetails, numberOfGuests, totalAmount } = req.body;

    // 1. Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    // 2. Validate date and slot
    if (!event.dates.includes(date)) {
      return res.status(400).json({ success: false, error: "Invalid date selected for this event" });
    }

    const slot = event.slots.find((s) => s.time === slotTime);
    if (!slot) {
      return res.status(400).json({ success: false, error: "Invalid slot selected" });
    }

    // 3. Check seat availability (locking simulation)
    if (slot.capacity - slot.booked < numberOfGuests) {
      return res.status(400).json({ success: false, error: "Not enough seats available in this slot" });
    }

    // 4. Reserve seats
    slot.booked += numberOfGuests;
    await event.save();

    // 5. Create Booking
    const booking = await Booking.create({
      user: req.user._id,
      event: eventId,
      date,
      slotTime,
      guestDetails,
      numberOfGuests,
      totalAmount,
      bookingStatus: "Confirmed",
      paymentStatus: "Pending", // Will be updated by payment webhook in Phase 5
    });

    // 6. Send Email Confirmation Asynchronously (does not block response)
    sendBookingConfirmationEmail(booking._id.toString()).catch(err => console.error("Email error:", err));

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("event", "title venue dates");
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await Booking.find().populate("user", "name email").populate("event", "title");
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    // Check ownership or admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Not authorized to cancel this booking" });
    }

    if (booking.bookingStatus === "Cancelled") {
      return res.status(400).json({ success: false, error: "Booking is already cancelled" });
    }

    booking.bookingStatus = "Cancelled";
    
    // Release seats
    const event = await Event.findById(booking.event);
    if (event) {
      const slot = event.slots.find((s) => s.time === booking.slotTime);
      if (slot) {
        slot.booked -= booking.numberOfGuests;
        await event.save();
      }
    }

    await booking.save();
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-in booking (Admin)
// @route   PUT /api/bookings/:id/check-in
// @access  Private/Admin
export const checkInBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("event", "title");
    if (!booking) {
      return res.status(404).json({ success: false, error: "Invalid booking ID" });
    }

    if (booking.bookingStatus === "Cancelled") {
      return res.status(400).json({ success: false, error: "Booking is cancelled" });
    }

    if (booking.bookingStatus === "Attended") {
      return res.status(400).json({ success: false, error: "Ticket already checked in" });
    }

    booking.bookingStatus = "Attended";
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};
