import express, { Request, Response, NextFunction } from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import { CheckStatus, ApiResponse } from "./types";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 4000;
const apiUrl = process.env.API_URL || "http://localhost:3000";

// Enable JSON parsing with size limits
app.use(express.json({ limit: "100kb" })); // Limiting request body size

// Enable CORS for frontend requests with more specific configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // More restrictive in production
    methods: ["GET"], // Only allow GET for this POC
  })
);

// Add basic security headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  // Helps prevent clickjacking attacks
  res.setHeader("X-Frame-Options", "DENY");
  // Helps prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Enables XSS protection in browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Simple request logger middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Proxy endpoint for check verification
app.get("/api/check/:checkNumber", async (req: Request, res: Response) => {
  try {
    const { checkNumber } = req.params;

    // Enhanced validation
    if (!checkNumber) {
      return res
        .status(400)
        .json({ success: false, error: "Check number is required" });
    }

    // Basic input sanitization/validation
    const checkNumberPattern = /^\d{1,12}$/; // Allowing only 1-12 numeric characters
    if (!checkNumberPattern.test(checkNumber)) {
      return res.status(400).json({
        success: false,
        error: "Invalid check number format.",
      });
    }

    // Call the API service with timeout
    console.log(`Fetching check data for ${checkNumber} from API`);
    const response = await axios.get<ApiResponse<CheckStatus>>(
      `${apiUrl}/api/check/${checkNumber}`,
      {
        timeout: 5000, // 5 second timeout to prevent hanging connections
        validateStatus: (status) => status < 500, // Accept all non-500 status codes
      }
    );

    // Return the API response to the frontend
    return res.status(response.status).json(response.data);
  } catch (error: unknown) {
    console.error("Error fetching check data:", error);

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
    return res
      .status(500)
      .json({ success: false, error: "Error communicating with API service" });
  }
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
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
