import { logger } from "./logger";

// ─── Alert Severity ───────────────────────────────────────────────────────────
type Severity = "info" | "warning" | "critical";

interface AlertPayload {
  title: string;
  message: string;
  severity: Severity;
  metadata?: Record<string, any>;
}

// ─── Telegram Alert ───────────────────────────────────────────────────────────
async function sendTelegramAlert(payload: AlertPayload): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const emoji = { info: "ℹ️", warning: "⚠️", critical: "🚨" }[payload.severity];
  const text = [
    `${emoji} *SUVAIALAYA ALERT*`,
    ``,
    `*${payload.title}*`,
    payload.message,
    ``,
    payload.metadata
      ? Object.entries(payload.metadata)
          .map(([k, v]) => `• ${k}: \`${v}\``)
          .join("\n")
      : "",
    ``,
    `_${new Date().toISOString()}_`,
  ]
    .join("\n")
    .trim();

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch (err: any) {
    logger.error("Telegram alert failed", { error: err.message });
  }
}

// ─── Email Alert (via Resend) ─────────────────────────────────────────────────
async function sendEmailAlert(payload: AlertPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const alertEmail = process.env.ALERT_EMAIL;
  if (!apiKey || !alertEmail) return;

  const severityColor = { info: "#0066cc", warning: "#ff9900", critical: "#cc0000" }[payload.severity];
  const emoji = { info: "ℹ️", warning: "⚠️", critical: "🚨" }[payload.severity];

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Suvaialaya SRE <alerts@suvaialaya.com>",
        to: [alertEmail],
        subject: `${emoji} [${payload.severity.toUpperCase()}] ${payload.title}`,
        html: `
          <div style="font-family: monospace; max-width: 600px; border-left: 4px solid ${severityColor}; padding: 20px; background: #f9f9f9;">
            <h2 style="color: ${severityColor};">${emoji} ${payload.title}</h2>
            <p>${payload.message}</p>
            ${
              payload.metadata
                ? `<pre style="background: #eee; padding: 10px; border-radius: 4px;">${JSON.stringify(payload.metadata, null, 2)}</pre>`
                : ""
            }
            <p style="color: #999; font-size: 12px;">Fired at: ${new Date().toISOString()}</p>
          </div>
        `,
      }),
    });
  } catch (err: any) {
    logger.error("Email alert failed", { error: err.message });
  }
}

// ─── Main Alert Dispatcher ────────────────────────────────────────────────────
// Fires all channels concurrently — if one fails, others still go through
export async function fireAlert(payload: AlertPayload): Promise<void> {
  logger.warn("ALERT FIRED", { title: payload.title, severity: payload.severity, ...payload.metadata });

  // Fire all channels concurrently — non-blocking
  await Promise.allSettled([
    sendTelegramAlert(payload),
    sendEmailAlert(payload),
    // Future: sendSlackAlert, sendWhatsAppAlert, sendSMSAlert
  ]);
}

// ─── Pre-built SRE Alert Templates ───────────────────────────────────────────
export const alerts = {
  paymentFailed: (bookingId: string, reason: string) =>
    fireAlert({
      title: "Payment Failed",
      message: `A payment has failed and requires investigation.`,
      severity: "warning",
      metadata: { bookingId, reason, timestamp: new Date().toISOString() },
    }),

  bookingEngineFailed: (userId: string, error: string) =>
    fireAlert({
      title: "Booking Engine Error",
      message: `Booking creation failed in a MongoDB transaction.`,
      severity: "critical",
      metadata: { userId, error },
    }),

  dlqJobDetected: (queue: string, jobId: string, error: string) =>
    fireAlert({
      title: "Dead Letter Queue — Job Exhausted Retries",
      message: `A job has failed all retry attempts and is now in the DLQ. Manual intervention required.`,
      severity: "critical",
      metadata: { queue, jobId, error },
    }),

  highMemoryUsage: (usagePercent: number) =>
    fireAlert({
      title: "High Memory Usage",
      message: `Node.js process memory usage is critically high.`,
      severity: "critical",
      metadata: { usagePercent: `${usagePercent}%`, threshold: "90%" },
    }),

  dbConnectionLost: (error: string) =>
    fireAlert({
      title: "MongoDB Connection Lost",
      message: `The application has lost its connection to MongoDB. Bookings are failing.`,
      severity: "critical",
      metadata: { error },
    }),

  redisConnectionLost: (error: string) =>
    fireAlert({
      title: "Redis Connection Lost",
      message: `Seat locking and job queues are unavailable. Race conditions are now possible.`,
      severity: "critical",
      metadata: { error },
    }),

  sslExpiryWarning: (daysRemaining: number) =>
    fireAlert({
      title: "SSL Certificate Expiring Soon",
      message: `SSL certificate will expire in ${daysRemaining} days. Renew immediately.`,
      severity: daysRemaining < 7 ? "critical" : "warning",
      metadata: { daysRemaining, domain: "suvaialaya.com" },
    }),

  duplicateQRScan: (bookingId: string, scannedBy: string) =>
    fireAlert({
      title: "Duplicate QR Scan Detected",
      message: `A ticket has been scanned twice. Possible fraud attempt.`,
      severity: "warning",
      metadata: { bookingId, scannedBy },
    }),

  backupFailed: (type: string, error: string) =>
    fireAlert({
      title: "Backup Failed",
      message: `Scheduled backup failed. Data recovery may be compromised.`,
      severity: "critical",
      metadata: { backupType: type, error },
    }),
};
