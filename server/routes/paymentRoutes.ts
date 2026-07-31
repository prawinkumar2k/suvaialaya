import express from "express";
import { createOrder, verifyPayment, razorpayWebhook, mockPayment } from "../controllers/paymentController";
import { protect } from "../middlewares/auth";

const router = express.Router();

// Webhook must use raw body — registered BEFORE express.json() in server
router.post("/webhook", express.raw({ type: "application/json" }), razorpayWebhook);

// Authenticated routes
router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post("/mock", protect, mockPayment);

export default router;
