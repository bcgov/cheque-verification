import { Router, Request, Response } from "express";
import chequeRoutes from "./cheque.js";
const router = Router();

router.use("/cheque", chequeRoutes);

router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

export default router;
