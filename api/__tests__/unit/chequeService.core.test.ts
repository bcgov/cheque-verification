import {
  getChequeFromDatabase,
  HttpError,
  oracledb,
  createMockConnection,
  mockPool,
  createValidChequeRow,
  setupTestEnvironment,
  TEST_SCHEMA,
  TEST_TABLE,
} from "../helpers/chequeTestHelpers";

describe("ChequeService - Core Functionality", () => {
  setupTestEnvironment();

  describe("getChequeFromDatabase - Basic Operations", () => {
    const validChequeRow = createValidChequeRow();

    it("retrieves_and_transforms_valid_cheque_data_successfully", async () => {
      // Arrange
      const chequeNumber = "98765";
      const expectedQuery = `SELECT CHEQUE_STATUS_OUTPUT, CHEQUE_NUMBER, PAYMENT_ISSUE_DT, APPLIED_AMOUNT
       FROM ${TEST_SCHEMA}.${TEST_TABLE}
       WHERE CHEQUE_NUMBER = :chequeNumber`;

      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [validChequeRow],
        metaData: [],
        resultSet: undefined,
      });

      // Act
      const result = await getChequeFromDatabase(chequeNumber);

      // Assert
      expect(result).toEqual({
        chequeNumber: "98765",
        chequeStatus: "verified_for_payment",
        paymentIssueDate: new Date("2024-08-14T10:30:00.000Z"),
        appliedAmount: 1250.75,
      });

      expect(mockPool.getConnection).toHaveBeenCalledTimes(1);
      expect(mockConnection.execute).toHaveBeenCalledWith(
        expectedQuery,
        { chequeNumber },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
    });

    it("handles_20_digit_cheque_numbers_without_precision_loss", async () => {
      // Arrange
      const largeChequeNumber = "12345678901234567890"; // 20 digits - would lose precision as number
      const largeChequeRow = createValidChequeRow({
        CHEQUE_NUMBER: largeChequeNumber,
      });

      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [largeChequeRow],
        metaData: [],
        resultSet: undefined,
      });

      // Act
      const result = await getChequeFromDatabase(largeChequeNumber);

      // Assert - Verify full precision is maintained
      expect(result.chequeNumber).toBe("12345678901234567890");
      expect(typeof result.chequeNumber).toBe("string");
      expect(result.chequeNumber).toHaveLength(20);
    });

    it("prevents_sql_injection_through_parameterized_queries", async () => {
      // Arrange
      const maliciousChequeNumber = "1"; // Even if this came from "1; DROP TABLE"
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [validChequeRow],
        metaData: [],
        resultSet: undefined,
      });

      // Act
      await getChequeFromDatabase(maliciousChequeNumber);

      // Assert - Verify parameterized query is used
      expect(mockConnection.execute).toHaveBeenCalledWith(
        expect.stringContaining("WHERE CHEQUE_NUMBER = :chequeNumber"),
        { chequeNumber: maliciousChequeNumber },
        expect.any(Object)
      );
    });

    it("processes_edge_case_cheque_amounts_correctly", async () => {
      // Arrange
      const edgeCaseData = createValidChequeRow({
        APPLIED_AMOUNT: 0.01, // Minimum possible amount
      });
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [edgeCaseData],
        metaData: [],
        resultSet: undefined,
      });

      // Act
      const result = await getChequeFromDatabase("12345");

      // Assert
      expect(result.appliedAmount).toBe(0.01);
      expect(typeof result.appliedAmount).toBe("number");
    });

    it("handles_very_large_amounts_correctly", async () => {
      // Arrange
      const largeAmountData = createValidChequeRow({
        APPLIED_AMOUNT: 999999999.99, // Maximum practical amount
      });
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [largeAmountData],
        metaData: [],
        resultSet: undefined,
      });

      // Act
      const result = await getChequeFromDatabase("12345");

      // Assert
      expect(result.appliedAmount).toBe(999999999.99);
      expect(typeof result.appliedAmount).toBe("number");
    });

    it("handles_zero_amount_cheques", async () => {
      // Arrange
      const zeroAmountData = createValidChequeRow({
        APPLIED_AMOUNT: 0.0,
      });
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [zeroAmountData],
        metaData: [],
        resultSet: undefined,
      });

      // Act
      const result = await getChequeFromDatabase("12345");

      // Assert
      expect(result.appliedAmount).toBe(0.0);
      expect(typeof result.appliedAmount).toBe("number");
    });
  });
});
