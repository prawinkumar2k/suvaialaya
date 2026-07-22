import { Request, Response } from "express";
import { SystemSettings } from "../models/SystemSettings";

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({}); // Creates default settings
    }
    res.json({ success: true, data: settings });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create(req.body);
    } else {
      settings = await SystemSettings.findOneAndUpdate({}, req.body, { new: true, runValidators: true });
    }
    res.json({ success: true, data: settings });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
