import { Request, Response } from "express";
import axios from "axios";
import { ChequeVerificationService } from "../services/chequeVerificationService";
import { logger } from "../config/logger";

/**
 * Controller for cheque verification endpoints
 * Handles HTTP request/response logic and delegates business logic to services
 */
export class ChequeController {
  private readonly chequeService: ChequeVerificationService;

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

      // Log incoming request (without sensitive data)
      console.log("Received cheque verification request", {
        hasChequeNumber: !!chequeNumber,
        chequeNumberLength: chequeNumber?.length || 0,
        hasAmount: !!appliedAmount,
        hasDate: !!paymentIssueDate,
        userAgent: req.get("User-Agent") || "unknown",
        timestamp: new Date().toISOString(),
      });

      // Validate cheque number
      if (!chequeNumber) {
        console.warn("Request missing cheque number");
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
      console.log("Calling API service for cheque data", {
        chequeNumberLength: chequeNumber.length,
      });

      const apiResponse = await this.chequeService.fetchChequeData(
        chequeNumber
      );

      console.log("API service response received", {
        success: !!apiResponse.success,
        hasData: !!apiResponse.data,
        responseKeys: apiResponse.data ? Object.keys(apiResponse.data) : [],
      });

      // Check if cheque exists
      if (!apiResponse.success || !apiResponse.data) {
        console.warn("Cheque not found in API response", {
          success: !!apiResponse.success,
          hasData: !!apiResponse.data,
        });
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
      console.error("Error during cheque verification", {
        errorType: error instanceof Error ? error.constructor.name : "Unknown",
        hasMessage: !!(error instanceof Error ? error.message : String(error)),
        isAxiosError: axios.isAxiosError(error),
        errorCode: axios.isAxiosError(error) ? error.code : undefined,
      });

      // Check for timeout errors specifically
      if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
        console.warn("API request timeout detected");
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
