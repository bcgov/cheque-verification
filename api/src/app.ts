import "express-async-errors";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { requestLogger } from "./middleware/logger";
import routes from "./routes/index";
import { HttpError } from "./middleware/validation";
import logger from "./config/logger";

export interface CreateAppOptions {
  allowedOrigins?: string[];
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const { allowedOrigins } = options;

  app.disable("x-powered-by");

  // Trust proxy for X-Forwarded-For headers (OpenShift router)
  // Trust first proxy only (more secure than 'true')
  app.set("trust proxy", 1);
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
      logger.error({ err }, "Error processing request");
      const status = err.statusCode || 500;
      const message =
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message;
      res.status(status).json({ success: false, error: message });
    }
  );

  return app;
}
