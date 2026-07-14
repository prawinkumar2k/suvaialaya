import express from "express";
import { createBooking, getMyBookings, getBookings, cancelBooking, checkInBooking } from "../controllers/bookingController";
import { protect, authorize } from "../middlewares/auth";

const router = express.Router();

// User routes
router.route("/").post(protect, createBooking);
router.route("/my-bookings").get(protect, getMyBookings);
router.route("/:id/cancel").put(protect, cancelBooking);

// Admin routes
router.route("/").get(protect, authorize("admin"), getBookings);
router.route("/:id/check-in").put(protect, authorize("admin"), checkInBooking);

export default router;
