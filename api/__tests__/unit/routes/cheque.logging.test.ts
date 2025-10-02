import request from "supertest";
import { createApp } from "../../../src/app";
import { getChequeFromDatabase } from "../../../src/services/chequeService";

// Mock rate limiting
jest.mock("express-rate-limit", () => {
  return jest.fn(() => (req: any, res: any, next: any) => next());
});

// Mock auth middleware to disable JWT for tests
jest.mock("../../../src/middleware/auth", () => ({
  authenticateJWT: (req: any, res: any, next: any) => next(),
  validateJWTClaims: () => (req: any, res: any, next: any) => next(),
}));

// Mock the cheque service
jest.mock("../../../src/services/chequeService");
const mockGetChequeFromDatabase = getChequeFromDatabase as jest.MockedFunction<
  typeof getChequeFromDatabase
>;

describe("Cheque Routes - Error Handling with Logging", () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
    // Silence console during tests
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("POST /api/v1/cheque/:chequeNumber", () => {
    it("should log error details when database throws error", async () => {
      const consoleSpy = jest.spyOn(console, "error");
      const testError = new Error("Database connection failed");

      // Mock the service to throw an error
      mockGetChequeFromDatabase.mockRejectedValueOnce(testError);

      await request(app).get("/api/v1/cheque/123456").expect(500);

      // Verify error logging was called
      expect(consoleSpy).toHaveBeenCalledWith("Cheque verification failed", {
        errorType: "Error",
        hasMessage: true,
      });
    });

    it("should log error details when unknown error type is thrown", async () => {
      const consoleSpy = jest.spyOn(console, "error");
      const testError = "String error"; // Non-Error object

      // Mock the service to throw a non-Error object
      mockGetChequeFromDatabase.mockRejectedValueOnce(testError);

      await request(app).get("/api/v1/cheque/123456").expect(500);

      // Verify error logging was called
      expect(consoleSpy).toHaveBeenCalledWith("Cheque verification failed", {
        errorType: "Unknown",
        hasMessage: true,
      });
    });

    it("should log error when error has no message", async () => {
      const consoleSpy = jest.spyOn(console, "error");
      const testError = new Error(""); // Empty message

      // Mock the service to throw an error with empty message
      mockGetChequeFromDatabase.mockRejectedValueOnce(testError);

      await request(app).get("/api/v1/cheque/123456").expect(500);

      // Verify error logging was called
      expect(consoleSpy).toHaveBeenCalledWith("Cheque verification failed", {
        errorType: "Error",
        hasMessage: false,
      });
    });

    it("should log request details on successful requests", async () => {
      const consoleSpy = jest.spyOn(console, "log");

      // Mock successful response
      mockGetChequeFromDatabase.mockResolvedValueOnce({
        chequeStatus: "VALID",
        chequeNumber: "123456",
        paymentIssueDate: new Date("2024-01-01"),
        appliedAmount: 100.0,
      });

      await request(app)
        .get("/api/v1/cheque/123456")
        .set("User-Agent", "test-agent")
        .expect(200);

      // Verify request logging was called
      expect(consoleSpy).toHaveBeenCalledWith(
        "Received cheque verification request",
        {
          chequeNumberLength: 6,
          hasUserAgent: true,
          timestamp: expect.any(String),
        }
      );

      // Verify success logging was called
      expect(consoleSpy).toHaveBeenCalledWith(
        "Cheque verification successful",
        {
          hasStatus: true,
          hasAmount: true,
          hasDate: true,
        }
      );
    });

    it("should handle requests without user agent", async () => {
      const consoleSpy = jest.spyOn(console, "log");

      // Mock successful response
      mockGetChequeFromDatabase.mockResolvedValueOnce({
        chequeStatus: "VALID",
        chequeNumber: "123456",
        paymentIssueDate: new Date("2024-01-01"),
        appliedAmount: 100.0,
      });

      await request(app).get("/api/v1/cheque/123456").expect(200);

      // Verify request logging handles missing user agent
      expect(consoleSpy).toHaveBeenCalledWith(
        "Received cheque verification request",
        {
          chequeNumberLength: 6,
          hasUserAgent: false,
          timestamp: expect.any(String),
        }
      );
    });
  });
});
