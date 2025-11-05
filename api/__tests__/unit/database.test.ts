import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock oracledb module
const mockClose = jest.fn();
const mockCreatePool = jest.fn() as jest.MockedFunction<any>;

jest.mock("oracledb", () => ({
  createPool: mockCreatePool,
  getPool: jest.fn(),
  CLOB: "CLOB",
  NUMBER: "NUMBER",
  STRING: "STRING",
  OUT_FORMAT_OBJECT: 1,
  outFormat: 0,
}));

describe("Database Configuration", () => {
  let database: any;

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset environment variables
    delete process.env.ORACLE_USER;
    delete process.env.ORACLE_PASSWORD;
    delete process.env.ORACLE_CONNECTION_STRING;

    // Reset mock implementations
    mockCreatePool.mockClear();
    mockClose.mockClear();

    // Reset and re-import the module to ensure clean state
    jest.resetModules();
    database = await import("../../src/config/database");
  });

  afterEach(() => {
    // Clean up any remaining pool state
    jest.resetModules();
  });

  describe("getRequired", () => {
    it("returns_environment_variable_when_present", () => {
      // Arrange
      process.env.TEST_VAR = "test_value";

      // Act
      const result = database.getRequired("TEST_VAR");

      // Assert
      expect(result).toBe("test_value");
    });

    it("throws_clear_error_when_environment_variable_missing", () => {
      // Arrange
      delete process.env.MISSING_VAR;

      // Act & Assert
      expect(() => database.getRequired("MISSING_VAR")).toThrow(
        "Missing required environment variable"
      );
    });

    it("throws_error_when_environment_variable_is_empty_string", () => {
      // Arrange
      process.env.EMPTY_VAR = "";

      // Act & Assert
      expect(() => database.getRequired("EMPTY_VAR")).toThrow(
        "Missing required environment variable"
      );
    });
  });

  describe("initializeDbPool", () => {
    const validDbConfig = {
      user: "test_user",
      password: "test_password",
      connectString: "localhost:1521/XEPDB1",
      poolMin: 0,
      poolMax: 4,
      poolIncrement: 1,
      stmtCacheSize: 40,
    };

    beforeEach(() => {
      // Set valid environment variables
      process.env.ORACLE_USER = validDbConfig.user;
      process.env.ORACLE_PASSWORD = validDbConfig.password;
      process.env.ORACLE_CONNECTION_STRING = validDbConfig.connectString;
    });

    it("creates_oracle_pool_with_correct_configuration", async () => {
      // Arrange
      const mockPool = { close: mockClose };
      mockCreatePool.mockResolvedValueOnce(mockPool);

      // Act
      const result = await database.initializeDbPool();

      // Assert
      expect(mockCreatePool).toHaveBeenCalledWith(validDbConfig);
      expect(result).toBe(mockPool);
    });

    it("throws_error_when_oracle_user_missing", async () => {
      // Arrange
      delete process.env.ORACLE_USER;

      // Act & Assert
      await expect(database.initializeDbPool()).rejects.toThrow(
        "Missing required environment variable"
      );
      expect(mockCreatePool).not.toHaveBeenCalled();
    });

    it("throws_error_when_oracle_password_missing", async () => {
      // Arrange
      delete process.env.ORACLE_PASSWORD;

      // Act & Assert
      await expect(database.initializeDbPool()).rejects.toThrow(
        "Missing required environment variable"
      );
      expect(mockCreatePool).not.toHaveBeenCalled();
    });

    it("throws_error_when_connection_string_missing", async () => {
      // Arrange
      delete process.env.ORACLE_CONNECTION_STRING;

      // Act & Assert
      await expect(database.initializeDbPool()).rejects.toThrow(
        "Missing required environment variable"
      );
      expect(mockCreatePool).not.toHaveBeenCalled();
    });

    it("propagates_oracle_connection_errors", async () => {
      // Arrange
      const connectionError = new Error("ORA-12541: TNS:no listener");
      mockCreatePool.mockRejectedValueOnce(connectionError);

      // Act & Assert
      await expect(database.initializeDbPool()).rejects.toThrow(
        "ORA-12541: TNS:no listener"
      );
    });

    it("returns_existing_pool_when_already_initialized", async () => {
      // Arrange - First call to create the pool
      const mockPool = { close: mockClose };
      mockCreatePool.mockResolvedValueOnce(mockPool);
      await database.initializeDbPool();

      // Clear the mock to verify it's not called again
      mockCreatePool.mockClear();

      // Act - Second call should return existing pool
      const result = await database.initializeDbPool();

      // Assert
      expect(mockCreatePool).not.toHaveBeenCalled(); // Should not create a new pool
      expect(result).toBe(mockPool); // Should return the same pool
    });
  });

  describe("getDbPool", () => {
    it("returns_initialized_pool", async () => {
      // Arrange
      process.env.ORACLE_USER = "test_user";
      process.env.ORACLE_PASSWORD = "test_password";
      process.env.ORACLE_CONNECTION_STRING = "localhost:1521/XEPDB1";

      const mockPool = { close: mockClose };
      mockCreatePool.mockResolvedValueOnce(mockPool);

      await database.initializeDbPool();

      // Act
      const result = database.getDbPool();

      // Assert
      expect(result).toBe(mockPool);
    });

    it("throws_clear_error_when_pool_not_initialized", () => {
      // Act & Assert
      expect(() => database.getDbPool()).toThrow("DB pool not initialized");
    });
  });

  describe("closeDbPool", () => {
    it("closes_pool_when_initialized", async () => {
      // Arrange
      process.env.ORACLE_USER = "test_user";
      process.env.ORACLE_PASSWORD = "test_password";
      process.env.ORACLE_CONNECTION_STRING = "localhost:1521/XEPDB1";

      const mockPool = { close: mockClose };
      mockCreatePool.mockResolvedValueOnce(mockPool);

      await database.initializeDbPool();

      // Act
      await database.closeDbPool();

      // Assert
      expect(mockPool.close).toHaveBeenCalledWith(0);
    });

    it("handles_multiple_close_calls_gracefully", async () => {
      // Arrange
      process.env.ORACLE_USER = "test_user";
      process.env.ORACLE_PASSWORD = "test_password";
      process.env.ORACLE_CONNECTION_STRING = "localhost:1521/XEPDB1";

      const mockPool = { close: mockClose };
      mockCreatePool.mockResolvedValueOnce(mockPool);

      await database.initializeDbPool();

      // Act - Close twice
      await database.closeDbPool();
      await database.closeDbPool();

      // Assert - Should not throw, only close once
      expect(mockPool.close).toHaveBeenCalledTimes(1);
    });

    it("handles_no_pool_gracefully", async () => {
      // Act & Assert - Should not throw
      await expect(database.closeDbPool()).resolves.not.toThrow();
    });

    it("resets_pool_state_after_closing", async () => {
      // Arrange
      process.env.ORACLE_USER = "test_user";
      process.env.ORACLE_PASSWORD = "test_password";
      process.env.ORACLE_CONNECTION_STRING = "localhost:1521/XEPDB1";

      const mockPool = { close: mockClose };
      mockCreatePool.mockResolvedValueOnce(mockPool);

      await database.initializeDbPool();
      await database.closeDbPool();

      // Act & Assert - Should throw after closing
      expect(() => database.getDbPool()).toThrow("DB pool not initialized");
    });
  });
});
