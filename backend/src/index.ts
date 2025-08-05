import express, { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import { ChequeStatusResponse, ApiResponse } from "./types";
import {
  globalRequestLimiter,
  apiLimiter,
  healthLimiter,
} from "./middleware/rateLimiter";
import { requestLogger } from "./middleware/logger";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 4000;
const apiUrl = process.env.API_URL || "http://localhost:3000";

// Apply global rate limiting to all requests
app.use(globalRequestLimiter);

// Enable JSON parsing with size limits
app.use(express.json({ limit: "100kb" })); // Limiting request body size

// Trust proxy settings for accurate IP detection
app.set("trust proxy", 1);

// Enable CORS for frontend requests with more specific configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Default to Vite dev server
    methods: ["GET"], // Only allow GET
    credentials: false, // Don't allow credentials
  })
);

// Simple request logger middleware
app.use(requestLogger);

// Proxy endpoint for cheque verification
app.get(
  "/api/cheque/:chequeNumber",
  apiLimiter,
  async (req: Request, res: Response) => {
    try {
      const { chequeNumber } = req.params;

      // Enhanced validation
      if (!chequeNumber) {
        return res
          .status(400)
          .json({ success: false, error: "Cheque number is required" });
      }

      // Basic input sanitization/validation - more realistic cheque number range
      const chequeNumberPattern = /^\d{6,12}$/; // Allowing 6-12 numeric characters (more realistic)
      if (!chequeNumberPattern.test(chequeNumber)) {
        return res.status(400).json({
          success: false,
          error: "Invalid cheque number format.",
        });
      }

      // Call the API service with timeout
      console.log(`Fetching cheque data for ${chequeNumber} from API`);
      const response = await axios.get<ApiResponse<ChequeStatusResponse>>(
        `${apiUrl}/cheque/${chequeNumber}`,
        {
          timeout: 5000, // 5 second timeout to prevent hanging connections
          validateStatus: (status) => status < 500, // Accept all non-500 status codes
        }
      );

      // Return the API response to the frontend
      return res.status(response.status).json(response.data);
    } catch (error: unknown) {
      console.error("Error fetching cheque data:", error);

      // Check for timeout errors specifically
      if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
        return res.status(504).json({
          success: false,
          error: "API request timed out",
        });
      }

      // If it's an error from the API, forward the response
      if (axios.isAxiosError(error) && error.response) {
        return res.status(error.response.status).json(error.response.data);
      }

      // Otherwise, return a generic error
      return res.status(500).json({
        success: false,
        error: "Error communicating with API service",
      });
    }
  }
);

// Health check endpoint
app.get("/health", healthLimiter, (_req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
  console.log(`Connected to API at ${apiUrl}`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("Server shutting down...");
  process.exit(0);
});
