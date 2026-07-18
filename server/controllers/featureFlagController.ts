import { Request, Response, NextFunction } from "express";
import { setFlag, isEnabled, getFlagValue } from "../lib/featureFlags";
import { FeatureFlag, FLAG_KEYS } from "../models/FeatureFlag";

export const getAllFlags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flags = await FeatureFlag.find().sort({ key: 1 }).lean();
    res.json({ success: true, data: flags });
  } catch (error) {
    next(error);
  }
};

export const updateFlag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;
    const { enabled, value, tenantId } = req.body;

    if (!FLAG_KEYS.includes(key as any)) {
      return res.status(400).json({ success: false, error: "Invalid flag key" });
    }

    await setFlag(key as any, enabled, value, req.user?._id, tenantId);

    res.json({ success: true, message: `Flag ${key} updated successfully` });
  } catch (error) {
    next(error);
  }
};

export const checkFlag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;
    const { tenantId } = req.query;

    const enabled = await isEnabled(key as any, tenantId as string);
    const value = await getFlagValue(key as any);

    res.json({ success: true, data: { key, enabled, value } });
  } catch (error) {
    next(error);
  }
};
