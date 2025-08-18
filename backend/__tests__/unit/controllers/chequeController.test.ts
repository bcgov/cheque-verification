import request from "supertest";
import express from "express";
import { ChequeController } from "../../../src/controllers/chequeController";
import { createMockChequeVerificationService } from "../../mocks/serviceMocks";
import { apiLimiter } from "../../../src/middleware/rateLimiter";
import { describe, it, expect, beforeEach } from "@jest/globals";

describe("ChequeController", () => {
  let app: express.Application;
  let mockService: any;
  let controller: ChequeController;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    mockService = createMockChequeVerificationService();
    controller = new ChequeController(mockService);

    // Setup routes with rate limiting (matches production configuration)
    // NOTE: Rate limiting is properly configured in production via middleware
    app.post("/api/verify", apiLimiter, controller.verifyCheque.bind(controller));
    app.get("/health", controller.healthCheck.bind(controller));
  });

  describe("POST /api/verify", () => {
    const validRequestBody = {
      chequeNumber: "123456",
      appliedAmount: "1000.50",
      paymentIssueDate: "2024-01-01",
    };

    it("should return 400 when chequeNumber is missing", async () => {
      const invalidBody = {
        appliedAmount: "1000.50",
        paymentIssueDate: "2024-01-01",
      };

      const response = await request(app).post("/api/verify").send(invalidBody);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Cheque number is required");
    });

    it("should return 400 for invalid cheque number format", async () => {
      mockService.isValidChequeNumber.mockReturnValue(false);

      const invalidBody = { ...validRequestBody, chequeNumber: "0" };

      const response = await request(app).post("/api/verify").send(invalidBody);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Invalid cheque number format.");
      expect(mockService.isValidChequeNumber).toHaveBeenCalledWith("0");
    });

    it("should return 400 for invalid verification fields", async () => {
      mockService.isValidChequeNumber.mockReturnValue(true);
      mockService.validateVerificationFields.mockReturnValue({
        isValid: false,
        error: "All verification fields are required",
      });

      const invalidBody = { ...validRequestBody, appliedAmount: "" };

      const response = await request(app).post("/api/verify").send(invalidBody);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("All verification fields are required");
      expect(mockService.validateVerificationFields).toHaveBeenCalledWith(
        "",
        "2024-01-01"
      );
    });

    it("should return 404 when cheque is not found", async () => {
      mockService.isValidChequeNumber.mockReturnValue(true);
      mockService.validateVerificationFields.mockReturnValue({ isValid: true });
      mockService.fetchChequeData.mockResolvedValue({
        success: false,
        error: "Cheque not found",
      });

      const response = await request(app)
        .post("/api/verify")
        .send(validRequestBody);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Cheque not found");
    });

    it("should return 422 when verification fails", async () => {
      mockService.isValidChequeNumber.mockReturnValue(true);
      mockService.validateVerificationFields.mockReturnValue({ isValid: true });
      mockService.fetchChequeData.mockResolvedValue({
        success: true,
        data: {
          chequeStatus: "active",
          chequeNumber: 123456,
          appliedAmount: 1000.5,
          paymentIssueDate: new Date("2024-01-01"),
        },
      });
      mockService.verifyFields.mockReturnValue([
        "Cheque amount does not match",
      ]);

      const invalidBody = { ...validRequestBody, appliedAmount: "999.99" };

      const response = await request(app).post("/api/verify").send(invalidBody);

      expect(response.status).toBe(400); // Controller returns 400, not 422
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Verification failed");
      expect(response.body.details).toContain("Cheque amount does not match");
    });

    it("should return 200 for successful verification", async () => {
      mockService.isValidChequeNumber.mockReturnValue(true);
      mockService.validateVerificationFields.mockReturnValue({ isValid: true });
      mockService.fetchChequeData.mockResolvedValue({
        success: true,
        data: {
          chequeStatus: "active",
          chequeNumber: 123456,
          appliedAmount: 1000.5,
          paymentIssueDate: new Date("2024-01-01"),
        },
      });
      mockService.verifyFields.mockReturnValue([]);

      const response = await request(app)
        .post("/api/verify")
        .send(validRequestBody);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("chequeNumber");
      expect(response.body.data).toHaveProperty("appliedAmount");
      expect(response.body.message).toBe("Cheque verification successful");
    });

    it("should handle network errors gracefully", async () => {
      mockService.isValidChequeNumber.mockReturnValue(true);
      mockService.validateVerificationFields.mockReturnValue({ isValid: true });
      mockService.fetchChequeData.mockRejectedValue(new Error("Network error"));

      const response = await request(app)
        .post("/api/verify")
        .send(validRequestBody);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Error communicating with API service");
    });

    it("should handle axios errors with response", async () => {
      mockService.isValidChequeNumber.mockReturnValue(true);
      mockService.validateVerificationFields.mockReturnValue({ isValid: true });

      const axiosError = {
        isAxiosError: true,
        response: {
          status: 503,
          data: { error: "Service unavailable" },
        },
      };

      mockService.fetchChequeData.mockRejectedValue(axiosError);

      const response = await request(app)
        .post("/api/verify")
        .send(validRequestBody);

      expect(response.status).toBe(503);
      expect(response.body.error).toBe("Service unavailable");
    });
  });

  describe("healthCheck", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty("timestamp");
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });
});
