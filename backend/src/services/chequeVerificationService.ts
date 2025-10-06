import axios from "axios";
import jwt, { SignOptions, JwtPayload, Secret } from "jsonwebtoken";
import { ChequeStatusResponse, ApiResponse } from "../types";

/**
 * Service class for cheque verification operations
 * Handles all business logic related to cheque verification
 */
export class ChequeVerificationService {
  private readonly apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  /**
   * Validates cheque number format and prevents path injection
   * @param chequeNumber - The cheque number to validate
   * @returns boolean indicating if format is valid
   */
  isValidChequeNumber(chequeNumber: string): boolean {
    // Must be 1-16 digits only (prevents path traversal and injection)
    const chequeNumberPattern = /^\d{1,16}$/;
    const isValidFormat = chequeNumberPattern.test(chequeNumber);

    // Reject zero as invalid cheque number
    if (chequeNumber === "0" || Number.parseInt(chequeNumber, 10) === 0) {
      return false;
    }

    return isValidFormat;
  }

  /**
   * Validates required verification fields
   * @param appliedAmount - Applied amount
   * @param paymentIssueDate - Payment issue date
   * @returns object with isValid boolean and error message if invalid
   */
  validateVerificationFields(
    appliedAmount: string,
    paymentIssueDate: string
  ): { isValid: boolean; error?: string } {
    if (!appliedAmount || !paymentIssueDate) {
      return {
        isValid: false,
        error:
          "All verification fields are required (appliedAmount, paymentIssueDate)",
      };
    }

    const amount = Number.parseFloat(appliedAmount);
    if (Number.isNaN(amount) || amount < 0) {
      return {
        isValid: false,
        error: "Cheque amount must be a valid positive number",
      };
    }

    const date = new Date(paymentIssueDate);
    if (Number.isNaN(date.getTime())) {
      return {
        isValid: false,
        error: "Payment issue date must be a valid date",
      };
    }

    return { isValid: true };
  }

  /**
   * Fetches cheque data from the API
   * @param chequeNumber - The cheque number to fetch
   * @returns Promise with API response
   */
  async fetchChequeData(
    chequeNumber: string
  ): Promise<ApiResponse<ChequeStatusResponse>> {
    // Validate cheque number format to prevent URL injection attacks
    if (!this.isValidChequeNumber(chequeNumber)) {
      throw new Error("Invalid cheque number format");
    }

    console.log("Preparing API request", {
      chequeNumberLength: chequeNumber.length,
      hasApiUrl: !!this.apiUrl,
      apiUrl: this.apiUrl, // Safe to log URL for debugging
    });

    // Prepare optional Authorization header with JWT for internal API
    const headers: Record<string, string> = {};
    const secret: Secret | undefined = process.env.JWT_SECRET;
    if (secret) {
      console.log("JWT authentication configured");
      const issuer = process.env.JWT_ISSUER || "cheque-backend";
      const audience = process.env.JWT_AUDIENCE || "cheque-api";
      const expiresIn = process.env.JWT_TTL
        ? Number.parseInt(process.env.JWT_TTL, 10)
        : 120;

      const payload: JwtPayload = {
        sub: "cheque-backend-service",
        purpose: "cheque-api-access",
      };

      const options: SignOptions = {
        algorithm: "HS256",
        issuer,
        audience,
        expiresIn,
      };

      const token = jwt.sign(payload, secret as Secret, options);
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn("No JWT secret configured - making unauthenticated request");
    }

    // Safe: chequeNumber has been validated to contain only digits (1-16 chars)
    // This prevents path traversal and URL injection attacks
    const fullUrl = `${this.apiUrl}/api/v1/cheque/${chequeNumber}`;
    console.log("Making API request", {
      baseUrl: this.apiUrl,
      chequeNumberLength: chequeNumber.length,
      hasAuth: !!headers["Authorization"],
      timeout: 30000,
    });

    // Safe: URL is constructed from validated environment variable + validated digits-only cheque number
    const response = await axios.get<ApiResponse<ChequeStatusResponse>>(
      fullUrl,
      {
        timeout: 30000,
        validateStatus: (status: number) => status < 500,
        headers,
      }
    );

    console.log("API response received", {
      status: response.status,
      hasData: !!response.data,
      success: response.data?.success,
      dataKeys: response.data?.data ? Object.keys(response.data.data) : [],
    });

    return response.data;
  }

  /**
   * Verifies user input against actual cheque data
   * @param userInput - User provided verification data
   * @param actualData - Actual cheque data from API
   * @returns array of verification errors (empty if all match)
   */
  verifyFields(
    userInput: {
      appliedAmount: string;
      paymentIssueDate: string;
    },
    actualData: ChequeStatusResponse
  ): string[] {
    const verificationErrors: string[] = [];

    // Verify applied amount (with tolerance for floating point precision)
    const providedAmount = Number.parseFloat(userInput.appliedAmount);
    if (Math.abs(actualData.appliedAmount - providedAmount) > 0.01) {
      verificationErrors.push("Cheque amount does not match");
    }

    // Verify payment issue date
    // Handle timezone issues by comparing just the date parts (YYYY-MM-DD)
    const userInputDate = new Date(userInput.paymentIssueDate);
    const databaseDate = new Date(actualData.paymentIssueDate);

    // Extract just the date parts to avoid timezone issues
    const providedDateString = userInputDate.toISOString().split("T")[0]; // YYYY-MM-DD
    const actualDateString = databaseDate.toISOString().split("T")[0]; // YYYY-MM-DD

    if (providedDateString !== actualDateString) {
      verificationErrors.push("Payment issue date does not match");
    }

    return verificationErrors;
  }
}
