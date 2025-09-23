import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Request interface to include JWT payload
declare global {
  namespace Express {
    interface Request {
      jwtPayload?: jwt.JwtPayload;
    }
  }
}

/**
 * JWT authentication middleware for internal API
 * Bypasses verification when AUTH is disabled (e.g., tests/local dev)
 */
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authDisabled = process.env.AUTH_DISABLED === "true";
  const secret = process.env.JWT_SECRET;

  // Allow health checks without auth and allow bypass when disabled
  if (authDisabled || req.path.includes("/health")) {
    return next();
  }

  if (!secret) {
    return res.status(500).json({
      success: false,
      error: "Server authentication is not configured",
    });
  }

  const authHeader = req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authorization header with Bearer token required",
    });
  }

  const token = authHeader.substring(7);
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Token is required",
    });
  }

  try {
    const issuer = process.env.JWT_ISSUER || undefined;
    const audience = process.env.JWT_AUDIENCE || undefined;
    const clockTolerance = process.env.JWT_CLOCK_TOLERANCE
      ? Number.parseInt(process.env.JWT_CLOCK_TOLERANCE, 10)
      : 10; // Default 10 seconds tolerance

    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
      issuer,
      audience,
      clockTolerance,
    }) as jwt.JwtPayload;

    // Attach payload to request for potential downstream use
    req.jwtPayload = payload;

    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: "Token has expired",
      });
    }

    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: "Invalid token format",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Token verification failed",
    });
  }
};

/**
 * Optional middleware to validate specific JWT claims
 */
export const validateJWTClaims = (requiredClaims: Record<string, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.jwtPayload) {
      return res.status(401).json({
        success: false,
        error:
          "JWT payload not found. Ensure authenticateJWT middleware runs first.",
      });
    }

    for (const [key, expectedValue] of Object.entries(requiredClaims)) {
      if (req.jwtPayload[key] !== expectedValue) {
        return res.status(403).json({
          success: false,
          error: "Invalid JWT claims",
        });
      }
    }

    next();
  };
};
