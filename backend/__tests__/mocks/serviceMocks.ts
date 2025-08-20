/**
 * Mock implementations for backend services used in testing
 */

import { ChequeVerificationService } from "../../src/services/chequeVerificationService";
import { createMockAxiosResponse } from "../helpers/backendTestHelpers";
import { AxiosResponse } from "axios";
import { ApiResponse, ChequeStatusResponse } from "../../src/types";

// Use global jest - available in test environment
import { jest } from "@jest/globals";

// Constants for consistent validation and comparison
const CHEQUE_NUMBER_PATTERN = /^\d{1,16}$/; // Match actual service validation
const AMOUNT_EPSILON = 0.01; // Consistent epsilon for floating point comparisons
const MOCK_KEY_DELIMITER = "::"; // Avoid potential collisions with single colon

/**
 * Utility to normalize dates to UTC date components for comparison
 * Handles invalid inputs explicitly to avoid silent "NaN-NaN-NaN" results
 */
function normalizeToUTCDate(dateInput: string | Date): string {
  const date = new Date(dateInput);

  // Explicitly handle invalid dates
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date input: ${dateInput}`);
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Centralized composite key helper to avoid typos and ensure consistency
 */
function createMockKey(payeeCode: string, chequeNumber: string): string {
  return `${payeeCode}${MOCK_KEY_DELIMITER}${chequeNumber}`;
}

/**
 * Mock ChequeVerificationService for testing
 */
export class MockChequeVerificationService {
  private mockData: Map<string, any> = new Map();

  constructor() {
    this.setupDefaultMocks();
  }

  /**
   * Setup default mock responses
   */
  private setupDefaultMocks() {
    // Valid test cases - using consistent "appliedAmount" field name
    this.mockData.set(createMockKey("TEST001", "123456"), {
      isValid: true,
      chequeNumber: "123456",
      payeeCode: "TEST001",
      appliedAmount: 1000.0, // Consistent field name
      status: "active",
    });

    this.mockData.set(createMockKey("TEST002", "789012"), {
      isValid: true,
      chequeNumber: "789012",
      payeeCode: "TEST002",
      appliedAmount: 500.0, // Consistent field name
      status: "active",
    });

    // Invalid test cases
    this.mockData.set(createMockKey("INVALID", "000000"), {
      isValid: false,
      chequeNumber: "000000",
      payeeCode: "INVALID",
      error: "Cheque not found",
    });
  }

  /**
   * Mock verify cheque method
   */
  async verifyCheque(payeeCode: string, chequeNumber: string): Promise<any> {
    const key = createMockKey(payeeCode, chequeNumber);
    const result = this.mockData.get(key);

    if (result) {
      return result;
    }

    // Default response for unmocked requests
    return {
      isValid: false,
      chequeNumber,
      payeeCode,
      error: "Cheque not found in test data",
    };
  }

  /**
   * Add custom mock data
   */
  addMockData(payeeCode: string, chequeNumber: string, response: any) {
    const key = createMockKey(payeeCode, chequeNumber);
    this.mockData.set(key, response);
  }

  /**
   * Clear all mock data
   */
  clearMockData() {
    this.mockData.clear();
    this.setupDefaultMocks();
  }
}

/**
 * Create a strongly typed jest mock for ChequeVerificationService
 * Returns jest.Mocked<ChequeVerificationService> for type safety at call sites
 */
export const createMockChequeVerificationService = () => {
  // Create fetchChequeData mock separately to avoid TypeScript issue
  const fetchChequeDataMock = jest.fn();
  (fetchChequeDataMock as any).mockResolvedValue({
    success: true,
    data: {
      chequeNumber: "123456",
      payeeCode: "TEST001",
      appliedAmount: 1000.0, // Consistent field name
      paymentIssueDate: "2024-01-01",
      status: "active",
    },
  });

  return {
    isValidChequeNumber: jest
      .fn()
      .mockImplementation((chequeNumber: unknown): boolean => {
        // Jest requires 'unknown' but we know it should be a string
        const chequeNumberStr = String(chequeNumber);
        // Match actual service validation: 1-16 digits, but reject zero values
        const isValidFormat = CHEQUE_NUMBER_PATTERN.test(chequeNumberStr);

        // Reject "0" or numerical zero values (avoiding parseInt for consistency)
        if (chequeNumberStr === "0" || /^0+$/.test(chequeNumberStr)) {
          return false;
        }

        return isValidFormat;
      }),

    validateVerificationFields: jest
      .fn()
      .mockImplementation(
        (appliedAmount: unknown, paymentIssueDate: unknown) => {
          // Jest requires 'unknown' but we expect strings
          const appliedAmountStr = String(appliedAmount || "");
          const paymentIssueDateStr = String(paymentIssueDate || "");

          if (!appliedAmountStr || !paymentIssueDateStr) {
            return {
              isValid: false,
              error:
                "All verification fields are required (appliedAmount, paymentIssueDate)",
            };
          }

          const amount = parseFloat(appliedAmountStr);
          if (isNaN(amount) || amount < 0) {
            return {
              isValid: false,
              error: "Cheque amount must be a valid positive number",
            };
          }

          const date = new Date(paymentIssueDateStr);
          if (isNaN(date.getTime())) {
            return {
              isValid: false,
              error: "Payment issue date must be a valid date",
            };
          }

          return { isValid: true };
        }
      ),

    fetchChequeData: fetchChequeDataMock,

    verifyFields: jest
      .fn()
      .mockImplementation((userInput: any, actualData: any) => {
        const errors: string[] = [];

        // Guard against NaN in amount comparison
        const providedAmount = parseFloat(userInput.appliedAmount);
        const actualAmount = parseFloat(actualData.appliedAmount);

        if (isNaN(providedAmount) || isNaN(actualAmount)) {
          errors.push("Invalid amount format");
        } else if (Math.abs(actualAmount - providedAmount) > AMOUNT_EPSILON) {
          errors.push("Cheque amount does not match");
        }

        // Use UTC date normalization with explicit error handling
        try {
          const providedDateString = normalizeToUTCDate(
            userInput.paymentIssueDate
          );
          const actualDateString = normalizeToUTCDate(
            actualData.paymentIssueDate
          );

          if (providedDateString !== actualDateString) {
            errors.push("Payment issue date does not match");
          }
        } catch (error) {
          errors.push("Invalid date format");
        }

        return errors;
      }) as any,
  };
};

/**
 * Mock HTTP client responses for external API calls with proper AxiosResponse shape
 */
export const mockHttpResponses = {
  // Successful verification response - using consistent "appliedAmount" field
  validCheque: createMockAxiosResponse(
    200,
    {
      isValid: true,
      chequeNumber: "123456",
      payeeCode: "TEST001",
      appliedAmount: 1000.0, // Consistent field name
      status: "active",
    },
    {
      method: "get",
      url: "/api/cheque/verify",
    }
  ),

  // Invalid cheque response
  invalidCheque: createMockAxiosResponse(
    404,
    {
      isValid: false,
      error: "Cheque not found",
    },
    {
      method: "get",
      url: "/api/cheque/verify",
    }
  ),

  // Server error response
  serverError: createMockAxiosResponse(
    500,
    {
      error: "Internal server error",
    },
    {
      method: "get",
      url: "/api/cheque/verify",
    }
  ),

  // Network error simulation with Axios-like properties for axios.get().catch(e => ...)
  networkError: Object.assign(new Error("Network Error"), {
    isAxiosError: true,
    code: "ENOTFOUND",
    config: {
      method: "get",
      url: "/api/cheque/verify",
      headers: {},
    },
    request: {}, // Mock request object
    // No response property for network errors
  }),
} as const;

/**
 * Mock configuration for testing
 */
export const mockConfig = {
  apiUrl: "http://localhost:3001/api",
  port: 3002,
  corsOrigin: "http://localhost:5173",
  rateLimitWindowMs: 15 * 60 * 1000,
  rateLimitMax: 100,
};
