import { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { logger } from "../config/logger";

export const globalRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // 20 requests per 15 minutes per pod
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response): void => {
    logger.warn(
      {
        ip: req.ip,
        path: req.path,
        userAgent: req.get("User-Agent"),
      },
      "Global rate limit exceeded"
    );
    res.status(429).json({
      success: false,
      error: "Too many requests. Please try again later.",
      retryAfter: 900, // 15 minutes in seconds
    });
  },
});

/**
 * Rate limiter for cheque verification endpoints
 */
export const chequeVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // 20 requests per 15 minutes per pod
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Custom handler for rate limit exceeded
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
      "Cheque verification rate limit exceeded"
    );
    res.status(429).json({
      success: false,
      error: "Too many requests. Please try again later.",
      retryAfter: 900, // 15 minutes in seconds
    });
  },
});

/**
 * Rate limiter for health checks
 */
export const healthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 10, // 10 requests per minute per pod (reduced from 60)
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
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
      error: "Too many requests. Please try again later.",
      retryAfter: 60, // 1 minute in seconds
    });
  },
});
