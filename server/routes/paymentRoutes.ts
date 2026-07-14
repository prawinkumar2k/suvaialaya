import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController";
import { protect } from "../middlewares/auth";

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);

export default router;
