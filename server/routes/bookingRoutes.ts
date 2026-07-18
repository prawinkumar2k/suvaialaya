import express from "express";
import { createBooking, getMyBookings, getBookings, cancelBooking, checkInBooking, verifyBooking } from "../controllers/bookingController";
import { protect, authorize } from "../middlewares/auth";

const router = express.Router();

// Public verification route
router.route("/verify/:id").get(verifyBooking);

// User routes
router.route("/").post(protect, createBooking);
router.route("/my-bookings").get(protect, getMyBookings);
router.route("/:id/cancel").put(protect, cancelBooking);

// Admin routes
router.route("/").get(protect, authorize("admin", "owner", "receptionist", "finance"), getBookings);
router.route("/:id/check-in").put(protect, authorize("admin", "scanner", "receptionist", "owner"), checkInBooking);

export default router;
