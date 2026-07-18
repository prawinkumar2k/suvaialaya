import express from "express";
import { protect, authorize } from "../middlewares/auth";
import { getBusinessAnalytics, getAuditLogs } from "../controllers/analyticsController";

const router = express.Router();
// IDE Cache refresh

// Business analytics — owner + finance + admin
router.get(
  "/business",
  protect,
  authorize("owner", "admin", "super_admin", "finance"),
  getBusinessAnalytics
);

// Audit logs — super_admin + owner only
router.get(
  "/audit",
  protect,
  authorize("super_admin", "owner"),
  getAuditLogs
);

export default router;
