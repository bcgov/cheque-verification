import type { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../config/logger";

/**
 * HTTP request logging middleware
 *
 * Reads X-Request-ID injected by Kong's correlation-id plugin.
 * Falls back to generating a UUID for local development without Kong.
 * Propagates the ID as a response header for end-to-end traceability.
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Skip health check endpoints
  if (req.url === "/health" || req.url.startsWith("/health")) {
    return next();
  }

  // Use Kong-injected X-Request-ID or generate a fallback for local dev
  const existingId = req.headers["x-request-id"];
  const reqId = Array.isArray(existingId)
    ? existingId[0]
    : existingId || uuidv4();

  // Propagate request ID to response for end-to-end traceability
  res.setHeader("X-Request-ID", reqId);

  // Log when response finishes
  res.on("finish", () => {
    logger.info({
      reqId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ip: req.ip,
    });
  });

  next();
};
