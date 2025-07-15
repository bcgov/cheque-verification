import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { requestLogger } from "./middleware/logger";
import routes from "./routes";
import { initializeDbPool, closeDbPool } from "./config/database";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for API requests
app.use(cors());

// Request logger middleware
app.use(requestLogger);

// Use routes
app.use(routes);

// Start server
async function startServer() {
  try {
    // Initialize DB pool
    await initializeDbPool();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log("Connected to Oracle database");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Server shutting down...");
  await closeDbPool();
  process.exit(0);
});

// Start the server
startServer().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
