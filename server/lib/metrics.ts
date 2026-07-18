import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from "prom-client";
import { logger } from "./logger";

// ─── Custom Prometheus Registry ───────────────────────────────────────────────
export const metricsRegistry = new Registry();

// Collect default Node.js metrics (CPU, memory, event loop, GC, etc.)
collectDefaultMetrics({ register: metricsRegistry, prefix: "suvaialaya_node_" });

// ─── Business Metrics — The metrics that matter to the CEO ───────────────────

export const bookingTotal = new Counter({
  name: "suvaialaya_bookings_total",
  help: "Total number of bookings created",
  labelNames: ["status", "slot_time"],
  registers: [metricsRegistry],
});

export const bookingRevenue = new Counter({
  name: "suvaialaya_revenue_total_inr",
  help: "Total revenue in INR from completed payments",
  labelNames: ["slot_time"],
  registers: [metricsRegistry],
});

export const paymentTotal = new Counter({
  name: "suvaialaya_payments_total",
  help: "Total payment attempts",
  labelNames: ["status"], // success | failed | refunded
  registers: [metricsRegistry],
});

export const qrGenerationTotal = new Counter({
  name: "suvaialaya_qr_generations_total",
  help: "Total QR codes generated",
  labelNames: ["status"], // success | failed
  registers: [metricsRegistry],
});

export const waitlistTotal = new Counter({
  name: "suvaialaya_waitlist_joins_total",
  help: "Total users added to waitlist",
  registers: [metricsRegistry],
});

export const checkInTotal = new Counter({
  name: "suvaialaya_checkins_total",
  help: "Total guest check-ins",
  labelNames: ["slot_time"],
  registers: [metricsRegistry],
});

// ─── Performance Metrics ──────────────────────────────────────────────────────

export const httpRequestDuration = new Histogram({
  name: "suvaialaya_http_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [metricsRegistry],
});

export const bookingEngineLatency = new Histogram({
  name: "suvaialaya_booking_engine_duration_seconds",
  help: "Booking engine (with Redis lock + MongoDB transaction) latency",
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [metricsRegistry],
});

// ─── Operational Gauges ───────────────────────────────────────────────────────

export const activeSeatsGauge = new Gauge({
  name: "suvaialaya_active_seat_locks",
  help: "Currently locked seats in Redis (pending payment)",
  registers: [metricsRegistry],
});

export const waitlistSizeGauge = new Gauge({
  name: "suvaialaya_waitlist_size",
  help: "Total users currently waiting on waitlist",
  registers: [metricsRegistry],
});

export const queueDepthGauge = new Gauge({
  name: "suvaialaya_bullmq_queue_depth",
  help: "BullMQ queue depth",
  labelNames: ["queue"],
  registers: [metricsRegistry],
});

// ─── SRE Metrics ──────────────────────────────────────────────────────────────

export const errorTotal = new Counter({
  name: "suvaialaya_errors_total",
  help: "Total application errors",
  labelNames: ["type", "route"],
  registers: [metricsRegistry],
});

export const dlqJobsTotal = new Counter({
  name: "suvaialaya_dlq_jobs_total",
  help: "Total jobs that exhausted retries and landed in Dead Letter Queue",
  labelNames: ["queue"],
  registers: [metricsRegistry],
});

// ─── Prometheus metrics middleware ────────────────────────────────────────────
export function metricsMiddleware(req: any, res: any, next: any) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode.toString(),
      },
      duration
    );
  });
  next();
}

logger.info("Prometheus metrics registry initialized");
