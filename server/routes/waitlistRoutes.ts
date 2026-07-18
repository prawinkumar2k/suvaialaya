import express from "express";
import { protect } from "../middlewares/auth";
import { Waitlist } from "../models/Waitlist";
import { logger } from "../lib/logger";

const router = express.Router();
// IDE Cache refresh

// @desc    Get waitlist position for current user
// @route   GET /api/waitlist/my-position?slotKey=eventId:date:slotTime
// @access  Private
router.get("/my-position", protect, async (req, res, next) => {
  try {
    const { slotKey } = req.query;
    if (!slotKey) {
      return res.status(400).json({ success: false, error: "slotKey is required" });
    }

    const entry = await Waitlist.findOne({
      user: req.user._id,
      slotKey: slotKey as string,
      status: "waiting",
    }).lean();

    if (!entry) {
      return res.status(404).json({ success: false, error: "You are not on the waitlist for this slot" });
    }

    // Recalculate live position
    const position = await Waitlist.countDocuments({
      slotKey: slotKey as string,
      status: "waiting",
      createdAt: { $lt: entry.createdAt },
    });

    res.json({
      success: true,
      data: {
        position: position + 1,
        slotKey,
        numberOfGuests: entry.numberOfGuests,
        joinedAt: entry.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Leave waitlist
// @route   DELETE /api/waitlist/:id
// @access  Private
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const entry = await Waitlist.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, error: "Waitlist entry not found" });
    }
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }
    entry.status = "expired";
    await entry.save();
    res.json({ success: true, message: "Removed from waitlist" });
  } catch (error) {
    next(error);
  }
});

// @desc    Get full waitlist for a slot (Admin)
// @route   GET /api/waitlist/admin?slotKey=...
// @access  Private/Admin
import { authorize } from "../middlewares/auth";
router.get("/admin", protect, authorize("admin"), async (req, res, next) => {
  try {
    const { slotKey } = req.query;
    const filter: any = { status: "waiting" };
    if (slotKey) filter.slotKey = slotKey;

    const entries = await Waitlist.find(filter)
      .populate("user", "name email phone")
      .sort({ position: 1, createdAt: 1 })
      .lean();

    res.json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    next(error);
  }
});

export default router;
