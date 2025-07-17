import express, { Request, Response } from "express";
import { Server } from "http";
import dotenv from "dotenv";
import { securityMiddleware } from "./middleware/security";
import { requestLogger } from "./middleware/logger";
import routes from "./routes";
import { initializeDbPool, closeDbPool } from "./config/database";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(securityMiddleware);

// Request logger middleware
app.use(requestLogger);

// Use routes
app.use(routes);

// Start server
async function startServer(): Promise<Server | undefined> {
  try {
    // Initialize DB pool
    await initializeDbPool();

    const server = app.listen(port, () => {
      // TODO: Replace with proper logging
      // Log: Server started on port ${port}, Database connected
    });

    return server;
  } catch (error) {
    // TODO: Replace with proper logging
    // Log: Failed to start server - error details
    process.exit(1);
  }
}

// Handle graceful shutdown for both development and production
const gracefulShutdown = async (server: Server, signal: string) => {
  // TODO: Replace with proper logging
  // Log: ${signal} received, starting graceful shutdown

  // Set a forced timeout
  const forceTimeout = setTimeout(() => {
    // TODO: Replace with proper logging
    // Log: Forced shutdown after timeout (CRITICAL)
    process.exit(1);
  }, 10000); // 10 second timeout

  try {
    // 1. Stop accepting new connections
    server.close(() => {
      // TODO: Replace with proper logging
      // Log: HTTP server closed
    });

    // 2. Close database pool
    await closeDbPool();
    // TODO: Replace with proper logging
    // Log: Database pool closed successfully

    // 3. Clear the timeout and exit gracefully
    clearTimeout(forceTimeout);
    process.exit(0);
  } catch (error) {
    // TODO: Replace with proper logging
    // Log: Error during graceful shutdown - error details
    clearTimeout(forceTimeout);
    process.exit(1);
  }
};

// Start the server and set up signal handlers
startServer()
  .then((server) => {
    if (server) {
      process.on("SIGINT", () => gracefulShutdown(server, "SIGINT"));
      process.on("SIGTERM", () => gracefulShutdown(server, "SIGTERM"));
    }
  })
  .catch((error) => {
    // TODO: Replace with proper logging
    // Log: Error starting server - error details
    process.exit(1);
  });
