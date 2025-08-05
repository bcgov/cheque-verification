import { Request, Response, NextFunction } from "express";

/**
 * Security headers middleware
 * Adds basic security headers to prevent common attacks
 */
export const securityHeaders = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Helps prevent clickjacking attacks
  res.setHeader("X-Frame-Options", "DENY");
  // Helps prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Enables XSS protection in browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
};
