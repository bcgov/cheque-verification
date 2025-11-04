import { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { logger } from "../config/logger.js";

// General rate limiter for all requests
export const globalRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // 100 requests per 15 minutes
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for API endpoints
export const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 20, // 20 requests per 5 minutes
  message: {
    success: false,
    error: "Too many API requests. Please wait before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Custom handler for rate limit exceeded
  handler: (req: Request, res: Response): void => {
    logger.warn({ ip: req.ip, path: req.path }, "Rate limit exceeded");
    res.status(429).json({
      success: false,
      error: "Too many API requests. Please wait before trying again.",
      retryAfter: 300, // 5 minutes in seconds
    });
  },
});

// Lenient rate limiter for health checks
export const healthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 60, // 60 requests per minute
  message: {
    success: false,
    error: "Too many health check requests.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
