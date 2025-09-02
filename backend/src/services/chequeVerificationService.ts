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
   * Validates cheque number format
   * @param chequeNumber - The cheque number to validate
   * @returns boolean indicating if format is valid
   */
  isValidChequeNumber(chequeNumber: string): boolean {
    // Updated to match API validation: 1-16 digits, no leading zeros except for "0"
    const chequeNumberPattern = /^\d{1,16}$/;
    const isValidFormat = chequeNumberPattern.test(chequeNumber);

    // Reject zero as invalid cheque number
    if (chequeNumber === "0" || parseInt(chequeNumber, 10) === 0) {
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

    const amount = parseFloat(appliedAmount);
    if (isNaN(amount) || amount < 0) {
      return {
        isValid: false,
        error: "Cheque amount must be a valid positive number",
      };
    }

    const date = new Date(paymentIssueDate);
    if (isNaN(date.getTime())) {
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
    // Prepare optional Authorization header with JWT for internal API
    const headers: Record<string, string> = {};
    const secret: Secret | undefined = process.env.JWT_SECRET;
    if (secret) {
      const issuer = process.env.JWT_ISSUER || "cheque-backend";
      const audience = process.env.JWT_AUDIENCE || "cheque-api";
      const expiresIn = process.env.JWT_TTL
        ? parseInt(process.env.JWT_TTL, 10)
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
    }

    const response = await axios.get<ApiResponse<ChequeStatusResponse>>(
      `${this.apiUrl}/api/v1/cheque/${chequeNumber}`,
      {
        timeout: 5000,
        validateStatus: (status: number) => status < 500,
        headers,
      }
    );

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
    const providedAmount = parseFloat(userInput.appliedAmount);
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
