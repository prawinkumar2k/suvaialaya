import { Request, Response, NextFunction } from "express";
import { Booking } from "../models/Booking";

// @desc    Get Dashboard Statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await Booking.find();
    
    let totalRevenue = 0;
    let totalBookings = bookings.length;
    let guestsExpected = 0;
    let checkIns = 0;

    bookings.forEach((booking) => {
      if (booking.bookingStatus === "Confirmed" || booking.bookingStatus === "Attended") {
        totalRevenue += booking.totalAmount;
        guestsExpected += booking.numberOfGuests;
      }
      if (booking.bookingStatus === "Attended") {
        checkIns += booking.numberOfGuests;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalBookings,
        guestsExpected,
        checkIns,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Scan and Verify Ticket
// @route   POST /api/admin/scan
// @access  Private/Admin
export const scanTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate("user", "name email").populate("event", "title");

    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    if (booking.bookingStatus === "Cancelled") {
      return res.status(400).json({ success: false, error: "This booking has been cancelled" });
    }

    if (booking.bookingStatus === "Attended") {
      return res.status(400).json({ success: false, error: "Ticket already scanned and checked in" });
    }

    // Mark as attended
    booking.bookingStatus = "Attended";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Ticket verified successfully. Guest checked in.",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
