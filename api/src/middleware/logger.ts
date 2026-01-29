import type { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../config/logger.js";

/**
 * HTTP request logging middleware
 *
 * Note: This file is intentionally duplicated in both api/ and backend/ services
 * to maintain service independence and separate deployment capabilities.
 */

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Skip health check endpoints
  if (req.url === "/api/v1/health" || req.path === "/api/v1/health") {
    return next();
  }

  // Generate or use existing request ID
  const existingId = req.headers["x-request-id"] || req.headers["X-Request-ID"];
  const reqId = Array.isArray(existingId)
    ? existingId[0]
    : existingId || uuidv4();

  // Log when response finishes
  res.on("finish", () => {
    logger.info({
      reqId,
      method: req.method,
      status: res.statusCode,
      ip: req.ip,
    });
  });

  next();
};
