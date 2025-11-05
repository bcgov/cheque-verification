import request from "supertest";
import { createApp } from "../../../src/app";
import { getChequeFromDatabase } from "../../../src/services/chequeService";
import logger from "../../../src/config/logger";

// Mock rate limiting
jest.mock("express-rate-limit", () => {
  return jest.fn(() => (req: any, res: any, next: any) => next());
});

// Mock auth middleware to disable JWT for tests
jest.mock("../../../src/middleware/auth", () => ({
  authenticateJWT: (req: any, res: any, next: any) => next(),
  validateJWTClaims: () => (req: any, res: any, next: any) => next(),
}));

// Mock the logger
jest.mock("../../../src/config/logger", () => ({
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  },
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
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("GET /api/v1/cheque/:chequeNumber", () => {
    it("should log error details when database throws error", async () => {
      const testError = new Error("Database connection failed");

      // Mock the service to throw an error
      mockGetChequeFromDatabase.mockRejectedValueOnce(testError);

      await request(app).get("/api/v1/cheque/123456").expect(500);

      // Verify error logging was called with the error object
      expect(logger.error).toHaveBeenCalledWith(
        { err: testError },
        "Cheque verification failed"
      );
    });

    it("should log error details when unknown error type is thrown", async () => {
      const testError = "String error"; // Non-Error object

      // Mock the service to throw a non-Error object
      mockGetChequeFromDatabase.mockRejectedValueOnce(testError);

      await request(app).get("/api/v1/cheque/123456").expect(500);

      // Verify error logging was called
      expect(logger.error).toHaveBeenCalledWith(
        { err: testError },
        "Cheque verification failed"
      );
    });

    it("should log error when error has no message", async () => {
      const testError = new Error(""); // Empty message

      // Mock the service to throw an error with empty message
      mockGetChequeFromDatabase.mockRejectedValueOnce(testError);

      await request(app).get("/api/v1/cheque/123456").expect(500);

      // Verify error logging was called
      expect(logger.error).toHaveBeenCalledWith(
        { err: testError },
        "Cheque verification failed"
      );
    });

    it("should log request details on successful requests", async () => {
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
      expect(logger.info).toHaveBeenCalledWith(
        {
          chequeNumberLength: 6,
          hasUserAgent: true,
        },
        "Received cheque verification request"
      );
    });

    it("should handle requests without user agent", async () => {
      // Mock successful response
      mockGetChequeFromDatabase.mockResolvedValueOnce({
        chequeStatus: "VALID",
        chequeNumber: "123456",
        paymentIssueDate: new Date("2024-01-01"),
        appliedAmount: 100.0,
      });

      await request(app).get("/api/v1/cheque/123456").expect(200);

      // Verify request logging handles missing user agent
      expect(logger.info).toHaveBeenCalledWith(
        {
          chequeNumberLength: 6,
          hasUserAgent: false,
        },
        "Received cheque verification request"
      );
    });
  });
});
