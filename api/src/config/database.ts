import oracledb from "oracledb";

let dbPool: oracledb.Pool;

// Initialize Oracle DB connection pool
export async function initializeDbPool(): Promise<void> {
  try {
    // Create database configuration inside the function
    // This ensures environment variables are loaded
    const dbConfig = {
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING,
      poolIncrement: 1,
      poolMax: 5,
      poolMin: 1,
    };

    dbPool = await oracledb.createPool(dbConfig);
    console.log("Oracle Database connection pool initialized");

    // Make dbPool globally accessible for routes
    (global as any).dbPool = dbPool;
  } catch (error) {
    console.error("Failed to initialize Oracle connection pool:", error);
    throw error; // Fail if database connection fails
  }
}

// Get the database pool
export function getDbPool(): oracledb.Pool {
  return dbPool;
}

// Close the database pool
export async function closeDbPool(): Promise<void> {
  if (dbPool) {
    try {
      await dbPool.close(10);
      console.log("Database connections closed");
    } catch (err) {
      console.error("Error closing database connections:", err);
    }
  }
}
