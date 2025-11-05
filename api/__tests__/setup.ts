import dotenv from "dotenv";

// Mock uuid module to avoid ESM issues
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-1234"),
}));

// Mock the logger configuration
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
  trace: jest.fn(),
  fatal: jest.fn(),
  level: "info",
  version: "8.0.0",
  bindings: jest.fn(() => ({ service: "cheque-verification-api" })),
};

jest.mock("../src/config/logger", () => ({
  logger: mockLogger,
  default: mockLogger,
}));

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Global test setup
beforeAll(async () => {
  // Set test environment variables if not already set
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "test";
  }

  // Set up test database configuration
  process.env.DB_SCHEMA = process.env.TEST_DB_SCHEMA || "TEST_SCHEMA";
  process.env.DB_TABLE = process.env.TEST_DB_TABLE || "TEST_CHEQUES";

  // Disable auth checks in tests
  process.env.AUTH_DISABLED = "true";

  // Suppress console.log during tests unless debugging
  if (!process.env.DEBUG_TESTS) {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

// Global test teardown
afterAll(async () => {
  // Clean up any global resources
});

// Reset mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});
