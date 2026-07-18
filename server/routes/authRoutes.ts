import express from "express";
import { registerUser, loginUser, getUserProfile, updateUserProfile, forgotPassword, verifyOTP, resetPassword } from "../controllers/authController";
import { protect } from "../middlewares/auth";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

export default router;
