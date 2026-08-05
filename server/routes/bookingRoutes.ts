import express from "express";
import { createBooking, bulkImportBookings, getMyBookings, getBookings, cancelBooking, checkInBooking, verifyBooking, uploadTicket, rescheduleBooking, updateBooking } from "../controllers/bookingController";
import { protect, authorize } from "../middlewares/auth";

const router = express.Router();

// Public verification route
router.route("/verify/:id").get(verifyBooking);

// Admin-only manual booking routes
router.route("/").post(protect, authorize("admin", "owner", "receptionist"), createBooking);
router.route("/bulk").post(protect, authorize("admin", "owner", "receptionist"), bulkImportBookings);
router.route("/").get(protect, authorize("admin", "owner", "receptionist", "finance"), getBookings);
router.route("/:id").put(protect, authorize("admin", "owner"), updateBooking);
router.route("/:id/cancel").put(protect, authorize("admin", "owner"), cancelBooking);
router.route("/:id/check-in").put(protect, authorize("admin", "scanner", "receptionist", "owner"), checkInBooking);

export default router;
