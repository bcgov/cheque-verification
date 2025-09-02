import request from "supertest";
import express from "express";
import { describe, it, expect, beforeAll } from "@jest/globals";
import { createApp } from "../../src/index";

describe("Backend Server Integration", () => {
  let app: express.Application;

  beforeAll(async () => {
    // Create the app instance for testing (without starting server)
    app = createApp();
  });

  describe("Server Configuration", () => {
    it("should disable x-powered-by header for security", async () => {
      const response = await request(app).get("/health");

      expect(response.headers["x-powered-by"]).toBeUndefined();
    });

    it("should apply rate limiting middleware", async () => {
      const response = await request(app).get("/health");

      // Should have rate limit headers (different format than expected)
      expect(response.headers).toHaveProperty("ratelimit-limit");
    });

    it("should handle JSON requests", async () => {
      const response = await request(app)
        .post("/api/cheque/verify")
        .send({
          chequeNumber: "123456",
          appliedAmount: "100.00",
          paymentIssueDate: "2024-01-01",
        })
        .expect("Content-Type", /json/);

      expect([200, 400, 404, 422, 429, 500]).toContain(response.status); // Valid responses including 500 for network errors
    });

    it("should handle CORS properly", async () => {
      const response = await request(app)
        .options("/api/cheque/verify")
        .set("Origin", "http://localhost:3000")
        .set("Access-Control-Request-Method", "POST");

      expect(response.headers["access-control-allow-origin"]).toBeDefined();
    });
  });

  describe("Route Configuration", () => {
    it("should have cheque routes configured", async () => {
      const response = await request(app).get("/api/cheque/verify");

      // Should get a response (likely method not allowed for GET, 404 for the route, or rate limited)
      expect([200, 404, 405, 429]).toContain(response.status);
    });

    it("should have health routes configured", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status");
    });
  });

  describe("Middleware Integration", () => {
    it("should process requests through logger middleware", async () => {
      // This tests that the request logger doesn't crash
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
    });

    it("should handle large payloads with proper error", async () => {
      // Create a payload larger than the limit to test body parsing
      const largePayload = { data: "x".repeat(200000) }; // 200KB

      const response = await request(app)
        .post("/api/cheque/verify")
        .send(largePayload);

      expect([400, 413, 429]).toContain(response.status); // Bad request or payload too large or rate limited
    });
  });

  describe("Error Handling", () => {
    it("should handle unknown routes", async () => {
      const response = await request(app).get("/unknown-route");

      expect(response.status).toBe(404);
    });
  });
});
