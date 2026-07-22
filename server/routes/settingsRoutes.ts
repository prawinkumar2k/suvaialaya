import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController";
import { protect, authorize } from "../middlewares/auth";

const router = express.Router();

router.get("/", getSettings);

// Only admins can update settings
router.put("/", protect, authorize("admin"), updateSettings);

export default router;
