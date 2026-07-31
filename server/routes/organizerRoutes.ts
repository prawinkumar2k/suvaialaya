import express from "express";
import { protect, authorize } from "../middlewares/auth";
import {
  getOrganizers,
  createOrganizer,
  updateOrganizer,
  deleteOrganizer,
} from "../controllers/organizerController";

const router = express.Router();

router.route("/")
  .get(getOrganizers)
  .post(protect, authorize("admin", "super_admin", "owner"), createOrganizer);

router.route("/:id")
  .put(protect, authorize("admin", "super_admin", "owner"), updateOrganizer)
  .delete(protect, authorize("admin", "super_admin", "owner"), deleteOrganizer);

export default router;
