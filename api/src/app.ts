import "express-async-errors";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { requestLogger } from "./middleware/logger.js";
import routes from "./routes/index.js";
import { HttpError } from "./middleware/validation.js";

export interface CreateAppOptions {
  allowedOrigins?: string[];
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const { allowedOrigins } = options;

  app.disable("x-powered-by");

  // Trust proxy for X-Forwarded-For headers (required for OpenShift/rate limiting)
  app.set("trust proxy", true);

  const origins = allowedOrigins?.length
    ? allowedOrigins
    : ["http://localhost:4000"];

  app.use(
    cors({
      origin: origins,
      credentials: false,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());
  app.use(requestLogger);
  app.use("/api/v1", routes);

  app.use((req, res) =>
    res.status(404).json({ success: false, error: "Not found" })
  );

  app.use(
    (err: HttpError, req: Request, res: Response, _next: NextFunction) => {
      console.error(err.stack || err);
      const status = err.statusCode || 500;
      const message = err.message || "Internal server error";
      res.status(status).json({ success: false, error: message });
    }
  );

  return app;
}
