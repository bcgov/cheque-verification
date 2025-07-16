import { Router, Request, Response } from "express";
import { getChequeFromDatabase } from "../services/chequeService";
import { validateChequeNumber } from "../middleware/validation";

const router = Router();

// Main endpoint for cheque verification
router.get(
  "/:chequeNumber",
  validateChequeNumber,
  async (req: Request, res: Response) => {
    try {
      const { chequeNumber } = req.params;

      // Query database (input is already validated and sanitized)
      const response = await getChequeFromDatabase(chequeNumber);

      // Return appropriate response
      if (!response.success) {
        return res.status(404).json(response);
      }

      return res.status(200).json(response);
    } catch (error) {
      // Error details removed - will implement proper logging in next PR
      return res
        .status(500)
        .json({ success: false, error: "Internal server error" });
    }
  }
);

export default router;
