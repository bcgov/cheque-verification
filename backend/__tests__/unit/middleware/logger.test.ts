import express from "express";
import request from "supertest";
import { requestLogger } from "../../../src/middleware/logger";
import { describe, it, expect } from "@jest/globals";

/** The mocked uuid value from __tests__/setup.ts */
const MOCK_UUID = "test-uuid-1234";

const createApp = (): express.Application => {
  const app = express();
  app.use(requestLogger);
  app.get("/test", (req, res) => {
    res.json({ reqId: req.headers["x-request-id"] });
  });
  return app;
};

describe("requestLogger - request ID sanitization", () => {
  it("should preserve a valid x-request-id", async () => {
    const res = await request(createApp())
      .get("/test")
      .set("x-request-id", "550e8400-e29b-41d4-a716-446655440000");

    expect(res.body.reqId).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("should reject IDs with disallowed characters", async () => {
    const res = await request(createApp())
      .get("/test")
      .set("x-request-id", "<script>alert(1)</script>");

    expect(res.body.reqId).toBe(MOCK_UUID);
  });

  it("should reject IDs exceeding 64 characters", async () => {
    const res = await request(createApp())
      .get("/test")
      .set("x-request-id", "a".repeat(65));

    expect(res.body.reqId).toBe(MOCK_UUID);
  });

  it("should fall back to UUID when header is missing", async () => {
    const res = await request(createApp()).get("/test");

    expect(res.body.reqId).toBe(MOCK_UUID);
  });
});
