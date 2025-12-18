import { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import logger from "../config/logger.js";

/**
 * Rate limiter for cheque verification endpoints
 */
export const chequeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50, // 50 requests per 15 minutes per pod
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
      retryAfter: 900, // 15 minutes in seconds
    });
  },
});
