import EventEmitter from "events";
import { Request, Response, NextFunction } from "express";

describe("requestLogger middleware", () => {
  it("should export requestLogger middleware", async () => {
    const { requestLogger } = await import("../../../src/middleware/logger");
    expect(requestLogger).toBeDefined();
    expect(typeof requestLogger).toBe("function");
  });

  it("should call next when invoked", () => {
    const { requestLogger } = require("../../../src/middleware/logger");
    const req = {
      method: "GET",
      url: "/test-path",
      path: "/test-path",
      headers: {},
    } as unknown as Request;

    const res = new EventEmitter() as unknown as Response & {
      statusCode: number;
    };
    res.statusCode = 200;

    const next: NextFunction = jest.fn();

    requestLogger(req, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it("should skip logging for health check endpoint", () => {
    const { requestLogger } = require("../../../src/middleware/logger");
    const req = {
      method: "GET",
      url: "/api/v1/health",
      path: "/api/v1/health",
      headers: {},
    } as unknown as Request;

    const res = new EventEmitter() as unknown as Response & {
      statusCode: number;
    };
    res.statusCode = 200;

    const next: NextFunction = jest.fn();

    requestLogger(req, res as Response, next);

    expect(next).toHaveBeenCalled();
    // Verify no listener was added for the finish event (logging skipped)
    expect(res.listenerCount("finish")).toBe(0);
  });

  it("should add finish listener for non-health check endpoints", () => {
    const { requestLogger } = require("../../../src/middleware/logger");
    const req = {
      method: "GET",
      url: "/api/v1/cheque",
      path: "/api/v1/cheque",
      headers: {},
    } as unknown as Request;

    const res = new EventEmitter() as unknown as Response & {
      statusCode: number;
    };
    res.statusCode = 200;

    const next: NextFunction = jest.fn();

    requestLogger(req, res as Response, next);

    expect(next).toHaveBeenCalled();
    // Verify listener was added for the finish event (logging enabled)
    expect(res.listenerCount("finish")).toBe(1);
  });
});
