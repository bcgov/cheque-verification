import { ChequeVerificationService } from "../../../src/services/chequeVerificationService";
import axios from "axios";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ChequeVerificationService", () => {
  let service: ChequeVerificationService;
  const mockApiUrl = "http://localhost:3001";

  beforeEach(() => {
    service = new ChequeVerificationService(mockApiUrl);
    jest.clearAllMocks();
  });

  describe("isValidChequeNumber", () => {
    it("should return true for valid cheque numbers", () => {
      const validNumbers = ["123456", "1", "9999999999999999"]; // 1-16 digits

      validNumbers.forEach((number) => {
        expect(service.isValidChequeNumber(number)).toBe(true);
      });
    });

    it("should return false for invalid cheque numbers", () => {
      const invalidNumbers = [
        "0", // Zero
        "00000", // Multiple zeros
        "", // Empty string
        "abc", // Non-numeric
        "123abc", // Mixed characters
        "12345678901234567", // 17 digits (too long)
        "-123", // Negative
        "123.45", // Decimal
      ];

      invalidNumbers.forEach((number) => {
        expect(service.isValidChequeNumber(number)).toBe(false);
      });
    });
  });

  describe("validateVerificationFields", () => {
    it("should return valid for correct inputs", () => {
      const result = service.validateVerificationFields(
        "1000.50",
        "2024-01-01"
      );

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return error for missing appliedAmount", () => {
      const result = service.validateVerificationFields("", "2024-01-01");

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("All verification fields are required");
    });

    it("should return error for missing paymentIssueDate", () => {
      const result = service.validateVerificationFields("1000.50", "");

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("All verification fields are required");
    });

    it("should return error for invalid amount", () => {
      const invalidAmounts = ["abc", "-100", "NaN"];

      invalidAmounts.forEach((amount) => {
        const result = service.validateVerificationFields(amount, "2024-01-01");

        expect(result.isValid).toBe(false);
        expect(result.error).toContain(
          "Cheque amount must be a valid positive number"
        );
      });
    });

    it("should return error for invalid date", () => {
      const invalidDates = ["invalid-date", "2024-13-01", "abc"];

      invalidDates.forEach((date) => {
        const result = service.validateVerificationFields("1000.50", date);

        expect(result.isValid).toBe(false);
        expect(result.error).toContain(
          "Payment issue date must be a valid date"
        );
      });
    });
  });

  describe("fetchChequeData", () => {
    it("should make API call and return data", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            chequeNumber: "123456",
            payeeCode: "TEST001",
            appliedAmount: 1000.5,
            paymentIssueDate: "2024-01-01",
            status: "active",
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.fetchChequeData("123456");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${mockApiUrl}/api/v1/cheque/123456`,
        {
          timeout: 5000,
          validateStatus: expect.any(Function),
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle API errors", async () => {
      const mockError = new Error("Network error");
      mockedAxios.get.mockRejectedValue(mockError);

      await expect(service.fetchChequeData("123456")).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("verifyFields", () => {
    const mockActualData = {
      chequeStatus: "active",
      chequeNumber: 123456,
      appliedAmount: 1000.5,
      paymentIssueDate: new Date("2024-01-01T00:00:00.000Z"),
    };

    it("should return no errors for matching data", () => {
      const userInput = {
        appliedAmount: "1000.50",
        paymentIssueDate: "2024-01-01",
      };

      const errors = service.verifyFields(userInput, mockActualData);

      expect(errors).toHaveLength(0);
    });

    it("should return error for mismatched amount", () => {
      const userInput = {
        appliedAmount: "999.99",
        paymentIssueDate: "2024-01-01",
      };

      const errors = service.verifyFields(userInput, mockActualData);

      expect(errors).toContain("Cheque amount does not match");
    });

    it("should return error for mismatched date", () => {
      const userInput = {
        appliedAmount: "1000.50",
        paymentIssueDate: "2024-01-02",
      };

      const errors = service.verifyFields(userInput, mockActualData);

      expect(errors).toContain("Payment issue date does not match");
    });

    it("should return multiple errors for multiple mismatches", () => {
      const userInput = {
        appliedAmount: "999.99",
        paymentIssueDate: "2024-01-02",
      };

      const errors = service.verifyFields(userInput, mockActualData);

      expect(errors).toHaveLength(2);
      expect(errors).toContain("Cheque amount does not match");
      expect(errors).toContain("Payment issue date does not match");
    });

    it("should handle floating point precision issues", () => {
      const userInput = {
        appliedAmount: "1000.52", // Outside tolerance (0.02 difference)
        paymentIssueDate: "2024-01-01",
      };

      const errors = service.verifyFields(userInput, mockActualData);

      expect(errors).toContain("Cheque amount does not match");
    });
  });
});
