import express from "express";
import { protect, authorize } from "../middlewares/auth";
import { createIncident, updateIncidentStatus, getIncidents } from "../controllers/incidentController";
import { getCostAnalysis } from "../controllers/costController";
import { getAllFlags, updateFlag, checkFlag } from "../controllers/featureFlagController";

const router = express.Router();

// ─── Authentication & Authorization ───────────────────────────────────────────
router.use(protect);
router.use(authorize("owner", "super_admin"));

// ─── Feature Flags ────────────────────────────────────────────────────────────
router.get("/flags", getAllFlags);
router.get("/flags/:key", checkFlag);
router.put("/flags/:key", updateFlag);

// ─── Incidents ────────────────────────────────────────────────────────────────
router.post("/incidents", createIncident);
router.get("/incidents", getIncidents);
router.put("/incidents/:id/status", updateIncidentStatus);

// ─── Cost Analysis ────────────────────────────────────────────────────────────
router.get("/costs", getCostAnalysis);

export default router;
