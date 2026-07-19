import cron from "node-cron";
import { execSync } from "child_process";
import { logger } from "./logger";
import { alerts } from "./alerts";
import { queueDepthGauge, waitlistSizeGauge } from "./metrics";
import { getRedisClient } from "./redis";
import { Waitlist } from "../models/Waitlist";
import mongoose from "mongoose";

// ─── SRE: Memory watchdog ─────────────────────────────────────────────────────
// Fires every 30 seconds — alerts if heap exceeds 500MB (development/safe limit)
export function startMemoryWatchdog() {
  setInterval(async () => {
    const mem = process.memoryUsage();
    const heapUsedMB = mem.heapUsed / 1024 / 1024;

    // Node.js V8 routinely runs at 95% of heapTotal before garbage collection.
    // Percentage-based alerts are false positives. Use absolute memory instead.
    if (heapUsedMB > 500) {
      logger.error("CRITICAL: Memory usage exceeded 500MB", { heapUsedMB: heapUsedMB.toFixed(1) });
      await alerts.highMemoryUsage(Math.round(heapUsedMB));
    } else if (heapUsedMB > 400) {
      logger.warn("Memory usage above 400MB", { heapUsedMB: heapUsedMB.toFixed(1) });
    }
  }, 30_000);
  logger.info("SRE memory watchdog started (30s interval, 500MB threshold)");
}

// ─── SRE: Queue depth reporter ────────────────────────────────────────────────
// Updates Prometheus gauges every 60 seconds
export function startQueueMonitor() {
  setInterval(async () => {
    try {
      const redis = getRedisClient();
      const [notifWait, qrWait, waitlistWait] = await Promise.all([
        redis.llen("bull:notifications:wait"),
        redis.llen("bull:qr-generation:wait"),
        redis.llen("bull:waitlist:wait"),
      ]);

      queueDepthGauge.set({ queue: "notifications" }, notifWait);
      queueDepthGauge.set({ queue: "qr-generation" }, qrWait);
      queueDepthGauge.set({ queue: "waitlist" }, waitlistWait);

      // Alert if notification queue backlog exceeds 100 jobs
      if (notifWait > 100) {
        logger.warn("Notification queue backlog", { depth: notifWait });
      }
    } catch (err: any) {
      if (err.message.includes('enableOfflineQueue')) return;
      logger.error("Queue monitor error", { error: err.message });
    }
  }, 60_000);
  logger.info("SRE queue monitor started (60s interval)");
}

// ─── SRE: Waitlist size gauge ─────────────────────────────────────────────────
export function startWaitlistMonitor() {
  setInterval(async () => {
    try {
      const count = await Waitlist.countDocuments({ status: "waiting" });
      waitlistSizeGauge.set(count);
    } catch (err: any) {
      logger.error("Waitlist monitor error", { error: err.message });
    }
  }, 120_000);
  logger.info("SRE waitlist monitor started (120s interval)");
}

