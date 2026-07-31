import express from "express";
import { protect } from "../middlewares/auth";
import {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
} from "../controllers/userProfileController";

const router = express.Router();

router.use(protect); // All routes require authentication

router.route("/profile")
  .get(getUserProfile)
  .put(updateUserProfile);

router.put("/password", updateUserPassword);

export default router;
