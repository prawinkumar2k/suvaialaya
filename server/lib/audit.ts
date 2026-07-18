import { AuditLog } from "../models/AuditLog";
import { logger } from "./logger";

interface AuditPayload {
  action: string;
  userId?: string;
  role?: string;
  adminId?: string;
  resourceType?: string;
  resourceId?: string;
  status?: "success" | "failure" | "warning";
  errorMessage?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

// ─── Fire-and-forget audit log writer ────────────────────────────────────────
// Never awaited in the main request path — does NOT block response latency.
// If it fails, it logs the error but does NOT throw (non-blocking).
export function audit(payload: AuditPayload): void {
  AuditLog.create({
    actor: {
      userId: payload.userId,
      role: payload.role,
      adminId: payload.adminId,
    },
    action: payload.action as any,
    resource: {
      type: payload.resourceType,
      id: payload.resourceId,
    },
    status: payload.status || "success",
    errorMessage: payload.errorMessage,
    request: {
      ip: payload.ip,
      userAgent: payload.userAgent,
      method: payload.method,
      path: payload.path,
      duration: payload.duration,
    },
    metadata: payload.metadata,
  }).catch((err) => {
    // Audit failure must never crash the main application
    logger.error("AUDIT LOG WRITE FAILED", { error: err.message, action: payload.action });
  });
}

// ─── Audit middleware factory (auto-audits a route) ──────────────────────────
export function auditMiddleware(action: string) {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    res.on("finish", () => {
      const status = res.statusCode < 400 ? "success" : "failure";
      audit({
        action,
        userId: req.user?._id?.toString(),
        role: req.user?.role,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        method: req.method,
        path: req.originalUrl,
        duration: Date.now() - start,
        status,
      });
    });
    next();
  };
}
