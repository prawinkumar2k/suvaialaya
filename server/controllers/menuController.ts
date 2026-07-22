import { Request, Response } from "express";
import { MenuItem } from "../models/MenuItem";

export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const items = await MenuItem.find({ isActive: true }).sort({ category: 1, name: 1 });
    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }
    res.json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
