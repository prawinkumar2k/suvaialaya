import express from "express";
import {
  getDashboardStats,
  scanTicket,
  getOperationsDashboard,
  getKitchenDashboard,
  getReceptionDashboard,
  getRevenueAnalytics,
} from "../controllers/adminController";
import { protect, authorize } from "../middlewares/auth";

const router = express.Router();

router.use(protect, authorize("admin"));

// Owner Dashboard
router.get("/stats", getDashboardStats);
router.get("/revenue", getRevenueAnalytics);

// Operational Dashboards
router.get("/ops", getOperationsDashboard);
router.get("/kitchen", getKitchenDashboard);
router.get("/reception", getReceptionDashboard);

// QR Scanner / Check-in
router.post("/scan", scanTicket);

export default router;
