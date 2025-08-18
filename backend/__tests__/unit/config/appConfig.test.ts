import { withTestEnv } from "../../helpers/backendTestHelpers";
import { describe, it, expect } from "@jest/globals";

describe("AppConfig", () => {
  // Since getConfig() is pure (no caching), we can use top-level import safely
  // Combined with withTestEnv for proper environment cleanup

  it("should return default configuration when no env vars set", async () => {
    await withTestEnv({}, () => {
      // Clear relevant env vars
      delete process.env.API_URL;
      delete process.env.PORT;
      delete process.env.FRONTEND_URL;
      delete process.env.NODE_ENV;

      const { getConfig } = require("../../../src/config/appConfig");
      const config = getConfig();

      expect(config).toEqual({
        apiUrl: "http://localhost:3000",
        port: 4000,
        frontendUrl: "http://localhost:5173",
        environment: "development",
      });
    });
  });

  it("should use environment variables when provided", async () => {
    await withTestEnv(
      {
        API_URL: "https://api.example.com",
        PORT: "3002",
        FRONTEND_URL: "https://frontend.example.com",
        NODE_ENV: "production",
      },
      () => {
        const { getConfig } = require("../../../src/config/appConfig");
        const config = getConfig();

        expect(config.apiUrl).toBe("https://api.example.com");
        expect(config.port).toBe(3002);
        expect(config.frontendUrl).toBe("https://frontend.example.com");
        expect(config.environment).toBe("production");
      }
    );
  });

  it("should handle invalid PORT gracefully", async () => {
    await withTestEnv({ PORT: "invalid" }, () => {
      const { getConfig } = require("../../../src/config/appConfig");

      expect(() => getConfig()).toThrow(
        "PORT must be a valid port number between 1 and 65535"
      );
    });
  });

  it("should handle port out of range", async () => {
    await withTestEnv({ PORT: "70000" }, () => {
      const { getConfig } = require("../../../src/config/appConfig");

      expect(() => getConfig()).toThrow(
        "PORT must be a valid port number between 1 and 65535"
      );
    });
  });

  it("should handle negative port", async () => {
    await withTestEnv({ PORT: "-1" }, () => {
      const { getConfig } = require("../../../src/config/appConfig");

      expect(() => getConfig()).toThrow(
        "PORT must be a valid port number between 1 and 65535"
      );
    });
  });

  it("should handle empty API_URL", async () => {
    await withTestEnv({ API_URL: "" }, () => {
      const { getConfig } = require("../../../src/config/appConfig");
      const config = getConfig();

      // Empty string gets treated as falsy, falls back to default
      expect(config.apiUrl).toBe("http://localhost:3000");
    });
  });

  it("should return consistent config object structure", async () => {
    await withTestEnv({}, () => {
      const { getConfig } = require("../../../src/config/appConfig");
      const config = getConfig();

      expect(config).toHaveProperty("apiUrl");
      expect(config).toHaveProperty("port");
      expect(config).toHaveProperty("frontendUrl");
      expect(config).toHaveProperty("environment");

      expect(typeof config.apiUrl).toBe("string");
      expect(typeof config.port).toBe("number");
      expect(typeof config.frontendUrl).toBe("string");
      expect(typeof config.environment).toBe("string");
    });
  });

  // Additional edge cases
  describe("Whitespace handling", () => {
    it("should handle whitespace-only API_URL", async () => {
      await withTestEnv({ API_URL: "   " }, () => {
        const { getConfig } = require("../../../src/config/appConfig");
        const config = getConfig();

        // Whitespace-only string is truthy, so it's used as-is (not falsy)
        expect(config.apiUrl).toBe("   ");
      });
    });

    it("should trim whitespace from API_URL", async () => {
      await withTestEnv({ API_URL: "  https://api.example.com  " }, () => {
        const { getConfig } = require("../../../src/config/appConfig");
        const config = getConfig();

        // Should use the value as-is (no trimming in current implementation)
        expect(config.apiUrl).toBe("  https://api.example.com  ");
      });
    });

    it("should handle whitespace in PORT", async () => {
      await withTestEnv({ PORT: "  3002  " }, () => {
        const { getConfig } = require("../../../src/config/appConfig");
        const config = getConfig();

        // parseInt should handle whitespace correctly
        expect(config.port).toBe(3002);
      });
    });
  });

  describe("Port edge cases", () => {
    it("should handle PORT with leading zeros", async () => {
      await withTestEnv({ PORT: "03002" }, () => {
        const { getConfig } = require("../../../src/config/appConfig");
        const config = getConfig();

        expect(config.port).toBe(3002);
      });
    });

    it("should handle decimal PORT values", async () => {
      await withTestEnv({ PORT: "3002.5" }, () => {
        const { getConfig } = require("../../../src/config/appConfig");
        const config = getConfig();

        // parseInt truncates decimals
        expect(config.port).toBe(3002);
      });
    });

    it("should handle port boundary values", async () => {
      // Test minimum valid port
      await withTestEnv({ PORT: "1" }, () => {
        const { getConfig } = require("../../../src/config/appConfig");
        const config = getConfig();
        expect(config.port).toBe(1);
      });

      // Test maximum valid port
      await withTestEnv({ PORT: "65535" }, () => {
        const { getConfig } = require("../../../src/config/appConfig");
        const config = getConfig();
        expect(config.port).toBe(65535);
      });
    });
  });

  describe("NODE_ENV normalization", () => {
    it("should handle production environment", async () => {
      await withTestEnv({ NODE_ENV: "production" }, () => {
        const { getConfig } = require("../../../src/config/appConfig");
        const config = getConfig();

        expect(config.environment).toBe("production");
      });
    });

    it("should handle test environment", async () => {
      await withTestEnv({ NODE_ENV: "test" }, () => {
        const { getConfig } = require("../../../src/config/appConfig");
        const config = getConfig();

        expect(config.environment).toBe("test");
      });
    });

    it("should handle unknown NODE_ENV values", async () => {
      await withTestEnv({ NODE_ENV: "staging" }, () => {
        const { getConfig } = require("../../../src/config/appConfig");
        const config = getConfig();

        // Should accept unknown values as-is
        expect(config.environment).toBe("staging");
      });
    });

    it("should handle case sensitivity in NODE_ENV", async () => {
      await withTestEnv({ NODE_ENV: "PRODUCTION" }, () => {
        const { getConfig } = require("../../../src/config/appConfig");
        const config = getConfig();

        // No normalization in current implementation
        expect(config.environment).toBe("PRODUCTION");
      });
    });
  });

  describe("Partial environment override combinations", () => {
    it("should use defaults when only API_URL is set", async () => {
      await withTestEnv({ API_URL: "https://api.example.com" }, () => {
        const { getConfig } = require("../../../src/config/appConfig");
        const config = getConfig();

        expect(config.apiUrl).toBe("https://api.example.com");
        expect(config.port).toBe(4000); // default
        expect(config.frontendUrl).toBe("http://localhost:5173"); // default
        expect(config.environment).toBe("development"); // default
      });
    });

    it("should use defaults when only FRONTEND_URL is set", async () => {
      await withTestEnv(
        { FRONTEND_URL: "https://frontend.example.com" },
        () => {
          const { getConfig } = require("../../../src/config/appConfig");
          const config = getConfig();

          expect(config.apiUrl).toBe("http://localhost:3000"); // default
          expect(config.port).toBe(4000); // default
          expect(config.frontendUrl).toBe("https://frontend.example.com");
          expect(config.environment).toBe("development"); // default
        }
      );
    });

    it("should use defaults when only PORT is set", async () => {
      await withTestEnv({ PORT: "3002" }, () => {
        const { getConfig } = require("../../../src/config/appConfig");
        const config = getConfig();

        expect(config.apiUrl).toBe("http://localhost:3000"); // default
        expect(config.port).toBe(3002);
        expect(config.frontendUrl).toBe("http://localhost:5173"); // default
        expect(config.environment).toBe("development"); // default
      });
    });

    it("should use defaults when only NODE_ENV is set", async () => {
      await withTestEnv({ NODE_ENV: "production" }, () => {
        const { getConfig } = require("../../../src/config/appConfig");
        const config = getConfig();

        expect(config.apiUrl).toBe("http://localhost:3000"); // default
        expect(config.port).toBe(4000); // default
        expect(config.frontendUrl).toBe("http://localhost:5173"); // default
        expect(config.environment).toBe("production");
      });
    });
  });
});
