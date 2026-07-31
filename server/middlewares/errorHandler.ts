import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";

  // ─── Structured logging (not console.error) ────────────────────────────────
  logger.error("Request error", {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    error: message,
    // Only include stack in development — never expose in production
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });

  // ─── Mongoose: Bad ObjectId ────────────────────────────────────────────────
  if (err.name === "CastError") {
    message = "Resource not found — invalid ID";
    statusCode = 404;
  }

  // ─── Mongoose: Duplicate key ───────────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `A record with that ${field} already exists`;
    statusCode = 409;
  }

  // ─── Mongoose: Validation error ────────────────────────────────────────────
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(", ");
    statusCode = 400;
  }

  // ─── JWT errors ────────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    message = "Invalid authentication token";
    statusCode = 401;
  }
  if (err.name === "TokenExpiredError") {
    message = "Authentication token has expired";
    statusCode = 401;
  }

  // ─── Payload too large ─────────────────────────────────────────────────────
  if (err.type === "entity.too.large") {
    message = "Request payload too large";
    statusCode = 413;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    // Only expose request ID in production for support tracking
    ...(process.env.NODE_ENV === "production" && { requestId: req.headers["x-request-id"] }),
  });
};
