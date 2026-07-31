import { Request, Response, NextFunction } from "express";
import { User, USER_ROLES } from "../models/User";
import crypto from "crypto";

// @desc    Get all staff members
// @route   GET /api/staff
// @access  Admin/SuperAdmin
export const getStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const staff = await User.find({ role: { $ne: "customer" } }).select("-password -otpCode -otpExpiry").sort({ role: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new staff member
// @route   POST /api/staff
// @access  Admin/SuperAdmin
export const createStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, role } = req.body;

    if (!name || !email || !phone || !role) {
      res.status(400);
      throw new Error("Please provide all required fields");
    }

    if (!USER_ROLES.includes(role)) {
      res.status(400);
      throw new Error("Invalid role provided");
    }
    
    if (role === "owner" && req.user.role !== "owner") {
      res.status(403);
      throw new Error("Only owners can create other owners");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists with this email");
    }

    const tempPassword = crypto.randomBytes(8).toString("hex");

    const staff = await User.create({
      name,
      email,
      phone,
      role,
      password: tempPassword,
      isEmailVerified: true,
    });

    res.status(201).json({ 
      success: true, 
      data: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        tempPassword 
      } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff member role/status
// @route   PUT /api/staff/:id
// @access  Admin/SuperAdmin
export const updateStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, isActive } = req.body;

    const staff = await User.findById(req.params.id);

    if (!staff) {
      res.status(404);
      throw new Error("Staff not found");
    }

    if (staff.role === "owner" && req.user.role !== "owner") {
      res.status(403);
      throw new Error("Cannot modify an owner account");
    }

    if (role && USER_ROLES.includes(role)) staff.role = role;
    if (isActive !== undefined) staff.isActive = isActive;

    await staff.save();

    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete (Revoke) staff access
// @route   DELETE /api/staff/:id
// @access  Admin/SuperAdmin
export const deleteStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const staff = await User.findById(req.params.id);

    if (!staff) {
      res.status(404);
      throw new Error("Staff not found");
    }

    if (staff.role === "owner" && req.user.role !== "owner") {
      res.status(403);
      throw new Error("Cannot delete an owner account");
    }
    
    if (staff._id.toString() === req.user.id) {
      res.status(400);
      throw new Error("You cannot delete your own account");
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
