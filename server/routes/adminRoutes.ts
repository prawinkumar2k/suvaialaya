import express from "express";
import { getDashboardStats, scanTicket } from "../controllers/adminController";
import { protect, authorize } from "../middlewares/auth";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", getDashboardStats);
router.post("/scan", scanTicket);

export default router;
