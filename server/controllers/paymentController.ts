import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import QRCode from "qrcode";
import { Booking } from "../models/Booking";

// Initialize Razorpay
// Note: In production, these should be in .env (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: "Not authorized to pay for this booking" });
    }

    const options = {
      amount: booking.totalAmount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_booking_${booking._id}`,
    };

    const order = await razorpay.orders.create(options);
    
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "dummy_secret")
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ success: false, error: "Invalid Payment Signature" });
    }

    // Update booking payment status
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    booking.paymentStatus = "Completed";
    booking.bookingStatus = "Confirmed";
    
    // Generate QR Code containing the Booking ID
    const qrCodeDataUrl = await QRCode.toDataURL(booking._id.toString());
    booking.qrCodeUrl = qrCodeDataUrl;

    await booking.save();

    res.status(200).json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    next(error);
  }
};
