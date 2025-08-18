import { Request, Response, NextFunction } from "express";
import { requestLogger } from "../../../src/middleware/logger";
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
  let consoleSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    mockReq = {
      method: "GET",
      path: "/api/test",
    };
    mockRes = {};
    mockNext = jest.fn();

    // Spy on console.log to test logging
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("requestLogger", () => {
    it("should log request method and path with timestamp", () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(
          /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z - GET \/api\/test/
        )
      );
    });

    it("should call next() to continue middleware chain", () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should log different HTTP methods correctly", () => {
      const methods = ["GET", "POST", "PUT", "DELETE"];

      methods.forEach((method) => {
        mockReq.method = method;
        consoleSpy.mockClear();
        mockNext = jest.fn();

        requestLogger(mockReq as Request, mockRes as Response, mockNext);

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining(`${method} /api/test`)
        );
        expect(mockNext).toHaveBeenCalledTimes(1);
      });
    });

    it("should log different paths correctly", () => {
      const paths = ["/api/verify", "/health", "/api/v1/cheques"];

      paths.forEach((path) => {
        const pathMockReq = { ...mockReq, path };
        consoleSpy.mockClear();
        mockNext = jest.fn();

        requestLogger(pathMockReq as Request, mockRes as Response, mockNext);

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining(`GET ${path}`)
        );
        expect(mockNext).toHaveBeenCalledTimes(1);
      });
    });

    it("should include ISO timestamp format", () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      const logCall = consoleSpy.mock.calls[0][0];
      const timestamp = logCall.split(" - ")[0];

      // Check that timestamp is a valid ISO string
      expect(new Date(timestamp).toISOString()).toBe(timestamp);

      // Check that timestamp is recent (within last second)
      const now = Date.now();
      const logTime = new Date(timestamp).getTime();
      expect(Math.abs(now - logTime)).toBeLessThan(1000); // Within 1 second
    });
  });
});
