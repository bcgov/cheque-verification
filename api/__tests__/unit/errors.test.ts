import { HttpError } from "../../src/middleware/validation";

describe("HttpError", () => {
  it("creates_error_with_default_500_status_when_no_code_provided", () => {
    // Arrange & Act
    const error = new HttpError("System failure");

    // Assert
    expect(error.message).toBe("System failure");
    expect(error.statusCode).toBe(500);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("HttpError"); // Should have distinct name
  });

  it("creates_error_with_custom_status_when_code_specified", () => {
    // Arrange & Act
    const error = new HttpError("Resource not found", 404);

    // Assert
    expect(error.message).toBe("Resource not found");
    expect(error.statusCode).toBe(404);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("HttpError");
  });

  it("maintains_error_stack_trace_for_debugging", () => {
    // Arrange & Act
    const error = new HttpError("Test error", 400);

    // Assert - Less brittle stack assertion
    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe("string");
    expect(error.stack!.length).toBeGreaterThan(0);
  });

  it("handles_empty_message_gracefully", () => {
    // Arrange & Act
    const error = new HttpError("", 400);

    // Assert
    expect(error.message).toBe("");
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe("HttpError");
  });

  // Table-driven test for status codes with better reporting
  it.each([
    { message: "Bad Request", code: 400 },
    { message: "Unauthorized", code: 401 },
    { message: "Forbidden", code: 403 },
    { message: "Not Found", code: 404 },
    { message: "Unprocessable Entity", code: 422 },
    { message: "Internal Server Error", code: 500 },
    { message: "Bad Gateway", code: 502 },
    { message: "Service Unavailable", code: 503 },
  ])("handles_http_status_$code_correctly", ({ message, code }) => {
    // Arrange & Act
    const error = new HttpError(message, code);

    // Assert
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(code);
    expect(error.name).toBe("HttpError");
  });

  // Guard tests for invalid status values
  describe("Invalid Status Code Guards", () => {
    it("defaults_to_500_for_NaN_status_code", () => {
      // Arrange & Act
      const error = new HttpError("Invalid status", NaN);

      // Assert
      expect(error.message).toBe("Invalid status");
      expect(error.statusCode).toBe(500); // Should fall back to 500
      expect(error.name).toBe("HttpError");
    });

    it("defaults_to_500_for_negative_status_code", () => {
      // Arrange & Act
      const error = new HttpError("Negative status", -1);

      // Assert
      expect(error.message).toBe("Negative status");
      expect(error.statusCode).toBe(500); // Should fall back to 500
    });

    it("defaults_to_500_for_zero_status_code", () => {
      // Arrange & Act
      const error = new HttpError("Zero status", 0);

      // Assert
      expect(error.message).toBe("Zero status");
      expect(error.statusCode).toBe(500); // Should fall back to 500
    });

    it("defaults_to_500_for_status_code_above_599", () => {
      // Arrange & Act
      const error = new HttpError("Invalid high status", 700);

      // Assert
      expect(error.message).toBe("Invalid high status");
      expect(error.statusCode).toBe(500); // Should fall back to 500
    });

    it("accepts_valid_status_codes_in_range_100_to_599", () => {
      const validCodes = [100, 200, 300, 400, 500, 599];

      validCodes.forEach((code) => {
        // Arrange & Act
        const error = new HttpError(`Status ${code}`, code);

        // Assert
        expect(error.statusCode).toBe(code); // Should accept valid codes
      });
    });
  });
});
