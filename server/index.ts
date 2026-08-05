import "dotenv/config";
import path from "node:path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import mongoSanitize from "express-mongo-sanitize";
import { connectDB } from "./db";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger, logger } from "./lib/logger";
import { metricsMiddleware } from "./lib/metrics";
import { getRedisClient } from "./lib/redis";

// ─── Suppress repetitive Redis connection error spam in development ──────────
process.on("uncaughtException", (err: any) => {
  if (err.code === "ECONNREFUSED" && err.port === 6379) return;
  logger.error("Uncaught Exception", { error: err.message, stack: err.stack });
});
process.on("unhandledRejection", (reason: any) => {
  if (reason?.code === "ECONNREFUSED" && reason?.port === 6379) return;
  logger.error("Unhandled Rejection", { reason });
});
import eventRoutes from "./routes/eventRoutes";
import bookingRoutes from "./routes/bookingRoutes";

import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";
import engineRoutes from "./routes/engineRoutes";
import waitlistRoutes from "./routes/waitlistRoutes.ts";
import analyticsRoutes from "./routes/analyticsRoutes.ts";

import menuRoutes from "./routes/menuRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import pageRoutes from "./routes/pageRoutes";
import galleryImageRoutes from "./routes/galleryImageRoutes";
import aboutFeatureRoutes from "./routes/aboutFeatureRoutes";
import landingStatRoutes from "./routes/landingStatRoutes";
import landingSpecialRoutes from "./routes/landingSpecialRoutes";
import organizerRoutes from "./routes/organizerRoutes";
import userProfileRoutes from "./routes/userProfileRoutes";
import addonRoutes from "./routes/addonRoutes";
import staffRoutes from "./routes/staffRoutes";
import { getSystemHealth, getMetrics } from "./controllers/healthController";
import { cacheRoute } from "./middlewares/cacheMiddleware";

// ─── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ─── Start background services after DB is ready ─────────────────────────────
// Prevent zombie background services during Vite HMR restarts
if (!(global as any).__BACKGROUND_JOBS_STARTED) {
  (global as any).__BACKGROUND_JOBS_STARTED = true;
  Promise.all([
    import("./services/workers"),
    import("./lib/featureFlags").then((m) => m.seedDefaultFlags()),
    import("./lib/sre").then((m) => m.startSREJobs()),
  ]).then(() => {
    logger.info("All background services initialized");
  }).catch((err) => {
    logger.error("Background services startup failed", { error: err.message });
  });
}

