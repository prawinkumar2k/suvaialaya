import express from "express";
import { createOrder, verifyPayment, razorpayWebhook } from "../controllers/paymentController";
import { protect } from "../middlewares/auth";

const router = express.Router();

// Webhook must use raw body — registered BEFORE express.json() in server
router.post("/webhook", express.raw({ type: "application/json" }), razorpayWebhook);

// Authenticated routes
router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);

export default router;
