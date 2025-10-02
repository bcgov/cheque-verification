import {
  getChequeFromDatabase,
  HttpError,
  oracledb,
  createMockConnection,
  mockPool,
  setupTestEnvironment,
  TEST_SCHEMA,
  TEST_TABLE,
} from "../../helpers/chequeTestHelpers";

describe("ChequeService - Logging Coverage", () => {
  setupTestEnvironment();

  describe("Console logging verification", () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      // Override the global console mocking for this specific test
      consoleSpy = jest.spyOn(console, "log").mockImplementation();
      jest.spyOn(console, "error").mockImplementation();
      jest.spyOn(console, "warn").mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it("should log database configuration missing error", async () => {
      // Temporarily remove environment variables
      const originalSchema = process.env.DB_SCHEMA;
      const originalTable = process.env.DB_TABLE;

      delete process.env.DB_SCHEMA;
      delete process.env.DB_TABLE;

      const errorSpy = jest.spyOn(console, "error");

      try {
        await getChequeFromDatabase("123456");
      } catch (error) {
        // Expected to throw
      }

      expect(errorSpy).toHaveBeenCalledWith("Database configuration missing", {
        schema: false,
        table: false,
      });

      // Restore environment variables
      process.env.DB_SCHEMA = originalSchema;
      process.env.DB_TABLE = originalTable;
    });

    it("should log database query start with secure parameters", async () => {
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [
          {
            CHEQUE_STATUS_OUTPUT: "VALID",
            CHEQUE_NUMBER: "123456",
            PAYMENT_ISSUE_DT: new Date(),
            APPLIED_AMOUNT: 100,
          },
        ],
      });

      await getChequeFromDatabase("123456");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Starting cheque database query",
        {
          chequeNumberLength: 6,
          hasSchema: true,
          hasTable: true,
        }
      );
    });

    it("should log database connection establishment", async () => {
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [
          {
            CHEQUE_STATUS_OUTPUT: "VALID",
            CHEQUE_NUMBER: "123456",
            PAYMENT_ISSUE_DT: new Date(),
            APPLIED_AMOUNT: 100,
          },
        ],
      });

      await getChequeFromDatabase("123456");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Database connection established"
      );
    });

    it("should log query completion with row count", async () => {
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [
          {
            CHEQUE_STATUS_OUTPUT: "VALID",
            CHEQUE_NUMBER: "123456",
            PAYMENT_ISSUE_DT: new Date(),
            APPLIED_AMOUNT: 100,
          },
        ],
      });

      await getChequeFromDatabase("123456");

      expect(consoleSpy).toHaveBeenCalledWith("Database query completed", {
        rowCount: 1,
        hasResult: true,
      });
    });

    it("should log when query result is found with secure data flags", async () => {
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [
          {
            CHEQUE_STATUS_OUTPUT: "VALID",
            CHEQUE_NUMBER: "123456",
            PAYMENT_ISSUE_DT: new Date(),
            APPLIED_AMOUNT: 100,
          },
        ],
      });

      await getChequeFromDatabase("123456");

      expect(consoleSpy).toHaveBeenCalledWith("Query result found", {
        hasStatusOutput: true,
        hasPaymentDate: true,
        hasAmount: true,
        resultNumberLength: 6,
      });
    });

    it("should log when no rows are returned from database", async () => {
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [],
      });

      const warnSpy = jest.spyOn(console, "warn");

      try {
        await getChequeFromDatabase("123456");
      } catch (error) {
        // Expected to throw HttpError
      }

      expect(warnSpy).toHaveBeenCalledWith(
        "No rows returned from database query"
      );
    });

    it("should log when cheque is not found", async () => {
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [],
      });

      const warnSpy = jest.spyOn(console, "warn");

      try {
        await getChequeFromDatabase("123456");
      } catch (error) {
        // Expected to throw HttpError
      }

      expect(warnSpy).toHaveBeenCalledWith("Cheque not found in database");
    });

    it("should log database errors with secure error information", async () => {
      const mockConnection = createMockConnection();
      const testError = new Error("Connection timeout");

      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockRejectedValueOnce(testError);

      const errorSpy = jest.spyOn(console, "error");

      try {
        await getChequeFromDatabase("123456");
      } catch (error) {
        // Expected to throw
      }

      expect(errorSpy).toHaveBeenCalledWith(
        "Database error in getChequeFromDatabase",
        {
          errorType: "Error",
          hasMessage: true,
        }
      );
    });

    it("should handle non-Error objects in database errors", async () => {
      const mockConnection = createMockConnection();
      const testError = "String error";

      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockRejectedValueOnce(testError);

      const errorSpy = jest.spyOn(console, "error");

      try {
        await getChequeFromDatabase("123456");
      } catch (error) {
        // Expected to throw
      }

      expect(errorSpy).toHaveBeenCalledWith(
        "Database error in getChequeFromDatabase",
        {
          errorType: "Unknown",
          hasMessage: true,
        }
      );
    });

    it("should log query completion with zero rows", async () => {
      const mockConnection = createMockConnection();
      mockPool.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValueOnce({
        rows: [],
      });

      try {
        await getChequeFromDatabase("123456");
      } catch (error) {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith("Database query completed", {
        rowCount: 0,
        hasResult: false,
      });
    });
  });
});
