import request from "supertest";
import express from "express";
import rateLimit from "express-rate-limit";

describe("Rate Limiting", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();

    // Create a simple rate limiter for testing (very low limits)
    const testRateLimit = rateLimit({
      windowMs: 1000, // 1 second window
      max: 2, // Allow only 2 requests per second for testing
      message: {
        error: "Too many requests, please try again later.",
        retryAfter: "1 second",
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    app.use(testRateLimit);
    app.get("/test", (req, res) => {
      res.json({ success: true });
    });
  });

  it("should allow requests within the rate limit", async () => {
    // First request should succeed
    const response1 = await request(app).get("/test").expect(200);

    expect(response1.body).toEqual({ success: true });

    // Second request should also succeed
    const response2 = await request(app).get("/test").expect(200);

    expect(response2.body).toEqual({ success: true });
  });

  it("should block requests that exceed the rate limit", async () => {
    // Make the maximum allowed requests
    await request(app).get("/test").expect(200);
    await request(app).get("/test").expect(200);

    // Third request should be rate limited
    const response = await request(app).get("/test").expect(429);

    expect(response.body).toEqual({
      error: "Too many requests, please try again later.",
      retryAfter: "1 second",
    });
  });

  it("should include rate limit headers", async () => {
    const response = await request(app).get("/test").expect(200);

    // Check for standard rate limit headers
    expect(response.headers).toHaveProperty("ratelimit-limit");
    expect(response.headers).toHaveProperty("ratelimit-remaining");
    expect(response.headers).toHaveProperty("ratelimit-reset");
  });
});
