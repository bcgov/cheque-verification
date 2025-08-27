import request from "supertest";
import express from "express";
import { createAppForTesting } from "../helpers/chequeTestHelpers";

describe("API Server Integration", () => {
  let app: express.Application;

  beforeAll(async () => {
    app = await createAppForTesting();
  });

  describe("Server Configuration", () => {
    it("should disable x-powered-by header for security", async () => {
      const response = await request(app).get("/api/v1/cheques/test");

      expect(response.headers["x-powered-by"]).toBeUndefined();
    });

    it("should handle JSON requests", async () => {
      const response = await request(app)
        .post("/api/v1/cheques/verify")
        .send({ chequeNumber: "123456" })
        .expect("Content-Type", /json/);

      expect([200, 400, 404]).toContain(response.status); // Valid responses
    });

    it("should handle CORS properly", async () => {
      const response = await request(app)
        .options("/api/v1/cheques/verify")
        .set("Origin", "http://localhost:4000")
        .set("Access-Control-Request-Method", "POST");

      expect(response.headers["access-control-allow-origin"]).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for unknown routes", async () => {
      const response = await request(app).get("/unknown-route");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        error: "Not found",
      });
    });

    it("should return 404 for unknown API routes", async () => {
      const response = await request(app).get("/api/v1/unknown");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        error: "Not found",
      });
    });
  });

  describe("Health Check", () => {
    it("should respond to basic API requests", async () => {
      const response = await request(app).get("/api/v1/cheques/verify");

      // Should get a response (even if it's an error due to missing params)
      expect([200, 400, 404, 405]).toContain(response.status);
      expect(response.body).toHaveProperty("success");
    });
  });
});
