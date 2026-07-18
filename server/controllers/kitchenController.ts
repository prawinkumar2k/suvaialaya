import { Request, Response, NextFunction } from "express";
import { Booking } from "../models/Booking";

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get real-time food counts for the Kitchen Dashboard
// @route   GET /api/kitchen/stats
// @access  Private (kitchen_staff, admin, owner)
// ─────────────────────────────────────────────────────────────────────────────
export const getKitchenStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let targetDate = req.query.date as string;
    
    if (!targetDate) {
      targetDate = new Date().toISOString().split("T")[0];
      // Check if today has bookings. If not, get the next available date with bookings
      const todayCount = await Booking.countDocuments({ date: targetDate, bookingStatus: { $in: ["Confirmed", "Attended"] } });
      if (todayCount === 0) {
        const nextBooking = await Booking.findOne({ date: { $gt: targetDate }, bookingStatus: { $in: ["Confirmed", "Attended"] } }).sort({ date: 1 });
        if (nextBooking) {
          targetDate = nextBooking.date;
        }
      }
    }

    // Aggregate meal counts for the target date's bookings that are Confirmed or Attended
    const stats = await Booking.aggregate([
      {
        $match: {
          date: targetDate,
          bookingStatus: { $in: ["Confirmed", "Attended"] }
        }
      },
      {
        $group: {
          _id: "$slotTime",
          totalGuests: { $sum: "$numberOfGuests" },
          vegCount: {
            $sum: {
              $cond: [{ $eq: ["$guestDetails.mealPreference", "vegetarian"] }, "$numberOfGuests", 0]
            }
          },
          nonVegCount: {
            $sum: {
              $cond: [{ $ne: ["$guestDetails.mealPreference", "vegetarian"] }, "$numberOfGuests", 0]
            }
          },
          vipCount: {
            $sum: {
              $cond: [{ $eq: ["$guestDetails.isVIP", true] }, "$numberOfGuests", 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } } // Sort by slot time
    ]);

    // Format for easy frontend consumption
    const formattedStats = stats.map(slot => ({
      slotTime: slot._id,
      totalGuests: slot.totalGuests,
      veg: slot.vegCount,
      nonVeg: slot.nonVegCount,
      vip: slot.vipCount
    }));

    res.status(200).json({
      success: true,
      data: formattedStats,
      date: targetDate
    });
  } catch (error) {
    next(error);
  }
};
