import helmet from "helmet";

// Internal API security middleware - optimized for server-to-server communication
// No browser access, so CSP and CORS protections are unnecessary
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"], // Block all sources by default
      scriptSrc: ["'self'"], // Allow scripts only from the same origin
      connectSrc: ["'self'"], // Restrict connections to the same origin
    },
  }, // Minimal CSP for server-to-server communication
  crossOriginResourcePolicy: false, // No cross-origin browser loads
});
