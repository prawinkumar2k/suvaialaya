import { Request, Response } from "express";
import { LandingStat } from "../models/LandingStat";

export const getAll = async (req: Request, res: Response) => {
  try {
    const data = await LandingStat.find();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const data = await LandingStat.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: "Not Found" });
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const data = await LandingStat.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const data = await LandingStat.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, error: "Not Found" });
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const data = await LandingStat.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: "Not Found" });
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
