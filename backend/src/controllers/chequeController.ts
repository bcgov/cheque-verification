import { Request, Response } from "express";
import axios from "axios";
import { ChequeVerificationService } from "../services/chequeVerificationService";

/**
 * Controller for cheque verification endpoints
 * Handles HTTP request/response logic and delegates business logic to services
 */
export class ChequeController {
  private chequeService: ChequeVerificationService;

  constructor(chequeService: ChequeVerificationService) {
    this.chequeService = chequeService;
  }

  /**
   * Handles cheque verification requests
   * @param req - Express request object
   * @param res - Express response object
   */
  async verifyCheque(req: Request, res: Response): Promise<void> {
    try {
      const { chequeNumber, appliedAmount, paymentIssueDate } = req.body;

      // Validate cheque number
      if (!chequeNumber) {
        res
          .status(400)
          .json({ success: false, error: "Cheque number is required" });
        return;
      }

      if (!this.chequeService.isValidChequeNumber(chequeNumber)) {
        res.status(400).json({
          success: false,
          error: "Invalid cheque number format.",
        });
        return;
      }

      // Validate verification fields
      const validation = this.chequeService.validateVerificationFields(
        appliedAmount,
        paymentIssueDate
      );
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: validation.error,
        });
        return;
      }

      // Fetch cheque data from API
      const apiResponse = await this.chequeService.fetchChequeData(
        chequeNumber
      );

      // Check if cheque exists
      if (!apiResponse.success || !apiResponse.data) {
        res.status(404).json({
          success: false,
          error: "Cheque not found",
        });
        return;
      }

      // Verify user input against actual data
      const verificationErrors = this.chequeService.verifyFields(
        { appliedAmount, paymentIssueDate },
        apiResponse.data
      );

      // Return verification result
      if (verificationErrors.length > 0) {
        res.status(400).json({
          success: false,
          error: "Verification failed",
          details: verificationErrors,
        });
        return;
      }

      // All fields match - return success
      res.status(200).json({
        success: true,
        data: apiResponse.data,
        message: "Cheque verification successful",
      });
    } catch (error: unknown) {
      console.error("Error during cheque verification:", error);

      // Check for timeout errors specifically
      if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
        res.status(504).json({
          success: false,
          error: "API request timed out",
        });
        return;
      }

      // If it's an error from the API, forward the response
      if (axios.isAxiosError(error) && error.response) {
        res.status(error.response.status).json(error.response.data);
        return;
      }

      // Otherwise, return a generic error
      res.status(500).json({
        success: false,
        error: "Error communicating with API service",
      });
    }
  }

  /**
   * Health check endpoint handler
   * @param _req - Express request object (unused)
   * @param res - Express response object
   */
  async healthCheck(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
    });
  }
}
