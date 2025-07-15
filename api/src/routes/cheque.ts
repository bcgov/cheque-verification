import { Router, Request, Response } from "express";
import { getChequeFromDatabase } from "../services/chequeService";

const router = Router();

// Main endpoint for cheque verification
router.get("/:chequeNumber", async (req: Request, res: Response) => {
  try {
    const { chequeNumber } = req.params;

    // Validate input
    if (!chequeNumber) {
      return res
        .status(400)
        .json({ success: false, error: "Cheque number is required" });
    }

    // Query database
    console.log("Querying database for cheque", chequeNumber);
    const response = await getChequeFromDatabase(chequeNumber);

    // Return appropriate response
    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
});

export default router;
