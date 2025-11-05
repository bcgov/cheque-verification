import pinoHttp from "pino-http";
import { v4 as uuidv4 } from "uuid";
import { IncomingMessage } from "http";
import { logger } from "../config/logger";

// Request logging middleware that only includes reqId, method, status and client IP
export const requestLogger = pinoHttp({
  logger,
  genReqId: (req: IncomingMessage) => {
    // prefer an incoming request id header, else generate one
    const existingId =
      req.headers["x-request-id"] || req.headers["X-Request-ID"];
    return Array.isArray(existingId) ? existingId[0] : existingId || uuidv4();
  },
  // Add minimal structured props to every request log
  customProps: (req, res) => ({
    reqId: (req as any).id,
    clientIp:
      req.headers["x-forwarded-for"] ||
      (req as any).ip || // Express specific
      req.socket?.remoteAddress,
  }),
  // Only serialize minimal fields from req/res
  serializers: {
    req: (req) => {
      // Prefer Express path (no query params)
      const rawPath =
        (req as any).path || (req.url?.split("?")[0] ?? req.url ?? "");

      // Mask numeric and UUID-like segments
      const sanitizedPath = rawPath
        // Replace numbers like /12345 -> /:id
        .replace(/\/\d+/g, "/:id")
        // Replace UUID-like strings (optional)
        .replace(/\/[0-9a-fA-F-]{8,36}(?=\/|$)/g, "/:id");

      return {
        method: req.method,
        path: sanitizedPath,
      };
    },
    res: (res) => ({ status: res.statusCode }),
  },
  // Keep autoLogging (logs a single entry when response ends).
  // Ignore health check endpoints to reduce log noise
  autoLogging: {
    ignore: (req) => {
      const url = req.url || "";
      return url === "/health" || url.startsWith("/health");
    },
  },
});
