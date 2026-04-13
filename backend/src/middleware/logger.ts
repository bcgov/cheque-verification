import type { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../config/logger";

/** Alphanumerics, hyphens, dots, colons, underscores; max 64 chars. */
const VALID_REQUEST_ID = /^[A-Za-z0-9._:-]{1,64}$/;

const getRequestId = (req: Request): string => {
  const candidate = req.get("x-request-id");
  return candidate && VALID_REQUEST_ID.test(candidate) ? candidate : uuidv4();
};

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

  // Sanitize inbound ID to prevent header/log injection; fall back to UUID
  const reqId = getRequestId(req);

  // Store on request for downstream use (controller/service)
  req.headers["x-request-id"] = reqId;

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
