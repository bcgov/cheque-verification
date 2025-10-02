import pino, { Logger } from "pino";

/**
 * Simple Pino logger configuration for debugging
 */
export const logger: Logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: {
    service: "cheque-verification-api",
  },
});

export default logger;
