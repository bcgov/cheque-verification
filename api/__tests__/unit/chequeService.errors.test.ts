import {
  getChequeFromDatabase,
  HttpError,
  createMockConnection,
  mockPool,
  createValidChequeRow,
  setupTestEnvironment,
} from "../helpers/chequeTestHelpers";

import { logger } from "../../src/config/logger.js";

describe("ChequeService - Error Handling", () => {
  setupTestEnvironment();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getChequeFromDatabase - Error Scenarios", () => {
    it("throws_404_error_when_cheque_not_found_in_database", async () => {
      // Arrange
      const nonExistentCheque = "99999";
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [],
        metaData: [],
        resultSet: undefined,
      });

      // Act & Assert - Capture error once to avoid double execution
      let thrownError: HttpError | undefined;
      try {
        await getChequeFromDatabase(nonExistentCheque);
      } catch (error) {
        thrownError = error as HttpError;
      }

      expect(thrownError).toBeInstanceOf(HttpError);
      expect(thrownError?.statusCode).toBe(404);
      expect(thrownError?.message).toBe("Cheque not found");
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
    });

    it("handles_database_connection_failure_gracefully", async () => {
      // Arrange
      const connectionError = new Error("Database unavailable");
      mockPool.getConnection.mockRejectedValueOnce(connectionError);

      // Act & Assert
      await expect(getChequeFromDatabase("12345")).rejects.toThrow(
        "Failed to retrieve cheque information"
      );

      // Connection should not be closed if never established
      // Note: No mockConnection.close assertion since connection was never created
    });

    it("handles_sql_execution_timeout_appropriately", async () => {
      // Arrange
      const timeoutError = new Error(
        "ORA-01013: user requested cancel of current operation"
      );
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockRejectedValueOnce(timeoutError);

      // Act & Assert
      await expect(getChequeFromDatabase("12345")).rejects.toThrow(
        "Failed to retrieve cheque information"
      );

      expect(mockConnection.close).toHaveBeenCalledTimes(1);
    });

    it("fails_securely_when_database_schema_not_configured", async () => {
      // Arrange
      delete process.env.DB_SCHEMA;

      // Act & Assert
      await expect(getChequeFromDatabase("12345")).rejects.toThrow(
        "Database schema and table not configured in environment variables"
      );

      // Should not attempt database connection
      expect(mockPool.getConnection).not.toHaveBeenCalled();
    });

    it("fails_securely_when_database_table_not_configured", async () => {
      // Arrange
      delete process.env.DB_TABLE;

      // Act & Assert
      await expect(getChequeFromDatabase("12345")).rejects.toThrow(
        "Database schema and table not configured in environment variables"
      );

      expect(mockPool.getConnection).not.toHaveBeenCalled();
    });

    it("closes_connection_even_when_query_execution_fails", async () => {
      // Arrange
      const queryError = new Error("ORA-00942: table or view does not exist");
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockRejectedValueOnce(queryError);

      // Act
      await getChequeFromDatabase("12345").catch(() => {});

      // Assert
      expect(mockConnection.close).toHaveBeenCalledTimes(1);
    });

    it("handles_null_database_results_appropriately", async () => {
      // Arrange
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: null,
        metaData: [],
        resultSet: undefined,
      });

      // Act & Assert
      await expect(getChequeFromDatabase("12345")).rejects.toThrow(HttpError);
    });

    it("handles_database_returning_undefined_rows", async () => {
      // Arrange
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: undefined,
        metaData: [],
        resultSet: undefined,
      });

      // Act & Assert
      await expect(getChequeFromDatabase("12345")).rejects.toThrow(
        "Cheque not found"
      );
    });

    it("handles_connection_close_failure_gracefully", async () => {
      // Arrange
      const mockConnection = createMockConnection();
      const closeError = new Error("Connection close failed");

      const validChequeRow = createValidChequeRow();

      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [validChequeRow],
        metaData: [],
        resultSet: undefined,
      });
      mockConnection.close.mockRejectedValueOnce(closeError);

      // Act
      const result = await getChequeFromDatabase("12345");

      // Assert
      expect(result).toBeDefined();
      expect(logger.warn).toHaveBeenCalledWith(
        { error: closeError },
        "Failed to close database connection"
      );
    });
  });
});
