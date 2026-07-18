import winston from "winston";

const { combine, timestamp, printf, colorize, json } = winston.format;

// ─── Development: human-readable coloured output ────────────────────────────
const devFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : "";
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// ─── Production: structured JSON for Loki / Grafana ingestion ───────────────
const prodFormat = combine(timestamp(), json());

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
  defaultMeta: { service: "suvaialaya-api" },
  transports: [
    new winston.transports.Console(),
    // In production, also write to rotating log files
    ...(process.env.NODE_ENV === "production"
      ? [
          new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
            tailable: true,
          }),
          new winston.transports.File({
            filename: "logs/combined.log",
            maxsize: 10 * 1024 * 1024,
            maxFiles: 10,
            tailable: true,
          }),
        ]
      : []),
  ],
});

export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("HTTP Request", {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
  });
  next();
};
