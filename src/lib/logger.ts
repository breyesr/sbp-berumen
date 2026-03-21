import pino from "pino";

/**
 * Optimized JSON logger for Vercel and Edge environments.
 * Outputs structured logs that are searchable in the Vercel Log dashboard.
 */

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  // Vercel logs are already timestamped by the platform, 
  // but keeping internal ISO timestamps helps when exporting logs.
  timestamp: pino.stdTimeFunctions.isoTime,
  // Reduce noise in development, keep structured JSON in production
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
        },
      },
  // Ensure we don't accidentally log sensitive credentials
  redact: {
    paths: [
      "password",
      "*.password",
      "currentPassword",
      "newPassword",
      "secret",
      "token",
      "apiKey",
      "OPENAI_API_KEY",
      "AUTH_SECRET",
      "UPSTASH_REDIS_REST_TOKEN"
    ],
    censor: "[REDACTED]",
  },
});

/**
 * Usage Examples:
 * logger.info({ userId: '123' }, 'User logged in');
 * logger.error({ err, path: '/api/auth' }, 'Auth failed');
 */
