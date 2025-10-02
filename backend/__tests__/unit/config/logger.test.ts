import { logger } from "../../../src/config/logger";

describe("Logger Configuration", () => {
  describe("logger instance", () => {
    it("should be defined", () => {
      expect(logger).toBeDefined();
    });

    it("should have required logging methods", () => {
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.error).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.debug).toBe("function");
    });

    it("should be a pino logger instance", () => {
      // Check that it has pino-specific properties
      expect(logger).toHaveProperty("level");
      expect(logger).toHaveProperty("version");
    });

    it("should have correct service name configured", () => {
      // Check that logger has the service name in its configuration
      expect(logger.bindings()).toHaveProperty(
        "service",
        "cheque-verification-backend"
      );
    });
  });

  describe("log level configuration", () => {
    const originalLogLevel = process.env.LOG_LEVEL;

    afterEach(() => {
      // Restore original log level
      if (originalLogLevel) {
        process.env.LOG_LEVEL = originalLogLevel;
      } else {
        delete process.env.LOG_LEVEL;
      }
    });

    it("should use default info level when LOG_LEVEL not set", () => {
      delete process.env.LOG_LEVEL;

      // Re-import to get fresh logger with new env
      jest.resetModules();
      const { logger: freshLogger } = require("../../../src/config/logger");

      expect(freshLogger.level).toBe("info");
    });

    it("should respect LOG_LEVEL environment variable", () => {
      process.env.LOG_LEVEL = "debug";

      // Re-import to get fresh logger with new env
      jest.resetModules();
      const { logger: freshLogger } = require("../../../src/config/logger");

      expect(freshLogger.level).toBe("debug");
    });
  });

  describe("logging methods", () => {
    it("should not throw when calling logging methods", () => {
      // These tests just ensure the methods don't throw errors
      // The actual output is tested in integration scenarios
      expect(() => logger.info("Test info message")).not.toThrow();
      expect(() => logger.error("Test error message")).not.toThrow();
      expect(() => logger.warn("Test warn message")).not.toThrow();
      expect(() => logger.debug("Test debug message")).not.toThrow();
    });

    it("should handle different log levels", () => {
      // Test that we can call methods at different levels
      expect(() => {
        logger.trace("trace");
        logger.debug("debug");
        logger.info("info");
        logger.warn("warn");
        logger.error("error");
        logger.fatal("fatal");
      }).not.toThrow();
    });
  });
});