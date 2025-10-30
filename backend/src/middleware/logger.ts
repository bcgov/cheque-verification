import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

/**
 * Compact request logger - single line per request
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.once("finish", () => {
    logger.info(
      {
        method: req.method,
        path: req.path,
        status: res.statusCode,
      },
      "request"
    );
  });

  next();
};
