import { Router } from "express";
import { ChequeController } from "../controllers/chequeController";
import { chequeVerifyLimiter } from "../middleware/rateLimiter";
import { chequeVerifySlowDown } from "../middleware/slowDown";

/**
 * Creates and configures cheque verification routes
 * @param chequeController - The cheque controller instance
 * @returns Configured Express router
 */
export const createChequeRoutes = (
  chequeController: ChequeController
): Router => {
  const router = Router();

  // Enhanced cheque verification endpoint with slow-down and rate limiting
  router.post(
    "/verify",
    chequeVerifySlowDown,
    chequeVerifyLimiter,
    (req, res) => chequeController.verifyCheque(req, res)
  );

  return router;
};

/**
 * Creates and configures health check routes
 * @param chequeController - The cheque controller instance
 * @returns Configured Express router
 */
export const createHealthRoutes = (
  chequeController: ChequeController
): Router => {
  const router = Router();

  // Health check endpoint - no rate limiting (internal cluster traffic only)
  router.get("/", (req, res) => chequeController.healthCheck(req, res));

  return router;
};
