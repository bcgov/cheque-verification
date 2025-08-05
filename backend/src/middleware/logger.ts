import { Request, Response, NextFunction } from "express";

/**
 * Simple request logger middleware
 * Logs incoming requests with timestamp, method, and path
 */
export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};
