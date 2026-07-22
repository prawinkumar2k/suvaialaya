import express from "express";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuController";
import { protect, authorize } from "../middlewares/auth";

const router = express.Router();

// Public route
router.get("/", getMenuItems);

// Admin-only routes
router.use(protect);
router.use(authorize("admin"));

router.post("/", createMenuItem);
router.put("/:id", updateMenuItem);
router.delete("/:id", deleteMenuItem);

export default router;
