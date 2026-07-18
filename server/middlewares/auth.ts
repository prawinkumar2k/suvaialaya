import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, ROLE_PERMISSIONS, UserRole } from "../models/User";
import { logger } from "../lib/logger";
import { audit } from "../lib/audit";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// ─── JWT Protection Middleware ────────────────────────────────────────────────
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, error: "User no longer exists" });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, error: "Account deactivated. Contact support." });
    }

    if ((user as any).isLocked && (user as any).isLocked()) {
      return res.status(401).json({
        success: false,
        error: "Account temporarily locked due to multiple failed login attempts.",
      });
    }

    req.user = user;
    next();
  } catch (error: any) {
    audit({
      action: "auth.token.refresh",
      status: "failure",
      errorMessage: error.message,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.originalUrl,
    });
    return res.status(401).json({ success: false, error: "Not authorized, token failed" });
  }
};

// ─── Role-Based Authorization ─────────────────────────────────────────────────
// Accepts role names directly (e.g., authorize("admin", "owner", "manager"))
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    // Owner has full access to everything
    if (req.user.role === "owner") return next();

    if (!roles.includes(req.user.role)) {
      logger.warn("Unauthorized access attempt", {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.originalUrl,
      });
      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' is not authorized for this action`,
      });
    }
    next();
  };
};

// ─── Permission-Based Authorization ──────────────────────────────────────────
// Finer-grained — check specific permission (e.g., "booking:scan")
export const hasPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const role = req.user.role as UserRole;
    const permissions = ROLE_PERMISSIONS[role] || [];

    const hasWildcard = permissions.includes("*");
    const hasAdminWildcard = permissions.includes("*:admin") && permission.includes("admin");
    const hasExact = permissions.includes(permission);

    if (hasWildcard || hasAdminWildcard || hasExact) {
      return next();
    }

    logger.warn("Permission denied", {
      userId: req.user._id,
      role,
      requiredPermission: permission,
      path: req.originalUrl,
    });
    return res.status(403).json({
      success: false,
      error: `Insufficient permissions for action: ${permission}`,
    });
  };
};
