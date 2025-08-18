import request, { Response as SuperTestResponse } from "supertest";
import express, { Express, Router } from "express";
import { AxiosResponse } from "axios";

// Import Jest globals for TypeScript support
import { jest, expect } from "@jest/globals";

// Fixed test date for deterministic testing
export const FIXED_TEST_DATE = new Date("2024-01-15T10:30:00.000Z");
export const FIXED_TEST_DATE_ISO = FIXED_TEST_DATE.toISOString();

/**
 * Environment variable manager that automatically restores state
 * Handles both sync and async test functions properly
 */
export async function withTestEnv<T>(
  vars: Record<string, string>,
  testFn: () => T | Promise<T>
): Promise<T> {
  const snapshot: Record<string, string | undefined> = {};

  // Snapshot current values
  Object.keys(vars).forEach((key) => {
    snapshot[key] = process.env[key];
  });

  try {
    // Set test values
    Object.entries(vars).forEach(([key, value]) => {
      process.env[key] = value;
    });

    return await testFn();
  } finally {
    // Restore original values
    Object.entries(snapshot).forEach(([key, originalValue]) => {
      if (originalValue === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalValue;
      }
    });
  }
}
/**
 * Creates a test Express app with optional routes and middleware
 */
export function createTestApp(options?: {
  routes?: Router[];
  middleware?: any[];
}): Express {
  const app = express();

  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Add custom middleware if provided
  if (options?.middleware) {
    options.middleware.forEach((mw) => app.use(mw));
  }

  // Add routes if provided
  if (options?.routes) {
    options.routes.forEach((router) => app.use(router));
  }

  return app;
}

/**
 * Creates a SuperTest agent that persists cookies/headers
 */
export function createTestAgent(app: Express) {
  return request.agent(app);
}

/**
 * Creates a regular SuperTest instance
 */
export function createTestClient(app: Express) {
  return request(app);
}

/**
 * Delay helper - use Jest fake timers when possible
 * @param ms - milliseconds to delay
 * @param useFakeTimers - whether to advance fake timers instead of real delay
 */
export async function delay(ms: number, useFakeTimers = false): Promise<void> {
  if (useFakeTimers) {
    // Check for Jest fake timers more robustly
    if (
      typeof jest !== "undefined" &&
      typeof jest.getRealSystemTime === "function"
    ) {
      // Use async timer advancement if available (Jest 27+)
      if (typeof jest.advanceTimersToNextTimerAsync === "function") {
        await jest.advanceTimersToNextTimerAsync();
      } else {
        jest.advanceTimersByTime(ms);
      }
      return;
    }
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a properly typed Axios response mock with minimal config fields
 */
export function createMockAxiosResponse<T = any>(
  status: number,
  data: T,
  options?: {
    headers?: Record<string, string>;
    statusText?: string;
    method?: string;
    url?: string;
  }
): AxiosResponse<T> {
  return {
    status,
    statusText: options?.statusText || (status === 200 ? "OK" : "Error"),
    data,
    headers: options?.headers || {},
    config: {
      method: options?.method || "get",
      url: options?.url || "/test",
      headers: {} as any,
    },
  };
}

/**
 * Enhanced test assertions with content type and shape validation
 */
export function assertApiResponse(
  response: SuperTestResponse,
  expectedStatus: number,
  options?: {
    properties?: string[];
    contentType?: string;
  }
): void {
  expect(response.status).toBe(expectedStatus);

  if (options?.contentType) {
    expect(response.headers["content-type"]).toMatch(options.contentType);
  }

  if (options?.properties) {
    options.properties.forEach((prop) => {
      expect(response.body).toHaveProperty(prop);
    });
  }
}

/**
 * Assert error response structure with enhanced validation
 */
export function assertErrorResponse(
  response: SuperTestResponse,
  expectedStatus: number,
  options?: {
    message?: string;
    contentType?: string;
  }
): void {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty("error");

  if (options?.contentType) {
    expect(response.headers["content-type"]).toMatch(options.contentType);
  }

  if (options?.message) {
    expect(response.body.error).toContain(options.message);
  }
}

/**
 * Assert cheque verification response structure
 */
export function assertChequeVerificationResponse(
  response: SuperTestResponse
): void {
  expect(response.body).toHaveProperty("isValid");
  expect(response.body).toHaveProperty("chequeNumber");
  expect(response.body).toHaveProperty("payeeCode");
  expect(typeof response.body.isValid).toBe("boolean");
  expect(response.headers["content-type"]).toMatch(/json/);
}

/**
 * Deterministic test data - no randomness for reliable tests
 */
export const TEST_DATA = {
  VALID_PAYEE_CODES: ["TEST001", "TEST002", "VALID001"] as const,
  INVALID_PAYEE_CODES: ["", "INVALID", "NOTFOUND"] as const,
  VALID_CHEQUE_NUMBERS: ["123456", "789012", "456789"] as const,
  INVALID_CHEQUE_NUMBERS: ["", "INVALID", "000000"] as const,
} as const;

/**
 * Generate fixed test cheque data sets - deterministic
 */
export function getTestChequeData() {
  return {
    valid: {
      payeeCode: TEST_DATA.VALID_PAYEE_CODES[0], // Always "TEST001"
      chequeNumber: TEST_DATA.VALID_CHEQUE_NUMBERS[0], // Always "123456"
      amount: 1000.0,
      issueDate: FIXED_TEST_DATE_ISO,
    },
    validAlternate: {
      payeeCode: TEST_DATA.VALID_PAYEE_CODES[1], // Always "TEST002"
      chequeNumber: TEST_DATA.VALID_CHEQUE_NUMBERS[1], // Always "789012"
      amount: 2500.0,
      issueDate: FIXED_TEST_DATE_ISO,
    },
    invalid: {
      payeeCode: TEST_DATA.INVALID_PAYEE_CODES[0], // Always ""
      chequeNumber: TEST_DATA.INVALID_CHEQUE_NUMBERS[0], // Always ""
      amount: -100,
      issueDate: "invalid-date",
    },
    invalidPayeeCode: {
      payeeCode: TEST_DATA.INVALID_PAYEE_CODES[1], // Always "INVALID"
      chequeNumber: TEST_DATA.VALID_CHEQUE_NUMBERS[0], // Always "123456"
      amount: 1000.0,
      issueDate: FIXED_TEST_DATE_ISO,
    },
  };
}

/**
 * Test data sets for parametrized tests - use instead of random generation
 */
export function getChequeTestCases() {
  const testData = getTestChequeData();
  return [
    { name: "valid cheque data", data: testData.valid, expected: true },
    {
      name: "alternate valid data",
      data: testData.validAlternate,
      expected: true,
    },
    { name: "invalid empty data", data: testData.invalid, expected: false },
    {
      name: "invalid payee code",
      data: testData.invalidPayeeCode,
      expected: false,
    },
  ];
}
