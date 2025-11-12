import { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import logger from "../config/logger.js";

/**
 * Rate limiter for cheque verification endpoints
 */
export const chequeRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 5, // 5 requests per 5 minutes per pod
  message: {
    success: false,
    error:
      "Too many cheque verification requests. Please wait before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response): void => {
    logger.warn(
      {
        ip: req.ip,
        path: req.path,
        userAgent: req.get("User-Agent"),
        headers: {
          "x-forwarded-for": req.get("X-Forwarded-For"),
          "x-real-ip": req.get("X-Real-IP"),
        },
      },
      "Cheque API rate limit exceeded"
    );
    res.status(429).json({
      success: false,
      error:
        "Too many cheque verification requests. Please wait before trying again.",
      retryAfter: 300, // 5 minutes in seconds
    });
  },
});

/**
 * Rate limiter for health check endpoint
 */
export const healthRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 10, // 10 requests per minute per pod
  message: {
    success: false,
    error: "Too many health check requests.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response): void => {
    logger.warn(
      {
        ip: req.ip,
        path: req.path,
      },
      "Health check rate limit exceeded"
    );
    res.status(429).json({
      success: false,
      error: "Too many health check requests.",
      retryAfter: 60, // 1 minute in seconds
    });
  },
});
