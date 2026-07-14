import express from "express";
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent } from "../controllers/eventController";
import { protect, authorize } from "../middlewares/auth";

const router = express.Router();

router
  .route("/")
  .get(getEvents)
  .post(protect, authorize("admin"), createEvent);

router
  .route("/:id")
  .get(getEvent)
  .put(protect, authorize("admin"), updateEvent)
  .delete(protect, authorize("admin"), deleteEvent);

export default router;
