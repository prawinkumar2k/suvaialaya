import { Request, Response, NextFunction } from "express";
import { getRedisClient } from "../lib/redis";
import { logger } from "../lib/logger";

/**
 * Middleware to cache HTTP GET responses in Redis.
 * Useful for public CMS routes that receive high traffic but change infrequently.
 * @param durationInSeconds How long the cache should live (e.g., 3600 for 1 hour)
 */
export const cacheRoute = (durationInSeconds: number = 3600) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    try {
      const redis = getRedisClient();
      // Generate a unique cache key based on the URL and query parameters
      const cacheKey = `cache:${req.originalUrl}`;
      
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        // Return the cached response immediately, bypassing MongoDB
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(JSON.parse(cachedData));
      }

      // If not cached, override res.json to capture the response and store it
      const originalJson = res.json.bind(res);
      
      res.json = (body: any) => {
        // Only cache successful requests (no errors)
        if (res.statusCode >= 200 && res.statusCode < 300 && body.success !== false) {
          redis.set(cacheKey, JSON.stringify(body), "EX", durationInSeconds).catch(err => {
            logger.error("Failed to set Redis cache", { error: err.message, cacheKey });
          });
        }
        res.setHeader("X-Cache", "MISS");
        return originalJson(body);
      };

      next();
    } catch (error) {
      // If Redis fails, log the error but fail open (continue to DB)
      logger.warn("Redis caching bypassed due to error", { error: (error as Error).message });
      res.setHeader("X-Cache", "BYPASS");
      next();
    }
  };
};

/**
 * Utility to manually clear cache keys when Admin updates data.
 * @param prefix The URL path prefix to clear (e.g., "/api/pages")
 */
export const clearCache = async (prefix: string) => {
  try {
    const redis = getRedisClient();
    // Use SCAN to find keys matching the prefix and delete them
    const stream = redis.scanStream({
      match: `cache:${prefix}*`,
      count: 100,
    });

    stream.on("data", async (keys: string[]) => {
      if (keys.length) {
        const pipeline = redis.pipeline();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();
        logger.info(`Cleared ${keys.length} cache entries for prefix: ${prefix}`);
      }
    });

    stream.on("end", () => {
      logger.info(`Cache clear complete for prefix: ${prefix}`);
    });
  } catch (error) {
    logger.error("Failed to clear cache", { error: (error as Error).message, prefix });
  }
};
