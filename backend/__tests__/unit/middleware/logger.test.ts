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
  let writeSpy: any;

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
    writeSpy = jest
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);
  });

  afterEach(() => {
    writeSpy.mockRestore();
  });

  describe("requestLogger", () => {
    it("should log method, path, and status as JSON", () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      expect(writeSpy).toHaveBeenCalled();
      const payload = writeSpy.mock.calls.at(-1)?.[0];
      expect(payload).toBeDefined();
      const logLine =
        typeof payload === "string"
          ? payload.trim()
          : payload?.toString("utf8").trim();
      const parsed = JSON.parse(logLine);
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
        writeSpy.mockClear();
        mockNext = jest.fn();
        requestLogger(mockReq as Request, mockRes as Response, mockNext);
        expect(writeSpy).toHaveBeenCalled();
        const payload = writeSpy.mock.calls.at(-1)?.[0];
        const parsed = JSON.parse(
          typeof payload === "string"
            ? payload.trim()
            : payload?.toString("utf8").trim()
        );
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
        writeSpy.mockClear();
        mockNext = jest.fn();
        requestLogger(mockReq as Request, mockRes as Response, mockNext);
        expect(writeSpy).toHaveBeenCalled();
        const payload = writeSpy.mock.calls.at(-1)?.[0];
        const parsed = JSON.parse(
          typeof payload === "string"
            ? payload.trim()
            : payload?.toString("utf8").trim()
        );
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
