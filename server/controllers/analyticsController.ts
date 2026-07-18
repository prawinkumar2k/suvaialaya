import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Booking } from "../models/Booking";
import { AuditLog } from "../models/AuditLog";
import { Waitlist } from "../models/Waitlist";
import { logger } from "../lib/logger";

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Business Analytics Engine — Full owner-level revenue intelligence
// @route   GET /api/admin/analytics?from=2026-08-01&to=2026-08-09
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getBusinessAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to, eventId } = req.query;

    const dateFilter: any = {};
    if (from) dateFilter.$gte = new Date(from as string);
    if (to) dateFilter.$lte = new Date(to as string);

    const matchBase: any = {};
    if (Object.keys(dateFilter).length) matchBase.createdAt = dateFilter;
    if (eventId) matchBase.event = new mongoose.Types.ObjectId(eventId as string);

    // ─── Single aggregation pipeline — zero N+1 queries ─────────────────────
    const [analytics] = await Booking.aggregate([
      { $match: matchBase },
      {
        $facet: {
          // ── REVENUE ENGINE ─────────────────────────────────────────────────
          revenueMetrics: [
            {
              $group: {
                _id: null,
                totalRevenue: {
                  $sum: { $cond: [{ $eq: ["$paymentStatus", "Completed"] }, "$totalAmount", 0] },
                },
                expectedRevenue: {
                  $sum: {
                    $cond: [
                      { $in: ["$bookingStatus", ["Confirmed", "Attended"]] },
                      "$totalAmount",
                      0,
                    ],
                  },
                },
                totalRefunds: {
                  $sum: { $cond: [{ $eq: ["$paymentStatus", "Refunded"] }, "$totalAmount", 0] },
                },
                avgBookingValue: { $avg: "$totalAmount" },
                totalBookings: { $sum: 1 },
                totalGuests: { $sum: "$numberOfGuests" },
              },
            },
          ],

          // ── CONVERSION ENGINE ──────────────────────────────────────────────
          conversionMetrics: [
            {
              $group: {
                _id: "$paymentStatus",
                count: { $sum: 1 },
                amount: { $sum: "$totalAmount" },
              },
            },
          ],

          // ── BOOKING STATUS ENGINE ──────────────────────────────────────────
          bookingStatusMetrics: [
            {
              $group: {
                _id: "$bookingStatus",
                count: { $sum: 1 },
                guests: { $sum: "$numberOfGuests" },
              },
            },
          ],

          // ── SLOT PERFORMANCE ──────────────────────────────────────────────
          slotPerformance: [
            {
              $match: { paymentStatus: "Completed" },
            },
            {
              $group: {
                _id: "$slotTime",
                totalGuests: { $sum: "$numberOfGuests" },
                revenue: { $sum: "$totalAmount" },
                bookings: { $sum: 1 },
                checkedIn: {
                  $sum: { $cond: [{ $eq: ["$bookingStatus", "Attended"] }, "$numberOfGuests", 0] },
                },
                noShow: {
                  $sum: { $cond: [{ $eq: ["$bookingStatus", "NoShow"] }, "$numberOfGuests", 0] },
                },
              },
            },
            { $sort: { revenue: -1 } },
          ],

          // ── DAILY REVENUE TREND ────────────────────────────────────────────
          dailyRevenue: [
            {
              $match: { paymentStatus: "Completed" },
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                revenue: { $sum: "$totalAmount" },
                bookings: { $sum: 1 },
                guests: { $sum: "$numberOfGuests" },
              },
            },
            { $sort: { _id: 1 } },
          ],

          // ── CUSTOMER INTELLIGENCE ─────────────────────────────────────────
          customerMetrics: [
            {
              $group: {
                _id: "$user",
                bookingCount: { $sum: 1 },
                totalSpent: { $sum: "$totalAmount" },
              },
            },
            {
              $group: {
                _id: null,
                repeatCustomers: {
                  $sum: { $cond: [{ $gt: ["$bookingCount", 1] }, 1, 0] },
                },
                newCustomers: {
                  $sum: { $cond: [{ $eq: ["$bookingCount", 1] }, 1, 0] },
                },
                totalUniqueCustomers: { $sum: 1 },
                avgSpendPerCustomer: { $avg: "$totalSpent" },
              },
            },
          ],

          // ── REFUND & CANCELLATION ANALYSIS ─────────────────────────────────
          refundMetrics: [
            {
              $group: {
                _id: "$refundStatus",
                count: { $sum: 1 },
                amount: { $sum: "$totalAmount" },
              },
            },
          ],
        },
      },
    ]);

    // ─── Derived KPIs (CEO-level calculations) ────────────────────────────────
    const rev = analytics.revenueMetrics[0] || {};
    const customers = analytics.customerMetrics[0] || {};

    const paymentBreakdown = analytics.conversionMetrics.reduce(
      (acc: any, { _id, count, amount }: any) => {
        acc[_id] = { count, amount };
        return acc;
      },
      {}
    );

    const statusBreakdown = analytics.bookingStatusMetrics.reduce(
      (acc: any, { _id, count, guests }: any) => {
        acc[_id] = { count, guests };
        return acc;
      },
      {}
    );

    const totalCompleted = paymentBreakdown["Completed"]?.count || 1;
    const totalAttempted = rev.totalBookings || 1;
    const totalAttended = statusBreakdown["Attended"]?.guests || 0;
    const totalExpected = (statusBreakdown["Confirmed"]?.guests || 0) + totalAttended;

    const mostBookedSlot = analytics.slotPerformance[0] || null;
    const mostCancelledSlot = analytics.slotPerformance.sort(
      (a: any, b: any) => b.noShow - a.noShow
    )[0] || null;

    const waitlistCount = await Waitlist.countDocuments({ status: "waiting" });

    res.status(200).json({
      success: true,
      data: {
        // ── Revenue ────────────────────────────────────────────────────────
        revenue: {
          total: rev.totalRevenue || 0,
          expected: rev.expectedRevenue || 0,
          refunded: rev.totalRefunds || 0,
          averageBookingValue: Math.round(rev.avgBookingValue || 0),
          netRevenue: (rev.totalRevenue || 0) - (rev.totalRefunds || 0),
        },

        // ── Conversion Rates ────────────────────────────────────────────────
        rates: {
          paymentSuccessRate: `${((totalCompleted / totalAttempted) * 100).toFixed(1)}%`,
          noShowRate:
            totalExpected > 0
              ? `${(((totalExpected - totalAttended) / totalExpected) * 100).toFixed(1)}%`
              : "0%",
          checkInRate:
            totalExpected > 0
              ? `${((totalAttended / totalExpected) * 100).toFixed(1)}%`
              : "0%",
          refundRate: `${(((rev.totalRefunds || 0) / (rev.totalRevenue || 1)) * 100).toFixed(1)}%`,
        },

        // ── Guest Volumes ───────────────────────────────────────────────────
        guests: {
          total: rev.totalGuests || 0,
          checkedIn: totalAttended,
          noShow: statusBreakdown["NoShow"]?.guests || 0,
          waitlisted: waitlistCount,
        },

        // ── Booking Volumes ─────────────────────────────────────────────────
        bookings: {
          total: rev.totalBookings || 0,
          confirmed: statusBreakdown["Confirmed"]?.count || 0,
          attended: statusBreakdown["Attended"]?.count || 0,
          cancelled: statusBreakdown["Cancelled"]?.count || 0,
          noShow: statusBreakdown["NoShow"]?.count || 0,
        },

        // ── Customer Intelligence ───────────────────────────────────────────
        customers: {
          unique: customers.totalUniqueCustomers || 0,
          repeat: customers.repeatCustomers || 0,
          new: customers.newCustomers || 0,
          averageSpend: Math.round(customers.avgSpendPerCustomer || 0),
          repeatRate:
            customers.totalUniqueCustomers > 0
              ? `${((customers.repeatCustomers / customers.totalUniqueCustomers) * 100).toFixed(1)}%`
              : "0%",
        },

        // ── Slot Intelligence ───────────────────────────────────────────────
        slotInsights: {
          topSlot: mostBookedSlot
            ? { time: mostBookedSlot._id, revenue: mostBookedSlot.revenue, guests: mostBookedSlot.totalGuests }
            : null,
          slots: analytics.slotPerformance,
        },

        // ── Revenue Trend ───────────────────────────────────────────────────
        dailyTrend: analytics.dailyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Audit Log Explorer — Forensic investigation endpoint
// @route   GET /api/admin/audit?action=payment.failed&userId=...&from=...
// @access  Private/Admin (super_admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      action,
      userId,
      status,
      resourceId,
      from,
      to,
      page = "1",
      limit = "50",
    } = req.query;

    const filter: any = {};
    if (action) filter.action = action;
    if (userId) filter["actor.userId"] = new mongoose.Types.ObjectId(userId as string);
    if (status) filter.status = status;
    if (resourceId) filter["resource.id"] = resourceId;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) filter.createdAt.$lte = new Date(to as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("actor.userId", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
