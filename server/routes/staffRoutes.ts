import express from "express";
import { protect, authorize } from "../middlewares/auth";
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staffController";

const router = express.Router();

router.use(protect, authorize("admin", "super_admin", "owner"));

router.route("/")
  .get(getStaff)
  .post(createStaff);

router.route("/:id")
  .put(updateStaff)
  .delete(deleteStaff);

export default router;
