import { logger } from "../../../src/config/logger";

describe("Logger configuration", () => {
  it("exports a pino logger instance with expected methods and bindings", () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.debug).toBe("function");
    expect(logger).toHaveProperty("level");
    expect(logger).toHaveProperty("version");
    expect(logger.bindings()).toHaveProperty(
      "service",
      "cheque-verification-api"
    );
  });

  describe("LOG_LEVEL handling", () => {
    const original = process.env.LOG_LEVEL;

    afterEach(() => {
      if (original) {
        process.env.LOG_LEVEL = original;
      } else {
        delete process.env.LOG_LEVEL;
      }
      jest.resetModules();
    });

    it("defaults to info when LOG_LEVEL is not set", () => {
      delete process.env.LOG_LEVEL;
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { logger: freshLogger } = require("../../../src/config/logger");
      expect(freshLogger.level).toBe("info");
    });

    it("respects LOG_LEVEL environment variable", () => {
      process.env.LOG_LEVEL = "debug";
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { logger: freshLogger } = require("../../../src/config/logger");
      expect(freshLogger.level).toBe("debug");
    });
  });

  it("logging methods do not throw", () => {
    expect(() => {
      logger.trace("trace");
      logger.debug("debug");
      logger.info("info");
      logger.warn("warn");
      logger.error("error");
      logger.fatal("fatal");
    }).not.toThrow();
  });

  describe("sensitive data redaction", () => {
    it("redacts configured sensitive fields", () => {
      // Re-create logger after spying on stdout so pino binds to the spy
      jest.resetModules();
      const writeSpy = jest
        .spyOn(process.stdout, "write")
        .mockImplementation(() => true);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { logger: freshLogger } = require("../../../src/config/logger");

      freshLogger.info(
        {
          password: "super-secret",
          token: "token-value",
          secret: "another-secret",
          req: {
            headers: {
              authorization: "Bearer abc123",
              cookie: "session=xyz",
            },
            cookies: {
              session: "xyz",
            },
          },
          res: {
            headers: {
              "set-cookie": ["session=xyz"],
            },
          },
        },
        "sensitive"
      );

      expect(writeSpy).toHaveBeenCalled();
      const payload = writeSpy.mock.calls.at(-1)?.[0];
      expect(payload).toBeDefined();

      const logLine =
        typeof payload === "string" ? payload.trim() : String(payload).trim();
      const parsed = JSON.parse(logLine);

      expect(parsed.password).toBe("[Redacted]");
      expect(parsed.token).toBe("[Redacted]");
      expect(parsed.secret).toBe("[Redacted]");
      expect(parsed.req.headers.authorization).toBe("[Redacted]");
      expect(parsed.req.headers.cookie).toBe("[Redacted]");
      expect(parsed.req.cookies).toBe("[Redacted]");
      expect(parsed.res.headers["set-cookie"]).toBe("[Redacted]");

      writeSpy.mockRestore();
    });
  });
});
