import { Router, Request, Response } from "express";
import { getChequeFromDatabase } from "../services/chequeService";
import { validateChequeNumber } from "../middleware/validation";

const router = Router();

// Main endpoint for cheque verification
router.get(
  "/:chequeNumber",
  validateChequeNumber,
  async (req: Request, res: Response) => {
    const { chequeNumber } = req.params;

    // Express-async-errors automatically handle query database - errors
    const chequeStatus = await getChequeFromDatabase(chequeNumber); // Keep as string to avoid precision loss

    // Return successful response
    res.status(200).json({
      success: true,
      data: chequeStatus,
    });
  }
);

export default router;
