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
});
