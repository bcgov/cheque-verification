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

// Create app for testing without starting server
export async function createAppForTesting() {
  const express = require("express");
  const cors = require("cors");
  const { requestLogger } = require("../../src/middleware/logger");
  const routes = require("../../src/routes").default;
  const { HttpError } = require("../../src/middleware/validation");

  const app = express();

  // Security: Disable X-Powered-By header
  app.disable("x-powered-by");

  // Configure CORS
  const allowedOrigins = ["http://localhost:4000"];
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: false,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());
  app.use(requestLogger);
  app.use("/api/v1", routes);

  // 404 handler
  app.use((req: any, res: any) =>
    res.status(404).json({ success: false, error: "Not found" })
  );

  // Error handler
  app.use((err: any, req: any, res: any, _next: any) => {
    const status = err.statusCode || 500;
    const message = err.message || "Internal server error";
    res.status(status).json({ success: false, error: message });
  });

  return app;
}
