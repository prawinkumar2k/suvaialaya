import { Request, Response, NextFunction } from "express";
import { Addon } from "../models/Addon";

// @desc    Get all active add-ons
// @route   GET /api/addons
// @access  Public
export const getAddons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const addons = await Addon.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: addons });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new add-on
// @route   POST /api/addons
// @access  Admin
export const createAddon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const addon = await Addon.create(req.body);
    res.status(201).json({ success: true, data: addon });
  } catch (error) {
    next(error);
  }
};

// @desc    Update add-on
// @route   PUT /api/addons/:id
// @access  Admin
export const updateAddon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const addon = await Addon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!addon) {
      res.status(404);
      throw new Error("Addon not found");
    }

    res.status(200).json({ success: true, data: addon });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete add-on
// @route   DELETE /api/addons/:id
// @access  Admin
export const deleteAddon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const addon = await Addon.findByIdAndDelete(req.params.id);

    if (!addon) {
      res.status(404);
      throw new Error("Addon not found");
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
