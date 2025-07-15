import { Router, Request, Response } from "express";
import chequeRoutes from "./cheque";

const router = Router();

// Mount cheque routes
router.use("/api/v1/cheque", chequeRoutes);

// Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

export default router;
