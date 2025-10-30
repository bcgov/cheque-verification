import { Request, Response, NextFunction } from "express";
import { requestLogger } from "../../../src/middleware/logger";
import { logger } from '../../../src/config/logger';
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";

describe("Logger Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let loggerSpy: any;

  beforeEach(() => {
    mockReq = {
      method: "GET",
      path: "/api/test",
    };
    mockRes = {
      once: jest.fn((event: string, cb: () => void) => {
        if (event === "finish") {
          cb();
        }
      }) as any, // Cast as any to bypass Response event type
      statusCode: 200,
    };
    mockNext = jest.fn();
    // Spy on the pino logger rather than process.stdout to avoid test flakiness
    loggerSpy = jest.spyOn(logger, 'info').mockImplementation(() => undefined as any);
  });

  afterEach(() => {
    loggerSpy.mockRestore();
  });

  describe("requestLogger", () => {
    it("should log method, path, and status as JSON", () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      expect(loggerSpy).toHaveBeenCalled();
  const payload = loggerSpy.mock.calls.at(-1)?.[0];
      expect(payload).toBeDefined();
      const parsed = payload;
      expect(parsed.method).toBe("GET");
      expect(parsed.path).toBe("/api/test");
      expect(parsed.status).toBe(200);
      expect(parsed).not.toHaveProperty("durationMs");
    });

    it("should call next() to continue middleware chain", () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should log different HTTP methods correctly", () => {
      const methods = ["GET", "POST", "PUT", "DELETE"];
      methods.forEach((method) => {
        mockReq.method = method;
        mockRes.statusCode = 200;
  loggerSpy.mockClear();
        mockNext = jest.fn();
        requestLogger(mockReq as Request, mockRes as Response, mockNext);
        expect(loggerSpy).toHaveBeenCalled();
  const payload = loggerSpy.mock.calls.at(-1)?.[0];
        const parsed = payload;
        expect(parsed.method).toBe(method);
        expect(parsed.path).toBe("/api/test");
        expect(parsed.status).toBe(200);
        expect(parsed).not.toHaveProperty("durationMs");
        expect(mockNext).toHaveBeenCalledTimes(1);
      });
    });

    it("should log different paths correctly", () => {
      const paths = ["/api/verify", "/health", "/api/v1/cheques"];
      paths.forEach((path) => {
        (mockReq as any).path = path; // Allow assignment for test
        mockRes.statusCode = 200;
  loggerSpy.mockClear();
        mockNext = jest.fn();
        requestLogger(mockReq as Request, mockRes as Response, mockNext);
        expect(loggerSpy).toHaveBeenCalled();
  const payload = loggerSpy.mock.calls.at(-1)?.[0];
        const parsed = payload;
        expect(parsed.method).toBe("GET");
        expect(parsed.path).toBe(path);
        expect(parsed.status).toBe(200);
        expect(parsed).not.toHaveProperty("durationMs");
        expect(mockNext).toHaveBeenCalledTimes(1);
      });
    });

    // No timestamp assertion: logger now emits only method, path, status as JSON
  });
});
