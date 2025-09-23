import { createApp } from "../../src/app.js";
import request from "supertest";
import express from "express";

describe("createApp", () => {
  describe("Application Creation", () => {
    it("should create an Express app with default configuration", () => {
      const app = createApp();
      expect(app).toBeDefined();
      expect(typeof app.listen).toBe("function");
    });

    it("should create an Express app with custom allowed origins", () => {
      const customOrigins = ["http://localhost:3000", "https://example.com"];
      const app = createApp({ allowedOrigins: customOrigins });
      expect(app).toBeDefined();
    });

    it("should create an Express app with empty allowed origins array", () => {
      const app = createApp({ allowedOrigins: [] });
      expect(app).toBeDefined();
    });
  });

  describe("Security Headers", () => {
    it("should disable x-powered-by header", async () => {
      const app = createApp();
      const response = await request(app).get("/api/v1/health");
      expect(response.headers["x-powered-by"]).toBeUndefined();
    });
  });

  describe("CORS Configuration", () => {
    it("should handle CORS with default origins", async () => {
      const app = createApp();
      const response = await request(app)
        .options("/api/v1/health")
        .set("Origin", "http://localhost:4000")
        .set("Access-Control-Request-Method", "GET");

      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://localhost:4000"
      );
    });

    it("should handle CORS with custom origins", async () => {
      const customOrigins = ["https://example.com"];
      const app = createApp({ allowedOrigins: customOrigins });
      const response = await request(app)
        .options("/api/v1/health")
        .set("Origin", "https://example.com")
        .set("Access-Control-Request-Method", "GET");

      expect(response.headers["access-control-allow-origin"]).toBe(
        "https://example.com"
      );
    });

    it("should reject CORS requests from unauthorized origins", async () => {
      const app = createApp({ allowedOrigins: ["https://authorized.com"] });
      const response = await request(app)
        .options("/api/v1/health")
        .set("Origin", "https://unauthorized.com")
        .set("Access-Control-Request-Method", "GET");

      expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    });
  });

  describe("Request Handling", () => {
    it("should handle JSON requests", async () => {
      const app = createApp();
      const response = await request(app)
        .post("/api/v1/health")
        .send({ test: "data" })
        .set("Content-Type", "application/json");

      // Should parse JSON and respond (even if endpoint doesn't exist)
      expect(typeof response.body).toBe("object");
    });

    it("should serve health endpoint", async () => {
      const app = createApp();
      const response = await request(app).get("/api/v1/health");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "OK",
        timestamp: expect.any(String),
      });
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for unknown routes", async () => {
      const app = createApp();
      const response = await request(app).get("/unknown-route");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        error: "Not found",
      });
    });

    it("should return 404 for unknown API routes", async () => {
      const app = createApp();
      const response = await request(app).get("/api/v1/unknown");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        error: "Not found",
      });
    });

    it("should handle middleware errors with custom status codes", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Mock the JSON middleware to throw an error
      const mockJson = jest.fn().mockImplementation((req, res, next) => {
        const error = new Error("Invalid JSON") as any;
        error.statusCode = 422;
        next(error);
      });

      // We need to replace express.json temporarily
      const originalJson = express.json;
      (express as any).json = () => mockJson;

      const app = createApp();

      const response = await request(app)
        .post("/api/v1/health")
        .send({ test: "data" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        success: false,
        error: "Invalid JSON",
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid JSON")
      );

      // Restore
      (express as any).json = originalJson;
      consoleErrorSpy.mockRestore();
    });

    it("should handle middleware errors with default 500 status", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Mock the JSON middleware to throw an error without status
      const mockJson = jest.fn().mockImplementation((req, res, next) => {
        const error = new Error("Middleware error");
        next(error);
      });

      const originalJson = express.json;
      (express as any).json = () => mockJson;

      const app = createApp();

      const response = await request(app)
        .post("/api/v1/health")
        .send({ test: "data" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: "Middleware error",
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Middleware error")
      );

      (express as any).json = originalJson;
      consoleErrorSpy.mockRestore();
    });

    it("should handle errors without message with default message", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const mockJson = jest.fn().mockImplementation((req, res, next) => {
        const error = new Error() as any;
        error.statusCode = 400;
        error.message = "";
        next(error);
      });

      const originalJson = express.json;
      (express as any).json = () => mockJson;

      const app = createApp();

      const response = await request(app)
        .post("/api/v1/health")
        .send({ test: "data" })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: "Internal server error",
      });

      (express as any).json = originalJson;
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Middleware Integration", () => {
    it("should include request logger middleware", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const app = createApp();

      await request(app).get("/api/v1/health");

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(
          /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z - GET \/api\/v1\/health/
        )
      );

      consoleSpy.mockRestore();
    });
  });
});
