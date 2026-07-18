import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Booking } from "../models/Booking";
import { Event } from "../models/Event";
import { Waitlist } from "../models/Waitlist";
import { logger } from "../lib/logger";

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Owner Dashboard — Revenue, Bookings, Guest Demographics
// @route   GET /api/admin/stats
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ─── Aggregation Pipeline — single DB round-trip ──────────────────────────
    const [stats] = await Booking.aggregate([
      {
        $facet: {
          // Total revenue from completed payments only
          revenue: [
            { $match: { paymentStatus: "Completed" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ],
          // Booking status breakdown
          statusBreakdown: [
            { $group: { _id: "$bookingStatus", count: { $sum: 1 }, guests: { $sum: "$numberOfGuests" } } },
          ],
          // Today's stats
          todayStats: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  $lt: new Date(new Date().setHours(23, 59, 59, 999)),
                },
              },
            },
            {
              $group: {
                _id: null,
                todayRevenue: { $sum: "$totalAmount" },
                todayBookings: { $sum: 1 },
                todayGuests: { $sum: "$numberOfGuests" },
              },
            },
          ],
          // Payment status breakdown
          paymentBreakdown: [
            { $group: { _id: "$paymentStatus", count: { $sum: 1 }, amount: { $sum: "$totalAmount" } } },
          ],
          // Total bookings and guests
          totals: [
            {
              $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                totalGuests: { $sum: "$numberOfGuests" },
                confirmedGuests: {
                  $sum: {
                    $cond: [{ $in: ["$bookingStatus", ["Confirmed", "Attended"]] }, "$numberOfGuests", 0],
                  },
                },
                checkedIn: {
                  $sum: { $cond: [{ $eq: ["$bookingStatus", "Attended"] }, "$numberOfGuests", 0] },
                },
                cancelled: {
                  $sum: { $cond: [{ $eq: ["$bookingStatus", "Cancelled"] }, 1, 0] },
                },
                noShow: {
                  $sum: { $cond: [{ $eq: ["$bookingStatus", "NoShow"] }, "$numberOfGuests", 0] },
                },
              },
            },
          ],
        },
      },
    ]);

    const totalRevenue = stats.revenue[0]?.total || 0;
    const totals = stats.totals[0] || {};
    const today = stats.todayStats[0] || {};

    res.status(200).json({
      success: true,
      data: {
        revenue: {
          total: totalRevenue,
          today: today.todayRevenue || 0,
        },
        bookings: {
          total: totals.totalBookings || 0,
          today: today.todayBookings || 0,
          confirmed: totals.confirmedGuests || 0,
          checkedIn: totals.checkedIn || 0,
          cancelled: totals.cancelled || 0,
          noShow: totals.noShow || 0,
        },
        guests: {
          total: totals.totalGuests || 0,
          today: today.todayGuests || 0,
        },
        breakdown: {
          status: stats.statusBreakdown,
          payment: stats.paymentBreakdown,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Operations Dashboard — Slot-level stats for a specific date/slot
// @route   GET /api/admin/ops?date=2026-08-05&slotTime=11:00 AM
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getOperationsDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, eventId } = req.query;

    if (!date || !eventId) {
      return res.status(400).json({ success: false, error: "date and eventId are required" });
    }

    // ─── Slot-level operational breakdown ─────────────────────────────────────
    const slotStats = await Booking.aggregate([
      {
        $match: {
          event: new mongoose.Types.ObjectId(eventId as string),
          date: date as string,
          bookingStatus: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: "$slotTime",
          totalGuests: { $sum: "$numberOfGuests" },
          confirmedBookings: { $sum: 1 },
          checkedIn: {
            $sum: { $cond: [{ $eq: ["$bookingStatus", "Attended"] }, "$numberOfGuests", 0] },
          },
          noShow: {
            $sum: { $cond: [{ $eq: ["$bookingStatus", "NoShow"] }, "$numberOfGuests", 0] },
          },
          // Kitchen metrics
          chicken: {
            $sum: {
              $cond: [{ $eq: ["$guestDetails.mealPreference", "chicken"] }, "$numberOfGuests", 0],
            },
          },
          mutton: {
            $sum: {
              $cond: [{ $eq: ["$guestDetails.mealPreference", "mutton"] }, "$numberOfGuests", 0],
            },
          },
          fish: {
            $sum: {
              $cond: [{ $eq: ["$guestDetails.mealPreference", "fish"] }, "$numberOfGuests", 0],
            },
          },
          vegetarian: {
            $sum: {
              $cond: [{ $eq: ["$guestDetails.mealPreference", "vegetarian"] }, "$numberOfGuests", 0],
            },
          },
          // Reception metrics
          vipGuests: {
            $sum: { $cond: ["$guestDetails.isVIP", "$numberOfGuests", 0] },
          },
          children: {
            $sum: { $cond: ["$guestDetails.isChild", "$numberOfGuests", 0] },
          },
          male: {
            $sum: { $cond: [{ $eq: ["$guestDetails.gender", "male"] }, "$numberOfGuests", 0] },
          },
          female: {
            $sum: { $cond: [{ $eq: ["$guestDetails.gender", "female"] }, "$numberOfGuests", 0] },
          },
          returningCustomers: {
            $sum: { $cond: ["$guestDetails.isReturningCustomer", 1, 0] },
          },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Add remaining guests to each slot
    const event = await Event.findById(eventId).lean();
    const enrichedSlots = slotStats.map((slot) => {
      const eventSlot = event?.slots.find((s) => s.time === slot._id);
      return {
        slotTime: slot._id,
        capacity: eventSlot?.capacity || 70,
        totalGuests: slot.totalGuests,
        checkedIn: slot.checkedIn,
        remaining: slot.totalGuests - slot.checkedIn - slot.noShow,
        noShow: slot.noShow,
        kitchen: {
          chicken: slot.chicken,
          mutton: slot.mutton,
          fish: slot.fish,
          vegetarian: slot.vegetarian,
          children: slot.children,
        },
        reception: {
          vip: slot.vipGuests,
          male: slot.male,
          female: slot.female,
          returningCustomers: slot.returningCustomers,
        },
        revenue: slot.revenue,
      };
    });

    // ─── Day-level summary ────────────────────────────────────────────────────
    const dayTotals = enrichedSlots.reduce(
      (acc, s) => ({
        totalGuests: acc.totalGuests + s.totalGuests,
        checkedIn: acc.checkedIn + s.checkedIn,
        remaining: acc.remaining + s.remaining,
        revenue: acc.revenue + s.revenue,
      }),
      { totalGuests: 0, checkedIn: 0, remaining: 0, revenue: 0 }
    );

    // ─── Waitlist count ────────────────────────────────────────────────────────
    const waitlistCount = await Waitlist.countDocuments({
      event: new mongoose.Types.ObjectId(eventId as string),
      date: date as string,
      status: "waiting",
    });

    res.status(200).json({
      success: true,
      data: {
        date,
        summary: dayTotals,
        waitlistCount,
        slots: enrichedSlots,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Kitchen Dashboard — Meal prep counts for a specific slot
// @route   GET /api/admin/kitchen?date=2026-08-05&slotTime=11:00 AM&eventId=...
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getKitchenDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, slotTime, eventId } = req.query;

    if (!date || !slotTime || !eventId) {
      return res.status(400).json({ success: false, error: "date, slotTime, and eventId are required" });
    }

    const [kitchenData] = await Booking.aggregate([
      {
        $match: {
          event: new mongoose.Types.ObjectId(eventId as string),
          date: date as string,
          slotTime: slotTime as string,
          bookingStatus: { $in: ["Confirmed", "Attended"] },
          paymentStatus: "Completed",
        },
      },
      {
        $group: {
          _id: null,
          totalGuests: { $sum: "$numberOfGuests" },
          arrivedGuests: {
            $sum: { $cond: [{ $eq: ["$bookingStatus", "Attended"] }, "$numberOfGuests", 0] },
          },
          chicken: {
            $sum: {
              $cond: [{ $eq: ["$guestDetails.mealPreference", "chicken"] }, "$numberOfGuests", 0],
            },
          },
          mutton: {
            $sum: {
              $cond: [{ $eq: ["$guestDetails.mealPreference", "mutton"] }, "$numberOfGuests", 0],
            },
          },
          fish: {
            $sum: {
              $cond: [{ $eq: ["$guestDetails.mealPreference", "fish"] }, "$numberOfGuests", 0],
            },
          },
          vegetarian: {
            $sum: {
              $cond: [{ $eq: ["$guestDetails.mealPreference", "vegetarian"] }, "$numberOfGuests", 0],
            },
          },
          children: {
            $sum: { $cond: ["$guestDetails.isChild", "$numberOfGuests", 0] },
          },
          vip: {
            $sum: { $cond: ["$guestDetails.isVIP", "$numberOfGuests", 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        slot: slotTime,
        date,
        totalGuests: kitchenData?.totalGuests || 0,
        arrivedGuests: kitchenData?.arrivedGuests || 0,
        remainingGuests: (kitchenData?.totalGuests || 0) - (kitchenData?.arrivedGuests || 0),
        mealBreakdown: {
          chicken: kitchenData?.chicken || 0,
          mutton: kitchenData?.mutton || 0,
          fish: kitchenData?.fish || 0,
          vegetarian: kitchenData?.vegetarian || 0,
        },
        specialGuests: {
          children: kitchenData?.children || 0,
          vip: kitchenData?.vip || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reception Dashboard — Check-in status, VIP list, late arrivals
// @route   GET /api/admin/reception?date=2026-08-05&slotTime=11:00 AM&eventId=...
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getReceptionDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, slotTime, eventId } = req.query;

    if (!date || !slotTime || !eventId) {
      return res.status(400).json({ success: false, error: "date, slotTime, and eventId are required" });
    }

    const bookings = await Booking.find({
      event: new mongoose.Types.ObjectId(eventId as string),
      date: date as string,
      slotTime: slotTime as string,
      bookingStatus: { $in: ["Confirmed", "Attended"] },
      paymentStatus: "Completed",
    })
      .populate("user", "name email phone")
      .sort({ "guestDetails.isVIP": -1, createdAt: 1 })
      .lean();

    const guestList = bookings.map((b) => ({
      bookingId: b._id,
      guestName: b.guestDetails.fullName,
      phone: b.guestDetails.phone,
      numberOfGuests: b.numberOfGuests,
      status: b.bookingStatus,
      isVIP: b.guestDetails.isVIP,
      isChild: b.guestDetails.isChild,
      checkedInAt: b.checkedInAt,
      mealPreference: b.guestDetails.mealPreference,
    }));

    const summary = {
      total: bookings.reduce((a, b) => a + b.numberOfGuests, 0),
      arrived: bookings.filter((b) => b.bookingStatus === "Attended").reduce((a, b) => a + b.numberOfGuests, 0),
      remaining: bookings.filter((b) => b.bookingStatus === "Confirmed").reduce((a, b) => a + b.numberOfGuests, 0),
      vip: bookings.filter((b) => b.guestDetails.isVIP).reduce((a, b) => a + b.numberOfGuests, 0),
    };

    res.status(200).json({
      success: true,
      data: { summary, guestList },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Scan and Verify Ticket via QR (Anti-duplicate check)
// @route   POST /api/admin/scan
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
export const scanTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate("user", "name email")
      .populate("event", "title");

    if (!booking) {
      return res.status(404).json({ success: false, error: "❌ INVALID TICKET — Booking not found" });
    }

    if (booking.paymentStatus !== "Completed") {
      return res.status(400).json({ success: false, error: "❌ PAYMENT INCOMPLETE — Deny entry" });
    }

    if (booking.bookingStatus === "Cancelled") {
      return res.status(400).json({ success: false, error: "❌ CANCELLED BOOKING — Deny entry" });
    }

    if (booking.bookingStatus === "Attended") {
      logger.warn("Duplicate QR scan attempt detected", {
        bookingId,
        checkedInAt: booking.checkedInAt,
        scannedBy: req.user._id,
      });
      return res.status(400).json({
        success: false,
        error: "⚠️ DUPLICATE SCAN — This ticket was already used",
        checkedInAt: booking.checkedInAt,
      });
    }

    booking.bookingStatus = "Attended";
    booking.checkedInAt = new Date();
    booking.checkedInBy = req.user._id;
    await booking.save();

    logger.info("QR scan check-in successful", {
      bookingId,
      guestName: booking.guestDetails.fullName,
      guests: booking.numberOfGuests,
      scannedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "✅ TICKET VALID — Guest checked in",
      data: {
        guestName: booking.guestDetails.fullName,
        numberOfGuests: booking.numberOfGuests,
        slotTime: booking.slotTime,
        date: booking.date,
        isVIP: booking.guestDetails.isVIP,
        mealPreference: booking.guestDetails.mealPreference,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Revenue Analytics by date range
// @route   GET /api/admin/revenue?from=2026-08-01&to=2026-08-09
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getRevenueAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to } = req.query;

    const matchFilter: any = { paymentStatus: "Completed" };
    if (from && to) {
      matchFilter.createdAt = {
        $gte: new Date(from as string),
        $lte: new Date(to as string),
      };
    }

    const revenueData = await Booking.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          dailyRevenue: { $sum: "$totalAmount" },
          bookings: { $sum: 1 },
          guests: { $sum: "$numberOfGuests" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalRevenue = revenueData.reduce((a, d) => a + d.dailyRevenue, 0);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        dailyBreakdown: revenueData,
      },
    });
  } catch (error) {
    next(error);
  }
};
