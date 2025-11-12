import { Router, Request, Response } from "express";
import { getChequeFromDatabase } from "../services/chequeService.js";
import { validateChequeNumber } from "../middleware/validation.js";
import { authenticateJWT, validateJWTClaims } from "../middleware/auth.js";
import { chequeRateLimiter } from "../middleware/rateLimiter.js";
import logger from "../config/logger.js";

const router = Router();

// Apply rate limiting to all cheque routes
router.use(chequeRateLimiter);

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
