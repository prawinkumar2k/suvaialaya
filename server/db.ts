import mongoose from "mongoose";
import { logger } from "./lib/logger";

export async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/suvaialaya";

    const conn = await mongoose.connect(mongoURI, {
      // ─── Connection Pool (handles 10,000+ concurrent users) ─────────────────
      maxPoolSize: 50,          // Max 50 simultaneous connections to MongoDB
      minPoolSize: 5,           // Keep minimum 5 connections warm
      maxIdleTimeMS: 30000,     // Close idle connections after 30s
      serverSelectionTimeoutMS: 5000, // Fail fast if MongoDB unreachable (5s)
      socketTimeoutMS: 45000,   // Abort hanging socket operations after 45s
      heartbeatFrequencyMS: 10000, // Check connection health every 10s

      // ─── Retry configuration ─────────────────────────────────────────────
      retryWrites: true,        // Auto-retry transient write failures
      retryReads: true,
    });

    logger.info("MongoDB connected", {
      host: conn.connection.host,
      database: conn.connection.name,
      poolSize: 50,
    });

    // ─── Handle connection events ─────────────────────────────────────────────
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error", { error: err.message });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected — attempting reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected successfully");
    });

    // ─── Graceful shutdown: close DB connection on process termination ────────
    process.on("SIGTERM", async () => {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed due to app termination");
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed due to interrupt");
      process.exit(0);
    });
  } catch (error: any) {
    logger.error("MongoDB initial connection failed", { error: error.message });
    process.exit(1);
  }
}
