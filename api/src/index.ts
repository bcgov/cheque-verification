import "express-async-errors"; // catches async throws for you
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { requestLogger } from "./middleware/logger";
import routes from "./routes";
import { initializeDbPool, closeDbPool } from "./config/database";
import { HttpError} from "./middleware/validation";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json()); // parse JSON bodies
app.use(requestLogger);
// Use the main router and apply the version prefix
app.use("/api/v1", routes);

// 404 handler
app.use((req, res) =>
  res.status(404).json({ success: false, error: "Not found" })
);

// Error handler
app.use((err: HttpError, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack || err); // swap in Winston later
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ success: false, error: message });
});

async function startServer() {
  await initializeDbPool();
  const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });

  // graceful shutdown
  const shutdown = async () => {
    console.log("Shutting down…");
    server.close();
    await closeDbPool();
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer().catch((err) => {
  console.error("Startup error:", err);
  process.exit(1);
});