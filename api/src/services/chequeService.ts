import oracledb from "oracledb";
import { ChequeStatusResponse } from "../types.js";
import { getDbPool } from "../config/database.js";
import { HttpError } from "../middleware/validation.js";
// Temporary: using console.log for debugging instead of logger
// import { logger } from "../config/logger.js";

// Define the database row type for better type safety
interface ChequeRow {
  CHEQUE_STATUS_OUTPUT: string;
  CHEQUE_NUMBER: string; // Changed from number to string to avoid precision loss
  PAYMENT_ISSUE_DT: Date;
  APPLIED_AMOUNT: number;
}

export async function getChequeFromDatabase(
  chequeNumber: string
): Promise<ChequeStatusResponse> {
  let connection: oracledb.Connection | undefined;
  let result: oracledb.Result<ChequeRow> | undefined;

  const schema = process.env.DB_SCHEMA;
  const table = process.env.DB_TABLE;

  if (!schema || !table) {
    console.error("Database configuration missing", {
      schema: !!schema,
      table: !!table,
    });
    throw new Error(
      "Database schema and table not configured in environment variables"
    );
  }

  console.log("Starting cheque database query", {
    chequeNumberLength: chequeNumber?.length || 0,
    hasSchema: !!schema,
    hasTable: !!table,
  });

  try {
    const dbPool = getDbPool();
    connection = await dbPool.getConnection();

    console.log("Database connection established");

    result = await connection.execute<ChequeRow>(
      `SELECT CHEQUE_STATUS_OUTPUT, CHEQUE_NUMBER, PAYMENT_ISSUE_DT, APPLIED_AMOUNT
       FROM ${schema}.${table}
       WHERE CHEQUE_NUMBER = :chequeNumber`,
      { chequeNumber },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    console.log("Database query completed", {
      rowCount: result?.rows?.length || 0,
      hasResult: !!result?.rows?.length,
    });

    // Log result status (without sensitive data) for debugging
    if (result?.rows?.length) {
      console.log("Query result found", {
        hasStatusOutput: !!result.rows[0].CHEQUE_STATUS_OUTPUT,
        hasPaymentDate: !!result.rows[0].PAYMENT_ISSUE_DT,
        hasAmount: !!result.rows[0].APPLIED_AMOUNT,
        resultNumberLength: result.rows[0].CHEQUE_NUMBER?.length || 0,
      });
    } else {
      console.warn("No rows returned from database query");
    }
  } catch (error) {
    console.error("Database error in getChequeFromDatabase", {
      errorType: error instanceof Error ? error.constructor.name : "Unknown",
      hasMessage: !!(error instanceof Error ? error.message : String(error)),
    });
    throw new Error("Failed to retrieve cheque information");
  } finally {
    await closeConnection(connection);
  }

  if (!result?.rows?.length) {
    console.warn("Cheque not found in database");
    throw new HttpError("Cheque not found", 404);
  }

  const row = result.rows[0];
  return {
    chequeStatus: row.CHEQUE_STATUS_OUTPUT,
    chequeNumber: row.CHEQUE_NUMBER,
    paymentIssueDate: row.PAYMENT_ISSUE_DT,
    appliedAmount: row.APPLIED_AMOUNT,
  };
}

// Extract connection cleanup into a separate function
async function closeConnection(
  connection: oracledb.Connection | undefined
): Promise<void> {
  if (connection) {
    try {
      await connection.close();
    } catch (err) {
      console.warn("Failed to close database connection:", err);
    }
  }
}
