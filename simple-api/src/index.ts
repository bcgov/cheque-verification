import express, { Request, Response } from "express";
import oracledb from "oracledb";
import dotenv from "dotenv";
import cors from "cors";
import { CheckStatus, ApiResponse } from "./types";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for API requests
app.use(cors());

// Simple request logger middleware
app.use((req: Request, _res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Oracle connection pool
let dbPool: oracledb.Pool;

// Initialize Oracle DB connection pool
async function initializeDbPool(): Promise<void> {
  try {
    dbPool = await oracledb.createPool({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING,
      poolIncrement: 1,
      poolMax: 5,
      poolMin: 1,
    });
    console.log("Oracle Database connection pool initialized");
  } catch (error) {
    console.error("Failed to initialize Oracle connection pool:", error);
    throw error; // Fail if database connection fails
  }
}

// Get check status from database
async function getCheckFromDatabase(
  checkNumber: string
): Promise<ApiResponse<CheckStatus>> {
  let connection;
  try {
    connection = await dbPool.getConnection();

    // Simple query that only selects check_number and status
    const result = await connection.execute(
      `SELECT 
        check_number, 
        status
      FROM checks 
      WHERE check_number = :checkNumber`,
      { checkNumber },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return { success: false, error: "Check not found" };
    }

    // Oracle returns column names in uppercase by default
    const row = result.rows[0] as Record<string, any>;

    // Minimal response with only check number and status
    const checkStatus: CheckStatus = {
      checkNumber: row.CHECK_NUMBER,
      status: row.STATUS,
    };

    return { success: true, data: checkStatus };
  } catch (error) {
    console.error("Error querying database:", error);
    return { success: false, error: "Database error" };
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Main endpoint for check verification
app.get("/api/check/:checkNumber", async (req: Request, res: Response) => {
  try {
    const { checkNumber } = req.params;

    // Validate input
    if (!checkNumber) {
      return res
        .status(400)
        .json({ success: false, error: "Check number is required" });
    }

    // Query database
    console.log("Querying database for check", checkNumber);
    const response = await getCheckFromDatabase(checkNumber);

    // Return appropriate response
    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error processing request:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Start server
async function startServer() {
  // Initialize DB pool
  await initializeDbPool();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log("Connected to Oracle database");
  });
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Server shutting down...");

  if (dbPool) {
    try {
      await dbPool.close(10);
      console.log("Database connections closed");
    } catch (err) {
      console.error("Error closing database connections:", err);
    }
  }

  process.exit(0);
});

// Start the server
startServer();
