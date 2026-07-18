import { Request, Response, NextFunction } from "express";
import { Tenant } from "../models/Tenant";
import { Booking } from "../models/Booking";
import { FeatureFlag } from "../models/FeatureFlag";

// ─── Constants for Cost Estimation (INR) ──────────────────────────────────────
const COSTS = {
  // Infrastructure
  serverHour: 2.5, // VPS cost per hour
  dbGBMonth: 50,   // MongoDB storage cost per GB/month
  redisHour: 1.0,  // Redis cache cost per hour

  // Usage based
  smsPerUnit: 0.15,
  emailPerUnit: 0.05,
  whatsappPerUnit: 0.80,
  
  // Payment Gateway
  razorpayPercent: 0.02, // 2% per transaction
};

// ─── Calculate Cost ───────────────────────────────────────────────────────────
export const getCostAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { month, year } = req.query;
    
    const targetDate = month && year 
      ? new Date(parseInt(year as string), parseInt(month as string) - 1, 1) 
      : new Date();
      
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const hoursInMonth = daysInMonth * 24;

    // 1. Fixed Infrastructure Costs
    const infraCost = {
      server: hoursInMonth * COSTS.serverHour,
      redis: hoursInMonth * COSTS.redisHour,
      database: 5 * COSTS.dbGBMonth, // Assuming 5GB average for now
    };
    const totalInfraCost = Object.values(infraCost).reduce((a, b) => a + b, 0);

    // 2. Transaction Costs (Revenue & Payment Gateway)
    const bookings = await Booking.aggregate([
      { 
        $match: { 
          paymentStatus: "Completed",
          createdAt: { $gte: startOfMonth, $lte: endOfMonth } 
        } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const revenue = bookings[0]?.totalRevenue || 0;
    const bookingCount = bookings[0]?.count || 0;
    const pgCost = revenue * COSTS.razorpayPercent;

    // 3. Notification Costs (Estimating 2 emails, 1 SMS per booking)
    const notificationCost = {
      email: bookingCount * 2 * COSTS.emailPerUnit,
      sms: bookingCount * 1 * COSTS.smsPerUnit,
      whatsapp: 0, // Assume not active unless flag checked
    };
    const totalNotificationCost = Object.values(notificationCost).reduce((a, b) => a + b, 0);

    // Total Expenses
    const totalExpenses = totalInfraCost + pgCost + totalNotificationCost;
    const profit = revenue - totalExpenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    res.json({
      success: true,
      data: {
        period: {
          month: targetDate.getMonth() + 1,
          year: targetDate.getFullYear(),
        },
        revenue,
        expenses: {
          infrastructure: infraCost,
          paymentGateway: Math.round(pgCost),
          notifications: notificationCost,
          total: Math.round(totalExpenses),
        },
        profitability: {
          profit: Math.round(profit),
          profitMarginPercent: parseFloat(profitMargin.toFixed(2)),
        },
        metrics: {
          bookingsCompleted: bookingCount,
          costPerBooking: bookingCount > 0 ? parseFloat((totalExpenses / bookingCount).toFixed(2)) : 0,
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
