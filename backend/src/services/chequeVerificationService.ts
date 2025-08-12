import axios from "axios";
import { ChequeStatusResponse, ApiResponse } from "../types";

/**
 * Service class for cheque verification operations
 * Handles all business logic related to cheque verification
 */
export class ChequeVerificationService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  /**
   * Validates cheque number format
   * @param chequeNumber - The cheque number to validate
   * @returns boolean indicating if format is valid
   */
  isValidChequeNumber(chequeNumber: string): boolean {
    const chequeNumberPattern = /^\d{4,12}$/;
    return chequeNumberPattern.test(chequeNumber);
  }

  /**
   * Validates required verification fields
   * @param payeeName - Payee name
   * @param appliedAmount - Applied amount
   * @param paymentIssueDate - Payment issue date
   * @returns object with isValid boolean and error message if invalid
   */
  validateVerificationFields(
    payeeName: string,
    appliedAmount: string,
    paymentIssueDate: string
  ): { isValid: boolean; error?: string } {
    if (!payeeName || !appliedAmount || !paymentIssueDate) {
      return {
        isValid: false,
        error:
          "All verification fields are required (payeeName, appliedAmount, paymentIssueDate)",
      };
    }

    const amount = parseFloat(appliedAmount);
    if (isNaN(amount) || amount < 0) {
      return {
        isValid: false,
        error: "Applied amount must be a valid positive number",
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
    console.log(`Verifying cheque data for ${chequeNumber} from API`);

    const response = await axios.get<ApiResponse<ChequeStatusResponse>>(
      `${this.apiUrl}/api/v1/cheque/${chequeNumber}`,
      {
        timeout: 5000,
        validateStatus: (status) => status < 500,
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
      payeeName: string;
      appliedAmount: string;
      paymentIssueDate: string;
    },
    actualData: ChequeStatusResponse
  ): string[] {
    const verificationErrors: string[] = [];

    // Verify payee name (case-insensitive)
    if (
      actualData.payeeName.toLowerCase() !== userInput.payeeName.toLowerCase()
    ) {
      verificationErrors.push("Payee name does not match");
    }

    // Verify applied amount (with tolerance for floating point precision)
    const providedAmount = parseFloat(userInput.appliedAmount);
    if (Math.abs(actualData.appliedAmount - providedAmount) > 0.01) {
      verificationErrors.push("Applied amount does not match");
    }

    // Verify payment issue date
    const providedDate = new Date(userInput.paymentIssueDate).toDateString();
    const actualDate = new Date(actualData.paymentIssueDate).toDateString();
    if (providedDate !== actualDate) {
      verificationErrors.push("Payment issue date does not match");
    }

    return verificationErrors;
  }
}
