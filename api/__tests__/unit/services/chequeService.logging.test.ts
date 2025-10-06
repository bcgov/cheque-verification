import {
  getChequeFromDatabase,
  createMockConnection,
  mockPool,
  setupTestEnvironment,
} from "../../helpers/chequeTestHelpers";

// Mock the logger before importing anything else
jest.mock("../../../src/config/logger.js", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    fatal: jest.fn(),
  },
}));

import { logger } from "../../../src/config/logger.js";

describe("ChequeService - Logging Coverage", () => {
  setupTestEnvironment();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should log starting query info", async () => {
    const mockConnection = createMockConnection();
    mockConnection.execute.mockResolvedValue({ rows: [] });
    mockPool.getConnection.mockResolvedValue(mockConnection);

    try {
      await getChequeFromDatabase("123");
    } catch (error) {
      // Expected to throw
    }

    expect(logger.info).toHaveBeenCalledWith(
      {
        chequeNumberLength: 3,
        hasSchema: true,
        hasTable: true,
      },
      "Starting cheque database query"
    );
  });

  it("should log database connection establishment", async () => {
    const mockConnection = createMockConnection();
    mockConnection.execute.mockResolvedValue({ rows: [] });
    mockPool.getConnection.mockResolvedValue(mockConnection);

    try {
      await getChequeFromDatabase("123");
    } catch (error) {
      // Expected to throw
    }

    expect(logger.info).toHaveBeenCalledWith("Database connection established");
  });

  it("should log database errors", async () => {
    const mockConnection = createMockConnection();
    const testError = new Error("Connection timeout");
    mockPool.getConnection.mockResolvedValue(mockConnection);
    mockConnection.execute.mockRejectedValue(testError);

    try {
      await getChequeFromDatabase("123456");
    } catch (error) {
      // Expected to throw
    }

    expect(logger.error).toHaveBeenCalledWith(
      {
        errorType: "Error",
        errorMessage: "Connection timeout",
        errorCode: undefined,
        hasMessage: true,
      },
      "Database error in getChequeFromDatabase"
    );
  });

  it("should log no rows returned warning", async () => {
    const mockConnection = createMockConnection();
    mockPool.getConnection.mockResolvedValue(mockConnection);
    mockConnection.execute.mockResolvedValue({ rows: [] });

    try {
      await getChequeFromDatabase("123456");
    } catch (error) {
      // Expected to throw
    }

    expect(logger.warn).toHaveBeenCalledWith(
      "No rows returned from database query"
    );
  });
});
