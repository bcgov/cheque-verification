import { Request, Response } from "express";
import axios from "axios";
import { ChequeVerificationService } from "../services/chequeVerificationService";

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

      // Log incoming request
      this.logIncomingRequest(req, {
        chequeNumber,
        appliedAmount,
        paymentIssueDate,
      });

      // Validate inputs
      const validationError = this.validateInputs(
        chequeNumber,
        appliedAmount,
        paymentIssueDate
      );
      if (validationError) {
        res.status(400).json(validationError);
        return;
      }

      // Fetch and verify cheque data
      const result = await this.processApiRequest(
        chequeNumber,
        appliedAmount,
        paymentIssueDate
      );
      res.status(result.status).json(result.body);
    } catch (error: unknown) {
      this.handleError(error, res);
    }
  }

  /**
   * Logs incoming request details securely
   */
  private logIncomingRequest(
    req: Request,
    data: { chequeNumber: any; appliedAmount: any; paymentIssueDate: any }
  ): void {
    console.log("Received cheque verification request", {
      hasChequeNumber: !!data.chequeNumber,
      chequeNumberLength: data.chequeNumber?.length || 0,
      hasAmount: !!data.appliedAmount,
      hasDate: !!data.paymentIssueDate,
      userAgent: req.get("User-Agent") || "unknown",
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Validates all input parameters
   */
  private validateInputs(
    chequeNumber: any,
    appliedAmount: any,
    paymentIssueDate: any
  ): { success: boolean; error: string } | null {
    if (!chequeNumber) {
      console.warn("Request missing cheque number");
      return { success: false, error: "Cheque number is required" };
    }

    if (!this.chequeService.isValidChequeNumber(chequeNumber)) {
      return { success: false, error: "Invalid cheque number format." };
    }

    const validation = this.chequeService.validateVerificationFields(
      appliedAmount,
      paymentIssueDate
    );
    if (!validation.isValid) {
      return { success: false, error: validation.error || "Validation failed" };
    }

    return null;
  }

  /**
   * Processes the API request and verification
   */
  private async processApiRequest(
    chequeNumber: string,
    appliedAmount: any,
    paymentIssueDate: any
  ): Promise<{ status: number; body: any }> {
    console.log("Calling API service for cheque data", {
      chequeNumberLength: chequeNumber.length,
    });

    const apiResponse = await this.chequeService.fetchChequeData(chequeNumber);

    console.log("API service response received", {
      success: !!apiResponse.success,
      hasData: !!apiResponse.data,
      responseKeys: apiResponse.data ? Object.keys(apiResponse.data) : [],
    });

    if (!apiResponse.success || !apiResponse.data) {
      console.warn("Cheque not found in API response", {
        success: !!apiResponse.success,
        hasData: !!apiResponse.data,
      });
      return {
        status: 404,
        body: { success: false, error: "Cheque not found" },
      };
    }

    return this.verifyUserData(
      apiResponse.data,
      appliedAmount,
      paymentIssueDate
    );
  }

  /**
   * Verifies user input against API data
   */
  private verifyUserData(
    chequeData: any,
    appliedAmount: any,
    paymentIssueDate: any
  ): { status: number; body: any } {
    const verificationErrors = this.chequeService.verifyFields(
      { appliedAmount, paymentIssueDate },
      chequeData
    );

    if (verificationErrors.length > 0) {
      return {
        status: 400,
        body: {
          success: false,
          error: "Verification failed",
          details: verificationErrors,
        },
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        data: chequeData,
        message: "Cheque verification successful",
      },
    };
  }

  /**
   * Handles errors and sends appropriate responses
   */
  private handleError(error: unknown, res: Response): void {
    console.error("Error during cheque verification", {
      errorType: error instanceof Error ? error.constructor.name : "Unknown",
      hasMessage: !!(error instanceof Error ? error.message : String(error)),
      isAxiosError: axios.isAxiosError(error),
      errorCode: axios.isAxiosError(error) ? error.code : undefined,
    });

    if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
      console.warn("API request timeout detected");
      res.status(504).json({
        success: false,
        error: "API request timed out",
      });
      return;
    }

    if (axios.isAxiosError(error) && error.response) {
      res.status(error.response.status).json(error.response.data);
      return;
    }

    res.status(500).json({
      success: false,
      error: "Error communicating with API service",
    });
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