// ─── BACKUP ENGINE ────────────────────────────────────────────────────────────
// Runs MongoDB dump every 6 hours and maintains rotational retention locally
export function startBackupScheduler() {
  const fs = require("fs");
  const path = require("path");

  // Every 6 hours: 0 */6 * * *
  cron.schedule("0 */6 * * *", async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupsDir = path.resolve(process.cwd(), "data", "backups");
    const rawBackupPath = path.join(backupsDir, `mongodb-raw-${timestamp}`);
    const archivePath = path.join(backupsDir, `mongodb-${timestamp}.tar.gz`);
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/suvaialaya";

    logger.info("Starting scheduled MongoDB backup process", { timestamp });

    let auditId: string | null = null;
    try {
      // 1. Create backups directory if not exists
      if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
      }

      // 2. Log backup start in AuditLog
      const AuditLog = mongoose.model("AuditLog") as any;
      const audit = await AuditLog.create({
        action: "system.backup.started",
        resource: { type: "system", id: "mongodb" },
        status: "success",
        metadata: { timestamp, target: archivePath },
      });
      auditId = (audit as any)._id.toString();

      // 3. Execute mongodump to raw folder
      execSync(`mongodump --uri="${mongoUri}" --out="${rawBackupPath}" --gzip`, {
        timeout: 5 * 60 * 1000, // 5-minute timeout
      });

      // 4. Compress the folder using tar (cross-platform or native shell command)
      // Since tar is installed on standard Linux/macOS/Windows environments
      execSync(`tar -czf "${archivePath}" -C "${backupsDir}" "${path.basename(rawBackupPath)}"`, {
        timeout: 2 * 60 * 1000,
      });

      // 5. Delete raw uncompressed backup folder to conserve disk space
      fs.rmSync(rawBackupPath, { recursive: true, force: true });

      const stats = fs.statSync(archivePath);
      const sizeBytes = stats.size;

      logger.info("MongoDB backup completed and compressed", { archivePath, sizeBytes });

      // 6. Log success in AuditLog
      if (auditId) {
        await AuditLog.updateOne(
          { _id: auditId },
          {
            $set: {
              action: "system.backup.success",
              metadata: { timestamp, archivePath, sizeBytes, status: "success" },
            },
          }
        );
      }

      // 7. Rotate backups: Keep only the 5 most recent backup files
      const files = fs.readdirSync(backupsDir)
        .filter((file: string) => file.startsWith("mongodb-") && file.endsWith(".tar.gz"))
        .map((file: string) => ({
          name: file,
          time: fs.statSync(path.join(backupsDir, file)).mtime.getTime(),
        }))
        .sort((a: any, b: any) => b.time - a.time); // newest first

      if (files.length > 5) {
        const toDelete = files.slice(5);
        for (const file of toDelete) {
          fs.unlinkSync(path.join(backupsDir, file.name));
          logger.info("Rotated and deleted old backup file", { file: file.name });
        }
      }
    } catch (err: any) {
      logger.error("MongoDB backup failed", { error: err.message });
      await alerts.backupFailed("mongodb", err.message);

      // Clean up raw backup path in case of failure
      if (fs.existsSync(rawBackupPath)) {
        fs.rmSync(rawBackupPath, { recursive: true, force: true });
      }

      try {
        const AuditLog = mongoose.model("AuditLog");
        if (auditId) {
          await AuditLog.updateOne(
            { _id: auditId },
            {
              $set: {
                action: "system.backup.failed",
                status: "failure",
                errorMessage: err.message,
                metadata: { timestamp, error: err.message },
              },
            }
          );
        } else {
          await AuditLog.create({
            action: "system.backup.failed",
            resource: { type: "system", id: "mongodb" },
            status: "failure",
            errorMessage: err.message,
            metadata: { timestamp, error: err.message },
          });
        }
      } catch (logErr: any) {
        logger.error("Failed to log backup error to AuditLog", { error: logErr.message });
      }
    }
  });

  // Redis backup every 6 hours (BGSAVE)
  cron.schedule("30 */6 * * *", async () => {
    try {
      const redis = getRedisClient();
      await redis.bgsave();
      logger.info("Redis BGSAVE initiated");
    } catch (err: any) {
      logger.error("Redis BGSAVE failed", { error: err.message });
      await alerts.backupFailed("redis", err.message);
    }
  });

  logger.info("Backup scheduler started (MongoDB with local rotation/auditing, Redis BGSAVE)");
}

// ─── SRE: NoShow Auto-marker ──────────────────────────────────────────────────
// Runs every hour — marks "Confirmed" guests as "NoShow" if slot ended 2h ago
export function startNoShowDetector() {
  cron.schedule("0 * * * *", async () => {
    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const today = new Date().toISOString().split("T")[0];

      const result = await mongoose.model("Booking").updateMany(
        {
          bookingStatus: "Confirmed",
          paymentStatus: "Completed",
          date: { $lt: today },
        },
        { $set: { bookingStatus: "NoShow" } }
      );

      if (result.modifiedCount > 0) {
        logger.info("NoShow detector ran", { markedCount: result.modifiedCount });
      }
    } catch (err: any) {
      logger.error("NoShow detector error", { error: err.message });
    }
  });
  logger.info("SRE NoShow detector started (hourly)");
}

// ─── Start all SRE jobs ───────────────────────────────────────────────────────
export function startSREJobs() {
  startMemoryWatchdog();
  startQueueMonitor();
  startWaitlistMonitor();
  startBackupScheduler();
  startNoShowDetector();
  logger.info("All SRE background jobs started");
}
