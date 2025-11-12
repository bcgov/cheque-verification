import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { getChequeFromDatabase } from "../services/chequeService.js";
import { validateChequeNumber } from "../middleware/validation.js";
import { authenticateJWT, validateJWTClaims } from "../middleware/auth.js";
import logger from "../config/logger.js";

const router = Router();

// Rate limiting for cheque API endpoints
// Allow configurable requests per configurable window (default: 10 requests per 15 minutes)
// This accommodates the ~600 requests/day total with reasonable per-IP limits
const windowMinutes = Number.parseInt(
  process.env.RATE_LIMIT_WINDOW_MINUTES || "15"
);
const maxRequests = Number.parseInt(
  process.env.RATE_LIMIT_MAX_REQUESTS || "10"
);

const chequeRateLimit = rateLimit({
  windowMs: windowMinutes * 60 * 1000, // Convert minutes to milliseconds
  max: maxRequests, // Limit each IP to max requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: `${windowMinutes} minutes`,
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all cheque routes
router.use(chequeRateLimit);

// Apply JWT authentication to all cheque routes
router.use(authenticateJWT);

// Optional: Validate specific JWT claims for extra security
router.use(
  validateJWTClaims({
    purpose: "cheque-api-access",
    sub: "cheque-backend-service",
  })
);

// Main endpoint for cheque verification
router.get(
  "/:chequeNumber",
  validateChequeNumber,
  async (req: Request, res: Response) => {
    const { chequeNumber } = req.params;

    logger.info(
      {
        chequeNumberLength: chequeNumber?.length || 0,
        hasUserAgent: !!req.get("User-Agent"),
      },
      "Received cheque verification request"
    );

    // Express-async-errors automatically catches and handles any errors
    const chequeStatus = await getChequeFromDatabase(chequeNumber);

    res.status(200).json({
      success: true,
      data: chequeStatus,
    });
  }
);

export default router;
