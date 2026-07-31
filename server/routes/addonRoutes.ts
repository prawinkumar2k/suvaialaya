import express from "express";
import { protect, authorize } from "../middlewares/auth";
import {
  getAddons,
  createAddon,
  updateAddon,
  deleteAddon,
} from "../controllers/addonController";

const router = express.Router();

router.route("/")
  .get(getAddons)
  .post(protect, authorize("admin", "super_admin", "owner"), createAddon);

router.route("/:id")
  .put(protect, authorize("admin", "super_admin", "owner"), updateAddon)
  .delete(protect, authorize("admin", "super_admin", "owner"), deleteAddon);

export default router;
