// Mock Oracle DB module
export const mockOracleDb = {
  OUT_FORMAT_OBJECT: 4002, // Updated to match actual constant

  createPool: jest.fn(),

  // Mock connection
  mockConnection: {
    execute: jest.fn(),
    close: jest.fn(),
  },

  // Mock pool
  mockPool: {
    getConnection: jest.fn(),
    close: jest.fn(),
    terminate: jest.fn(),
  },

  // Helper to set up successful query result
  mockSuccessfulQuery: (data: any) => {
    mockOracleDb.mockConnection.execute.mockResolvedValue({
      rows: [data],
      metaData: [],
      resultSet: undefined,
    });
    mockOracleDb.mockPool.getConnection.mockResolvedValue(
      mockOracleDb.mockConnection
    );
  },

  // Helper to set up failed query
  mockFailedQuery: (error: Error) => {
    mockOracleDb.mockConnection.execute.mockRejectedValue(error);
    mockOracleDb.mockPool.getConnection.mockResolvedValue(
      mockOracleDb.mockConnection
    );
  },

  // Helper to set up empty result
  mockEmptyQuery: () => {
    mockOracleDb.mockConnection.execute.mockResolvedValue({
      rows: [],
      metaData: [],
      resultSet: undefined,
    });
    mockOracleDb.mockPool.getConnection.mockResolvedValue(
      mockOracleDb.mockConnection
    );
  },

  // Reset all mocks
  reset: () => {
    mockOracleDb.mockConnection.execute.mockReset();
    mockOracleDb.mockConnection.close.mockReset();
    mockOracleDb.mockPool.getConnection.mockReset();
    mockOracleDb.mockPool.close.mockReset();
    mockOracleDb.mockPool.terminate.mockReset();
  },
};

// Mock the oracledb module
jest.mock("oracledb", () => mockOracleDb);

export default mockOracleDb;
