import request from "supertest";
import express from "express";
import routes from "../../src/routes";
import { HttpError } from "../../src/middleware/validation";

// Mock the entire cheque service module
jest.mock("../../src/services/chequeService", () => ({
  getChequeFromDatabase: jest.fn(),
}));

// Import after mocking
import { getChequeFromDatabase } from "../../src/services/chequeService";
const mockGetChequeFromDatabase = getChequeFromDatabase as jest.MockedFunction<
  typeof getChequeFromDatabase
>;

describe("ChequeAPI_SeniorLevel_SecurityTests", () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/v1", routes);

    // Error handler
    app.use((err: any, req: any, res: any, next: any) => {
      const status = err.statusCode || 500;
      const message = status === 500 ? "Internal server error" : err.message;
      res.status(status).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Health Check Endpoint", () => {
    it("exposes_minimal_system_information_in_health_check", async () => {
      const response = await request(app).get("/api/v1/health").expect(200);

      expect(response.body).toEqual({
        status: "OK",
        timestamp: expect.any(String),
      });

      // Security: Should not expose internal system details
      expect(response.body).not.toHaveProperty("database");
      expect(response.body).not.toHaveProperty("version");
      expect(response.body).not.toHaveProperty("environment");
    });
  });

  describe("Cheque Verification Security", () => {
    it("processes_valid_government_cheque_numbers_correctly", async () => {
      // Arrange
      const validChequeData = {
        chequeNumber: "123456789", // Changed to string
        chequeStatus: "authorized_for_payment",
        paymentIssueDate: new Date("2024-08-14T08:00:00.000Z"),
        appliedAmount: 2500.0,
      };
      mockGetChequeFromDatabase.mockResolvedValueOnce(validChequeData);

      // Act
      const response = await request(app)
        .get("/api/v1/cheque/123456789")
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.chequeNumber).toBe("123456789"); // Now expect string
      expect(response.body.data.chequeStatus).toBe("authorized_for_payment");
      expect(mockGetChequeFromDatabase).toHaveBeenCalledWith("123456789"); // Called with string
    });

    it("prevents_sql_injection_via_parameter_validation", async () => {
      // Arrange
      const sqlInjectionAttempt = "1'; DROP TABLE cheques; --";

      // Act
      const response = await request(app)
        .get(`/api/v1/cheque/${encodeURIComponent(sqlInjectionAttempt)}`)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Invalid input");
      expect(mockGetChequeFromDatabase).not.toHaveBeenCalled();
    });

    it("blocks_xss_injection_attempts_through_input_validation", async () => {
      // Arrange
      const xssPayload = '<script>alert("XSS")</script>';

      // Act
      const response = await request(app)
        .get(`/api/v1/cheque/${encodeURIComponent(xssPayload)}`)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(mockGetChequeFromDatabase).not.toHaveBeenCalled();
    });

    it("enforces_business_rules_rejecting_negative_numbers", async () => {
      // Act
      const response = await request(app)
        .get("/api/v1/cheque/-123456")
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Invalid input");
      expect(mockGetChequeFromDatabase).not.toHaveBeenCalled();
    });

    it("validates_input_length_preventing_buffer_overflow", async () => {
      // Arrange
      const oversizedInput = "1".repeat(50);

      // Act
      const response = await request(app)
        .get(`/api/v1/cheque/${oversizedInput}`)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(mockGetChequeFromDatabase).not.toHaveBeenCalled();
    });

    it("handles_unicode_normalization_attacks", async () => {
      // Arrange
      const unicodeAttack = "１２３４５"; // Full-width unicode

      // Act
      const response = await request(app)
        .get(`/api/v1/cheque/${encodeURIComponent(unicodeAttack)}`)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(mockGetChequeFromDatabase).not.toHaveBeenCalled();
    });

    it("handles_cancelled_cheque_status_appropriately", async () => {
      // Arrange
      const cancelledCheque = {
        chequeNumber: "987654321", // Changed to string
        chequeStatus: "cancelled_void",
        paymentIssueDate: new Date("2024-07-01T00:00:00.000Z"),
        appliedAmount: 0.0,
      };
      mockGetChequeFromDatabase.mockResolvedValueOnce(cancelledCheque);

      // Act
      const response = await request(app)
        .get("/api/v1/cheque/987654321")
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.chequeStatus).toBe("cancelled_void");
      expect(response.body.data.appliedAmount).toBe(0.0);
    });

    it("processes_edge_case_amounts_correctly", async () => {
      // Arrange
      const edgeCaseAmount = {
        chequeNumber: "555555555",
        chequeStatus: "pending_verification",
        paymentIssueDate: new Date("2024-08-14T00:00:00.000Z"),
        appliedAmount: 0.01, // Minimum amount
      };
      mockGetChequeFromDatabase.mockResolvedValueOnce(edgeCaseAmount);

      // Act
      const response = await request(app)
        .get("/api/v1/cheque/555555555")
        .expect(200);

      // Assert
      expect(response.body.data.appliedAmount).toBe(0.01);
      expect(typeof response.body.data.appliedAmount).toBe("number");
    });

    it("handles_maximum_valid_cheque_number_within_constraints", async () => {
      // Arrange - 16 digit number (maximum allowed length)
      const maxValidCheque = {
        chequeNumber: "1234567890123456",
        chequeStatus: "verified",
        paymentIssueDate: new Date("2024-08-14T00:00:00.000Z"),
        appliedAmount: 999999.99,
      };
      mockGetChequeFromDatabase.mockResolvedValueOnce(maxValidCheque);

      // Act
      const response = await request(app)
        .get("/api/v1/cheque/1234567890123456")
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.chequeNumber).toBe("1234567890123456"); // Expect string with full precision
    });

    it("handles_very_large_cheque_amounts", async () => {
      // Arrange
      const largeCheque = {
        chequeNumber: "777777777",
        chequeStatus: "high_value_approved",
        paymentIssueDate: new Date("2024-08-14T00:00:00.000Z"),
        appliedAmount: 999999999.99, // Very large amount
      };
      mockGetChequeFromDatabase.mockResolvedValueOnce(largeCheque);

      // Act
      const response = await request(app)
        .get("/api/v1/cheque/777777777")
        .expect(200);

      // Assert
      expect(response.body.data.appliedAmount).toBe(999999999.99);
      expect(typeof response.body.data.appliedAmount).toBe("number");
    });

    it("handles_zero_amount_cheques", async () => {
      // Arrange
      const zeroCheque = {
        chequeNumber: "888888888",
        chequeStatus: "void_no_amount",
        paymentIssueDate: new Date("2024-08-14T00:00:00.000Z"),
        appliedAmount: 0.0,
      };
      mockGetChequeFromDatabase.mockResolvedValueOnce(zeroCheque);

      // Act
      const response = await request(app)
        .get("/api/v1/cheque/888888888")
        .expect(200);

      // Assert
      expect(response.body.data.appliedAmount).toBe(0.0);
    });

    it("handles_cheques_with_future_dates", async () => {
      // Arrange
      const futureCheque = {
        chequeNumber: "999999999",
        chequeStatus: "post_dated",
        paymentIssueDate: new Date("2025-12-31T23:59:59.999Z"),
        appliedAmount: 500.0,
      };
      mockGetChequeFromDatabase.mockResolvedValueOnce(futureCheque);

      // Act
      const response = await request(app)
        .get("/api/v1/cheque/999999999")
        .expect(200);

      // Assert
      expect(response.body.data.paymentIssueDate).toBe(
        "2025-12-31T23:59:59.999Z"
      );
    });

    it("handles_cheques_with_unicode_status_messages", async () => {
      // Arrange
      const unicodeCheque = {
        chequeNumber: "111111111",
        chequeStatus: "vérifié_approuvé", // French accents
        paymentIssueDate: new Date("2024-08-14T00:00:00.000Z"),
        appliedAmount: 1000.0,
      };
      mockGetChequeFromDatabase.mockResolvedValueOnce(unicodeCheque);

      // Act
      const response = await request(app)
        .get("/api/v1/cheque/111111111")
        .expect(200);

      // Assert
      expect(response.body.data.chequeStatus).toBe("vérifié_approuvé");
    });

    it("handles_decimal_precision_edge_cases", async () => {
      // Arrange
      const precisionCheque = {
        chequeNumber: "222222222",
        chequeStatus: "precision_test",
        paymentIssueDate: new Date("2024-08-14T00:00:00.000Z"),
        appliedAmount: 123.456789, // High precision
      };
      mockGetChequeFromDatabase.mockResolvedValueOnce(precisionCheque);

      // Act
      const response = await request(app)
        .get("/api/v1/cheque/222222222")
        .expect(200);

      // Assert
      expect(response.body.data.appliedAmount).toBe(123.456789);
    });

    it("rejects_floating_point_cheque_numbers", async () => {
      // Act
      const response = await request(app)
        .get("/api/v1/cheque/123.45")
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(mockGetChequeFromDatabase).not.toHaveBeenCalled();
    });

    it("rejects_scientific_notation_cheque_numbers", async () => {
      // Act
      const response = await request(app).get("/api/v1/cheque/1e6").expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(mockGetChequeFromDatabase).not.toHaveBeenCalled();
    });

    it("rejects_hexadecimal_cheque_numbers", async () => {
      // Act
      const response = await request(app)
        .get("/api/v1/cheque/0xFF")
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(mockGetChequeFromDatabase).not.toHaveBeenCalled();
    });

    it("rejects_cheque_numbers_exceeding_16_digits", async () => {
      // Act - Test 17 digit number should be rejected
      const response = await request(app)
        .get("/api/v1/cheque/12345678901234567")
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Invalid input");
      expect(mockGetChequeFromDatabase).not.toHaveBeenCalled();
    });

    it("handles_leading_zeros_in_cheque_numbers", async () => {
      // Arrange
      const leadingZeroCheque = {
        chequeNumber: "12345",
        chequeStatus: "valid",
        paymentIssueDate: new Date("2024-08-14T00:00:00.000Z"),
        appliedAmount: 100.0,
      };
      mockGetChequeFromDatabase.mockResolvedValueOnce(leadingZeroCheque);

      // Act
      const response = await request(app)
        .get("/api/v1/cheque/000012345")
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(mockGetChequeFromDatabase).toHaveBeenCalledWith("000012345"); // Leading zeros preserved as string
    });
  });

  describe("API Security and Error Handling", () => {
    it("returns_404_for_non_existent_api_endpoints", async () => {
      // Act
      const response = await request(app)
        .get("/api/v1/invalid-endpoint")
        .expect(404);

      // Assert - Should have proper error structure
      expect(response.status).toBe(404);
    });

    it("handles_malformed_json_gracefully", async () => {
      // Act
      const response = await request(app)
        .post("/api/v1/cheque")
        .set("Content-Type", "application/json")
        .send('{"invalid": json}');

      // Assert - Should not crash server
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
    });

    it("trims_whitespace_from_valid_input", async () => {
      // Arrange
      const validData = {
        chequeNumber: "12345",
        chequeStatus: "active",
        paymentIssueDate: new Date(),
        appliedAmount: 100.0,
      };
      mockGetChequeFromDatabase.mockResolvedValueOnce(validData);

      // Act
      const response = await request(app)
        .get("/api/v1/cheque/  12345  ")
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(mockGetChequeFromDatabase).toHaveBeenCalledWith("12345"); // Trimmed and preserved as string
    });
  });
});
