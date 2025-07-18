import { Request, Response, NextFunction } from "express";

// Simple request logger middleware
export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};
