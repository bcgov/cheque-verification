import {
  validateChequeNumber,
  HttpError,
} from "../../src/middleware/validation";
import request from "supertest";
import express from "express";

describe("ChequeValidationSecurity", () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Test route that uses our validation and exposes converted value
    app.get(
      "/test/:chequeNumber",
      validateChequeNumber,
      (req: any, res: any) => {
        res.json({
          success: true,
          chequeNumber: req.params.chequeNumber,
          convertedValue: req.params.chequeNumber, // Keep as string to avoid precision loss
          type: typeof req.params.chequeNumber,
        });
      }
    );

    // Error handler
    app.use((err: any, req: any, res: any, next: any) => {
      res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || "Internal server error",
      });
    });
  });

  // Helper function to test invalid inputs with less boilerplate
  const testInvalidInput = async (input: string, description: string) => {
    const response = await request(app)
      .get(`/test/${encodeURIComponent(input)}`)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Invalid input");
    return response;
  };

  // Helper function to test valid inputs
  const testValidInput = async (input: string, expectedValue: string) => {
    const response = await request(app).get(`/test/${input}`).expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.convertedValue).toBe(expectedValue);
    expect(response.body.type).toBe("string");
    return response;
  };

  describe("ChequeNumber Validation Security", () => {
    it("allows_valid_numeric_cheque_numbers_and_preserves_as_string", async () => {
      // Act & Assert - Test string preservation behavior
      const response = await testValidInput("12345", "12345");

      // Direct assertion to satisfy SonarQube requirement
      expect(response.status).toBe(200);
    });

    it("handles_leading_zeros_correctly_and_preserves_format", async () => {
      // Act & Assert - Leading zeros should be preserved as string
      const response = await testValidInput("00012345", "00012345");

      // Direct assertion to satisfy SonarQube requirement
      expect(response.status).toBe(200);
    });

    it("accepts_exactly_sixteen_digit_numbers_at_boundary", async () => {
      // Arrange - Exactly 16 digits (maximum allowed)
      const sixteenDigits = "1234567890123456";

      // Act & Assert - Preserve full precision as string
      const response = await testValidInput(sixteenDigits, sixteenDigits);

      // Direct assertion to satisfy SonarQube requirement
      expect(response.status).toBe(200);
    });

    it("handles_maximum_safe_integer_boundary", async () => {
      // Arrange - Number.MAX_SAFE_INTEGER has 16 digits, should be within our 16-digit limit
      const maxSafeInteger = Number.MAX_SAFE_INTEGER; // 9007199254740991 (16 digits)

      // Act & Assert - Preserve as string to avoid precision issues
      const response = await testValidInput(
        maxSafeInteger.toString(),
        maxSafeInteger.toString()
      );

      // Direct assertion to satisfy SonarQube requirement
      expect(response.status).toBe(200);
    });

    // Parameterized security injection tests
    describe("Security Injection Prevention", () => {
      const maliciousInputs = [
        { input: "1'; DROP TABLE cheques; --", type: "SQL injection" },
        { input: '<script>alert("xss")</script>', type: "XSS attack" },
        { input: "１２３４５", type: "Unicode full-width digits" },
        { input: "٠١٢٣٤", type: "Arabic-Indic numerals" },
        { input: "123\x00456", type: "null byte injection" },
        { input: "123😀456", type: "emoji injection" },
      ];

      maliciousInputs.forEach(({ input, type }) => {
        it(`prevents_${type.replace(/\s+/g, "_").toLowerCase()}`, async () => {
          const response = await testInvalidInput(input, type);
          expect(response.status).toBe(400);
        });
      });
    });

    // Parameterized format rejection tests
    describe("Invalid Format Rejection", () => {
      const invalidFormats = [
        { input: "-123", type: "negative numbers" },
        { input: "123.45", type: "decimal numbers" },
        { input: "1e5", type: "scientific notation" },
        { input: "0xFF", type: "hexadecimal format" },
        { input: "0", type: "zero value" },
        { input: "A".repeat(1000), type: "buffer overflow" },
        { input: "12345678901234567", type: "17+ digit numbers" }, // Updated for 16-char limit
        { input: "12345678901234567890", type: "20 digit numbers" }, // Should now be invalid
      ];

      invalidFormats.forEach(({ input, type }) => {
        it(`rejects_${type.replace(/\s+/g, "_").toLowerCase()}`, async () => {
          const response = await testInvalidInput(input, type);
          expect(response.status).toBe(400);
        });
      });
    });

    // Space handling with realistic URL encoding
    describe("Whitespace Handling", () => {
      it("handles_url_encoded_spaces_realistically", async () => {
        // Arrange - Browsers encode spaces as %20
        const inputWithSpaces = encodeURIComponent("  12345  ");

        // Act
        const response = await request(app)
          .get(`/test/${inputWithSpaces}`)
          .expect(200);

        // Assert - Should trim and preserve as string
        expect(response.body.success).toBe(true);
        expect(response.body.convertedValue).toBe("12345");
        expect(response.status).toBe(200);
      });

      it("handles_trimming_behavior_correctly", async () => {
        // Test literal spaces that get passed through Express routing
        const response = await request(app)
          .get("/test/%20%2012345%20%20") // URL-encoded spaces
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.convertedValue).toBe("12345");
        expect(response.status).toBe(200);
      });
    });

    it("rejects_empty_cheque_numbers", async () => {
      // Act - Empty param doesn't match route pattern
      const response = await request(app).get("/test/").expect(404);

      // Assert - This is expected behavior
      expect(response.status).toBe(404);
    });
  });
});
