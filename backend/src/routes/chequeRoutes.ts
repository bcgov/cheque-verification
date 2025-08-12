import { Router } from "express";
import { ChequeController } from "../controllers/chequeController";
import { apiLimiter, healthLimiter } from "../middleware/rateLimiter";

/**
 * Creates and configures cheque verification routes
 * @param chequeController - The cheque controller instance
 * @returns Configured Express router
 */
export const createChequeRoutes = (
  chequeController: ChequeController
): Router => {
  const router = Router();

  // Enhanced cheque verification endpoint
  router.post("/verify", apiLimiter, (req, res) =>
    chequeController.verifyCheque(req, res)
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

  // Health check endpoint
  router.get("/", healthLimiter, (req, res) =>
    chequeController.healthCheck(req, res)
  );

  return router;
};
