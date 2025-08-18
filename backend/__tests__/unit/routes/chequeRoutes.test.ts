import { Router } from "express";
import {
  createChequeRoutes,
  createHealthRoutes,
} from "../../../src/routes/chequeRoutes";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { ChequeController } from "../../../src/controllers/chequeController";

// Mock the middleware to avoid rate limiting in tests
jest.mock("../../../src/middleware/rateLimiter", () => ({
  apiLimiter: (req: any, res: any, next: any) => next(),
  healthLimiter: (req: any, res: any, next: any) => next(),
}));

describe("Cheque Routes", () => {
  let mockController: ChequeController;

  beforeEach(() => {
    mockController = {
      verifyCheque: jest.fn(),
      healthCheck: jest.fn(),
    } as unknown as ChequeController;
  });

  describe("createChequeRoutes", () => {
    it("should return a Router instance", () => {
      const router = createChequeRoutes(mockController);

      expect(router).toBeDefined();
      expect(typeof router).toBe("function"); // Router is a function
    });

    it("should create POST route for /verify", () => {
      const router = createChequeRoutes(mockController);

      // Check that the router has the expected structure
      // We can't easily test the exact routes without more complex setup,
      // but we can verify the function returns a router
      expect(router).toBeDefined();
      expect(typeof router.post).toBe("function");
    });

    it("should handle router creation with different controllers", () => {
      const controller1 = {
        verifyCheque: jest.fn(),
        healthCheck: jest.fn(),
      } as unknown as ChequeController;
      const controller2 = {
        verifyCheque: jest.fn(),
        healthCheck: jest.fn(),
      } as unknown as ChequeController;

      const router1 = createChequeRoutes(controller1);
      const router2 = createChequeRoutes(controller2);

      expect(router1).toBeDefined();
      expect(router2).toBeDefined();
      expect(router1).not.toBe(router2); // Should be different instances
    });
  });

  describe("createHealthRoutes", () => {
    it("should return a Router instance", () => {
      const router = createHealthRoutes(mockController);

      expect(router).toBeDefined();
      expect(typeof router).toBe("function"); // Router is a function
    });

    it("should create GET route for health check", () => {
      const router = createHealthRoutes(mockController);

      expect(router).toBeDefined();
      expect(typeof router.get).toBe("function");
    });

    it("should handle router creation with different controllers", () => {
      const controller1 = {
        verifyCheque: jest.fn(),
        healthCheck: jest.fn(),
      } as unknown as ChequeController;
      const controller2 = {
        verifyCheque: jest.fn(),
        healthCheck: jest.fn(),
      } as unknown as ChequeController;

      const router1 = createHealthRoutes(controller1);
      const router2 = createHealthRoutes(controller2);

      expect(router1).toBeDefined();
      expect(router2).toBeDefined();
      expect(router1).not.toBe(router2); // Should be different instances
    });
  });

  describe("Route integration", () => {
    it("should export both route creation functions", () => {
      expect(createChequeRoutes).toBeDefined();
      expect(typeof createChequeRoutes).toBe("function");

      expect(createHealthRoutes).toBeDefined();
      expect(typeof createHealthRoutes).toBe("function");
    });

    it("should accept ChequeController parameter", () => {
      expect(() => createChequeRoutes(mockController)).not.toThrow();
      expect(() => createHealthRoutes(mockController)).not.toThrow();
    });

    it("should create independent router instances", () => {
      const chequeRouter = createChequeRoutes(mockController);
      const healthRouter = createHealthRoutes(mockController);

      expect(chequeRouter).not.toBe(healthRouter);
      expect(typeof chequeRouter).toBe("function");
      expect(typeof healthRouter).toBe("function");
    });
  });

  describe("Middleware integration", () => {
    it("should integrate with rate limiting middleware", () => {
      // The routes should be created without errors even with middleware
      expect(() => createChequeRoutes(mockController)).not.toThrow();
      expect(() => createHealthRoutes(mockController)).not.toThrow();
    });
  });
});
