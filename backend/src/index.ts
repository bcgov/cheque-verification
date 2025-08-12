import express from "express";
import cors from "cors";
import { getConfig } from "./config/appConfig";
import { ChequeVerificationService } from "./services/chequeVerificationService";
import { ChequeController } from "./controllers/chequeController";
import { createChequeRoutes, createHealthRoutes } from "./routes/chequeRoutes";
import { globalRequestLimiter } from "./middleware/rateLimiter";
import { requestLogger } from "./middleware/logger";

// Get application configuration
const config = getConfig();

// Initialize Express app
const app = express();

// Initialize services and controllers
const chequeService = new ChequeVerificationService(config.apiUrl);
const chequeController = new ChequeController(chequeService);

// Apply global rate limiting to all requests
app.use(globalRequestLimiter);

// Enable JSON parsing with size limits
app.use(express.json({ limit: "100kb" })); // Limiting request body size

// Trust proxy settings for accurate IP detection
app.set("trust proxy", 1);

// Enable CORS for frontend requests with more specific configuration
app.use(
  cors({
    origin: config.frontendUrl, // Use configured frontend URL
    methods: ["GET", "POST"], // Allow GET and POST
    credentials: false, // Don't allow credentials
  })
);

// Simple request logger middleware
app.use(requestLogger);

// Configure routes
app.use("/api/cheque", createChequeRoutes(chequeController));
app.use("/health", createHealthRoutes(chequeController));

// Start server and store reference
const server = app.listen(config.port, () => {
  console.log(`Backend server running on port ${config.port}`);
  console.log(`Connected to API at ${config.apiUrl}`);
  console.log(`Environment: ${config.environment}`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed successfully");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed successfully");
    process.exit(0);
  });
});
