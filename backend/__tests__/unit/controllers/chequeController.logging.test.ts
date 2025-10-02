import { Request, Response } from "express";
import { ChequeController } from "../../../src/controllers/chequeController";
import { ChequeVerificationService } from "../../../src/services/chequeVerificationService";

// Mock the service
jest.mock("../../../src/services/chequeVerificationService");
const MockedService = ChequeVerificationService as jest.MockedClass<
  typeof ChequeVerificationService
>;

describe("ChequeController - Logging Coverage", () => {
  let controller: ChequeController;
  let mockService: jest.Mocked<ChequeVerificationService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // Create mocked service
    mockService = new MockedService("http://test-api") as jest.Mocked<ChequeVerificationService>;
    controller = new ChequeController(mockService);

    // Setup request/response mocks
    mockRequest = {
      body: {},
      get: jest.fn(),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Setup console spy
    consoleSpy = jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "warn").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("verifyCheque - Request Logging", () => {
    it("should log incoming request details securely", async () => {
      mockRequest.body = {
        chequeNumber: "123456",
        appliedAmount: "100.00",
        paymentIssueDate: "2024-01-01",
      };
      mockRequest.get = jest.fn().mockReturnValue("test-user-agent");

      // Mock service to return valid cheque number
      mockService.isValidChequeNumber.mockReturnValue(true);
      mockService.validateVerificationFields.mockReturnValue({ isValid: true });
      mockService.fetchChequeData.mockResolvedValue({
        success: true,
        data: {
          chequeStatus: "VALID",
          chequeNumber: 123456,
          paymentIssueDate: new Date("2024-01-01"),
          appliedAmount: 100.0,
        },
      });
      mockService.verifyFields.mockReturnValue([]);

      await controller.verifyCheque(mockRequest as Request, mockResponse as Response);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Received cheque verification request",
        {
          hasChequeNumber: true,
          chequeNumberLength: 6,
          hasAmount: true,
          hasDate: true,
          userAgent: "test-user-agent",
          timestamp: expect.any(String),
        }
      );
    });

    it("should handle missing user agent in logging", async () => {
      mockRequest.body = { chequeNumber: "123456" };
      mockRequest.get = jest.fn().mockReturnValue(undefined);

      // Mock service to return valid but incomplete data
      mockService.isValidChequeNumber.mockReturnValue(true);
      mockService.validateVerificationFields.mockReturnValue({
        isValid: false,
        error: "Missing fields",
      });

      await controller.verifyCheque(mockRequest as Request, mockResponse as Response);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Received cheque verification request",
        {
          hasChequeNumber: true,
          chequeNumberLength: 6,
          hasAmount: false,
          hasDate: false,
          userAgent: "unknown",
          timestamp: expect.any(String),
        }
      );
    });

    it("should log warning when cheque number is missing", async () => {
      const warnSpy = jest.spyOn(console, "warn");
      mockRequest.body = {};

      await controller.verifyCheque(mockRequest as Request, mockResponse as Response);

      expect(warnSpy).toHaveBeenCalledWith("Request missing cheque number");
    });
  });

  describe("verifyCheque - API Response Logging", () => {
    beforeEach(() => {
      mockRequest.body = {
        chequeNumber: "123456",
        appliedAmount: "100.00",
        paymentIssueDate: "2024-01-01",
      };
      mockService.isValidChequeNumber.mockReturnValue(true);
      mockService.validateVerificationFields.mockReturnValue({ isValid: true });
    });

    it("should log API service call details", async () => {
      mockService.fetchChequeData.mockResolvedValue({
        success: true,
        data: {
          chequeStatus: "VALID",
          chequeNumber: 123456,
          paymentIssueDate: new Date(),
          appliedAmount: 100.0,
        },
      });
      mockService.verifyFields.mockReturnValue([]);

      await controller.verifyCheque(mockRequest as Request, mockResponse as Response);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Calling API service for cheque data",
        {
          chequeNumberLength: 6,
        }
      );
    });

    it("should log successful API response", async () => {
      const mockData = {
        chequeStatus: "VALID",
        chequeNumber: 123456,
        paymentIssueDate: new Date(),
        appliedAmount: 100.0,
      };

      mockService.fetchChequeData.mockResolvedValue({
        success: true,
        data: mockData,
      });
      mockService.verifyFields.mockReturnValue([]);

      await controller.verifyCheque(mockRequest as Request, mockResponse as Response);

      expect(consoleSpy).toHaveBeenCalledWith(
        "API service response received",
        {
          success: true,
          hasData: true,
          responseKeys: ["chequeStatus", "chequeNumber", "paymentIssueDate", "appliedAmount"],
        }
      );
    });

    it("should log when cheque not found in API response", async () => {
      const warnSpy = jest.spyOn(console, "warn");
      
      mockService.fetchChequeData.mockResolvedValue({
        success: false,
        data: undefined,
      });

      await controller.verifyCheque(mockRequest as Request, mockResponse as Response);

      expect(warnSpy).toHaveBeenCalledWith(
        "Cheque not found in API response",
        {
          success: false,
          hasData: false,
        }
      );
    });
  });

  describe("verifyCheque - Error Logging", () => {
    beforeEach(() => {
      mockRequest.body = {
        chequeNumber: "123456",
        appliedAmount: "100.00",
        paymentIssueDate: "2024-01-01",
      };
      mockService.isValidChequeNumber.mockReturnValue(true);
      mockService.validateVerificationFields.mockReturnValue({ isValid: true });
    });

    it("should log errors securely", async () => {
      const errorSpy = jest.spyOn(console, "error");
      const testError = new Error("Database connection failed");

      mockService.fetchChequeData.mockRejectedValue(testError);

      await controller.verifyCheque(mockRequest as Request, mockResponse as Response);

      expect(errorSpy).toHaveBeenCalledWith(
        "Error during cheque verification",
        {
          errorType: "Error",
          hasMessage: true,
          isAxiosError: false,
          errorCode: undefined,
        }
      );
    });

    it("should handle axios timeout errors", async () => {
      const errorSpy = jest.spyOn(console, "error");
      const warnSpy = jest.spyOn(console, "warn");
      
      const axiosError = {
        isAxiosError: true,
        code: "ECONNABORTED",
        message: "timeout",
      };

      // Mock axios.isAxiosError
      const axios = require("axios");
      jest.spyOn(axios, "isAxiosError").mockReturnValue(true);

      mockService.fetchChequeData.mockRejectedValue(axiosError);

      await controller.verifyCheque(mockRequest as Request, mockResponse as Response);

      expect(errorSpy).toHaveBeenCalledWith(
        "Error during cheque verification",
        {
          errorType: "Unknown", // Plain object, not Error instance
          hasMessage: true,
          isAxiosError: true,
          errorCode: "ECONNABORTED",
        }
      );

      expect(warnSpy).toHaveBeenCalledWith("API request timeout detected");
    });

    it("should handle non-Error objects", async () => {
      const errorSpy = jest.spyOn(console, "error");
      mockService.fetchChequeData.mockRejectedValue("String error");

      await controller.verifyCheque(mockRequest as Request, mockResponse as Response);

      expect(errorSpy).toHaveBeenCalledWith(
        "Error during cheque verification",
        {
          errorType: "Unknown",
          hasMessage: true,
          isAxiosError: false,
          errorCode: undefined,
        }
      );
    });
  });
});