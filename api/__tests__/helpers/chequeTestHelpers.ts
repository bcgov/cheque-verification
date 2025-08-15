import { getChequeFromDatabase } from "../../src/services/chequeService";
import { HttpError } from "../../src/middleware/validation";
import oracledb from "oracledb";

// Mock oracledb module completely
jest.mock("oracledb", () => ({
  OUT_FORMAT_OBJECT: 4002,
  createPool: jest.fn(),
}));

// Create a mock connection factory to simulate proper pooling
export function createMockConnection() {
  return {
    execute: jest.fn(),
    close: jest.fn(),
  };
}

export const mockPool = {
  getConnection: jest.fn(),
  close: jest.fn(),
  terminate: jest.fn(),
};

jest.mock("../../src/config/database", () => ({
  getDbPool: jest.fn(() => mockPool),
}));

// Test data factory
export const createValidChequeRow = (overrides = {}) => ({
  CHEQUE_STATUS_OUTPUT: "verified_for_payment",
  CHEQUE_NUMBER: "98765",
  PAYMENT_ISSUE_DT: new Date("2024-08-14T10:30:00.000Z"),
  APPLIED_AMOUNT: 1250.75,
  ...overrides,
});

// Test environment setup
export const TEST_SCHEMA = "GOV_SCHEMA";
export const TEST_TABLE = "CHEQUE_REGISTRY";

export const setupTestEnvironment = () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DB_SCHEMA = TEST_SCHEMA;
    process.env.DB_TABLE = TEST_TABLE;
  });

  afterEach(() => {
    delete process.env.DB_SCHEMA;
    delete process.env.DB_TABLE;
  });
};

// Export common types
export { getChequeFromDatabase, HttpError, oracledb };
