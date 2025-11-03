import EventEmitter from "events";
import { requestLogger } from "../../../src/middleware/logger";
import { logger } from "../../../src/config/logger";
import { Request, Response, NextFunction } from "express";

describe("requestLogger middleware", () => {
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerSpy = jest.spyOn(logger, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    loggerSpy.mockRestore();
    jest.clearAllMocks();
  });

  it("should call logger.info when response finishes", () => {
    // Create minimal mock req/res
    const req = {
      method: "GET",
      path: "/test-path",
    } as unknown as Request;

    // Use EventEmitter so we can emit 'finish'
    const res = new EventEmitter() as unknown as Response & {
      statusCode: number;
    };
    res.statusCode = 204;

    const next: NextFunction = jest.fn();

    // Call middleware - this will attach the 'finish' listener and call next()
    requestLogger(req, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(loggerSpy).not.toHaveBeenCalled();

    // Simulate the response finishing
    (res as EventEmitter).emit("finish");

    expect(loggerSpy).toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/test-path",
        status: 204,
      }),
      "request"
    );
  });
});
