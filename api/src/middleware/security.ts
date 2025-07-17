import helmet from "helmet";

// Internal API security middleware - optimized for server-to-server communication
// No browser access, so CSP and CORS protections are unnecessary
export const securityMiddleware = helmet({
  contentSecurityPolicy: false, // Not needed for JSON API responses
  crossOriginResourcePolicy: false, // No cross-origin browser loads
});
