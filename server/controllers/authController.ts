import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { audit } from "../lib/audit";
import { logger } from "../lib/logger";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const generateToken = (id: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("FATAL: JWT_SECRET environment variable is not set");
  return jwt.sign({ id }, secret, { expiresIn: "24h" });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      audit({ action: "auth.register", status: "failure", ip: req.ip, errorMessage: "Email already exists" });
      return res.status(400).json({ success: false, error: "An account with this email already exists" });
    }

    const user = await User.create({ name, email, phone, password });

    audit({
      action: "auth.register",
      userId: user._id.toString(),
      role: user.role,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      status: "success",
    });

    logger.info("New user registered", { userId: user._id, email });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id.toString()),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      audit({ action: "auth.login.failed", ip: req.ip, metadata: { email }, status: "failure", errorMessage: "User not found" });
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    // ─── Account lockout check ─────────────────────────────────────────────
    if ((user as any).isLocked && (user as any).isLocked()) {
      audit({ action: "auth.login.failed", userId: user._id.toString(), ip: req.ip, status: "failure", errorMessage: "Account locked" });
      return res.status(401).json({
        success: false,
        error: "Account temporarily locked. Please try again in 15 minutes.",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, error: "Account deactivated. Contact support." });
    }

    const isMatch = await (user as any).matchPassword(password);

    if (!isMatch) {
      // ─── Increment failed attempts + lock if threshold reached ─────────────
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
        logger.warn("Account locked after failed attempts", { email, attempts: user.failedLoginAttempts });
      }
      await user.save({ validateBeforeSave: false });

      audit({ action: "auth.login.failed", userId: user._id.toString(), ip: req.ip, status: "failure", errorMessage: "Wrong password" });
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    // ─── Successful login — reset lockout ──────────────────────────────────
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLoginAt = new Date();
    user.lastLoginIP = req.ip;
    await user.save({ validateBeforeSave: false });

    audit({
      action: "auth.login.success",
      userId: user._id.toString(),
      role: user.role,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      status: "success",
    });

    logger.info("User logged in", { userId: user._id, role: user.role });

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id.toString()),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({
      success: true,
      data: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, preferences: user.preferences },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    
    if (req.body.preferences) {
      user.preferences = { ...user.preferences, ...req.body.preferences };
    }

    await user.save();
    audit({ action: "user.profile.update", userId: user._id.toString(), ip: req.ip, status: "success" });

    res.json({
      success: true,
      data: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, preferences: user.preferences },
    });
  } catch (error) {
    next(error);
  }
};
// Removed duplicate block

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Security: Do not reveal if user exists
      return res.status(200).json({ success: true, message: "If an account exists, an OTP has been sent." });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash it for DB storage
    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    user.otpCode = hashedOtp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry
    await user.save({ validateBeforeSave: false });

    // Mock Email Send (Replace with SES/SendGrid)
    logger.info(`[MOCK EMAIL] Password Reset OTP for ${email} is: ${otp}`);
    audit({ action: "auth.forgot_password", userId: user._id.toString(), ip: req.ip, status: "success" });

    res.status(200).json({ success: true, message: "If an account exists, an OTP has been sent." });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: "Email and OTP are required" });
    }

    const user = await User.findOne({ email }).select("+otpCode +otpExpiry");

    if (!user || !user.otpCode || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
    }

    const bcrypt = require("bcryptjs");
    const isValid = await bcrypt.compare(otp, user.otpCode);

    if (!isValid) {
      audit({ action: "auth.verify_otp", userId: user._id.toString(), ip: req.ip, status: "failure", errorMessage: "Invalid OTP" });
      return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
    }

    // OTP verified successfully, clear OTP but issue a temporary reset token
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    audit({ action: "auth.verify_otp", userId: user._id.toString(), ip: req.ip, status: "success" });

    // Issue a short-lived token specifically for resetting the password
    const resetToken = jwt.sign({ id: user._id.toString(), purpose: "reset_password" }, process.env.JWT_SECRET!, { expiresIn: "15m" });

    res.status(200).json({ success: true, resetToken });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, error: "Token and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, error: "Password must be at least 8 characters" });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET!) as any;

    if (decoded.purpose !== "reset_password") {
      return res.status(400).json({ success: false, error: "Invalid token purpose" });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.password = newPassword;
    // Unlock account upon successful password reset
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    
    await user.save();

    audit({ action: "auth.reset_password", userId: user._id.toString(), ip: req.ip, status: "success" });

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    audit({ action: "auth.reset_password", ip: req.ip, status: "failure", errorMessage: "Token invalid or expired" });
    return res.status(400).json({ success: false, error: "Invalid or expired token" });
  }
};
