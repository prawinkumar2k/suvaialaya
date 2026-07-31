import { Request, Response, NextFunction } from "express";
import { Organizer } from "../models/Organizer";

// @desc    Get all active organizers
// @route   GET /api/organizers
// @access  Public
export const getOrganizers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizers = await Organizer.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: organizers });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new organizer
// @route   POST /api/organizers
// @access  Admin
export const createOrganizer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizer = await Organizer.create(req.body);
    res.status(201).json({ success: true, data: organizer });
  } catch (error) {
    next(error);
  }
};

// @desc    Update organizer
// @route   PUT /api/organizers/:id
// @access  Admin
export const updateOrganizer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizer = await Organizer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!organizer) {
      res.status(404);
      throw new Error("Organizer not found");
    }

    res.status(200).json({ success: true, data: organizer });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete organizer
// @route   DELETE /api/organizers/:id
// @access  Admin
export const deleteOrganizer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizer = await Organizer.findByIdAndDelete(req.params.id);

    if (!organizer) {
      res.status(404);
      throw new Error("Organizer not found");
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
