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

    // Verify payee name (case-insensitive with multiple format handling)
    let payeeNameMatches = false;
    const dbName = actualData.payeeName.toLowerCase().trim();
    const userName = userInput.payeeName.toLowerCase().trim();

    // Method 1: Exact match
    if (dbName === userName) {
      payeeNameMatches = true;
    } else {
      // Method 2: Check if database format is "Last, First" and user entered "First Last"
      if (dbName.includes(",")) {
        const [lastName, firstName] = dbName
          .split(",")
          .map((part) => part.trim());
        const reconstructed = `${firstName} ${lastName}`;

        if (reconstructed === userName) {
          payeeNameMatches = true;
        }
      }

      // Method 3: Check if user entered "Last, First" and database has "First Last"
      if (!payeeNameMatches && userName.includes(",")) {
        const [lastName, firstName] = userName
          .split(",")
          .map((part) => part.trim());
        const reconstructed = `${firstName} ${lastName}`;

        if (reconstructed === dbName) {
          payeeNameMatches = true;
        }
      }

      // Method 4: Try reversing the database name if it doesn't have comma
      if (!payeeNameMatches && !dbName.includes(",") && dbName.includes(" ")) {
        const nameParts = dbName.split(" ");
        if (nameParts.length === 2) {
          const reversed = `${nameParts[1]} ${nameParts[0]}`;

          if (reversed === userName) {
            payeeNameMatches = true;
          }
        }
      }
    }

    if (!payeeNameMatches) {
      verificationErrors.push("Payee name does not match");
    }

    // Verify applied amount (with tolerance for floating point precision)
    const providedAmount = parseFloat(userInput.appliedAmount);
    if (Math.abs(actualData.appliedAmount - providedAmount) > 0.01) {
      verificationErrors.push("Applied amount does not match");
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