export function createServer() {
  const app = express();

  // ─── System Level Emergency Controls (Feature Flags) ─────────────────────
  app.use(async (req, res, next) => {
    try {
      const { isEnabled } = await import("./lib/featureFlags");
      
      const isMaintenance = await isEnabled("system.maintenance.mode");
      if (isMaintenance && !req.path.startsWith("/api/auth")) {
        // Only block API routes, let Vite serve frontend
        if (req.path.startsWith("/api/")) {
          return res.status(503).json({ success: false, error: "System under emergency maintenance." });
        }
      }

      if (req.method !== "GET") {
        const isReadOnly = await isEnabled("system.read.only.mode");
        if (isReadOnly && !req.path.startsWith("/api/auth")) {
          if (req.path.startsWith("/api/")) {
            return res.status(503).json({ success: false, error: "System is in read-only mode." });
          }
        }
      }
      
      next();
    } catch {
      next(); // Fail open if flag service crashes
    }
  });

  // ─── Trust proxy (Nginx / K8s ingress) ────────────────────────────────────
  app.set("trust proxy", 1);

  // ─── Security: Helmet HTTP Headers ───────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com", "blob:"],
          workerSrc: ["'self'", "blob:"],
          frameSrc: ["'self'", "https://api.razorpay.com", "https://maps.google.com", "https://www.google.com"],
          connectSrc: ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com", "ws:", "wss:"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          mediaSrc: ["'self'", "https://actions.google.com"],
          upgradeInsecureRequests: null, // Do not force HTTPS in development
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: process.env.NODE_ENV === "production" ? { policy: "same-origin" } : false,
      crossOriginResourcePolicy: process.env.NODE_ENV === "production" ? { policy: "same-origin" } : false,
      originAgentCluster: false,
      hsts: false, // Disable Strict-Transport-Security in development
    })
  );

  // ─── CORS ─────────────────────────────────────────────────────────────────
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:8080").split(",");
  app.use(
    "/api",
    cors({
      origin: (origin, callback) => {
        if (process.env.NODE_ENV !== "production" || !origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o.trim()))) {
          callback(null, true);
        } else {
          logger.warn("CORS blocked", { origin });
          callback(null, false); // Do not throw error (which causes 500), just deny CORS headers
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );


  // ─── Regular JSON body parsing ──────────────────────────────────────────
  app.use("/api", express.json({ limit: "10mb" }));
  app.use("/api", express.urlencoded({ extended: true, limit: "10kb" }));

  // ─── NoSQL Injection Prevention ────────────────────────────────────────────
  // mongoSanitize() mutates req.query which is read-only in Vite's connect server, so we only run it in production
  if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
      ['body', 'params', 'headers'].forEach((k) => {
        if ((req as any)[k]) {
          (req as any)[k] = mongoSanitize.sanitize((req as any)[k]);
        }
      });
      next();
    });
  }

  // ─── Observability: Request logging + Prometheus metrics ──────────────────
  app.use(requestLogger);
  app.use(metricsMiddleware);

  // ─── Rate Limiting ─────────────────────────────────────────────────────────
  const createRateLimitStore = (prefix: string) => process.env.NODE_ENV === "production" 
    ? new RedisStore({
        prefix: prefix,
        sendCommand: (...args: string[]) => {
          const client = getRedisClient();
          return client.call(args[0], ...args.slice(1)) as any;
        },
      })
    : undefined;

  app.use(
    "/api/",
    rateLimit({
      store: createRateLimitStore("rl:api:"),
      windowMs: 15 * 60 * 1000,
      max: 300,
      message: { success: false, error: "Too many requests" },
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.use(
    "/api/auth/login",
    rateLimit({
      store: createRateLimitStore("rl:login:"),
      windowMs: 15 * 60 * 1000,
      max: 20,
      skipSuccessfulRequests: true,
      message: { success: false, error: "Too many login attempts. Try again in 15 minutes." },
    })
  );

  app.use(
    "/api/auth/register",
    rateLimit({
      store: createRateLimitStore("rl:register:"),
      windowMs: 60 * 60 * 1000,
      max: 5,
      message: { success: false, error: "Too many registrations from this IP" },
    })
  );

  app.use(
    "/api/bookings",
    rateLimit({
      store: createRateLimitStore("rl:bookings:"),
      windowMs: 60 * 1000,
      max: 10,
      message: { success: false, error: "Too many booking requests" },
    })
  );

  // ─── API Routes ────────────────────────────────────────────────────────────
  app.use("/api/auth", authRoutes);
  app.use("/api/events", cacheRoute(300), eventRoutes); // 5 min cache for events
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/waitlist", waitlistRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/engines", engineRoutes);

  app.use("/api/menu", cacheRoute(3600), menuRoutes);
  app.use("/api/settings", cacheRoute(3600), settingsRoutes);
  app.use("/api/pages", cacheRoute(3600), pageRoutes);
  app.use("/api/galleryimages", cacheRoute(3600), galleryImageRoutes);
  app.use("/api/aboutfeatures", cacheRoute(3600), aboutFeatureRoutes);
  app.use("/api/landingstats", cacheRoute(3600), landingStatRoutes);
  app.use("/api/landingspecials", cacheRoute(3600), landingSpecialRoutes);
  app.use("/api/organizers", cacheRoute(3600), organizerRoutes);
  app.use("/api/users", userProfileRoutes);
  app.use("/api/addons", cacheRoute(3600), addonRoutes);
  app.use("/api/staff", staffRoutes);

  // ─── Health & Observability Endpoints ────────────────────────────────────
  app.get("/api/health", getSystemHealth);    // Kubernetes liveness + readiness
  app.get("/api/metrics", getMetrics);        // Prometheus scrape endpoint
  app.get("/api/ping", (_req, res) => res.json({ message: "pong" }));

  // ─── Catch-all 404 for undefined Page routes (SEO & Red Team Security) ─────
  const VALID_FRONTEND_ROUTES = [
    /^\/$/,
    /^\/about$/,
    /^\/menu$/,
    /^\/gallery$/,
    /^\/login$/,
    /^\/register$/,
    /^\/forgot-password$/,
    /^\/verify-otp$/,
    /^\/reset-password$/,

    /^\/dashboard$/,
    /^\/admin$/,
    /^\/reception$/,

    /^\/scanner$/,
    /^\/organizers$/,
    /^\/contact$/,
    /^\/faq$/,
    /^\/help$/,
    /^\/terms$/,
    /^\/privacy$/,
    /^\/events\/[^/]+$/,
    /^\/ticket\/[^/]+$/
  ];

  if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      if (path.extname(req.path)) {
        return next();
      }
      const isValid = VALID_FRONTEND_ROUTES.some(regex => regex.test(req.path));
      if (!isValid) {
        res.status(404).send("Not Found");
        return;
      }
      next();
    });
  }

  // ─── Catch-all 404 for undefined API routes ──────────────────────────────
  app.use("/api", (req, res) => {
    res.status(404).json({ success: false, error: `API route not found: ${req.method} ${req.originalUrl}` });
  });

  // ─── Error Handler ────────────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
