import "dotenv/config";
import mongoose from "mongoose";
import { getRedisClient } from "../server/lib/redis";
import { logger } from "../server/lib/logger";

// ─── Chaos Monkey for Suvaialaya ──────────────────────────────────────────────
// Injects failures into the running production system to test resilience.

const CHAOS = {
  killMongo: async () => {
    logger.warn("CHAOS MONKEY: Killing MongoDB connection pool");
    await mongoose.connection.close();
  },
  killRedis: async () => {
    logger.warn("CHAOS MONKEY: Disconnecting Redis");
    const redis = getRedisClient();
    redis.disconnect();
  },
  cpuSpike: () => {
    logger.warn("CHAOS MONKEY: Spiking CPU to 100%");
    const end = Date.now() + 10000; // 10 seconds of blocking
    while (Date.now() < end) {}
  },
  memoryLeak: () => {
    logger.warn("CHAOS MONKEY: Simulating 500MB Memory Leak");
    const leak = [];
    for (let i = 0; i < 500000; i++) {
      leak.push(new Array(1000).fill("CHAOS"));
    }
  },
  triggerDeadLetterQueue: async () => {
    logger.warn("CHAOS MONKEY: Forcing a job into DLQ");
    // Simulate by manually writing to DLQ redis keys
    const redis = getRedisClient();
    await redis.lpush("bull:notifications:failed", JSON.stringify({ chaos: true, error: "Monkey induced" }));
  },
};

const runChaos = async () => {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_CHAOS !== "true") {
    console.error("Chaos Monkey is disabled in production without ALLOW_CHAOS=true");
    process.exit(1);
  }

  const experiment = process.argv[2];

  if (experiment === "mongo") await CHAOS.killMongo();
  else if (experiment === "redis") await CHAOS.killRedis();
  else if (experiment === "cpu") CHAOS.cpuSpike();
  else if (experiment === "memory") CHAOS.memoryLeak();
  else if (experiment === "dlq") await CHAOS.triggerDeadLetterQueue();
  else {
    console.log("Usage: pnpm tsx scripts/chaos.ts [mongo|redis|cpu|memory|dlq]");
  }
};

runChaos().catch(console.error);
