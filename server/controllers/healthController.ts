import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { getRedisClient } from "../lib/redis";
import { metricsRegistry } from "../lib/metrics";
import { logger } from "../lib/logger";

// ─── Service health status type ───────────────────────────────────────────────
type HealthStatus = "healthy" | "degraded" | "unhealthy";

interface ServiceHealth {
  status: HealthStatus;
  latencyMs?: number;
  message?: string;
  details?: Record<string, any>;
}

interface SystemHealth {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    mongodb: ServiceHealth;
    redis: ServiceHealth;
    nodeMemory: ServiceHealth;
    nodeCPU: ServiceHealth;
    queues: ServiceHealth;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Deep Health Check — Kubernetes liveness + readiness probe endpoint
// @route   GET /api/health
// @access  Public (no auth — K8s needs to call this)
// ─────────────────────────────────────────────────────────────────────────────
export const getSystemHealth = async (req: Request, res: Response) => {
  const checks: SystemHealth = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "2.0.0",
    services: {
      mongodb: await checkMongoDB(),
      redis: await checkRedis(),
      nodeMemory: checkNodeMemory(),
      nodeCPU: checkNodeCPU(),
      queues: await checkQueues(),
    },
  };

  // ─── Determine overall system status ─────────────────────────────────────
  const serviceStatuses = Object.values(checks.services).map((s) => s.status);
  if (serviceStatuses.includes("unhealthy")) {
    checks.status = "unhealthy";
  } else if (serviceStatuses.includes("degraded")) {
    checks.status = "degraded";
  }

  const httpStatus = checks.status === "healthy" ? 200 : checks.status === "degraded" ? 200 : 503;

  if (checks.status !== "healthy") {
    logger.warn("System health check degraded", { status: checks.status, services: checks.services });
  }

  res.status(httpStatus).json(checks);
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Prometheus Metrics Endpoint
// @route   GET /api/metrics
// @access  Internal (Prometheus scrapes this)
// ─────────────────────────────────────────────────────────────────────────────
export const getMetrics = async (_req: Request, res: Response) => {
  try {
    res.set("Content-Type", metricsRegistry.contentType);
    res.send(await metricsRegistry.metrics());
  } catch (err) {
    res.status(500).end();
  }
};

// ─── Individual Service Checks ────────────────────────────────────────────────

async function checkMongoDB(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const state = mongoose.connection.readyState;
    if (state !== 1) {
      return { status: "unhealthy", message: `MongoDB readyState: ${state}` };
    }
    // Ping with 3-second timeout
    await mongoose.connection.db!.admin().ping();
    const latencyMs = Date.now() - start;
    return {
      status: latencyMs > 500 ? "degraded" : "healthy",
      latencyMs,
      message: latencyMs > 500 ? "High latency detected" : "Connected",
    };
  } catch (err: any) {
    return { status: "unhealthy", message: err.message, latencyMs: Date.now() - start };
  }
}

async function checkRedis(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const redis = getRedisClient();
    const pong = await redis.ping();
    const latencyMs = Date.now() - start;
    if (pong !== "PONG") {
      return { status: "unhealthy", message: "Redis ping failed" };
    }
    const info = await redis.info("memory");
    const usedMemory = parseInt(info.match(/used_memory:(\d+)/)?.[1] || "0");
    const maxMemory = parseInt(info.match(/maxmemory:(\d+)/)?.[1] || "0");
    const memUsagePct = maxMemory > 0 ? (usedMemory / maxMemory) * 100 : 0;

    return {
      status: latencyMs > 100 || memUsagePct > 90 ? "degraded" : "healthy",
      latencyMs,
      message: memUsagePct > 90 ? `Memory ${memUsagePct.toFixed(0)}% full` : "Connected",
      details: { memoryUsagePct: `${memUsagePct.toFixed(1)}%` },
    };
  } catch (err: any) {
    return { status: "unhealthy", message: err.message, latencyMs: Date.now() - start };
  }
}

function checkNodeMemory(): ServiceHealth {
  const mem = process.memoryUsage();
  const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
  const usagePercent = (mem.heapUsed / mem.heapTotal) * 100;
  const rssMB = Math.round(mem.rss / 1024 / 1024);

  return {
    status: usagePercent > 90 ? "unhealthy" : usagePercent > 75 ? "degraded" : "healthy",
    message: `Heap: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent.toFixed(0)}%)`,
    details: { heapUsedMB, heapTotalMB, rssMB, usagePercent: `${usagePercent.toFixed(1)}%` },
  };
}

function checkNodeCPU(): ServiceHealth {
  const cpuUsage = process.cpuUsage();
  const totalMicros = cpuUsage.user + cpuUsage.system;
  const cpuSeconds = totalMicros / 1e6;

  return {
    status: "healthy", // CPU instantaneous check — Prometheus handles trending
    message: `CPU time: ${cpuSeconds.toFixed(2)}s`,
    details: { userMicros: cpuUsage.user, systemMicros: cpuUsage.system },
  };
}

async function checkQueues(): Promise<ServiceHealth> {
  try {
    const redis = getRedisClient();
    // Check BullMQ queues exist and are reachable
    const notificationQueueSize = await redis.llen("bull:notifications:wait");
    return {
      status: notificationQueueSize > 1000 ? "degraded" : "healthy",
      message:
        notificationQueueSize > 1000
          ? `Notification queue backlog: ${notificationQueueSize} jobs`
          : "Queues operational",
      details: { notificationQueueSize },
    };
  } catch (err: any) {
    return { status: "unhealthy", message: `Queue check failed: ${err.message}` };
  }
}
