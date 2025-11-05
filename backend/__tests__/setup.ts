// Mock uuid module to avoid ESM issues
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-1234"),
}));

// Mock the logger module
jest.mock("../src/config/logger", () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  },
}));

// Mock pino-http to avoid ESM and internal symbol issues
jest.mock("pino-http", () => {
  return jest.fn(() => {
    return (req: any, res: any, next: any) => {
      req.id = "test-request-id";
      req.log = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        child: jest.fn(() => ({
          info: jest.fn(),
          error: jest.fn(),
          warn: jest.fn(),
          debug: jest.fn(),
        })),
      };
      next();
    };
  });
});

// Global test setup

beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = "test";
});

afterAll(async () => {
  // Cleanup after all tests
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  jest.restoreAllMocks();
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection at:", reason);
});

// Silence console output during tests by default (tests can spy/restore as needed)
beforeEach(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});
