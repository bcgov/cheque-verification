import slowDown from "express-slow-down";

export const chequeVerifySlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes (matches rate limiter window)
  delayAfter: 10, // Allow 10 requests per window at full speed
  delayMs: (hits) => (hits - 10) * 1000, // Add 1 second delay per request after delayAfter
  maxDelayMs: 10000, // Maximum delay of 10 seconds
});

/**
 * Progressive slow-down for general requests
 * More lenient than cheque verification slow-down
 */
export const globalSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 10, // Allow 10 requests per window at full speed
  delayMs: (hits) => (hits - 10) * 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 5000, // Maximum delay of 5 seconds
});
