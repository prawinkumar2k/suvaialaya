import express from "express";
import { getAll, getOne, create, update, remove } from "../controllers/landingSpecialController";
import { protect, authorize } from "../middlewares/auth";
const admin = authorize("admin");

const router = express.Router();

router.route("/")
  .get(getAll)
  .post(protect, admin, create);

router.route("/:id")
  .get(getOne)
  .put(protect, admin, update)
  .delete(protect, admin, remove);

export default router;
