import express from "express";
import { getKitchenStats } from "../controllers/kitchenController";
import { protect, authorize } from "../middlewares/auth";

const router = express.Router();

router.use(protect);
// Accessible by kitchen_staff, admin, and owner
router.use(authorize("kitchen_staff", "admin", "owner"));

router.get("/stats", getKitchenStats);

export default router;
