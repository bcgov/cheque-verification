import {
  getChequeFromDatabase,
  createMockConnection,
  mockPool,
  createValidChequeRow,
  setupTestEnvironment,
} from "../helpers/chequeTestHelpers";

describe("ChequeService - Edge Cases & Data Types", () => {
  setupTestEnvironment();

  describe("getChequeFromDatabase - Data Type Handling", () => {
    const validChequeRow = createValidChequeRow();

    it("handles_future_dates_in_payment_issue_date_field", async () => {
      // Arrange
      const futureDate = new Date("2025-12-31T23:59:59.999Z");
      const futureDateData = createValidChequeRow({
        PAYMENT_ISSUE_DT: futureDate,
      });
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [futureDateData],
        metaData: [],
        resultSet: undefined,
      });

      // Act
      const result = await getChequeFromDatabase("12345");

      // Assert
      expect(result.paymentIssueDate).toEqual(futureDate);
      expect(result.paymentIssueDate).toBeInstanceOf(Date);
    });

    it("handles_maximum_safe_integer_cheque_numbers", async () => {
      // Arrange
      const maxSafeIntegerString = Number.MAX_SAFE_INTEGER.toString();
      const maxSafeIntegerData = createValidChequeRow({
        CHEQUE_NUMBER: maxSafeIntegerString,
      });
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [maxSafeIntegerData],
        metaData: [],
        resultSet: undefined,
      });

      // Act
      const result = await getChequeFromDatabase(maxSafeIntegerString);

      // Assert
      expect(result.chequeNumber).toBe(maxSafeIntegerString);
      expect(typeof result.chequeNumber).toBe("string");
    });

    it("handles_invalid_date_objects_gracefully", async () => {
      // Arrange
      const invalidDateData = createValidChequeRow({
        PAYMENT_ISSUE_DT: new Date("invalid-date"),
      });
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [invalidDateData],
        metaData: [],
        resultSet: undefined,
      });

      // Act
      const result = await getChequeFromDatabase("12345");

      // Assert - Should handle invalid date objects
      expect(result.paymentIssueDate).toBeInstanceOf(Date);
      expect(isNaN(result.paymentIssueDate.getTime())).toBe(true);
    });

    it("handles_string_date_from_database", async () => {
      // Arrange - Some databases might return dates as strings
      const stringDateData = createValidChequeRow({
        PAYMENT_ISSUE_DT: "2024-08-14T10:30:00.000Z",
      });
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [stringDateData],
        metaData: [],
        resultSet: undefined,
      });

      // Act
      const result = await getChequeFromDatabase("12345");

      // Assert - Should handle string dates from database
      expect(result.paymentIssueDate).toBe("2024-08-14T10:30:00.000Z");
    });

    it("handles_extremely_long_cheque_status_strings", async () => {
      // Arrange
      const longStatusData = createValidChequeRow({
        CHEQUE_STATUS_OUTPUT: "A".repeat(1000), // Very long status
      });
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [longStatusData],
        metaData: [],
        resultSet: undefined,
      });

      // Act
      const result = await getChequeFromDatabase("12345");

      // Assert
      expect(result.chequeStatus).toBe("A".repeat(1000));
      expect(typeof result.chequeStatus).toBe("string");
    });

    it("handles_empty_string_cheque_status", async () => {
      // Arrange
      const emptyStatusData = createValidChequeRow({
        CHEQUE_STATUS_OUTPUT: "",
      });
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [emptyStatusData],
        metaData: [],
        resultSet: undefined,
      });

      // Act
      const result = await getChequeFromDatabase("12345");

      // Assert
      expect(result.chequeStatus).toBe("");
    });

    it("handles_null_values_in_database_response", async () => {
      // Arrange
      const nullValueData = {
        CHEQUE_STATUS_OUTPUT: null,
        CHEQUE_NUMBER: "12345",
        PAYMENT_ISSUE_DT: null,
        APPLIED_AMOUNT: null,
      };
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [nullValueData],
        metaData: [],
        resultSet: undefined,
      });

      // Act
      const result = await getChequeFromDatabase("12345");

      // Assert - Should handle null values gracefully
      expect(result.chequeStatus).toBeNull();
      expect(result.paymentIssueDate).toBeNull();
      expect(result.appliedAmount).toBeNull();
    });

    it("handles_unicode_characters_in_cheque_status", async () => {
      // Arrange
      const unicodeStatusData = createValidChequeRow({
        CHEQUE_STATUS_OUTPUT: "支付已授权", // Chinese characters
      });
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [unicodeStatusData],
        metaData: [],
        resultSet: undefined,
      });

      // Act
      const result = await getChequeFromDatabase("12345");

      // Assert
      expect(result.chequeStatus).toBe("支付已授权");
    });
  });
});
