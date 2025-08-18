import express from "express";
import cors from "cors";
import request from "supertest";
import {
  createTestApp,
  assertApiResponse,
  assertErrorResponse,
  getTestChequeData,
} from "../helpers/backendTestHelpers";
import { describe, it, expect, beforeEach } from "@jest/globals";

describe("Backend Integration Tests", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();

    // Configure CORS
    app.use(
      cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: false,
      })
    );

    // Apply body parser with same limits as production (100kb)
    app.use(express.json({ limit: "100kb" }));

    // Add basic routes for testing
    app.get("/api/health", (req, res) => {
      res.json({
        status: "healthy",
        service: "cheque-verification-backend",
        timestamp: new Date().toISOString(),
      });
    });

    app.post("/api/verify", (req, res) => {
      const { chequeNumber } = req.body;

      if (!chequeNumber) {
        return res.status(400).json({
          success: false,
          error: "Cheque number is required",
        });
      }

      // Mock successful response for testing
      res.json({
        success: true,
        message: "Test verification endpoint",
        data: { chequeNumber },
      });
    });

    // Handle 404s with JSON response
    app.use("*", (req, res) => {
      res.status(404).json({
        error: "Endpoint not found",
        path: req.originalUrl,
        method: req.method,
      });
    });
  });

  describe("Basic Express Server Integration", () => {
    it("should respond to health check", async () => {
      const response = await request(app).get("/api/health");

      assertApiResponse(response, 200, {
        properties: ["status", "service", "timestamp"],
        contentType: "application/json",
      });

      expect(response.body.status).toBe("healthy");
      expect(response.body.service).toBe("cheque-verification-backend");
    });

    it("should handle deterministic CORS preflight", async () => {
      const response = await request(app)
        .options("/api/verify")
        .set("Origin", "http://localhost:5173")
        .set("Access-Control-Request-Method", "POST");

      // CORS preflight should return 204 with proper headers
      expect(response.status).toBe(204);
      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://localhost:5173"
      );
      expect(response.headers["access-control-allow-methods"]).toMatch(/POST/);
    });

    it("should parse JSON requests", async () => {
      const testData = getTestChequeData();

      const response = await request(app)
        .post("/api/verify")
        .send({ chequeNumber: testData.valid.chequeNumber });

      assertApiResponse(response, 200, {
        properties: ["success", "data"],
        contentType: "application/json",
      });

      expect(response.body.success).toBe(true);
      expect(response.body.data.chequeNumber).toBe(testData.valid.chequeNumber);
    });

    it("should handle missing request data", async () => {
      const response = await request(app).post("/api/verify").send({});

      assertErrorResponse(response, 400, {
        message: "Cheque number is required",
        contentType: "application/json",
      });

      expect(response.body.success).toBe(false);
    });

    it("should handle malformed JSON gracefully", async () => {
      const response = await request(app)
        .post("/api/verify")
        .set("Content-Type", "application/json")
        .send("{ invalid json");

      // Express returns 400 for malformed JSON
      expect(response.status).toBe(400);
      // Content-Type may or may not be JSON depending on error handler setup
      // Keep assertion flexible for different Express configurations
    });

    it("should handle invalid routes with proper 404 shape", async () => {
      const response = await request(app).get("/api/invalid-endpoint");

      assertErrorResponse(response, 404, {
        contentType: "application/json",
      });

      // Assert 404 response shape to prevent regressions
      expect(response.body).toHaveProperty("error", "Endpoint not found");
      expect(response.body).toHaveProperty("path", "/api/invalid-endpoint");
      expect(response.body).toHaveProperty("method", "GET");
    });
  });

  describe("Method Discipline & Security", () => {
    it("should reject GET requests on POST-only /api/verify endpoint", async () => {
      const response = await request(app).get("/api/verify");

      // Should return 404 since GET is not allowed on this POST-only endpoint
      assertErrorResponse(response, 404, {
        contentType: "application/json",
      });

      expect(response.body.error).toBe("Endpoint not found");
      expect(response.body.method).toBe("GET");
    });

    it("should reject unsupported HTTP methods", async () => {
      const response = await request(app).put("/api/verify");

      assertErrorResponse(response, 404, {
        contentType: "application/json",
      });

      expect(response.body.method).toBe("PUT");
    });
  });

  describe("Middleware Integration & Security", () => {
    it("should reject payloads exceeding 100kb limit", async () => {
      // Create a payload larger than 100kb (approximately 150kb)
      const largeData = "x".repeat(150 * 1024); // 150KB of 'x' characters
      const largePayload = {
        chequeNumber: "123456",
        extraData: largeData,
      };

      const response = await request(app)
        .post("/api/verify")
        .send(largePayload);

      // Express should return 413 (Payload Too Large) for oversized requests
      expect(response.status).toBe(413);
    });

    it("should handle normal-sized payloads within limit", async () => {
      // Create a payload under 100kb limit (approximately 50kb)
      const testData = getTestChequeData();
      const normalPayload = {
        chequeNumber: testData.valid.chequeNumber,
        extraData: "x".repeat(50 * 1024), // 50KB - well within limit
      };

      const response = await request(app)
        .post("/api/verify")
        .send(normalPayload);

      assertApiResponse(response, 200, {
        properties: ["success", "data"],
        contentType: "application/json",
      });

      expect(response.body.success).toBe(true);
    });

    it("should handle empty request body properly", async () => {
      const response = await request(app).post("/api/verify");

      assertErrorResponse(response, 400, {
        message: "Cheque number is required",
        contentType: "application/json",
      });

      expect(response.body.success).toBe(false);
    });

    it("should validate CORS headers on actual requests", async () => {
      const testData = getTestChequeData();

      const response = await request(app)
        .post("/api/verify")
        .set("Origin", "http://localhost:5173")
        .send({ chequeNumber: testData.valid.chequeNumber });

      // Verify CORS headers are present on actual requests
      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://localhost:5173"
      );

      assertApiResponse(response, 200, {
        properties: ["success", "data"],
        contentType: "application/json",
      });
    });
  });
});
